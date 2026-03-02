import { motion } from 'framer-motion';
import { FileUploadCard } from './FileUploadCard';
import { Shield } from 'lucide-react';

export interface DocumentFiles {
    driversLicense: File[];
    utilityBill: File[];
    w9Form: File[];
    additionalDocs: File[];
}

interface StepDocumentsProps {
    data: DocumentFiles;
    onChange: (data: DocumentFiles) => void;
    onNext: () => void;
    onBack: () => void;
}

export const StepDocuments = ({ data, onChange, onNext, onBack }: StepDocumentsProps) => {
    const updateField = (field: keyof DocumentFiles, files: File[]) => {
        onChange({ ...data, [field]: files });
    };

    const canProceed = data.driversLicense.length > 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (canProceed) onNext();
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
                <h2 className="text-2xl font-serif italic mb-1">Upload Your Documents</h2>
                <p className="text-sm text-slate-400">
                    These documents are needed to verify your identity and file your claim. All files are encrypted and stored securely.
                </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-start">
                <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-emerald-800">Your documents are secure</p>
                    <p className="text-xs text-emerald-600 mt-0.5">All uploads are encrypted and only accessible to our legal team. We never share your information with third parties.</p>
                </div>
            </div>

            <div className="space-y-6">
                <FileUploadCard
                    label="Driver's License or Government ID"
                    description="Upload a clear photo or scan of your valid ID"
                    required
                    accept=".pdf,.jpg,.jpeg,.png,.heic"
                    files={data.driversLicense}
                    onFilesChange={(files) => updateField('driversLicense', files)}
                />

                <FileUploadCard
                    label="Utility Bill (Proof of Address)"
                    description="Recent utility bill showing your current mailing address"
                    accept=".pdf,.jpg,.jpeg,.png,.heic"
                    files={data.utilityBill}
                    onFilesChange={(files) => updateField('utilityBill', files)}
                />

                <FileUploadCard
                    label="W9 Form"
                    description="Required by some counties for tax reporting purposes"
                    accept=".pdf,.jpg,.jpeg,.png"
                    files={data.w9Form}
                    onFilesChange={(files) => updateField('w9Form', files)}
                />

                <FileUploadCard
                    label="Additional Documents"
                    description="Any other relevant documents (deed, court notices, letters received, etc.)"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    multiple
                    files={data.additionalDocs}
                    onFilesChange={(files) => updateField('additionalDocs', files)}
                />
            </div>

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
                    disabled={!canProceed}
                    className={`flex-[2] py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${canProceed
                            ? 'bg-slate-900 text-white hover:bg-slate-700 focus:ring-slate-900'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                >
                    Continue to Review →
                </button>
            </div>
        </motion.form>
    );
};
