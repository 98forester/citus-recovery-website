import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
    const leadId = "1f3013b6-485f-4863-b0d8-b21e0212608f"; // Ezra Everett

    const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('id, owner_name, recovery_memo')
        .eq('id', leadId)
        .single();

    console.log("LEAD_RECOVERY_MEMO:");
    console.log(lead?.recovery_memo);

    const { data: logs, error: logError } = await supabase
        .from('lead_activity_logs')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

    console.log("\nACTIVITY_LOGS:");
    console.log(JSON.stringify(logs, null, 2));
}

check();
