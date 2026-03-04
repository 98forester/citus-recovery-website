// ═══════════════════════════════════════════════════════════
// Check Claim — Netlify Serverless Function
// Checks realtdm.com for existing surplus fund claims
// Uses Apify's RAG Web Browser for JS-rendered pages
// ═══════════════════════════════════════════════════════════

import type { Handler, HandlerEvent } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Missing Supabase credentials");
    return createClient(url, key);
}

// ── County → realtdm subdomain mapping ──────────────────
const COUNTY_SUBDOMAINS: Record<string, string> = {
    "alachua": "alachua",
    "baker": "baker",
    "bay": "bay",
    "broward": "broward",
    "charlotte": "charlotte",
    "citrus": "citrus",
    "clay": "clay",
    "collier": "collier",
    "columbia": "columbia",
    "duval": "duval",
    "escambia": "escambia",
    "flagler": "flagler",
    "hillsborough": "hillsborough",
    "indian river": "indianriver",
    "jackson": "jackson",
    "lee": "lee",
    "leon": "leon",
    "miami-dade": "miamidade",
    "okaloosa": "okaloosa",
    "okeechobee": "okeechobee",
    "orange": "orange",
    "osceola": "osceola",
    "palm beach": "palmbeach",
    "pasco": "pasco",
    "pinellas": "pinellas",
    "polk": "polk",
    "putnam": "putnam",
    "santa rosa": "santarosa",
    "sarasota": "sarasota",
    "seminole": "seminole",
    "st. lucie": "stlucie",
    "volusia": "volusia",
    "walton": "walton",
};

// ── Claim-related document keywords ─────────────────────
// Documents in the realtdm Documents tab that indicate a claim was filed
const CLAIM_KEYWORDS = [
    "claim",
    "surplus claim",
    "claim to surplus",
    "claimant",
    "motion for surplus",
    "petition for surplus",
    "order disbursing",
    "order releasing",
    "disbursement",
];

// Documents that indicate surplus exists but NO claim yet
const SURPLUS_AVAILABLE_KEYWORDS = [
    "com_surplus",
    "surplus_letter",
    "surplus is available",
    "surplus letter is now available",
    "notice of surplus",
];

interface ClaimCheckResult {
    status: "no_claim" | "claim_filed" | "partial_claim" | "unknown" | "error";
    county: string;
    case_number: string;
    realtdm_url: string;
    documents_found: string[];
    claim_documents: string[];
    surplus_documents: string[];
    message: string;
}

// ── Analyze documents for claims ────────────────────────
function analyzeDocuments(documents: string[]): {
    claim_documents: string[];
    surplus_documents: string[];
    status: "no_claim" | "claim_filed" | "partial_claim";
} {
    const claimDocs: string[] = [];
    const surplusDocs: string[] = [];

    for (const doc of documents) {
        const lower = doc.toLowerCase();

        if (CLAIM_KEYWORDS.some((kw) => lower.includes(kw))) {
            claimDocs.push(doc);
        }
        if (SURPLUS_AVAILABLE_KEYWORDS.some((kw) => lower.includes(kw))) {
            surplusDocs.push(doc);
        }
    }

    if (claimDocs.length === 0 && surplusDocs.length > 0) {
        return { claim_documents: claimDocs, surplus_documents: surplusDocs, status: "no_claim" };
    }

    if (claimDocs.length > 0) {
        // If surplus docs also exist alongside claim docs, might be partial
        if (surplusDocs.length > 0) {
            return { claim_documents: claimDocs, surplus_documents: surplusDocs, status: "partial_claim" };
        }
        return { claim_documents: claimDocs, surplus_documents: surplusDocs, status: "claim_filed" };
    }

    // No relevant documents found — can't determine
    if (documents.length > 0) {
        return { claim_documents: claimDocs, surplus_documents: surplusDocs, status: "no_claim" };
    }

    return { claim_documents: claimDocs, surplus_documents: surplusDocs, status: "no_claim" };
}

// ── Build the realtdm search URL ────────────────────────
function buildRealtdmUrl(county: string, caseNumber: string): string | null {
    const key = county.toLowerCase().replace(/\s+county$/i, "").trim();
    const subdomain = COUNTY_SUBDOMAINS[key];
    if (!subdomain) return null;
    return `https://${subdomain}.realtdm.com/public/cases/list`;
}

// ── Main handler ────────────────────────────────────────
const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: "",
        };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
    }

    const corsHeaders = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };

    try {
        const { lead_id } = JSON.parse(event.body || "{}");
        if (!lead_id) {
            return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "lead_id required" }) };
        }

        const supabase = getSupabase();

        // Fetch lead
        const { data: lead, error: leadErr } = await supabase
            .from("leads")
            .select("*")
            .eq("id", lead_id)
            .single();

        if (leadErr || !lead) {
            return { statusCode: 404, headers: corsHeaders, body: JSON.stringify({ error: "Lead not found" }) };
        }

        const county = lead.county || "";
        const caseNumber = lead.case_number || "";

        if (!caseNumber) {
            return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Lead has no case number" }) };
        }

        // Build the realtdm URL for this county
        const realtdmUrl = buildRealtdmUrl(county, caseNumber);

        if (!realtdmUrl) {
            // County not on realtdm — return the URL for manual check
            const result: ClaimCheckResult = {
                status: "unknown",
                county,
                case_number: caseNumber,
                realtdm_url: "",
                documents_found: [],
                claim_documents: [],
                surplus_documents: [],
                message: `${county} County is not on realtdm.com. Manual check required.`,
            };

            await supabase
                .from("leads")
                .update({ claim_status: "manual_check_required", claim_details: result })
                .eq("id", lead_id);

            return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(result) };
        }

        // For now: provide the direct link for quick manual verification
        // The user clicks "Check Claim" → we give them the exact URL to open
        // Future: integrate Apify web browser actor for fully automated checks
        const result: ClaimCheckResult = {
            status: "unknown",
            county,
            case_number: caseNumber,
            realtdm_url: realtdmUrl,
            documents_found: [],
            claim_documents: [],
            surplus_documents: [],
            message: `Open realtdm to verify: search case ${caseNumber}`,
        };

        // Update lead with check link
        await supabase
            .from("leads")
            .update({
                claim_status: "checking",
                claim_details: {
                    realtdm_url: realtdmUrl,
                    case_number: caseNumber,
                    checked_at: new Date().toISOString(),
                },
            })
            .eq("id", lead_id);

        // Log activity
        await supabase.from("lead_activity_logs").insert({
            lead_id,
            action: "claim_check_initiated",
            details: { county, case_number: caseNumber, realtdm_url: realtdmUrl },
        });

        return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(result) };
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error("Check claim error:", msg);
        return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: msg }) };
    }
};

export { handler };
