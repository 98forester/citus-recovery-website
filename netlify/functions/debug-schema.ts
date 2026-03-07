import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const handler = async () => {
    try {
        const { data, error } = await supabase
            .from("leads")
            .select('*')
            .limit(1);

        if (error) throw error;

        const columns = data && data.length > 0 ? Object.keys(data[0]) : [];

        // Also check lead_activity_logs
        const { data: logsData, error: logsError } = await supabase
            .from("lead_activity_logs")
            .select('*')
            .limit(1);

        return {
            statusCode: 200,
            body: JSON.stringify({
                leads_columns: columns,
                logs_table_exists: !logsError,
                logs_error: logsError ? logsError.message : null
            }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
