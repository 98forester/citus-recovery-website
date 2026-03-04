-- ═══════════════════════════════════════════════════════════════
-- Citus-Antigravity: Supabase Schema Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Expand leads table with pipeline fields
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS surplus_amount_numeric NUMERIC,
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS property_history JSONB,
  ADD COLUMN IF NOT EXISTS liens JSONB,
  ADD COLUMN IF NOT EXISTS competing_claims JSONB,
  ADD COLUMN IF NOT EXISTS recovery_memo TEXT,
  ADD COLUMN IF NOT EXISTS qualified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS outreach_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_known_address TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'FL',
  ADD COLUMN IF NOT EXISTS waiting_period_end DATE,
  ADD COLUMN IF NOT EXISTS ghl_contact_id TEXT;

-- 2. Activity log table (FK to leads)
CREATE TABLE IF NOT EXISTS lead_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  performed_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Outreach events table
CREATE TABLE IF NOT EXISTS outreach_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,       -- 'email_sent', 'email_opened', 'link_clicked', 'replied'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS on new tables
ALTER TABLE lead_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_events ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies — service_role bypasses RLS automatically
-- Allow anon reads on leads (for Command Center — future: switch to auth)
CREATE POLICY "anon_read_leads" ON leads
  FOR SELECT TO anon USING (true);

-- Allow anon reads on activity logs
CREATE POLICY "anon_read_activity_logs" ON lead_activity_logs
  FOR SELECT TO anon USING (true);

-- Allow anon reads on outreach events
CREATE POLICY "anon_read_outreach_events" ON outreach_events
  FOR SELECT TO anon USING (true);

-- 6. Index for common queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_tier ON leads(tier);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_activity_logs_lead_id ON lead_activity_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_outreach_events_lead_id ON outreach_events(lead_id);
