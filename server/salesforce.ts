import jsforce, { Connection, OAuth2 } from 'jsforce';
import { db } from './db';
import { 
  salesforceIntegrations, 
  salesforceAccountLinks, 
  salesforceOpportunityLinks,
  salesforceSyncLogs,
  accounts,
  kpiCommitments,
  projects
} from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

// Salesforce OAuth2 configuration
const SALESFORCE_CLIENT_ID = process.env.SALESFORCE_CLIENT_ID || '';
const SALESFORCE_CLIENT_SECRET = process.env.SALESFORCE_CLIENT_SECRET || '';
const SALESFORCE_CALLBACK_URL = process.env.SALESFORCE_CALLBACK_URL || '';
const SALESFORCE_LOGIN_URL = process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com';

// Create OAuth2 client
export function createOAuth2Client(): OAuth2 {
  return new jsforce.OAuth2({
    clientId: SALESFORCE_CLIENT_ID,
    clientSecret: SALESFORCE_CLIENT_SECRET,
    redirectUri: SALESFORCE_CALLBACK_URL,
    loginUrl: SALESFORCE_LOGIN_URL
  });
}

// Get authorization URL for OAuth flow
export function getAuthorizationUrl(): string {
  const oauth2 = createOAuth2Client();
  return oauth2.getAuthorizationUrl({ scope: 'api refresh_token' });
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string) {
  const oauth2 = createOAuth2Client();
  const conn = new jsforce.Connection({ oauth2 });
  
  try {
    await conn.authorize(code);
    
    // Get user identity
    const identity = await conn.identity();
    
    // Store the integration in database
    const [integration] = await db.insert(salesforceIntegrations).values({
      instanceUrl: conn.instanceUrl!,
      accessToken: conn.accessToken!,
      refreshToken: conn.refreshToken || null,
      tokenIssuedAt: new Date(),
      userId: identity.user_id,
      userName: identity.username,
      orgId: identity.organization_id,
      isActive: true,
    }).returning();
    
    return {
      success: true,
      integration,
      userInfo: {
        userId: identity.user_id,
        username: identity.username,
        displayName: identity.display_name,
        orgId: identity.organization_id
      }
    };
  } catch (error: any) {
    console.error('Salesforce OAuth error:', error);
    throw new Error(error.message || 'Failed to authenticate with Salesforce');
  }
}

// Get active Salesforce integration
export async function getActiveIntegration() {
  const [integration] = await db.select()
    .from(salesforceIntegrations)
    .where(eq(salesforceIntegrations.isActive, true))
    .limit(1);
  
  return integration || null;
}

// Create Salesforce connection from stored integration
export async function createConnection(integration: typeof salesforceIntegrations.$inferSelect): Promise<Connection> {
  const oauth2 = createOAuth2Client();
  const conn = new jsforce.Connection({
    oauth2,
    instanceUrl: integration.instanceUrl,
    accessToken: integration.accessToken,
    refreshToken: integration.refreshToken || undefined
  });
  
  // Handle token refresh
  conn.on('refresh', async (accessToken: string) => {
    await db.update(salesforceIntegrations)
      .set({ 
        accessToken, 
        tokenIssuedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(salesforceIntegrations.id, integration.id));
  });
  
  return conn;
}

// Disconnect Salesforce integration
export async function disconnectIntegration(integrationId: number) {
  await db.update(salesforceIntegrations)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(salesforceIntegrations.id, integrationId));
}

// Get sync status
export async function getSyncStatus(integrationId: number) {
  const [latestSync] = await db.select()
    .from(salesforceSyncLogs)
    .where(eq(salesforceSyncLogs.integrationId, integrationId))
    .orderBy(desc(salesforceSyncLogs.createdAt))
    .limit(1);
  
  const accountLinks = await db.select()
    .from(salesforceAccountLinks);
  
  const opportunityLinks = await db.select()
    .from(salesforceOpportunityLinks);
  
  return {
    lastSync: latestSync || null,
    linkedAccounts: accountLinks.length,
    linkedOpportunities: opportunityLinks.length,
    accountsWithErrors: accountLinks.filter(l => l.syncStatus === 'error').length,
    opportunitiesWithErrors: opportunityLinks.filter(l => l.syncStatus === 'error').length
  };
}

