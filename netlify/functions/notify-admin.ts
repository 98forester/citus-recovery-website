import type { Handler, HandlerEvent } from "@netlify/functions";
import nodemailer from "nodemailer";

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error("Missing GMAIL_USER or GMAIL_APP_PASSWORD");
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

export const handler: Handler = async (event: HandlerEvent) => {
  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const {
      client_name,
      client_email,
      client_phone,
      property_address,
      county,
      case_type,
      documents,
      reference_id,
      mailing_address,
      notes,
      submission_date
    } = body;

    const adminEmail = process.env.ALERT_EMAIL || "michael.miranda9875@gmail.com";
    const transporter = getTransporter();

    const subject = `New Lead: ${client_name} — ${case_type} (${reference_id})`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: #f4f4f5; color: #18181b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <div style="background: #18181b; padding: 24px; color: #ffffff;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 600;">New Client Submission — ${reference_id}</h1>
    </div>
    
    <div style="padding: 24px;">
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 14px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; border-bottom: 1px solid #e4e4e7; padding-bottom: 4px;">CLIENT INFORMATION</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 4px 0; font-weight: 500; width: 140px; color: #52525b;">Name:</td><td style="color: #18181b;">${client_name}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: 500; color: #52525b;">Email:</td><td style="color: #18181b;"><a href="mailto:${client_email}" style="color: #6366f1; text-decoration: none;">${client_email}</a></td></tr>
          <tr><td style="padding: 4px 0; font-weight: 500; color: #52525b;">Phone:</td><td style="color: #18181b;">${client_phone}</td></tr>
        </table>
      </div>

      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 14px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; border-bottom: 1px solid #e4e4e7; padding-bottom: 4px;">CASE DETAILS</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 4px 0; font-weight: 500; width: 140px; color: #52525b;">Case Type:</td><td style="color: #18181b;">${case_type}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: 500; color: #52525b;">Property Address:</td><td style="color: #18181b;">${property_address}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: 500; color: #52525b;">County:</td><td style="color: #18181b;">${county}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: 500; color: #52525b;">Mailing Address:</td><td style="color: #18181b;">${mailing_address}</td></tr>
        </table>
      </div>

      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 14px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; border-bottom: 1px solid #e4e4e7; padding-bottom: 4px;">DOCUMENTS & NOTES</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 4px 0; font-weight: 500; width: 140px; color: #52525b;">Documents Uploaded:</td><td style="color: #18181b;">${documents || "None"}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: 500; color: #52525b;">Notes:</td><td style="color: #18181b;">${notes || "None"}</td></tr>
        </table>
      </div>

      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e4e4e7; font-size: 12px; color: #a1a1aa;">
        <p style="margin: 0;">Submitted: ${submission_date}</p>
        <p style="margin: 4px 0 0;">Reference: ${reference_id}</p>
      </div>
    </div>
  </div>
</body>
</html>
        `;

    await transporter.sendMail({
      from: `"Citus Notifications" <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject: subject,
      html: html,
      replyTo: client_email
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, message: "Admin notification sent" })
    };
  } catch (err) {
    console.error("Notify Admin Error:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Failed to notify admin", details: String(err) })
    };
  }
};
