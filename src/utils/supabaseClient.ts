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
//
// -- Storage Setup (Dashboard → Storage):
// -- Create a public bucket named 'client-documents'
// -- Policy: Allow public upload (INSERT) to 'client-documents'
// ──────────────────────────────────────────────

export const uploadFile = async (bucket: string, path: string, file: File | Blob): Promise<{ url: string | null; error?: string }> => {
    try {
        const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
            cacheControl: '3600',
            upsert: true
        });

        if (error) {
            console.error('❌ Supabase storage upload failed:', error.message);
            return { url: null, error: error.message };
        }

        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
        return { url: publicUrl };
    } catch (err) {
        return { url: null, error: String(err) };
    }
};

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

export const insertLead = async (lead: LeadInsert): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
        const { data, error } = await supabase.from('leads').insert([lead]).select();
        if (error) {
            console.error('❌ Supabase insert failed:', error.message);
            return { success: false, error: error.message };
        }
        return { success: true, id: data?.[0]?.id };
    } catch (err) {
        return { success: false, error: String(err) };
    }
};

export const getLead = async (idOrRef: string): Promise<{ data: any | null; error?: string }> => {
    try {
        // Try UUID first, then reference_id
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrRef);

        let query = supabase.from('leads').select('*');
        if (isUuid) {
            query = query.eq('id', idOrRef);
        } else {
            query = query.eq('reference_id', idOrRef);
        }

        const { data, error } = await query.single();
        if (error) return { data: null, error: error.message };
        return { data };
    } catch (err) {
        return { data: null, error: String(err) };
    }
};

export const updateLead = async (id: string, updates: Partial<LeadInsert>): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase.from('leads').update(updates).eq('id', id);
        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        return { success: false, error: String(err) };
    }
};
