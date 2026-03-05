import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

// ════════════════════════════════════════════════════════════════
// Track Click — Netlify Edge Function
// GET/POST /api/track-click?lead_id=<uuid>
//
// Called when a claimant clicks a link in an outreach email.
// Updates lead to HOT_LEAD and logs the event.
// ════════════════════════════════════════════════════════════════

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(request: Request) {
    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    try {
        // Accept lead_id from query params (GET) or body (POST)
        let leadId: string | null = null;

        const url = new URL(request.url);
        leadId = url.searchParams.get("lead_id");

        if (!leadId && request.method === "POST") {
            try {
                const body = await request.json();
                leadId = body.lead_id;
            } catch {
                // ignore parse errors
            }
        }

        if (!leadId) {
            return new Response(JSON.stringify({ error: "lead_id is required" }), {
                status: 400,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            });
        }

        // ── Init Supabase ────────────────────────────────────────
        const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL") || "";
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

        if (!supabaseUrl || !supabaseKey) {
            // Still redirect even if Supabase is misconfigured
            return new Response(null, {
                status: 302,
                headers: { Location: `https://${'citusrecoverysolutions.com'}` },
            });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // ── Update lead status to HOT_LEAD + stop follow-up sequence ─
        const { error: updateError } = await supabase
            .from("leads")
            .update({
                status: "HOT_LEAD",
                sequence_active: false,
            })
            .eq("id", leadId);

        if (updateError) {
            console.error("Failed to update lead to HOT_LEAD:", updateError);
        }

        // ── Log the click event ──────────────────────────────────
        await supabase.from("outreach_events").insert({
            lead_id: leadId,
            event_type: "link_clicked",
            metadata: {
                user_agent: request.headers.get("user-agent") || "unknown",
                ip: request.headers.get("x-forwarded-for") || "unknown",
                timestamp: new Date().toISOString(),
            },
        });

        // ── Log activity ─────────────────────────────────────────
        await supabase.from("lead_activity_logs").insert({
            lead_id: leadId,
            action: "hot_lead_detected",
            details: {
                trigger: "email_link_clicked",
                timestamp: new Date().toISOString(),
            },
            performed_by: "system",
        });

        // ── Fire instant alert to owner (fire-and-forget) ────
        const siteUrl = Deno.env.get("SITE_URL");
        try {
            fetch(`${siteUrl}/.netlify/functions/notify-hot-lead`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lead_id: leadId }),
            }).catch(() => { }); // Don't block redirect if alert fails
        } catch {
            // Silently fail — redirect is more important
        }

        // ── Redirect to the website ──────────────────────────────
        // In production, this would redirect to a lead-specific landing page
        return new Response(null, {
            status: 302,
            headers: { Location: `https://${'citusrecoverysolutions.com'}/portal` },
        });
    } catch (err) {
        console.error("Track-click error:", err);
        // Always redirect even on error — don't show error pages to leads
        return new Response(null, {
            status: 302,
            headers: { Location: `https://${'citusrecoverysolutions.com'}` },
        });
    }
}

export const config = { path: "/api/track-click" };
