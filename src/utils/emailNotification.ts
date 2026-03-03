import emailjs from '@emailjs/browser';

// ──────────────────────────────────────────────
// EmailJS Configuration
// Uses VITE_ env vars if available, falls back to hardcoded values.
// These are PUBLIC client-side keys (safe to include in source).
// ──────────────────────────────────────────────

const EMAILJS_CONFIG = {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_y10ie4a',
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_fzhb2n2',
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'X5nkuSfJFV7BM7yLZ',
};

console.log('[EmailJS] Config loaded:', {
    serviceId: EMAILJS_CONFIG.serviceId ? '✅ set' : '❌ missing',
    templateId: EMAILJS_CONFIG.templateId ? '✅ set' : '❌ missing',
    publicKey: EMAILJS_CONFIG.publicKey ? '✅ set' : '❌ missing',
});

interface NotificationData {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    propertyAddress: string;
    county: string;
    caseType: string;
    documents: string[];
    referenceId: string;
    mailingAddress: string;
    notes: string;
}

const CASE_TYPE_LABELS: Record<string, string> = {
    mortgage_foreclosure: 'Mortgage Foreclosure Surplus',
    tax_deed: 'Tax Deed Sale Surplus',
    hoa_coa: 'HOA / COA Foreclosure Surplus',
    heir_probate: 'Heir / Probate Surplus Claim',
    foreclosure_prevention: 'Foreclosure Prevention',
    other: 'Other / Not Sure',
};

export const sendNotificationEmail = async (data: NotificationData): Promise<boolean> => {
    const templateParams = {
        client_name: data.clientName,
        client_email: data.clientEmail,
        client_phone: data.clientPhone,
        property_address: data.propertyAddress,
        county: data.county,
        case_type: CASE_TYPE_LABELS[data.caseType] || data.caseType,
        documents: data.documents.join(', '),
        reference_id: data.referenceId,
        mailing_address: data.mailingAddress,
        notes: data.notes || 'None',
        submission_date: new Date().toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short',
        }),
    };

    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateId || !EMAILJS_CONFIG.publicKey) {
        console.warn('⚠️  EmailJS env vars not set — email NOT sent. Logging submission to console.');
        console.log('📧 Portal Submission:', templateParams);
        return false; // Signal that email was NOT actually sent
    }

    try {
        await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams,
            EMAILJS_CONFIG.publicKey
        );
        console.log('✅ Email notification sent successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to send email notification:', error);
        return false;
    }
};

// Simplified email for the landing page contact form
export const sendContactEmail = async (data: {
    name: string;
    email: string;
    phone: string;
    county: string;
    situation: string;
    notes: string;
}): Promise<boolean> => {
    const templateParams = {
        client_name: data.name,
        client_email: data.email,
        client_phone: data.phone || 'Not provided',
        property_address: 'N/A — lead capture form',
        county: data.county || 'Not specified',
        case_type: data.situation || 'Not specified',
        documents: 'None (contact form)',
        reference_id: `LEAD-${Date.now().toString(36).toUpperCase()}`,
        mailing_address: 'Not provided',
        notes: data.notes || 'None',
        submission_date: new Date().toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short',
        }),
    };

    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateId || !EMAILJS_CONFIG.publicKey) {
        console.warn('⚠️  EmailJS env vars not set — email NOT sent. Logging contact to console.');
        console.log('📧 Contact Form:', templateParams);
        return false;
    }

    try {
        await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams,
            EMAILJS_CONFIG.publicKey
        );
        console.log('✅ Contact email sent');
        return true;
    } catch (error) {
        console.error('❌ Failed to send contact email:', error);
        return false;
    }
};

export const generateReferenceId = (): string => {
    const prefix = 'CRS';
    const date = new Date();
    const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${datePart}-${randomPart}`;
};