// Pull accounts from Salesforce
export async function pullAccountsFromSalesforce(conn: Connection, integrationId: number) {
  const syncLog = await startSyncLog(integrationId, 'manual', 'pull');
  
  try {
    // Query Salesforce accounts
    const result = await conn.query<{
      Id: string;
      Name: string;
      Industry: string;
      Website: string;
    }>(`
      SELECT Id, Name, Industry, Website
      FROM Account 
      WHERE IsDeleted = false
      ORDER BY LastModifiedDate DESC
      LIMIT 100
    `);
    
    let created = 0, updated = 0, skipped = 0;
    
    for (const sfAccount of result.records) {
      // Check if we already have a link
      const [existingLink] = await db.select()
        .from(salesforceAccountLinks)
        .where(eq(salesforceAccountLinks.salesforceAccountId, sfAccount.Id));
      
      if (existingLink) {
        // Update existing local account
        await db.update(accounts)
          .set({
            name: sfAccount.Name,
            industry: sfAccount.Industry,
            website: sfAccount.Website,
            updatedAt: new Date()
          })
          .where(eq(accounts.id, existingLink.localAccountId));
        
        await db.update(salesforceAccountLinks)
          .set({
            salesforceAccountName: sfAccount.Name,
            lastSyncedAt: new Date(),
            lastSyncDirection: 'pull',
            syncStatus: 'synced',
            updatedAt: new Date()
          })
          .where(eq(salesforceAccountLinks.id, existingLink.id));
        
        updated++;
      } else {
        // Create new local account
        const [newAccount] = await db.insert(accounts).values({
          name: sfAccount.Name,
          industry: sfAccount.Industry,
          website: sfAccount.Website,
          status: 'active'
        }).returning();
        
        // Create link
        await db.insert(salesforceAccountLinks).values({
          localAccountId: newAccount.id,
          salesforceAccountId: sfAccount.Id,
          salesforceAccountName: sfAccount.Name,
          lastSyncedAt: new Date(),
          lastSyncDirection: 'pull',
          syncStatus: 'synced'
        });
        
        created++;
      }
    }
    
    await completeSyncLog(syncLog.id, 'completed', {
      recordsProcessed: result.records.length,
      recordsCreated: created,
      recordsUpdated: updated,
      recordsSkipped: skipped
    });
    
    return { success: true, created, updated, skipped, total: result.records.length };
  } catch (error: any) {
    await completeSyncLog(syncLog.id, 'failed', { errors: [{ message: error.message }] });
    throw error;
  }
}

