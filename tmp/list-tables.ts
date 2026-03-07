import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
    const { data, error } = await supabase
        .rpc('get_tables'); // This might not exist if not enabled

    if (error) {
        // Fallback: try to select from information_schema via manual query if possible, 
        // but Supabase JS doesn't support that easily. 
        // Instead, let's try to select from some guessed table names.
        console.log("Common table check:");
        const tables = ['leads', 'lead_activity_logs', 'bot_reports', 'research_memos'];
        for (const t of tables) {
            const { error: te } = await supabase.from(t).select('count', { count: 'exact', head: true });
            console.log(`${t}: ${te ? 'Error: ' + te.message : 'Exists'}`);
        }
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}

check();
