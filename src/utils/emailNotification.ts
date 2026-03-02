import emailjs from '@emailjs/browser';

// ──────────────────────────────────────────────
// EmailJS Configuration
// To enable email notifications:
// 1. Sign up at https://www.emailjs.com/ (free: 200 emails/month)
// 2. Create an email service (e.g. Gmail, Outlook)
// 3. Create an email template with variables: {{client_name}}, {{client_email}}, {{client_phone}}, {{property_address}}, {{county}}, {{case_type}}, {{documents}}, {{reference_id}}, {{submission_date}}
// 4. Replace the values below with your actual IDs
// ──────────────────────────────────────────────

const EMAILJS_CONFIG = {
    serviceId: 'YOUR_SERVICE_ID',    // Replace with your EmailJS service ID
    templateId: 'YOUR_TEMPLATE_ID',  // Replace with your EmailJS template ID
    publicKey: 'YOUR_PUBLIC_KEY',     // Replace with your EmailJS public key
};

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

    // Check if EmailJS is configured
    if (EMAILJS_CONFIG.serviceId === 'YOUR_SERVICE_ID') {
        console.log('──────────────────────────────────────');
        console.log('📧 NEW CLIENT ONBOARDING SUBMISSION');
        console.log('──────────────────────────────────────');
        console.log('Reference ID:', templateParams.reference_id);
        console.log('Client:', templateParams.client_name);
        console.log('Email:', templateParams.client_email);
        console.log('Phone:', templateParams.client_phone);
        console.log('Property:', templateParams.property_address);
        console.log('County:', templateParams.county);
        console.log('Case Type:', templateParams.case_type);
        console.log('Documents:', templateParams.documents);
        console.log('Mailing Address:', templateParams.mailing_address);
        console.log('Notes:', templateParams.notes);
        console.log('Submitted:', templateParams.submission_date);
        console.log('──────────────────────────────────────');
        console.log('⚠️  EmailJS not configured. To enable email notifications,');
        console.log('    update the config in src/utils/emailNotification.ts');
        console.log('──────────────────────────────────────');
        return true;
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

export const generateReferenceId = (): string => {
    const prefix = 'CRS';
    const date = new Date();
    const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${datePart}-${randomPart}`;
};
