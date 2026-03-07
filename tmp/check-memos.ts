import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
    // Try leads first to get the ID if needed, but I have it from previous check
    const leadId = "1f3013b6-485f-4863-b0d8-b21e0212608f"; // Ezra Everett

    const { data, error } = await supabase
        .from('research_memos')
        .select('*')
        .eq('lead_id', leadId);

    if (error) {
        console.error(error);
        return;
    }
    console.log("MEMO_DATA_START");
    console.log(JSON.stringify(data, null, 2));
    console.log("MEMO_DATA_END");

    const { data: reportData, error: reportError } = await supabase
        .from('bot_reports')
        .select('*')
        .eq('lead_id', leadId);

    console.log("REPORT_DATA_START");
    console.log(JSON.stringify(reportData, null, 2));
    console.log("REPORT_DATA_END");
}

check();
