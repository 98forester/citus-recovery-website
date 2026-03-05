-- ═══════════════════════════════════════════════════════════
-- Supabase Migration v3 — Call List & Contact Tracking
-- Run this in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Add contact tracking columns to leads table
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS contact_method TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS contact_notes TEXT DEFAULT NULL;

-- Add index for quick HOT_LEAD queries
CREATE INDEX IF NOT EXISTS idx_leads_hot_lead
ON leads (status) WHERE status = 'HOT_LEAD';

-- Add index for uncontacted HOT LEADs
CREATE INDEX IF NOT EXISTS idx_leads_uncontacted_hot
ON leads (status, contacted_at) WHERE status = 'HOT_LEAD' AND contacted_at IS NULL;
