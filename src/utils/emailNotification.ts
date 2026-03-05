import emailjs from '@emailjs/browser';

// ──────────────────────────────────────────────
// EmailJS Configuration
// Uses VITE_ env vars if available, falls back to hardcoded values.
// These are PUBLIC client-side keys (safe to include in source).
// ──────────────────────────────────────────────

const EMAILJS_CONFIG = {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
    adminTemplateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    claimantTemplateId: 'template_f69k4vn',
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};

console.log('[EmailJS] Config loaded:', {
    serviceId: EMAILJS_CONFIG.serviceId ? '✅ set' : '❌ missing',
    adminTemplateId: EMAILJS_CONFIG.adminTemplateId ? '✅ set' : '❌ missing',
    claimantTemplateId: EMAILJS_CONFIG.claimantTemplateId ? '✅ set' : '❌ missing',
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

// ── Admin notification email (template_fzhb2n2) ──────────────
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

    try {
        await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.adminTemplateId,
            templateParams,
            EMAILJS_CONFIG.publicKey
        );
        console.log('✅ Admin notification email sent successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to send admin notification email:', error);
        return false;
    }
};

// ── Claimant welcome email (template_f69k4vn) ──────────────
export const sendClaimantWelcomeEmail = async (data: {
    name: string;
    email: string;
    referenceId: string;
}): Promise<boolean> => {
    const templateParams = {
        client_name: data.name,
        client_email: data.email,
        reference_id: data.referenceId,
    };

    try {
        await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.claimantTemplateId,
            templateParams,
            EMAILJS_CONFIG.publicKey
        );
        console.log('✅ Claimant welcome email sent to:', data.email);
        return true;
    } catch (error) {
        console.error('❌ Failed to send claimant welcome email:', error);
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

    try {
        await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.adminTemplateId,
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
