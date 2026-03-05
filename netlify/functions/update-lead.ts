import type { Handler, HandlerEvent } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * update-lead — A generalized endpoint to update specific fields on a lead.
 * 
 * Request Body:
 * {
 *   "lead_id": "uuid",
 *   "updates": {
 *     "phone": "new value",
 *     "email": "new value",
 *     "notes": "new value",
 *     ...
 *   }
 * }
 */
export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { lead_id, updates } = JSON.parse(event.body || "{}");

        if (!lead_id || !updates) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing lead_id or updates" }),
            };
        }

        // Perform the update
        const { data, error } = await supabase
            .from("leads")
            .update(updates)
            .eq("id", lead_id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Lead updated successfully",
                lead: data
            }),
        };
    } catch (err) {
        console.error("Update Lead Error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to update lead" }),
        };
    }
};
