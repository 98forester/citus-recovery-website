-- ═══════════════════════════════════════════════════════════════
-- Citus-Antigravity: Follow-Up Sequence Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Add follow-up sequence tracking to leads table
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS follow_up_step INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sequence_active BOOLEAN DEFAULT FALSE;

-- 2. Add outreach channel column if missing
ALTER TABLE outreach_events
  ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'email';

-- 3. Index for the scheduler query (find leads needing follow-ups)
CREATE INDEX IF NOT EXISTS idx_leads_follow_up
  ON leads(next_follow_up_at)
  WHERE sequence_active = TRUE;

-- 4. Add claim_status for the claim checker
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS claim_status TEXT DEFAULT 'unchecked',
  ADD COLUMN IF NOT EXISTS claim_details JSONB;
