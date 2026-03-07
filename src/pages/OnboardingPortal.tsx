import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Shield, Loader2 } from 'lucide-react';
import { PortalProgress } from '../components/portal/PortalProgress';
import { StepClientInfo, ClientInfo } from '../components/portal/StepClientInfo';
import { StepDocuments, DocumentFiles } from '../components/portal/StepDocuments';
import { StepReviewSign } from '../components/portal/StepReviewSign';
import { StepConfirmation } from '../components/portal/StepConfirmation';
import { sendNotificationEmail, generateReferenceId, sendAutoReply } from '../utils/emailNotification';
import { insertLead, getLead, updateLead, uploadFile } from '../utils/supabaseClient';
import { generateSignedAgreement } from '../utils/generateAgreement';
import { COMPANY } from '../constants';

const INITIAL_CLIENT_INFO: ClientInfo = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: 'FL',
    zip: '',
    propertyAddress: '',
    county: '',
    caseType: '',
    notes: '',
};

const INITIAL_DOCUMENTS: DocumentFiles = {
    driversLicense: [],
    additionalDocs: [],
};

export const OnboardingPortal = () => {
    const [searchParams] = useSearchParams();
    const [currentStep, setCurrentStep] = useState(1);
    const [clientInfo, setClientInfo] = useState<ClientInfo>(INITIAL_CLIENT_INFO);
    const [documents, setDocuments] = useState<DocumentFiles>(INITIAL_DOCUMENTS);
    const [signature, setSignature] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [referenceId, setReferenceId] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [existingLeadId, setExistingLeadId] = useState<string | null>(null);

    // ── Hydrate Existing Lead ──────────────────────────────────
    useEffect(() => {
        const refId = searchParams.get('ref') || searchParams.get('id');
        if (refId) {
            const hydrate = async () => {
                setIsLoading(true);
                const { data: lead, error } = await getLead(refId);
                if (lead) {
                    setExistingLeadId(lead.id);
                    setReferenceId(lead.reference_id || '');

                    // Split owner name
                    const names = (lead.owner_name || '').split(' ');
                    const firstName = names[0] || '';
                    const lastName = names.slice(1).join(' ') || '';

                    setClientInfo({
                        firstName,
                        lastName,
                        email: lead.email || '',
                        phone: lead.phone || '',
                        streetAddress: lead.mailing_address || '',
                        city: '',
                        state: 'FL',
                        zip: '',
                        propertyAddress: lead.property_address || '',
                        county: lead.county || '',
                        caseType: lead.case_type || 'tax_deed',
                        notes: lead.notes || '',
                    });

                    // If we have enough info, skip to review
                    if (lead.owner_name && lead.property_address) {
                        setCurrentStep(3);
                    }
                } else if (error) {
                    console.error('Portal hydration error:', error);
                }
                setIsLoading(false);
            };
            hydrate();
        }
    }, [searchParams]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError(null);

        const refId = existingLeadId ? referenceId : generateReferenceId();
        if (!existingLeadId) setReferenceId(refId);

        // Collect document names
        const docNames: string[] = [];
        if (documents.driversLicense.length > 0) docNames.push("Driver's License");
        documents.additionalDocs.forEach((f) => docNames.push(f.name));

        const mailingAddress = `${clientInfo.streetAddress}${clientInfo.city ? `, ${clientInfo.city}` : ''}${clientInfo.state ? `, ${clientInfo.state}` : ''}${clientInfo.zip ? ` ${clientInfo.zip}` : ''}`;

        try {
            // 1. Upload Documents to Supabase Storage
            const uploadedUrls: string[] = [];
            const timestamp = Date.now();

            // Upload Driver's License
            for (const file of documents.driversLicense) {
                const path = `${refId}/id_${timestamp}_${file.name}`;
                const { url, error } = await uploadFile('client-documents', path, file);
                if (url) uploadedUrls.push(url);
                else console.error('ID upload failed:', error);
            }

            // Upload Additional Docs
            for (const file of documents.additionalDocs) {
                const path = `${refId}/doc_${timestamp}_${file.name}`;
                const { url, error } = await uploadFile('client-documents', path, file);
                if (url) uploadedUrls.push(url);
                else console.error('Doc upload failed:', error);
            }

            // 2. Generate and Upload Signed Agreement PDF
            let agreementUrl: string | undefined;
            let agreementBlob: Blob | undefined;

            if (signature) {
                agreementBlob = await generateSignedAgreement({
                    clientName: `${clientInfo.firstName} ${clientInfo.lastName}`,
                    propertyAddress: clientInfo.propertyAddress,
                    mailingAddress: mailingAddress,
                    county: clientInfo.county,
                    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                }, signature);

                const path = `${refId}/Signed_Agreement_${timestamp}.pdf`;
                const { url, error } = await uploadFile('client-documents', path, agreementBlob);
                if (url) agreementUrl = url;
                else console.error('Agreement upload failed:', error);
            }

            // 3. Save/Update Supabase
            const leadData = {
                owner_name: `${clientInfo.firstName} ${clientInfo.lastName}`,
                email: clientInfo.email,
                phone: clientInfo.phone,
                property_address: clientInfo.propertyAddress,
                county: clientInfo.county,
                case_type: clientInfo.caseType,
                mailing_address: mailingAddress,
                notes: clientInfo.notes,
                source: existingLeadId ? undefined : 'portal',
                documents: uploadedUrls, // Store actual URLs now
                signature_data: signature || undefined,
                agreement_link: agreementUrl || undefined, // Store the signed PDF URL here
                reference_id: refId,
                status: 'signed', // Direct to signed status
            };

            const result = existingLeadId
                ? await updateLead(existingLeadId, leadData)
                : await insertLead(leadData);

            if (!result.success) {
                console.error('❌ Lead op failed:', result.error);
                setSubmitError(`Failed to save your submission: ${result.error || 'Unknown error'}. Please try again or call us at (407) 917-8640.`);
                setIsSubmitting(false);
                return;
            }

            // 2. Send admin notification email (template_fzhb2n2)
            console.log('📧 Sending admin notification email...');
            const adminEmailSent = await sendNotificationEmail({
                clientName: `${clientInfo.firstName} ${clientInfo.lastName}`,
                clientEmail: clientInfo.email,
                clientPhone: clientInfo.phone,
                propertyAddress: clientInfo.propertyAddress,
                county: clientInfo.county,
                caseType: clientInfo.caseType,
                documents: docNames,
                referenceId: refId,
                mailingAddress,
                notes: clientInfo.notes,
            });

            if (!adminEmailSent) {
                console.error('❌ Admin email failed');
                setSubmitError('Your information was saved, but we could not send the notification email. Please call us at (407) 917-8640 to confirm your submission.');
                setIsSubmitting(false);
                return;
            }

            // 3. Send Auto-Reply to User via EmailJS
            await sendAutoReply(clientInfo.email, clientInfo.firstName);

            console.log('✅ Submission complete — ref:', refId);
            setIsSubmitting(false);
            setCurrentStep(4);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('❌ Unexpected submission error:', err);
            setSubmitError('Something went wrong. Please try again or call us at (407) 917-8640.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F8F6]">
            {/* Portal Header */}
            <header className="fixed top-0 w-full z-[100] px-8 py-5 bg-[#F9F8F6]/80 backdrop-blur-md border-b border-black/5 flex items-center justify-between">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back to Citus</span>
                </Link>
                <div className="flex items-center gap-2">
                    {isLoading && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
                    <span className="text-2xl font-serif font-semibold italic tracking-tighter text-slate-900">
                        Citus
                    </span>
                </div>
                <a
                    href={`tel:${COMPANY.phoneTel}`}
                    className="text-sm text-slate-400 hover:text-slate-700 transition-colors font-medium"
                >
                    {COMPANY.phone}
                </a>
            </header>

            {/* Main Content */}
            <main className="pt-28 pb-20 px-6 max-w-2xl mx-auto">
                {/* Page Title */}
                {currentStep < 4 && (
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 mb-6">
                            <Shield className="w-3 h-3 text-emerald-600" />
                            <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-600">
                                Secure Client Portal
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif italic tracking-tight text-slate-900 mb-3">
                            Start Your Claim
                        </h1>
                        <p className="text-slate-400 text-sm max-w-md mx-auto">
                            Complete the steps below to submit your surplus funds claim. The entire process takes about 5 minutes.
                        </p>
                    </div>
                )}

                {/* Submit Error Banner */}
                {submitError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start gap-3">
                        <span className="text-lg mt-0.5">⚠️</span>
                        <div>
                            <p className="font-bold mb-1">Submission Failed</p>
                            <p>{submitError}</p>
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                <PortalProgress currentStep={currentStep} totalSteps={4} />

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <StepClientInfo
                            key="step1"
                            data={clientInfo}
                            onChange={setClientInfo}
                            onNext={() => {
                                setCurrentStep(2);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        />
                    )}
                    {currentStep === 2 && (
                        <StepDocuments
                            key="step2"
                            data={documents}
                            onChange={setDocuments}
                            onNext={() => {
                                setCurrentStep(3);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            onBack={() => {
                                setCurrentStep(1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        />
                    )}
                    {currentStep === 3 && (
                        <StepReviewSign
                            key="step3"
                            clientInfo={clientInfo}
                            documents={documents}
                            signature={signature}
                            onSignatureChange={setSignature}
                            onSubmit={handleSubmit}
                            onBack={() => {
                                setCurrentStep(2);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            isSubmitting={isSubmitting}
                        />
                    )}
                    {currentStep === 4 && (
                        <StepConfirmation
                            key="step4"
                            referenceId={referenceId}
                            clientName={clientInfo.firstName}
                            clientFirstName={clientInfo.firstName}
                            clientLastName={clientInfo.lastName}
                            propertyAddress={clientInfo.propertyAddress}
                            county={clientInfo.county}
                            signatureDataUrl={signature}
                        />
                    )}
                </AnimatePresence>

                {/* Footer Trust Strip */}
                {currentStep < 4 && (
                    <div className="mt-12 text-center">
                        <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold tracking-widest uppercase text-slate-300">
                            <span>🔒 SSL Encrypted</span>
                            <span>📋 HIPAA-level Privacy</span>
                            <span>🏛️ FL Bar Compliant</span>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
