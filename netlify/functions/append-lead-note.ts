import type { Handler, HandlerEvent } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * append-lead-note — Allows external bots (Gravity Claw) to append findings to a lead's record.
 * 
 * Request Body:
 * {
 *   "lead_id": "uuid",
 *   "note": "The findings text...",
 *   "type": "finding" | "general"
 * }
 */
export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const body = JSON.parse(event.body || "{}");
        const { lead_id, note, type = 'general', case_number, county } = body;

        if (!note) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing note content" }),
            };
        }

        let targetLeadId = lead_id;

        // 1. Identification with Fallback
        if (!targetLeadId && case_number && county) {
            console.log(`Looking up lead by case: ${case_number} in ${county}`);
            const { data: lead, error: fetchError } = await supabase
                .from("leads")
                .select("id, notes")
                .ilike("case_number", case_number)
                .ilike("county", county)
                .maybeSingle();

            if (fetchError) {
                console.error("Lookup error:", fetchError);
            } else if (lead) {
                targetLeadId = lead.id;
                // We'll fetch notes again or use this if targetLeadId was already set
            }
        }

        if (!targetLeadId) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Lead not found or identification missing" }),
            };
        }

        // Fetch current notes for the identified lead
        const { data: leadData, error: fetchError } = await supabase
            .from("leads")
            .select("notes")
            .eq("id", targetLeadId)
            .single();

        if (fetchError) throw fetchError;
        const currentNotes = leadData.notes || "";
        let updates: any = {};

        if (type === 'finding') {
            updates.notes = currentNotes ? `${currentNotes}\n\n🤖 [Bot Finding]: ${note}` : `🤖 [Bot Finding]: ${note}`;
        } else {
            // Append to standard notes
            updates.notes = currentNotes ? `${currentNotes}\n\n[Bot]: ${note}` : `[Bot]: ${note}`;
        }

        // Perform the update
        const { error: updateError } = await supabase
            .from("leads")
            .update(updates)
            .eq("id", targetLeadId);

        if (updateError) throw updateError;

        // Log the activity
        await supabase.from("lead_activity_logs").insert({
            lead_id: targetLeadId,
            action: type === 'finding' ? 'bot_finding_added' : 'bot_note_added',
            details: { note, type },
            performed_by: 'citus1bot',
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Note appended successfully",
                type
            }),
        };
    } catch (err) {
        console.error("Append Note Error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to append note" }),
        };
    }
};
