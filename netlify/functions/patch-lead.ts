import type { Handler, HandlerEvent } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * patch-lead — A specialized endpoint for Citus1Bot and Gravity Claw to update
 * structured fields on a lead with fallback identification logic.
 * 
 * Request Body:
 * {
 *   "lead_id": "uuid" (optional),
 *   "case_number": "string" (optional),
 *   "county": "string" (optional),
 *   "updates": {
 *     "status": "qualified",
 *     "tier": "tier_1_priority",
 *     "is_deceased": true,
 *     "surplus_amount_numeric": 150000,
 *     ...
 *   }
 * }
 */
export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const body = JSON.parse(event.body || "{}");
        const { lead_id, case_number, county, updates } = body;

        if (!updates || Object.keys(updates).length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "No updates provided" }),
            };
        }

        let targetLeadId = lead_id;

        // 1. Identification with Fallback
        if (!targetLeadId && case_number && county) {
            console.log(`Looking up lead by case: ${case_number} in ${county}`);
            const { data: lead, error: fetchError } = await supabase
                .from("leads")
                .select("id")
                .ilike("case_number", case_number)
                .ilike("county", county)
                .maybeSingle();

            if (fetchError) {
                console.error("Lookup error:", fetchError);
            } else if (lead) {
                targetLeadId = lead.id;
            }
        }

        if (!targetLeadId) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Lead not found or identification missing" }),
            };
        }

        // 2. Perform Structured Update
        const { data, error: updateError } = await supabase
            .from("leads")
            .update(updates)
            .eq("id", targetLeadId)
            .select()
            .single();

        if (updateError) {
            console.error("Update error:", updateError);
            throw updateError;
        }

        // 3. Log Activity
        await supabase.from("lead_activity_logs").insert({
            lead_id: targetLeadId,
            action: "lead_patched",
            details: { updates },
            performed_by: "citus1bot",
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Lead patched successfully",
                lead: data
            }),
        };
    } catch (err) {
        console.error("Patch Lead Error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to patch lead" }),
        };
    }
};
