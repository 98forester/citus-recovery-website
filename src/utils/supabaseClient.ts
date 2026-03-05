import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ──────────────────────────────────────────────
// Supabase Configuration
// Uses VITE_ env vars if available, falls back to hardcoded values.
// The anon key is a PUBLIC client-side key (safe to include in source).
// Row Level Security on the database controls access.
// ──────────────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('[Supabase] Config loaded:', {
    url: supabaseUrl ? '✅ set' : '❌ missing',
    anonKey: supabaseAnonKey ? '✅ set' : '❌ missing',
});

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// ──────────────────────────────────────────────
// Leads table schema (create in Supabase Dashboard → SQL Editor):
//
// CREATE TABLE IF NOT EXISTS leads (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   created_at TIMESTAMPTZ DEFAULT now(),
//   owner_name TEXT NOT NULL,
//   email TEXT,
//   phone TEXT,
//   property_address TEXT,
//   county TEXT,
//   surplus_amount TEXT,
//   case_number TEXT,
//   case_type TEXT,
//   mailing_address TEXT,
//   notes TEXT,
//   source TEXT DEFAULT 'website',
//   status TEXT DEFAULT 'new',
//   documents TEXT[],
//   signature_data TEXT,
//   reference_id TEXT,
//   dob DATE,
//   agreement_link TEXT,
//   lpoa_link TEXT
// );
//
// -- Enable Row Level Security
// ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
//
// -- Allow anonymous inserts (for the website form)
// CREATE POLICY "Allow anonymous inserts" ON leads
//   FOR INSERT TO anon
//   WITH CHECK (true);
// ──────────────────────────────────────────────

export interface LeadInsert {
    owner_name: string;
    email?: string;
    phone?: string;
    property_address?: string;
    county?: string;
    surplus_amount?: string;
    case_number?: string;
    case_type?: string;
    mailing_address?: string;
    notes?: string;
    source?: string;
    documents?: string[];
    signature_data?: string;
    reference_id?: string;
    dob?: string;
    agreement_link?: string;
    lpoa_link?: string;
}

export const insertLead = async (lead: LeadInsert): Promise<{ success: boolean; error?: string }> => {

    try {
        const { error } = await supabase.from('leads').insert([lead]);

        if (error) {
            console.error('❌ Supabase insert failed:', error.message);
            return { success: false, error: error.message };
        }

        console.log('✅ Lead saved to Supabase:', lead.owner_name);
        return { success: true };
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown network error';
        console.error('❌ Supabase request failed:', msg);
        return { success: false, error: msg };
    }
};
