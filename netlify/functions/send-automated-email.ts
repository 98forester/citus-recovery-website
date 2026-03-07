import type { Handler, HandlerEvent } from "@netlify/functions";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return createClient(url, key);
}

function getTransporter() {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) throw new Error("Missing GMAIL_USER or GMAIL_APP_PASSWORD");
    return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

const handler: Handler = async (event: HandlerEvent) => {
    const corsHeaders: Record<string, string> = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
    };

    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 204,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: "",
        };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: "Method Not Allowed" })
        };
    }

    const { type, lead_id, pdf_data } = JSON.parse(event.body || "{}");
    const supabase = getSupabase();
    const transporter = getTransporter();

    // Fetch lead details
    const { data: lead, error: leadErr } = await supabase
        .from("leads")
        .select("*")
        .eq("id", lead_id)
        .single();

    if (leadErr || !lead) {
        return { statusCode: 404, body: JSON.stringify({ error: "Lead not found" }) };
    }

    const firstName = (lead.owner_name || "Property Owner").split(" ")[0];
    const confirmationCode = lead.reference_id || lead.id.split('-')[0].toUpperCase();

    let subject = "";
    let html = "";
    let attachments = [];

    // Common Email Footer Styling
    const emailStyles = `
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #1a1a1a;
        max-width: 600px;
        margin: 0 auto;
    `;

    if (type === "interest") {
        subject = `Confirmation: Claim Research Request [Code: ${confirmationCode}]`;
        html = `
            <div style="${emailStyles}">
                <p>Hello ${firstName},</p>
                <p>This email confirms that we have received your request to research potential unclaimed assets associated with your file.</p>
                <p>Your request has been assigned the following reference number: <strong>${confirmationCode}</strong></p>
                <p>Our team is currently conducting a preliminary review of the public records. You will receive a notification via this email address once the initial search is complete.</p>
                <p>If you have any immediate questions, please reply to this email or visit our client portal.</p>
                <p>Best regards,</p>
                <p>The Citus Recovery Team<br>
                <a href="https://citusrecoverysolutions.com" style="color: #7c3aed; text-decoration: none;">citusrecoverysolutions.com</a></p>
            </div>
        `;
    } else if (type === "portal_confirmation") {
        subject = `Successfully Submitted: Your Signed Documents [Ref: ${confirmationCode}]`;
        html = `
            <div style="${emailStyles}">
                <p>Hello ${firstName},</p>
                <p>Thank you for choosing Citus Recovery to assist with your claim. We have successfully received your signed Service Agreement and portal submission.</p>
                
                <p><strong>Case Opening Status:</strong> Our team is now performing a final review of the official records for your file. This step ensures that all claim forms are 100% accurate before we move to the formal filing stage with the appropriate agencies.</p>
                
                <p><strong>Your Next Steps:</strong> We will reach out to you via ${lead.email || "email"} or phone within 24 hours to coordinate the following:</p>
                
                <ul style="padding-left: 20px;">
                    <li style="margin-bottom: 12px;"><strong>Document Verification:</strong> We will walk you through the prepared Claim Package and the Limited Power of Attorney (LPOA) to ensure everything is in order.</li>
                    <li style="margin-bottom: 12px;"><strong>Identity Verification:</strong> We will schedule a brief, 5-minute identity verification call with a licensed Florida Notary. This is a standard requirement to finalize the secure recovery of your funds.</li>
                    <li style="margin-bottom: 12px;"><strong>Final Preparations:</strong> Please keep your government-issued Photo ID ready. If you have not yet uploaded a clear copy to our secure portal, you may reply to this email with a clear photo of the front and back of your ID.</li>
                </ul>
                
                <p>We look forward to assisting you through this process and ensuring a smooth recovery. If you have any questions, simply reply to this email or call us at (407) 479-8310.</p>
                
                <p><strong>This is your reference number: ${confirmationCode}</strong></p>
                
                <p>Best regards,</p>
                <p>The Citus Recovery Team</p>
            </div>
        `;

        if (pdf_data) {
            attachments.push({
                filename: `Citus_Recovery_Agreement_${confirmationCode}.pdf`,
                content: pdf_data,
                encoding: 'base64'
            });
        }
    }

    try {
        await transporter.sendMail({
            from: `"Citus Recovery Solutions" <${process.env.GMAIL_USER}>`,
            to: lead.email,
            subject,
            html,
            attachments
        });

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ success: true })
        };
    } catch (err) {
        console.error("Email error:", err);
        return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
    }
};

export { handler };
