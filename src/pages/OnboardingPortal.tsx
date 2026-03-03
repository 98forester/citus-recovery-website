import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { PortalProgress } from '../components/portal/PortalProgress';
import { StepClientInfo, ClientInfo } from '../components/portal/StepClientInfo';
import { StepDocuments, DocumentFiles } from '../components/portal/StepDocuments';
import { StepReviewSign } from '../components/portal/StepReviewSign';
import { StepConfirmation } from '../components/portal/StepConfirmation';
import { sendNotificationEmail, sendClaimantWelcomeEmail, generateReferenceId } from '../utils/emailNotification';
import { insertLead } from '../utils/supabaseClient';
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
    const [currentStep, setCurrentStep] = useState(1);
    const [clientInfo, setClientInfo] = useState<ClientInfo>(INITIAL_CLIENT_INFO);
    const [documents, setDocuments] = useState<DocumentFiles>(INITIAL_DOCUMENTS);
    const [signature, setSignature] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [referenceId, setReferenceId] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError(null);

        const refId = generateReferenceId();
        setReferenceId(refId);

        // Collect document names
        const docNames: string[] = [];
        if (documents.driversLicense.length > 0) docNames.push("Driver's License");
        documents.additionalDocs.forEach((f) => docNames.push(f.name));

        const mailingAddress = `${clientInfo.streetAddress}, ${clientInfo.city}, ${clientInfo.state} ${clientInfo.zip}`;

        try {
            // Save to Supabase
            console.log('📤 Submitting lead to Supabase...');
            const { success, error: dbError } = await insertLead({
                owner_name: `${clientInfo.firstName} ${clientInfo.lastName}`,
                email: clientInfo.email,
                phone: clientInfo.phone,
                property_address: clientInfo.propertyAddress,
                county: clientInfo.county,
                case_type: clientInfo.caseType,
                mailing_address: mailingAddress,
                notes: clientInfo.notes,
                source: 'portal',
                documents: docNames,
                signature_data: signature || undefined,
                reference_id: refId,
            });

            if (!success) {
                console.error('❌ Lead insert failed:', dbError);
                setSubmitError(`Failed to save your submission: ${dbError || 'Unknown error'}. Please try again or call us at (407) 917-8640.`);
                setIsSubmitting(false);
                return; // Stop — do NOT show success page
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

            // 3. Send claimant welcome email (template_f69k4vn)
            console.log('📧 Sending claimant welcome email...');
            const welcomeEmailSent = await sendClaimantWelcomeEmail({
                name: `${clientInfo.firstName} ${clientInfo.lastName}`,
                email: clientInfo.email,
                referenceId: refId,
            });

            if (!welcomeEmailSent) {
                console.warn('⚠️ Claimant welcome email failed, but lead and admin notification succeeded.');
            }

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
                <span className="text-2xl font-serif font-semibold italic tracking-tighter text-slate-900">
                    Citus
                </span>
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
