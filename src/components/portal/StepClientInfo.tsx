import { motion } from 'framer-motion';

const FL_COUNTIES = [
    'Alachua', 'Baker', 'Bay', 'Bradford', 'Brevard', 'Broward', 'Calhoun', 'Charlotte', 'Citrus',
    'Clay', 'Collier', 'Columbia', 'DeSoto', 'Dixie', 'Duval', 'Escambia', 'Flagler', 'Franklin',
    'Gadsden', 'Gilchrist', 'Glades', 'Gulf', 'Hamilton', 'Hardee', 'Hendry', 'Hernando', 'Highlands',
    'Hillsborough', 'Holmes', 'Indian River', 'Jackson', 'Jefferson', 'Lafayette', 'Lake', 'Lee',
    'Leon', 'Levy', 'Liberty', 'Madison', 'Manatee', 'Marion', 'Martin', 'Miami-Dade', 'Monroe',
    'Nassau', 'Okaloosa', 'Okeechobee', 'Orange', 'Osceola', 'Palm Beach', 'Pasco', 'Pinellas',
    'Polk', 'Putnam', 'Santa Rosa', 'Sarasota', 'Seminole', 'St. Johns', 'St. Lucie', 'Sumter',
    'Suwannee', 'Taylor', 'Union', 'Volusia', 'Wakulla', 'Walton', 'Washington',
];

export interface ClientInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
    propertyAddress: string;
    county: string;
    caseType: string;
    notes: string;
}

interface StepClientInfoProps {
    data: ClientInfo;
    onChange: (data: ClientInfo) => void;
    onNext: () => void;
}

const inputClass =
    'w-full px-4 py-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all bg-white';
const labelClass = 'block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2';

export const StepClientInfo = ({ data, onChange, onNext }: StepClientInfoProps) => {
    const update = (field: keyof ClientInfo, value: string) => {
        onChange({ ...data, [field]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <motion.form
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
            className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 space-y-6"
        >
            <div>
                <h2 className="text-2xl font-serif italic mb-1">Tell us about yourself</h2>
                <p className="text-sm text-slate-400">This information helps us locate your claim and contact you with updates.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                <div>
                    <label htmlFor="portal-first" className={labelClass}>First Name *</label>
                    <input id="portal-first" type="text" required value={data.firstName} onChange={(e) => update('firstName', e.target.value)} className={inputClass} />
                </div>
                <div>
                    <label htmlFor="portal-last" className={labelClass}>Last Name *</label>
                    <input id="portal-last" type="text" required value={data.lastName} onChange={(e) => update('lastName', e.target.value)} className={inputClass} />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                <div>
                    <label htmlFor="portal-email" className={labelClass}>Email *</label>
                    <input id="portal-email" type="email" required value={data.email} onChange={(e) => update('email', e.target.value)} className={inputClass} />
                </div>
                <div>
                    <label htmlFor="portal-phone" className={labelClass}>Phone *</label>
                    <input id="portal-phone" type="tel" required value={data.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} />
                </div>
            </div>

            <div className="pt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-3">Mailing Address</p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="portal-street" className={labelClass}>Street Address *</label>
                        <input id="portal-street" type="text" required value={data.streetAddress} onChange={(e) => update('streetAddress', e.target.value)} className={inputClass} />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="portal-city" className={labelClass}>City *</label>
                            <input id="portal-city" type="text" required value={data.city} onChange={(e) => update('city', e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="portal-state" className={labelClass}>State *</label>
                            <input id="portal-state" type="text" required value={data.state} onChange={(e) => update('state', e.target.value)} className={inputClass} placeholder="FL" />
                        </div>
                        <div>
                            <label htmlFor="portal-zip" className={labelClass}>ZIP Code *</label>
                            <input id="portal-zip" type="text" required value={data.zip} onChange={(e) => update('zip', e.target.value)} className={inputClass} placeholder="33702" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-3">Property Information</p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="portal-property" className={labelClass}>Foreclosed Property Address *</label>
                        <input id="portal-property" type="text" required value={data.propertyAddress} onChange={(e) => update('propertyAddress', e.target.value)} className={inputClass} placeholder="Full address of the foreclosed property" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="portal-county" className={labelClass}>Florida County *</label>
                            <select id="portal-county" required value={data.county} onChange={(e) => update('county', e.target.value)} className={inputClass + ' bg-white'}>
                                <option value="">Select county...</option>
                                {FL_COUNTIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="portal-case" className={labelClass}>Case Type *</label>
                            <select id="portal-case" required value={data.caseType} onChange={(e) => update('caseType', e.target.value)} className={inputClass + ' bg-white'}>
                                <option value="">Select type...</option>
                                <option value="mortgage_foreclosure">Mortgage Foreclosure Surplus</option>
                                <option value="tax_deed">Tax Deed Sale Surplus</option>
                                <option value="hoa_coa">HOA / COA Foreclosure Surplus</option>
                                <option value="heir_probate">Heir / Probate Surplus Claim</option>
                                <option value="foreclosure_prevention">Foreclosure Prevention</option>
                                <option value="other">Other / Not Sure</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <label htmlFor="portal-notes" className={labelClass}>Additional Notes</label>
                <textarea
                    id="portal-notes"
                    rows={3}
                    value={data.notes}
                    onChange={(e) => update('notes', e.target.value)}
                    className={inputClass + ' resize-none'}
                    placeholder="Anything else we should know — case number, timeline, questions, etc."
                />
            </div>

            <button
                type="submit"
                className="w-full py-4 bg-slate-900 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
                Continue to Documents →
            </button>
        </motion.form>
    );
};
