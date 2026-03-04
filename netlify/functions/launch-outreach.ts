// ═══════════════════════════════════════════════════════════
// Launch Outreach — Gmail SMTP via Nodemailer
// Netlify Serverless Function (Node.js runtime)
// ═══════════════════════════════════════════════════════════

import type { Handler, HandlerEvent } from "@netlify/functions";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client ──────────────────────────────────────
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return createClient(url, key);
}

// ── Gmail transporter ────────────────────────────────────
function getTransporter() {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) throw new Error("Missing GMAIL_USER or GMAIL_APP_PASSWORD");

    return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
    });
}

// ── Florida waiting period check ─────────────────────────
const FL_WAITING_DAYS: Record<string, number> = {
    "miami-dade": 120,
    broward: 120,
    "palm beach": 120,
    hillsborough: 90,
    orange: 90,
    duval: 90,
    pinellas: 90,
    default: 90,
};

function checkWaitingPeriod(county: string | null, saleDate: string | null): { ok: boolean; message: string } {
    if (!saleDate) return { ok: true, message: "No sale date recorded — proceeding." };

    const key = county?.toLowerCase().replace(/\s+county$/i, "").trim() || "default";
    const waitDays = FL_WAITING_DAYS[key] || FL_WAITING_DAYS.default;
    const saleTime = new Date(saleDate).getTime();
    const waitEnd = saleTime + waitDays * 24 * 60 * 60 * 1000;

    if (Date.now() < waitEnd) {
        const daysLeft = Math.ceil((waitEnd - Date.now()) / (24 * 60 * 60 * 1000));
        return { ok: false, message: `Waiting period: ${daysLeft} days remaining (${county || "FL"} requires ${waitDays} days)` };
    }

    return { ok: true, message: "Waiting period satisfied." };
}

// ── Email template ───────────────────────────────────────
function buildEmailHTML(lead: {
    owner_name: string;
    surplus_amount: string | null;
    county: string | null;
    case_number: string | null;
    property_address: string | null;
    id: string;
}): string {
    const siteUrl = process.env.SITE_URL || "https://citusrecoverysolutions.com";
    const trackLink = `${siteUrl}/api/track-click?lead_id=${lead.id}&redirect=${encodeURIComponent(siteUrl + "/portal")}`;
    const surplusDisplay = lead.surplus_amount || "unclaimed funds";
    const firstName = lead.owner_name?.split(" ")[0] || "there";

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 22px; margin: 0; font-weight: 600; }
    .header p { color: rgba(255,255,255,0.6); font-size: 13px; margin: 8px 0 0; }
    .body { padding: 32px 24px; }
    .body h2 { color: #1a1a2e; font-size: 18px; margin: 0 0 16px; }
    .body p { color: #444; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .highlight { background: #f0f4ff; border-left: 4px solid #4f46e5; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0; }
    .highlight p { color: #1a1a2e; font-weight: 600; margin: 0; }
    .cta { display: block; text-align: center; margin: 24px 0; }
    .cta a { background: linear-gradient(135deg, #7c3aed, #a855f7); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; }
    .footer { background: #f9f9fb; padding: 20px 24px; text-align: center; border-top: 1px solid #eee; }
    .footer p { color: #888; font-size: 11px; line-height: 1.5; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Citus Recovery Solutions</h1>
      <p>Surplus Funds Recovery Specialists</p>
    </div>
    <div class="body">
      <h2>Hi ${firstName},</h2>
      <p>I'm reaching out because our records indicate you may be entitled to <strong>surplus funds</strong> from a recent property matter${lead.county ? ` in <strong>${lead.county} County</strong>` : ""}.</p>
      
      <div class="highlight">
        <p>${lead.case_number ? `Case #${lead.case_number} — ` : ""}Estimated surplus: ${surplusDisplay}</p>
      </div>
      
      <p>Many property owners are unaware these funds exist. Our team specializes in locating and recovering surplus funds for eligible claimants — <strong>at no upfront cost to you</strong>.</p>
      
      <p>If you'd like to learn more about your potential claim, simply click below to get started:</p>
      
      <div class="cta">
        <a href="${trackLink}">Learn About My Claim →</a>
      </div>
      
      <p style="font-size: 13px; color: #666;">We handle all the paperwork, court filings, and follow-up so you don't have to. Our fee is only collected if we successfully recover your funds.</p>
    </div>
    <div class="footer">
      <p>Citus Recovery Solutions LLC<br>
      ${lead.property_address ? `Re: ${lead.property_address}<br>` : ""}
      <a href="${siteUrl}" style="color: #7c3aed;">citusrecoverysolutions.com</a></p>
      <p style="margin-top: 8px;">If you received this message in error or wish to opt out, please reply with "STOP".</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Main handler ─────────────────────────────────────────
const handler: Handler = async (event: HandlerEvent) => {
    // CORS preflight
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

        // Check if already sent
        if (lead.status === "outreach_sent" || lead.status === "HOT_LEAD") {
            return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: `Outreach already sent (status: ${lead.status})` }) };
        }

        // Check email exists
        if (!lead.email) {
            return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Lead has no email address — cannot send outreach" }) };
        }

        // Compliance check
        const waitCheck = checkWaitingPeriod(lead.county, lead.waiting_period_end);
        if (!waitCheck.ok) {
            return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: waitCheck.message }) };
        }

        // Send email via Gmail SMTP
        const transporter = getTransporter();
        const htmlBody = buildEmailHTML(lead);

        await transporter.sendMail({
            from: `"Citus Recovery Solutions" <${process.env.GMAIL_USER}>`,
            to: lead.email,
            subject: `${lead.owner_name?.split(" ")[0] || "Hello"}, you may have unclaimed surplus funds`,
            html: htmlBody,
        });

        // Update lead status
        await supabase
            .from("leads")
            .update({
                status: "outreach_sent",
                outreach_sent_at: new Date().toISOString(),
            })
            .eq("id", lead_id);

        // Log event
        await supabase.from("outreach_events").insert({
            lead_id,
            channel: "email",
            event_type: "sent",
            metadata: { to: lead.email, subject: "surplus funds outreach" },
        });

        await supabase.from("lead_activity_logs").insert({
            lead_id,
            action: "outreach_email_sent",
            details: { email: lead.email, channel: "gmail_smtp" },
        });

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                message: `Email sent to ${lead.email}`,
                lead_id,
            }),
        };
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error("Launch outreach error:", msg);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: msg }),
        };
    }
};

export { handler };
