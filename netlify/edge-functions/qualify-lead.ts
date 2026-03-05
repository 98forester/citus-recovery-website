import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

// ════════════════════════════════════════════════════════════════
// Citus1Bot Lead Qualifier — Netlify Edge Function
// POST /api/qualify-lead  { lead_id: string }
//
// Analyzes surplus amount, property history, and liens.
// Generates a Recovery Memo for leads >$10k.
// Flags >$50k as Tier 1 Priority.
// ════════════════════════════════════════════════════════════════

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default async function handler(request: Request) {
    // CORS preflight
    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
    }

    try {
        const { lead_id } = await request.json();
        if (!lead_id) {
            return new Response(JSON.stringify({ error: "lead_id is required" }), {
                status: 400,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            });
        }

        // ── Init Supabase (service role for full access) ──────────
        const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL") || "";
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
        if (!supabaseUrl || !supabaseKey) {
            return new Response(JSON.stringify({ error: "Missing Supabase config" }), {
                status: 500,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            });
        }
        const supabase = createClient(supabaseUrl, supabaseKey);

        // ── Fetch the lead ───────────────────────────────────────
        const { data: lead, error: fetchError } = await supabase
            .from("leads")
            .select("*")
            .eq("id", lead_id)
            .single();

        if (fetchError || !lead) {
            return new Response(
                JSON.stringify({ error: "Lead not found", details: fetchError?.message }),
                { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
            );
        }

        // ── Parse surplus amount ─────────────────────────────────
        const rawAmount = lead.surplus_amount || lead.surplus_amount_numeric || "0";
        const surplusNumeric = parseFloat(String(rawAmount).replace(/[^0-9.]/g, "")) || 0;

        // ── Determine tier ───────────────────────────────────────
        let tier = "standard";
        if (surplusNumeric >= 50000) {
            tier = "tier_1_priority";
        } else if (surplusNumeric >= 10000) {
            tier = "qualified";
        }

        // ── Generate Recovery Memo (for >$10k) ───────────────────
        let recoveryMemo = null;
        if (surplusNumeric >= 10000) {
            const openrouterKey = Deno.env.get("OPENROUTER_API_KEY") || "";
            const model = Deno.env.get("OPENROUTER_MODEL");

            if (openrouterKey) {
                try {
                    const llmResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${openrouterKey}`,
                            "Content-Type": "application/json",
                            "HTTP-Referer": `https://${'citusrecoverysolutions.com'}`,
                            "X-Title": "Citus1Bot Qualifier",
                        },
                        body: JSON.stringify({
                            model,
                            max_tokens: 800,
                            messages: [
                                {
                                    role: "system",
                                    content: `You are Citus1Bot, a surplus funds recovery analyst for Citus Recovery Solutions. 
Generate a concise Recovery Memo for internal review. Include:
1. **Case Summary** — case number, claimant, amount
2. **Surplus Analysis** — is the amount worth pursuing? Consider attorney fees, filing costs (~$500-1500)
3. **Risk Assessment** — potential liens, competing claims, property history concerns
4. **Recommendation** — pursue/pass/need-more-info
5. **Compliance Notes** — Florida FS 45.032/45.033 considerations, any waiting period

Be direct and analytical. No fluff.`,
                                },
                                {
                                    role: "user",
                                    content: `Analyze this lead:
- Case Number: ${lead.case_number || "Unknown"}
- Claimant: ${lead.owner_name || "Unknown"}
- Surplus Amount: $${surplusNumeric.toLocaleString()}
- County: ${lead.county || "Unknown"}
- State: ${lead.state || "FL"}
- Property Address: ${lead.property_address || "Unknown"}
- Last Known Address: ${lead.last_known_address || lead.mailing_address || "Unknown"}
- Property History: ${JSON.stringify(lead.property_history || "No data")}
- Known Liens: ${JSON.stringify(lead.liens || "No data")}
- Source: ${lead.source || "Unknown"}`,
                                },
                            ],
                        }),
                    });

                    const llmData = await llmResponse.json();
                    recoveryMemo = llmData.choices?.[0]?.message?.content || "Memo generation failed — review manually.";
                } catch (llmErr) {
                    console.error("LLM call failed:", llmErr);
                    recoveryMemo = `Auto-memo failed. Manual review required. Surplus: $${surplusNumeric.toLocaleString()}, Tier: ${tier}`;
                }
            } else {
                recoveryMemo = `[No LLM key configured] Surplus: $${surplusNumeric.toLocaleString()}, Tier: ${tier}. Review manually.`;
            }
        }

        // ── Check liens / competing claims ────────────────────────
        const hasLiens = lead.liens && (Array.isArray(lead.liens) ? lead.liens.length > 0 : Object.keys(lead.liens).length > 0);
        const hasCompetingClaims = lead.competing_claims && (Array.isArray(lead.competing_claims) ? lead.competing_claims.length > 0 : Object.keys(lead.competing_claims).length > 0);

        // ── Determine final status ───────────────────────────────
        let newStatus = "qualified";
        if (surplusNumeric < 1000) {
            newStatus = "low_value";
        } else if (hasLiens || hasCompetingClaims) {
            newStatus = "needs_review";
        }

        // ── Update the lead ──────────────────────────────────────
        const updateData: Record<string, unknown> = {
            surplus_amount_numeric: surplusNumeric,
            tier,
            status: newStatus,
            qualified_at: new Date().toISOString(),
        };
        if (recoveryMemo) {
            updateData.recovery_memo = recoveryMemo;
        }

        const { error: updateError } = await supabase
            .from("leads")
            .update(updateData)
            .eq("id", lead_id);

        if (updateError) {
            return new Response(
                JSON.stringify({ error: "Failed to update lead", details: updateError.message }),
                { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
            );
        }

        // ── Log the activity ─────────────────────────────────────
        await supabase.from("lead_activity_logs").insert({
            lead_id,
            action: "qualified",
            details: {
                surplus_numeric: surplusNumeric,
                tier,
                status: newStatus,
                has_liens: !!hasLiens,
                has_competing_claims: !!hasCompetingClaims,
                memo_generated: !!recoveryMemo,
            },
            performed_by: "citus1bot",
        });

        return new Response(
            JSON.stringify({
                success: true,
                lead_id,
                tier,
                status: newStatus,
                surplus_numeric: surplusNumeric,
                memo_generated: !!recoveryMemo,
            }),
            { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
    } catch (err) {
        console.error("Qualify-lead error:", err);
        return new Response(
            JSON.stringify({ error: "Internal server error", message: String(err) }),
            { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
    }
}

export const config = { path: "/api/qualify-lead" };
