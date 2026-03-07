import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
    const { data, error } = await supabase
        .from('leads')
        .select('id, owner_name, recovery_memo, notes')
        .ilike('owner_name', '%Ezra%')
        .single();

    if (error) {
        console.error(error);
        return;
    }
    console.log("LEAD_DATA_START");
    console.log(JSON.stringify(data, null, 2));
    console.log("LEAD_DATA_END");
}

check();
