import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Phone, Mail, Clock, FileText, Download, Loader2 } from 'lucide-react';
import { COMPANY } from '../../constants';
import { generateSignedAgreement } from '../../utils/generateAgreement';

interface StepConfirmationProps {
    referenceId: string;
    clientName: string;
    clientFirstName: string;
    clientLastName: string;
    propertyAddress: string;
    county: string;
    signatureDataUrl: string | null;
    mailingAddress: string;
}

export const StepConfirmation = ({
    referenceId,
    clientName,
    clientFirstName,
    clientLastName,
    propertyAddress,
    county,
    signatureDataUrl,
    mailingAddress,
}: StepConfirmationProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [downloaded, setDownloaded] = useState(false);

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            await generateSignedAgreement(
                {
                    clientName: `${clientFirstName} ${clientLastName}`,
                    propertyAddress,
                    mailingAddress,
                    county,
                    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                },
                signatureDataUrl
            );
            setDownloaded(true);
        } catch (err) {
            console.error('Failed to generate agreement:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-emerald-100 text-center"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
                <CheckCircle className="w-10 h-10 text-emerald-600" />
            </motion.div>

            <h2 className="text-3xl font-serif italic mb-2">Success, {clientName}!</h2>
            <p className="text-slate-500 mb-2">Your Service Agreement has been received and our recovery specialists are now assigned to your case.</p>

            <div className="inline-block bg-slate-50 border border-slate-200 rounded-xl px-6 py-3 mb-8">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Reference Number</span>
                <span className="text-xl font-mono font-bold text-slate-800 tracking-wider">{referenceId}</span>
            </div>

            {/* Download Signed Agreement & Resources */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-10 grid sm:grid-cols-2 gap-4"
            >
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-3">Your Signed Copy (PDF)</p>
                    <p className="text-xs text-slate-600 mb-4">
                        Download the official PDF version of the Services Agreement you just signed.
                    </p>
                    <button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className={`inline-flex items-center justify-center gap-2 w-full py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${downloaded
                            ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-600 shadow-lg shadow-emerald-600/25'
                            }`}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating PDF...
                            </>
                        ) : downloaded ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                PDF Downloaded
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Download Signed PDF
                            </>
                        )}
                    </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Common Forms</p>
                    <p className="text-xs text-slate-600 mb-4">
                        View or download our standard Service Agreement document.
                    </p>
                    <div className="flex flex-col gap-2">
                        <a
                            href={COMPANY.links.serviceAgreement}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition-all shadow-sm"
                        >
                            <span>SIGN SERVICE AGREEMENT</span>
                            <FileText className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </motion.div>

            <div className="max-w-md mx-auto text-left space-y-0 mb-10">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-4 text-center">What Happens Next</h3>
                {[
                    { icon: FileText, title: 'File Review', desc: 'We are verifying your documentation against the County Clerk\'s latest records.' },
                    { icon: Clock, title: 'Form Preparation', desc: 'We will prepare the official LPOA and Surplus Claim forms for your specific case.' },
                    { icon: Phone, title: 'Identity Verification', desc: 'Once ready, we will contact you to coordinate a brief identity verification session with a licensed Florida Notary.' },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.15 }}
                        className="flex gap-4 items-start py-4 border-b border-slate-100 last:border-0"
                    >
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <item.icon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">{item.title}</p>
                            <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <p className="text-sm text-slate-500 mb-8 italic">A confirmation has been sent to your email.</p>

            <div className="bg-slate-50 rounded-2xl p-6">
                <p className="text-sm text-slate-500 mb-3">Have questions? We're here to help.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                        href={`tel:${COMPANY.phoneTel}`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-700 transition-all"
                    >
                        <Phone className="w-4 h-4" />
                        {COMPANY.phone}
                    </a>
                    <a
                        href={`mailto:${COMPANY.email}`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-200 text-slate-600 rounded-full text-sm font-bold hover:border-slate-300 transition-all"
                    >
                        <Mail className="w-4 h-4" />
                        Email Us
                    </a>
                </div>
            </div>
        </motion.div>
    );
};
