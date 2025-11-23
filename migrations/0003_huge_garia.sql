-- Migration: Add unique index on success_stories (project_id, url) to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS "success_stories_project_url_idx" ON "success_stories" USING btree ("project_id","url");
