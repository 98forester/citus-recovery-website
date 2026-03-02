import { useState } from 'react';
import { motion } from 'framer-motion';
import { SignaturePad } from './SignaturePad';
import { ClientInfo } from './StepClientInfo';
import { DocumentFiles } from './StepDocuments';
import { User, MapPin, FileText, CheckCircle2, ExternalLink } from 'lucide-react';

interface StepReviewSignProps {
    clientInfo: ClientInfo;
    documents: DocumentFiles;
    signature: string | null;
    onSignatureChange: (sig: string | null) => void;
    onSubmit: () => void;
    onBack: () => void;
    isSubmitting: boolean;
}

const CASE_TYPE_LABELS: Record<string, string> = {
    mortgage_foreclosure: 'Mortgage Foreclosure Surplus',
    tax_deed: 'Tax Deed Sale Surplus',
    hoa_coa: 'HOA / COA Foreclosure Surplus',
    heir_probate: 'Heir / Probate Surplus Claim',
    foreclosure_prevention: 'Foreclosure Prevention',
    other: 'Other / Not Sure',
};

export const StepReviewSign = ({
    clientInfo,
    documents,
    signature,
    onSignatureChange,
    onSubmit,
    onBack,
    isSubmitting,
}: StepReviewSignProps) => {
    const [agreements, setAgreements] = useState({
        authorize: false,
        serviceAgreement: false,
        feeStructure: false,
    });

    const allAgreed = agreements.authorize && agreements.serviceAgreement && agreements.feeStructure;
    const canSubmit = allAgreed && signature && !isSubmitting;

    const docCount =
        documents.driversLicense.length +
        documents.utilityBill.length +
        documents.w9Form.length +
        documents.additionalDocs.length;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (canSubmit) onSubmit();
    };

    return (
        <motion.form
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
            className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 space-y-8"
        >
            <div>
                <h2 className="text-2xl font-serif italic mb-1">Review & Sign</h2>
                <p className="text-sm text-slate-400">Please review your information below, acknowledge the agreements, and provide your signature to submit.</p>
            </div>

            {/* Client Info Summary */}
            <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                    <User className="w-4 h-4" />
                    Client Information
                </div>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    <div>
                        <span className="text-slate-400 text-xs">Name</span>
                        <p className="font-medium text-slate-700">{clientInfo.firstName} {clientInfo.lastName}</p>
                    </div>
                    <div>
                        <span className="text-slate-400 text-xs">Email</span>
                        <p className="font-medium text-slate-700">{clientInfo.email}</p>
                    </div>
                    <div>
                        <span className="text-slate-400 text-xs">Phone</span>
                        <p className="font-medium text-slate-700">{clientInfo.phone}</p>
                    </div>
                    <div>
                        <span className="text-slate-400 text-xs">Case Type</span>
                        <p className="font-medium text-slate-700">{CASE_TYPE_LABELS[clientInfo.caseType] || clientInfo.caseType}</p>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-4 mt-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                        <MapPin className="w-4 h-4" />
                        Addresses
                    </div>
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                        <div>
                            <span className="text-slate-400 text-xs">Mailing Address</span>
                            <p className="font-medium text-slate-700">{clientInfo.streetAddress}<br />{clientInfo.city}, {clientInfo.state} {clientInfo.zip}</p>
                        </div>
                        <div>
                            <span className="text-slate-400 text-xs">Foreclosed Property</span>
                            <p className="font-medium text-slate-700">{clientInfo.propertyAddress}<br />{clientInfo.county} County, FL</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-4 mt-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                        <FileText className="w-4 h-4" />
                        Documents Uploaded
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {documents.driversLicense.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                                <CheckCircle2 className="w-3 h-3" /> Driver's License
                            </span>
                        )}
                        {documents.utilityBill.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                                <CheckCircle2 className="w-3 h-3" /> Utility Bill
                            </span>
                        )}
                        {documents.w9Form.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                                <CheckCircle2 className="w-3 h-3" /> W9 Form
                            </span>
                        )}
                        {documents.additionalDocs.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                <CheckCircle2 className="w-3 h-3" /> {documents.additionalDocs.length} Additional
                            </span>
                        )}
                        {docCount === 0 && (
                            <span className="text-xs text-slate-400 italic">No documents uploaded</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Agreements */}
            <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Acknowledgments</p>

                <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={agreements.authorize}
                        onChange={(e) => setAgreements({ ...agreements, authorize: e.target.checked })}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                        I authorize <strong>Citus Recovery Solutions</strong> to act on my behalf in recovering surplus funds and filing all necessary legal documents with the appropriate Florida court.
                    </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={agreements.serviceAgreement}
                        onChange={(e) => setAgreements({ ...agreements, serviceAgreement: e.target.checked })}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                        I have reviewed and agree to the{' '}
                        <a href="#" className="text-emerald-600 underline inline-flex items-center gap-0.5 hover:text-emerald-700">
                            Service Agreement <ExternalLink className="w-3 h-3" />
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-emerald-600 underline inline-flex items-center gap-0.5 hover:text-emerald-700">
                            Limited Power of Attorney <ExternalLink className="w-3 h-3" />
                        </a>.
                    </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={agreements.feeStructure}
                        onChange={(e) => setAgreements({ ...agreements, feeStructure: e.target.checked })}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                        I understand that Citus Recovery Solutions operates on a <strong>contingency fee basis</strong> — I owe nothing unless funds are successfully recovered on my behalf, and the fee will be discussed and agreed upon before work begins.
                    </span>
                </label>
            </div>

            {/* Signature */}
            <SignaturePad onSignatureChange={onSignatureChange} />

            {/* Submit */}
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 py-4 border-2 border-slate-200 text-slate-600 rounded-full font-bold text-sm uppercase tracking-widest hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                    ← Back
                </button>
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`flex-[2] py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${canSubmit
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-600 shadow-lg shadow-emerald-600/25'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Submitting...
                        </span>
                    ) : (
                        'Submit My Claim ✓'
                    )}
                </button>
            </div>
        </motion.form>
    );
};
