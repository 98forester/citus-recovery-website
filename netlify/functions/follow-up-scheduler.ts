// ═══════════════════════════════════════════════════════════
// Follow-Up Scheduler — Netlify Scheduled Function
// Runs every 6 hours to send follow-up emails
// Sequence: Day 1 → Day 3 → Day 7 → Day 14
// ═══════════════════════════════════════════════════════════

import type { Handler } from "@netlify/functions";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

// ── Config ──────────────────────────────────────────────
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Missing Supabase credentials");
    return createClient(url, key);
}

function getTransporter() {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) throw new Error("Missing Gmail credentials");
    return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

// ── Follow-up schedule (days after initial send) ────────
const FOLLOW_UP_SCHEDULE = [
    { step: 1, daysAfterInitial: 1 },
    { step: 2, daysAfterInitial: 3 },
    { step: 3, daysAfterInitial: 7 },
    { step: 4, daysAfterInitial: 14 },
];

// ── Follow-up email templates ───────────────────────────

interface LeadData {
    id: string;
    owner_name: string;
    email: string;
    surplus_amount: string | null;
    county: string | null;
    case_number: string | null;
    property_address: string | null;
    follow_up_step: number;
}

function buildFollowUpSubject(lead: LeadData, step: number): string {
    const caseRef = lead.case_number || lead.county ? `${lead.county} County` : "FL";
    switch (step) {
        case 1: return `Follow-Up: Surplus Funds — ${caseRef}`;
        case 2: return `Action Required: Surplus Funds Claim — ${caseRef}`;
        case 3: return `Second Notice: Unclaimed Surplus — ${caseRef}`;
        case 4: return `Final Notice: Surplus Funds — ${caseRef}`;
        default: return `Surplus Funds Notice — ${caseRef}`;
    }
}