// Push accounts to Salesforce
export async function pushAccountsToSalesforce(conn: Connection, integrationId: number) {
  const syncLog = await startSyncLog(integrationId, 'manual', 'push');
  
  try {
    // Get all local accounts that aren't linked yet
    const localAccounts = await db.select()
      .from(accounts)
      .where(eq(accounts.status, 'active'));
    
    const existingLinks = await db.select()
      .from(salesforceAccountLinks);
    
    const linkedAccountIds = new Set(existingLinks.map(l => l.localAccountId));
    const unlinkedAccounts = localAccounts.filter(a => !linkedAccountIds.has(a.id));
    
    let created = 0, updated = 0, failed = 0;
    
    for (const localAccount of unlinkedAccounts) {
      try {
        // Create in Salesforce
        const result = await conn.sobject('Account').create({
          Name: localAccount.name,
          Industry: localAccount.industry,
          Website: localAccount.website
        });
        
        if (result.success) {
          // Create link
          await db.insert(salesforceAccountLinks).values({
            localAccountId: localAccount.id,
            salesforceAccountId: result.id,
            salesforceAccountName: localAccount.name,
            lastSyncedAt: new Date(),
            lastSyncDirection: 'push',
            syncStatus: 'synced'
          });
          created++;
        } else {
          failed++;
        }
      } catch (err: any) {
        console.error(`Failed to push account ${localAccount.name}:`, err.message);
        failed++;
      }
    }
    
    // Update linked accounts
    for (const link of existingLinks) {
      const localAccount = localAccounts.find(a => a.id === link.localAccountId);
      if (!localAccount) continue;
      
      try {
        await conn.sobject('Account').update({
          Id: link.salesforceAccountId,
          Name: localAccount.name,
          Industry: localAccount.industry,
          Website: localAccount.website
        });
        
        await db.update(salesforceAccountLinks)
          .set({
            lastSyncedAt: new Date(),
            lastSyncDirection: 'push',
            syncStatus: 'synced',
            updatedAt: new Date()
          })
          .where(eq(salesforceAccountLinks.id, link.id));
        
        updated++;
      } catch (err: any) {
        console.error(`Failed to update account ${localAccount.name}:`, err.message);
        failed++;
      }
    }
    
    await completeSyncLog(syncLog.id, failed > 0 ? 'partial' : 'completed', {
      recordsProcessed: unlinkedAccounts.length + existingLinks.length,
      recordsCreated: created,
      recordsUpdated: updated,
      recordsFailed: failed
    });
    
    return { success: true, created, updated, failed };
  } catch (error: any) {
    await completeSyncLog(syncLog.id, 'failed', { errors: [{ message: error.message }] });
    throw error;
  }
}

// Pull opportunities from Salesforce
export async function pullOpportunitiesFromSalesforce(conn: Connection, integrationId: number) {
  const syncLog = await startSyncLog(integrationId, 'manual', 'pull');
  
  try {
    // Get account links to map opportunities
    const accountLinks = await db.select()
      .from(salesforceAccountLinks);
    
    if (accountLinks.length === 0) {
      await completeSyncLog(syncLog.id, 'completed', {
        recordsProcessed: 0,
        recordsSkipped: 0
      });
      return { success: true, created: 0, updated: 0, skipped: 0, total: 0, message: 'No linked accounts' };
    }
    
    const sfAccountIds = accountLinks.map(l => `'${l.salesforceAccountId}'`).join(',');
    
    const result = await conn.query<{
      Id: string;
      Name: string;
      AccountId: string;
      Amount: number;
      StageName: string;
      CloseDate: string;
      Description: string;
    }>(`
      SELECT Id, Name, AccountId, Amount, StageName, CloseDate, Description
      FROM Opportunity 
      WHERE AccountId IN (${sfAccountIds})
      AND IsDeleted = false
      ORDER BY LastModifiedDate DESC
      LIMIT 100
    `);
    
    let created = 0, updated = 0, skipped = 0;
    
    for (const sfOpp of result.records) {
      const accountLink = accountLinks.find(l => l.salesforceAccountId === sfOpp.AccountId);
      if (!accountLink) {
        skipped++;
        continue;
      }
      
      // Check if link exists
      const [existingLink] = await db.select()
        .from(salesforceOpportunityLinks)
        .where(eq(salesforceOpportunityLinks.salesforceOpportunityId, sfOpp.Id));
      
      if (existingLink) {
        // Update existing commitment
        await db.update(kpiCommitments)
          .set({
            commitmentTitle: sfOpp.Name,
            commitmentDescription: sfOpp.Description,
            estimatedAnnualValue: sfOpp.Amount ? Math.round(sfOpp.Amount) : null,
            targetDate: sfOpp.CloseDate ? new Date(sfOpp.CloseDate) : null,
            updatedAt: new Date()
          })
          .where(eq(kpiCommitments.id, existingLink.localCommitmentId));
        
        await db.update(salesforceOpportunityLinks)
          .set({
            salesforceOpportunityName: sfOpp.Name,
            lastSyncedAt: new Date(),
            lastSyncDirection: 'pull',
            syncStatus: 'synced',
            updatedAt: new Date()
          })
          .where(eq(salesforceOpportunityLinks.id, existingLink.id));
        
        updated++;
      } else {
        // Find or create a project for this account
        let [project] = await db.select()
          .from(projects)
          .where(eq(projects.accountId, accountLink.localAccountId))
          .limit(1);
        
        if (!project) {
          // Get account name for project
          const [account] = await db.select()
            .from(accounts)
            .where(eq(accounts.id, accountLink.localAccountId));
          
          [project] = await db.insert(projects).values({
            accountId: accountLink.localAccountId,
            name: `${account?.name || 'Account'} - Initiative`,
            companyName: account?.name || 'Unknown',
            currentPhase: 'discovery',
            status: 'active'
          }).returning();
        }
        
        // Create new commitment
        const [newCommitment] = await db.insert(kpiCommitments).values({
          projectId: project.id,
          commitmentTitle: sfOpp.Name,
          commitmentDescription: sfOpp.Description,
          estimatedAnnualValue: sfOpp.Amount ? Math.round(sfOpp.Amount) : null,
          targetDate: sfOpp.CloseDate ? new Date(sfOpp.CloseDate) : null,
          status: 'draft'
        }).returning();
        
        // Create link
        await db.insert(salesforceOpportunityLinks).values({
          localCommitmentId: newCommitment.id,
          salesforceOpportunityId: sfOpp.Id,
          salesforceOpportunityName: sfOpp.Name,
          lastSyncedAt: new Date(),
          lastSyncDirection: 'pull',
          syncStatus: 'synced'
        });
        
        created++;
      }
    }
    
    await completeSyncLog(syncLog.id, 'completed', {
      recordsProcessed: result.records.length,
      recordsCreated: created,
      recordsUpdated: updated,
      recordsSkipped: skipped
    });
    
    return { success: true, created, updated, skipped, total: result.records.length };
  } catch (error: any) {
    await completeSyncLog(syncLog.id, 'failed', { errors: [{ message: error.message }] });
    throw error;
  }
}

