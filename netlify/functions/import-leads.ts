import type { Handler, HandlerEvent } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

// ════════════════════════════════════════════════════════════════
// import-leads — Bulk import with deduplication
//
// Dedup priority: owner_name → phone → email
// Behavior: create new lead OR update existing (upsert)
// Empty fields are NEVER written — only non-empty values update
// ════════════════════════════════════════════════════════════════

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fields that can be imported / updated
const ALLOWED_FIELDS = [
    "owner_name", "email", "phone", "property_address", "county",
    "surplus_amount", "case_number", "case_type", "mailing_address",
    "last_known_address", "notes", "source", "state",
    "surplus_amount_numeric", "waiting_period_end", "dob",
    "agreement_link", "lpoa_link", "relatives_data",
] as const;

/**
 * Strip empty strings, null, undefined from an object.
 * Only returns fields that have actual values.
 */
function stripEmpty(obj: Record<string, unknown>): Record<string, unknown> {
    const clean: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
        if (val === null || val === undefined || val === "") continue;
        if (typeof val === "string" && val.trim() === "") continue;
        clean[key] = typeof val === "string" ? val.trim() : val;
    }
    return clean;
}

/**
 * Normalize a name for matching: lowercase, trim, collapse whitespace
 */
function normalizeName(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Normalize a phone number: strip everything except digits
 */
function normalizePhone(phone: string): string {
    return phone.replace(/\D/g, "").slice(-10); // Last 10 digits
}

/**
 * Try to find an existing lead by: owner_name → phone → email
 * Returns the existing lead ID if found, null otherwise.
 */
async function findExistingLead(lead: Record<string, unknown>): Promise<string | null> {
    const case_num = lead.case_number as string | undefined;
    const county = lead.county as string | undefined;

    // 0. Match by Case Number AND County (strongest identifier)
    if (case_num && case_num.trim() && !case_num.toUpperCase().includes('PENDING') && county && county.trim()) {
        const { data } = await supabase
            .from("leads")
            .select("id")
            .ilike("case_number", case_num.trim())
            .ilike("county", county.trim())
            .limit(1);
        if (data && data.length > 0) return data[0].id;
    }

    const name = lead.owner_name as string | undefined;
    const phone = lead.phone as string | undefined;
    const email = lead.email as string | undefined;

    // 1. Match by owner_name (highest priority — most unique identifier for surplus claims)
    if (name && name.trim()) {
        const { data } = await supabase
            .from("leads")
            .select("id, owner_name")
            .ilike("owner_name", normalizeName(name))
            .limit(1);
        if (data && data.length > 0) return data[0].id;
    }

    // 2. Match by phone
    if (phone && phone.trim()) {
        const normalized = normalizePhone(phone);
        if (normalized.length >= 7) {
            const { data } = await supabase
                .from("leads")
                .select("id, phone")
                .limit(100);
            if (data) {
                const match = data.find(
                    (d) => d.phone && normalizePhone(d.phone) === normalized
                );
                if (match) return match.id;
            }
        }
    }

    // 3. Match by email
    if (email && email.trim()) {
        const { data } = await supabase
            .from("leads")
            .select("id, email")
            .ilike("email", email.trim())
            .limit(1);
        if (data && data.length > 0) return data[0].id;
    }

    return null;
}

const handler: Handler = async (event: HandlerEvent) => {
    const CORS_HEADERS = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST",
        "Content-Type": "application/json",
    };

    // CORS
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers: CORS_HEADERS, body: "" };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "POST only" }) };
    }

    try {
        const body = JSON.parse(event.body || "{}");
        const leads: Record<string, unknown>[] = body.leads;

        if (!Array.isArray(leads) || leads.length === 0) {
            return {
                statusCode: 400,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Expected { leads: [...] } with at least one lead" }),
            };
        }

        const results = {
            created: 0,
            updated: 0,
            skipped: 0,
            errors: [] as string[],
        };

        for (const rawLead of leads) {
            // Only keep allowed fields with non-empty values
            const filteredLead: Record<string, unknown> = {};
            for (const field of ALLOWED_FIELDS) {
                if (rawLead[field] !== undefined) {
                    filteredLead[field] = rawLead[field];
                }
            }
            const cleanLead = stripEmpty(filteredLead);

            // Must have at least owner_name
            if (!cleanLead.owner_name) {
                results.skipped++;
                continue;
            }

            try {
                const existingId = await findExistingLead(cleanLead);

                if (existingId) {
                    // ── Update existing lead (only non-empty fields) ──
                    const { owner_name: _, ...updateFields } = cleanLead; // Don't overwrite name
                    if (Object.keys(updateFields).length > 0) {
                        const { error } = await supabase
                            .from("leads")
                            .update(updateFields)
                            .eq("id", existingId);
                        if (error) {
                            results.errors.push(`Update ${cleanLead.owner_name}: ${error.message}`);
                        } else {
                            results.updated++;
                        }
                    } else {
                        results.skipped++; // Nothing new to update
                    }
                } else {
                    // ── Create new lead ──
                    const insertData = {
                        ...cleanLead,
                        source: cleanLead.source || "csv_import",
                        status: "pending_review",
                    };
                    const { error } = await supabase.from("leads").insert([insertData]);
                    if (error) {
                        results.errors.push(`Insert ${cleanLead.owner_name}: ${error.message}`);
                    } else {
                        results.created++;
                    }
                }
            } catch (err) {
                results.errors.push(`${cleanLead.owner_name}: ${err instanceof Error ? err.message : "unknown error"}`);
            }
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                message: `Import complete: ${results.created} created, ${results.updated} updated, ${results.skipped} skipped`,
                ...results,
                total: leads.length,
            }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: err instanceof Error ? err.message : "Server error" }),
        };
    }
};

export { handler };
