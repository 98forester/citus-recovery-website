// ═══════════════════════════════════════════════════════════
// Notify HOT LEAD — Instant alert to business owner
// Called by track-click when a lead clicks an email link
// Sends email + optional SMS via email-to-SMS gateway
// ═══════════════════════════════════════════════════════════

import type { Handler } from "@netlify/functions";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error("Missing Gmail credentials");
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

const handler: Handler = async (event) => {
  const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { lead_id } = body;

    if (!lead_id) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "lead_id required" }) };
    }

    // ── Get lead details from Supabase ────────────────────
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) throw new Error("Missing Supabase credentials");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: lead, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single();

    if (error || !lead) {
      console.error("[Notify] Lead not found:", error);
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "Lead not found" }) };
    }

    // ── Build alert content ───────────────────────────────
    const ownerName = lead.owner_name || "Unknown";
    const county = lead.county || "Unknown County";
    const surplus = lead.surplus_amount || "N/A";
    const phone = lead.phone || "No phone on file";
    const email = lead.email || "No email on file";
    const caseNum = lead.case_number || "N/A";
    const siteUrl = process.env.SITE_URL;
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

    const alertSubject = `🔥 HOT LEAD: ${ownerName} just clicked — CALL NOW`;

    const alertHTML = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: #f7f7f7;">
  <div style="max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 24px 28px; color: #fff;">
      <h1 style="margin: 0; font-size: 20px;">🔥 HOT LEAD ALERT</h1>
      <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">${timestamp} ET</p>
    </div>
    <div style="padding: 24px 28px;">
      <h2 style="margin: 0 0 4px; font-size: 22px; color: #1a1a1a;">${ownerName}</h2>
      <p style="margin: 0 0 20px; color: #666; font-size: 14px;">Just clicked the email link — they're on the portal RIGHT NOW.</p>
      
      <div style="background: #f8f9fa; border: 1px solid #e2e2e2; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 4px 0; font-weight: 600; color: #444; width: 110px;">📞 Phone:</td><td style="color: #1a1a1a;"><strong>${phone}</strong></td></tr>
          <tr><td style="padding: 4px 0; font-weight: 600; color: #444;">📧 Email:</td><td style="color: #1a1a1a;">${email}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: 600; color: #444;">🏛️ County:</td><td style="color: #1a1a1a;">${county}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: 600; color: #444;">📋 Case:</td><td style="color: #1a1a1a;">${caseNum}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: 600; color: #444;">💰 Surplus:</td><td style="color: #1a1a1a;"><strong>${surplus}</strong></td></tr>
        </table>
      </div>

      <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 16px; font-weight: 700; color: #dc2626;">⚡ Call within 5 minutes</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #991b1b;">Speed to contact = 21x higher conversion</p>
      </div>

      <div style="text-align: center;">
        <a href="${siteUrl}/command-center" style="display: inline-block; background: #1a1a2e; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 13px;">Open Command Center</a>
      </div>
    </div>
  </div>
</body>
</html>`;

    // ── Plain text version for SMS gateways ───────────────
    const alertText = `🔥 HOT LEAD: ${ownerName} clicked!\nPhone: ${phone}\nCounty: ${county}\nSurplus: ${surplus}\nCALL THEM NOW — ${siteUrl}/command-center`;

    // ── Send email alert to owner ─────────────────────────
    const transporter = getTransporter();
    const ownerEmail = process.env.ALERT_EMAIL || "michael.miranda9875@gmail.com";

    await transporter.sendMail({
      from: `"🔥 Citus Alerts" <${process.env.GMAIL_USER}>`,
      to: ownerEmail,
      subject: alertSubject,
      html: alertHTML,
      text: alertText,
    });

    console.log(`[Notify] 🔥 Email alert sent for ${ownerName} → ${ownerEmail}`);

    // ── Telegram alert via Citus1Bot ──────────────────────
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

    if (!telegramToken || !telegramChatId) {
      console.warn("[Notify] Skipping Telegram alert: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing in env");
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, alerted: ownerEmail, telegram: false, msg: "Telegram env missing" }),
      };
    }

    const telegramMessage = [
      `🔥 <b>HOT LEAD ALERT</b>`,
      ``,
      `<b>${ownerName}</b> just clicked the email link!`,
      ``,
      `📞 Phone: <b>${phone}</b>`,
      `📧 Email: ${email}`,
      `🏛️ County: ${county}`,
      `📋 Case: ${caseNum}`,
      `💰 Surplus: <b>${surplus}</b>`,
      ``,
      `⚡ <b>CALL WITHIN 5 MINUTES</b>`,
      ``,
      `🕐 ${timestamp} ET`,
    ].join("\n");

    let telegramSent = false;
    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: telegramMessage,
          parse_mode: "HTML",
        }),
      });
      const tgData = await tgRes.json();
      telegramSent = tgData.ok === true;
      console.log(`[Notify] 📱 Telegram alert ${telegramSent ? "sent" : "failed"}`);
    } catch (tgErr) {
      console.error("[Notify] Telegram error:", tgErr);
    }

    // ── Log the alert ─────────────────────────────────────
    await supabase.from("lead_activity_logs").insert({
      lead_id: lead_id,
      action: "hot_lead_alert_sent",
      details: { email: ownerEmail, telegram: telegramSent ? telegramChatId : "failed" },
      performed_by: "system",
    });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, alerted: ownerEmail, telegram: telegramSent }),
    };
  } catch (err) {
    console.error("[Notify] Error:", err);
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
    };
  }
};

export { handler };