function buildFollowUpHTML(lead: LeadData, step: number): string {
    const siteUrl = process.env.SITE_URL || "https://citusrecoverysolutions.com";
    const trackLink = `${siteUrl}/api/track-click?lead_id=${lead.id}&redirect=${encodeURIComponent(siteUrl + "/portal")}`;
    const fullName = lead.owner_name || "Property Owner";
    const surplus = lead.surplus_amount || "an undisclosed amount";
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    // Build step-specific body content
    let bodyContent = "";

    switch (step) {
        case 1:
            bodyContent = `
      <p>Dear ${fullName},</p>
      <p>This is a brief follow-up to our previous correspondence regarding surplus funds that may be owed to you${lead.county ? ` from a property matter in <strong>${lead.county} County, Florida</strong>` : ""}.</p>
      ${buildRefBox(lead, surplus)}
      <p>We understand you may have been busy. Should you wish to review this matter, the information below will direct you to the relevant claim details.</p>`;
            break;

        case 2:
            bodyContent = `
      <p>Dear ${fullName},</p>
      <p>Our office previously notified you of potential surplus funds in the amount of <strong>${surplus}</strong> that may be owed to you under Florida Statute §197.582.</p>
      ${buildRefBox(lead, surplus)}
      <p>Please be advised that surplus funds held by the Clerk of Court are subject to statutory deadlines. Unclaimed proceeds may ultimately be transferred to the State of Florida as unclaimed property. We strongly encourage you to review your claim at your earliest convenience.</p>
      <p>There remains no upfront cost to engage our services — our fee is contingent upon successful recovery.</p>`;
            break;

        case 3:
            bodyContent = `
      <p>Dear ${fullName},</p>
      <p>This is our second notice regarding surplus funds of approximately <strong>${surplus}</strong> that our office has identified in connection with your name${lead.county ? ` in ${lead.county} County` : ""}.</p>
      ${buildRefBox(lead, surplus)}
      <p>To date, we have not received a response to our prior correspondence. We remain available to assist you with the recovery process should you wish to pursue this claim.</p>`;
            break;

        case 4:
            bodyContent = `
      <p>Dear ${fullName},</p>
      <p>This constitutes our final notice regarding the surplus funds matter referenced below.</p>
      ${buildRefBox(lead, surplus)}
      <p>Our office has made multiple attempts to contact you regarding these funds. If we do not hear from you, we will close this matter in our records. Should you wish to revisit this claim in the future, you may contact our office directly.</p>
      <p>We appreciate your time and wish you well.</p>`;
            break;
    }

    return `<!DOCTYPE html>
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
      ${bodyContent}
      <div class="cta">
        <a href="${trackLink}">Review Your Claim Details</a>
      </div>
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

function buildRefBox(lead: LeadData, surplus: string): string {
    return `<div class="ref-box">
        <table>
          ${lead.case_number ? `<tr><td>Case Reference:</td><td>${lead.case_number}</td></tr>` : ""}
          <tr><td>Estimated Surplus:</td><td><strong>${surplus}</strong></td></tr>
          ${lead.county ? `<tr><td>Jurisdiction:</td><td>${lead.county} County, FL</td></tr>` : ""}
          ${lead.property_address ? `<tr><td>Property Address:</td><td>${lead.property_address}</td></tr>` : ""}
        </table>
      </div>`;
}

// ── Compute next follow-up timestamp ────────────────────
function getNextFollowUpTime(outreachSentAt: string, nextStep: number): Date | null {
    const schedule = FOLLOW_UP_SCHEDULE.find((s) => s.step === nextStep);
    if (!schedule) return null; // sequence complete

    const sentDate = new Date(outreachSentAt);
    const nextDate = new Date(sentDate.getTime() + schedule.daysAfterInitial * 24 * 60 * 60 * 1000);
    return nextDate;
}

// ── Main scheduler handler ──────────────────────────────
const handler: Handler = async () => {
    const supabase = getSupabase();
    const transporter = getTransporter();
    const now = new Date().toISOString();

    console.log(`[Follow-Up Scheduler] Running at ${now}`);

    // Find leads with active sequences that are due for follow-up
    const { data: dueLeads, error } = await supabase
        .from("leads")
        .select("*")
        .eq("sequence_active", true)
        .lte("next_follow_up_at", now)
        .not("email", "is", null)
        .in("status", ["outreach_sent"]) // Only follow up on "outreach_sent" — NOT hot_lead, opted_out, etc.
        .order("next_follow_up_at", { ascending: true })
        .limit(50); // Process max 50 per run to stay within function limits

    if (error) {
        console.error("[Follow-Up Scheduler] Query error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    if (!dueLeads || dueLeads.length === 0) {
        console.log("[Follow-Up Scheduler] No follow-ups due.");
        return { statusCode: 200, body: JSON.stringify({ message: "No follow-ups due", processed: 0 }) };
    }

    console.log(`[Follow-Up Scheduler] Processing ${dueLeads.length} follow-ups`);

    let sent = 0;
    let completed = 0;
    const errors: string[] = [];

    for (const lead of dueLeads) {
        const nextStep = (lead.follow_up_step || 0) + 1;

        try {
            // Check if sequence should end (step > 4 = all follow-ups sent)
            if (nextStep > 4) {
                await supabase
                    .from("leads")
                    .update({
                        sequence_active: false,
                        status: "no_response",
                    })
                    .eq("id", lead.id);

                // Log the sequence completion
                await supabase.from("lead_activity_logs").insert({
                    lead_id: lead.id,
                    action: "sequence_completed",
                    details: { total_follow_ups: 4, final_status: "no_response" },
                });

                completed++;
                continue;
            }

            // Send follow-up email
            const subject = buildFollowUpSubject(lead, nextStep);
            const html = buildFollowUpHTML(lead, nextStep);

            await transporter.sendMail({
                from: `"Citus Recovery Solutions" <${process.env.GMAIL_USER}>`,
                to: lead.email,
                subject,
                html,
            });

            // Calculate next follow-up time
            const nextFollowUp = getNextFollowUpTime(lead.outreach_sent_at, nextStep + 1);

            // Update lead
            await supabase
                .from("leads")
                .update({
                    follow_up_step: nextStep,
                    next_follow_up_at: nextFollowUp?.toISOString() || null,
                    sequence_active: nextStep < 4, // Deactivate after step 4
                })
                .eq("id", lead.id);

            // Log outreach event
            await supabase.from("outreach_events").insert({
                lead_id: lead.id,
                channel: "email",
                event_type: `follow_up_${nextStep}`,
                metadata: { to: lead.email, subject, step: nextStep },
            });

            await supabase.from("lead_activity_logs").insert({
                lead_id: lead.id,
                action: `follow_up_${nextStep}_sent`,
                details: { email: lead.email, step: nextStep, subject },
            });

            sent++;
            console.log(`  ✉️ Step ${nextStep} sent to ${lead.email} (${lead.owner_name})`);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unknown error";
            errors.push(`Lead ${lead.id}: ${msg}`);
            console.error(`  ❌ Error sending to ${lead.email}:`, msg);
        }
    }

    const summary = {
        message: "Follow-up scheduler complete",
        processed: dueLeads.length,
        sent,
        completed,
        errors: errors.length,
    };

    console.log("[Follow-Up Scheduler] Summary:", summary);

    return { statusCode: 200, body: JSON.stringify(summary) };
};

export { handler };
