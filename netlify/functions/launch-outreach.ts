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
    const surplusDisplay = lead.surplus_amount || "an undisclosed amount";
    const fullName = lead.owner_name || "Property Owner";
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', Times, serif; background: #f7f7f7; color: #1a1a1a; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #d4d4d4; }
    .header { background: #1a1a2e; padding: 24px 32px; border-bottom: 3px solid #7c3aed; }
    .header h1 { color: #ffffff; font-size: 18px; margin: 0; font-weight: 700; letter-spacing: 0.5px; }
    .header p { color: rgba(255,255,255,0.5); font-size: 11px; margin: 4px 0 0; letter-spacing: 1px; text-transform: uppercase; }
    .body { padding: 32px; font-size: 14px; line-height: 1.75; }
    .date { color: #666; font-size: 13px; margin: 0 0 24px; }
    .body p { margin: 0 0 14px; }
    .ref-box { background: #f8f9fa; border: 1px solid #e2e2e2; padding: 16px 20px; margin: 20px 0; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .ref-box table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .ref-box td { padding: 4px 0; vertical-align: top; }
    .ref-box td:first-child { font-weight: 600; color: #444; width: 140px; }
    .ref-box td:last-child { color: #1a1a1a; }
    .cta { text-align: center; margin: 28px 0; }
    .cta a { background: #1a1a2e; color: #ffffff; text-decoration: none; padding: 12px 28px; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; display: inline-block; }
    .signature { margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e2e2; font-size: 13px; }
    .signature strong { display: block; margin-bottom: 2px; }
    .footer { background: #f8f9fa; padding: 16px 32px; border-top: 1px solid #e2e2e2; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .footer p { color: #888; font-size: 10px; line-height: 1.5; margin: 0; }
    .legal { font-size: 11px; color: #888; margin-top: 16px; font-style: italic; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Citus Recovery Solutions</h1>
      <p>Surplus Funds Recovery</p>
    </div>
    <div class="body">
      <p class="date">${today}</p>

      <p>Dear ${fullName},</p>

      <p>Our office has identified surplus funds that may be owed to you in connection with a recent property matter${lead.county ? ` in <strong>${lead.county} County, Florida</strong>` : " in the State of Florida"}. Under Florida Statute §197.582, former property owners and eligible parties are entitled to claim surplus proceeds resulting from tax deed or foreclosure sales.</p>

      <div class="ref-box">
        <table>
          ${lead.case_number ? `<tr><td>Case Reference:</td><td>${lead.case_number}</td></tr>` : ""}
          <tr><td>Estimated Surplus:</td><td><strong>${surplusDisplay}</strong></td></tr>
          ${lead.county ? `<tr><td>Jurisdiction:</td><td>${lead.county} County, FL</td></tr>` : ""}
          ${lead.property_address ? `<tr><td>Property Address:</td><td>${lead.property_address}</td></tr>` : ""}
        </table>
      </div>

      <p>Citus Recovery Solutions assists eligible claimants in navigating the surplus funds recovery process. Our services include case research, document preparation, court filing, and claim follow-through. There is no upfront cost — our fee is contingent upon successful recovery of your funds.</p>

      <p>If you believe you may be the rightful claimant, we encourage you to review the details of your potential claim at your earliest convenience.</p>

      <div class="cta">
        <a href="${trackLink}">Review Your Claim Details</a>
      </div>

      <p>Should you have any questions, or if you wish to discuss this matter directly, please do not hesitate to contact our office.</p>

      <div class="signature">
        <strong>Citus Recovery Solutions LLC</strong>
        Recovery Services Department<br>
        <a href="${siteUrl}" style="color: #7c3aed; text-decoration: none;">citusrecoverysolutions.com</a>
      </div>

      <p class="legal">This correspondence is intended solely for the individual(s) named above. If you are not the intended recipient, please disregard this message. To opt out of future communications, reply with "STOP." This is not legal advice and does not constitute an attorney-client relationship.</p>
    </div>
    <div class="footer">
      <p>Citus Recovery Solutions LLC${lead.property_address ? ` · Re: ${lead.property_address}` : ""}</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Email subject line ───────────────────────────────────
function buildSubject(lead: { owner_name: string; county: string | null; case_number: string | null }): string {
    const name = lead.owner_name || "Property Owner";
    if (lead.case_number) {
        return `Notice Regarding Surplus Funds — ${lead.case_number}`;
    }
    if (lead.county) {
        return `${name} — Surplus Funds Inquiry, ${lead.county} County`;
    }
    return `${name} — Surplus Funds Recovery Notice`;
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
            subject: buildSubject(lead),
            html: htmlBody,
        });

        // Update lead status + activate follow-up sequence
        const nextFollowUp = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // Day 1 follow-up
        await supabase
            .from("leads")
            .update({
                status: "outreach_sent",
                outreach_sent_at: new Date().toISOString(),
                follow_up_step: 0,
                sequence_active: true,
                next_follow_up_at: nextFollowUp.toISOString(),
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
