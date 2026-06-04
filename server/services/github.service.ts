// GitHub Integration - Replit Connector
import { Octokit } from '@octokit/rest'

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X-Replit-Token not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X-Replit-Token': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
export async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

const EXCLUDED_DIRS = new Set([
  'node_modules', '.git', '.local', '.cache', '.config', '.upm',
  'dist', '.replit', 'attached_assets', '.nix-store'
]);

const EXCLUDED_FILES = new Set([
  '.replit', 'replit.nix', '.replit.nix'
]);

import fs from 'fs';
import path from 'path';

function collectFiles(dir: string, baseDir: string): { path: string; content: string }[] {
  const results: { path: string; content: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    if (entry.name.startsWith('.') && EXCLUDED_FILES.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, baseDir));
    } else {
      try {
        const stat = fs.statSync(fullPath);
        if (stat.size > 5 * 1024 * 1024) continue;

        const buffer = fs.readFileSync(fullPath);
        const isBinary = buffer.includes(0);
        if (isBinary) {
          results.push({
            path: relativePath,
            content: buffer.toString('base64')
          });
        } else {
          results.push({
            path: relativePath,
            content: buffer.toString('utf-8')
          });
        }
      } catch {
        // skip unreadable files
      }
    }
  }
  return results;
}

export async function exportToGitHub(repoName: string, isPrivate: boolean = true): Promise<{ repoUrl: string; filesCommitted: number }> {
  const octokit = await getUncachableGitHubClient();

  const { data: user } = await octokit.users.getAuthenticated();
  const owner = user.login;

  let repoExists = false;
  try {
    await octokit.repos.get({ owner, repo: repoName });
    repoExists = true;
  } catch (e: any) {
    if (e.status !== 404) throw e;
  }

  if (!repoExists) {
    await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      private: isPrivate,
      auto_init: true,
      description: 'Korn Ferry Loop - Exported from Replit'
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const projectDir = path.resolve(process.cwd());
  const files = collectFiles(projectDir, projectDir);

  let treeSha: string;
  let baseSha: string;

  try {
    const { data: ref } = await octokit.git.getRef({ owner, repo: repoName, ref: 'heads/main' });
    baseSha = ref.object.sha;
  } catch {
    const { data: ref } = await octokit.git.getRef({ owner, repo: repoName, ref: 'heads/master' });
    baseSha = ref.object.sha;
  }

  const BATCH_SIZE = 5;
  const BATCH_DELAY_MS = 1500;
  const treeItems: any[] = [];

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const blobPromises = batch.map(async (file) => {
      const buffer = Buffer.from(file.content, file.content.includes('\0') ? 'base64' : 'utf-8');
      const isBinary = buffer.includes(0);

      const { data: blob } = await octokit.git.createBlob({
        owner,
        repo: repoName,
        content: isBinary ? buffer.toString('base64') : file.content,
        encoding: isBinary ? 'base64' : 'utf-8'
      });
      return {
        path: file.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blob.sha
      };
    });
    const batchResults = await Promise.all(blobPromises);
    treeItems.push(...batchResults);
    if (i + BATCH_SIZE < files.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  const { data: tree } = await octokit.git.createTree({
    owner,
    repo: repoName,
    tree: treeItems,
    base_tree: baseSha
  });
  treeSha = tree.sha;

  const { data: commit } = await octokit.git.createCommit({
    owner,
    repo: repoName,
    message: `Export from Replit - ${new Date().toISOString()}`,
    tree: treeSha,
    parents: [baseSha]
  });

  let defaultBranch = 'main';
  try {
    await octokit.git.updateRef({ owner, repo: repoName, ref: 'heads/main', sha: commit.sha });
  } catch {
    await octokit.git.updateRef({ owner, repo: repoName, ref: 'heads/master', sha: commit.sha });
    defaultBranch = 'master';
  }

  return {
    repoUrl: `https://github.com/${owner}/${repoName}`,
    filesCommitted: files.length
  };
}
