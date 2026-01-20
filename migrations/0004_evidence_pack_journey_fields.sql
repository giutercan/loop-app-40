-- Migration: Add journey-based evidence pack fields for Miller Heiman Blue Sheet integration
-- This adds support for evidence phases, story threads, and trust velocity scoring

ALTER TABLE evidence_pack_items ADD COLUMN IF NOT EXISTS evidence_phase TEXT;
ALTER TABLE evidence_pack_items ADD COLUMN IF NOT EXISTS story_thread_id TEXT;
ALTER TABLE evidence_pack_items ADD COLUMN IF NOT EXISTS preceding_item_id INTEGER;
ALTER TABLE evidence_pack_items ADD COLUMN IF NOT EXISTS following_item_id INTEGER;
ALTER TABLE evidence_pack_items ADD COLUMN IF NOT EXISTS success_frame_clarity INTEGER;
ALTER TABLE evidence_pack_items ADD COLUMN IF NOT EXISTS method_adherence INTEGER;
ALTER TABLE evidence_pack_items ADD COLUMN IF NOT EXISTS sponsor_alignment INTEGER;
ALTER TABLE evidence_pack_items ADD COLUMN IF NOT EXISTS handoff_completeness INTEGER;
ALTER TABLE evidence_pack_items ADD COLUMN IF NOT EXISTS what_this_proves TEXT;
