import type { Handler, HandlerEvent } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * append-lead-note — Allows Citus 1 Bot to append notes to a lead
 * 
 * Request Body:
 * {
 *   "lead_id": "uuid",
 *   "note": "The actual note text from the bot"
 * }
 */
export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { lead_id, note } = JSON.parse(event.body || "{}");

        if (!lead_id || !note) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing lead_id or note" }),
            };
        }

        // 1. Fetch current notes
        const { data: lead, error: fetchError } = await supabase
            .from("leads")
            .select("notes, owner_name")
            .eq("id", lead_id)
            .single();

        if (fetchError || !lead) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Lead not found" }),
            };
        }

        // 2. Format new note with timestamp
        const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
        const newNoteEntry = `\n[🤖 CITUS 1 BOT - ${timestamp}]\n${note}\n${"-".repeat(20)}`;
        const updatedNotes = (lead.notes || "") + newNoteEntry;

        // 3. Update Supabase
        const { error: updateError } = await supabase
            .from("leads")
            .update({ notes: updatedNotes })
            .eq("id", lead_id);

        if (updateError) {
            throw updateError;
        }

        console.log(`Successfully appended bot note for ${lead.owner_name} (${lead_id})`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Note appended successfully",
                owner: lead.owner_name
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
