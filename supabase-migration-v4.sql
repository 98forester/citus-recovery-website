-- ═══════════════════════════════════════════════════════════
-- Supabase Migration v4 — Structured Relatives Data
-- Run this in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Add a JSONB column to store all discovered relatives and their metadata
-- This will store an array of objects: { name, relationship, age, location, phones: [], emails: [] }
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS relatives_data JSONB DEFAULT '[]'::jsonb;

-- Comment for clarity
COMMENT ON COLUMN leads.relatives_data IS 'Structured list of all discovered heirs, relatives, and associates.';

-- Create an index for faster JSONB operations if needed (optional for small datasets)
-- CREATE INDEX IF NOT EXISTS idx_leads_relatives_data ON leads USING gin (relatives_data);
