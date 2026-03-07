import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Fetching lead...");
    const { data, error } = await supabase.from('leads').select('id, owner_name, status, surplus_amount_numeric').eq('status', 'pending_review').limit(1).single();
    if (error) console.error("Database query error:", error);
    else console.log("Valid Lead ID for testing:", data?.id);
}
run();