// Push commitments to Salesforce as opportunities
export async function pushCommitmentsToSalesforce(conn: Connection, integrationId: number) {
  const syncLog = await startSyncLog(integrationId, 'manual', 'push');
  
  try {
    // Get all commitments with their project/account info
    const allCommitments = await db.select()
      .from(kpiCommitments)
      .innerJoin(projects, eq(kpiCommitments.projectId, projects.id));
    
    const existingLinks = await db.select()
      .from(salesforceOpportunityLinks);
    
    const accountLinks = await db.select()
      .from(salesforceAccountLinks);
    
    const linkedCommitmentIds = new Set(existingLinks.map(l => l.localCommitmentId));
    let created = 0, updated = 0, failed = 0, skipped = 0;
    
    for (const row of allCommitments) {
      const commitment = row.kpi_commitments;
      const project = row.projects;
      
      // Find the SF account for this project
      const accountLink = accountLinks.find(l => l.localAccountId === project.accountId);
      if (!accountLink) {
        skipped++;
        continue;
      }
      
      if (linkedCommitmentIds.has(commitment.id)) {
        // Update existing opportunity
        const existingLink = existingLinks.find(l => l.localCommitmentId === commitment.id);
        if (!existingLink) continue;
        
        try {
          await conn.sobject('Opportunity').update({
            Id: existingLink.salesforceOpportunityId,
            Name: commitment.commitmentTitle,
            Description: commitment.commitmentDescription,
            Amount: commitment.estimatedAnnualValue || null,
            CloseDate: commitment.targetDate ? new Date(commitment.targetDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          });
          
          await db.update(salesforceOpportunityLinks)
            .set({
              lastSyncedAt: new Date(),
              lastSyncDirection: 'push',
              syncStatus: 'synced',
              updatedAt: new Date()
            })
            .where(eq(salesforceOpportunityLinks.id, existingLink.id));
          
          updated++;
        } catch (err: any) {
          console.error(`Failed to update opportunity:`, err.message);
          failed++;
        }
      } else {
        // Create new opportunity
        try {
          const result = await conn.sobject('Opportunity').create({
            Name: commitment.commitmentTitle,
            AccountId: accountLink.salesforceAccountId,
            Description: commitment.commitmentDescription,
            Amount: commitment.estimatedAnnualValue || null,
            StageName: 'Prospecting',
            CloseDate: commitment.targetDate ? new Date(commitment.targetDate).toISOString().split('T')[0] : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });
          
          if (result.success) {
            await db.insert(salesforceOpportunityLinks).values({
              localCommitmentId: commitment.id,
              salesforceOpportunityId: result.id,
              salesforceOpportunityName: commitment.commitmentTitle,
              lastSyncedAt: new Date(),
              lastSyncDirection: 'push',
              syncStatus: 'synced'
            });
            created++;
          } else {
            failed++;
          }
        } catch (err: any) {
          console.error(`Failed to create opportunity:`, err.message);
          failed++;
        }
      }
    }
    
    await completeSyncLog(syncLog.id, failed > 0 ? 'partial' : 'completed', {
      recordsProcessed: allCommitments.length,
      recordsCreated: created,
      recordsUpdated: updated,
      recordsFailed: failed,
      recordsSkipped: skipped
    });
    
    return { success: true, created, updated, failed, skipped };
  } catch (error: any) {
    await completeSyncLog(syncLog.id, 'failed', { errors: [{ message: error.message }] });
    throw error;
  }
}

// Full bidirectional sync
export async function fullSync(integrationId: number) {
  const integration = await db.select()
    .from(salesforceIntegrations)
    .where(eq(salesforceIntegrations.id, integrationId))
    .then(rows => rows[0]);
  
  if (!integration) {
    throw new Error('Integration not found');
  }
  
  const conn = await createConnection(integration);
  
  // Pull first, then push
  const accountPull = await pullAccountsFromSalesforce(conn, integrationId);
  const opportunityPull = await pullOpportunitiesFromSalesforce(conn, integrationId);
  const accountPush = await pushAccountsToSalesforce(conn, integrationId);
  const opportunityPush = await pushCommitmentsToSalesforce(conn, integrationId);
  
  // Update last sync time
  await db.update(salesforceIntegrations)
    .set({ lastSyncAt: new Date(), updatedAt: new Date() })
    .where(eq(salesforceIntegrations.id, integrationId));
  
  return {
    accounts: {
      pulled: { created: accountPull.created, updated: accountPull.updated },
      pushed: { created: accountPush.created, updated: accountPush.updated }
    },
    opportunities: {
      pulled: { created: opportunityPull.created, updated: opportunityPull.updated },
      pushed: { created: opportunityPush.created, updated: opportunityPush.updated }
    }
  };
}

// Helper functions for sync logging
async function startSyncLog(integrationId: number, syncType: 'full' | 'incremental' | 'manual', direction: 'push' | 'pull' | 'bidirectional') {
  const [syncLog] = await db.insert(salesforceSyncLogs).values({
    integrationId,
    syncType,
    direction,
    status: 'started',
    startedAt: new Date()
  }).returning();
  
  return syncLog;
}

async function completeSyncLog(syncLogId: number, status: 'completed' | 'failed' | 'partial', stats: {
  recordsProcessed?: number;
  recordsCreated?: number;
  recordsUpdated?: number;
  recordsSkipped?: number;
  recordsFailed?: number;
  errors?: any[];
}) {
  await db.update(salesforceSyncLogs)
    .set({
      status,
      completedAt: new Date(),
      recordsProcessed: stats.recordsProcessed || 0,
      recordsCreated: stats.recordsCreated || 0,
      recordsUpdated: stats.recordsUpdated || 0,
      recordsSkipped: stats.recordsSkipped || 0,
      recordsFailed: stats.recordsFailed || 0,
      errors: stats.errors || null
    })
    .where(eq(salesforceSyncLogs.id, syncLogId));
}

// Get recent sync logs
export async function getRecentSyncLogs(integrationId: number, limit: number = 10) {
  return db.select()
    .from(salesforceSyncLogs)
    .where(eq(salesforceSyncLogs.integrationId, integrationId))
    .orderBy(desc(salesforceSyncLogs.createdAt))
    .limit(limit);
}
