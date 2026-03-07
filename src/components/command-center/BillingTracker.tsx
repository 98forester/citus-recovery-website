import React, { useState, useMemo } from 'react';

interface Service {
    id: string;
    name: string;
    cost: number;
    billingCycle: 'monthly' | 'annual';
    renewalDate: string;
    category: string;
    alternatives?: string;
    notes?: string;
    isEssential: boolean;
}

const INITIAL_SERVICES: Service[] = [
    {
        id: '1',
        name: 'Google Workspace (2 Accounts)',
        cost: 16,
        billingCycle: 'monthly',
        renewalDate: 'Monthly',
        category: 'Email / Productivity',
        notes: 'Professional business email for outreach.',
        isEssential: true
    },
    {
        id: '2',
        name: 'OpenRouter (Haiku)',
        cost: 5,
        billingCycle: 'monthly',
        renewalDate: 'Pay-as-you-go',
        category: 'AI / Bot',
        notes: 'Low cost, high reliability for bot operations.',
        isEssential: true
    },
    {
        id: '3',
        name: 'Excess Elite',
        cost: 105,
        billingCycle: 'monthly',
        renewalDate: 'Monthly',
        category: 'Skip Tracing / Calls',
        alternatives: 'BatchSkipTracing, PropertyRadar',
        notes: 'Primary for calls/texts. We handle emails.',
        isEssential: true
    },
    {
        id: '4',
        name: 'Namecheap (Domain)',
        cost: 12,
        billingCycle: 'annual',
        renewalDate: 'Annual',
        category: 'Infrastructure',
        notes: 'citusrecoverysolutions.com domain registration.',
        isEssential: true
    },
    {
        id: '5',
        name: 'Anymail Finder',
        cost: 9,
        billingCycle: 'monthly',
        renewalDate: 'Monthly',
        category: 'Email Discovery',
        notes: 'Finds verified email addresses for leads.',
        isEssential: true
    },
    {
        id: '6',
        name: 'Supabase',
        cost: 0,
        billingCycle: 'monthly',
        renewalDate: 'Free Tier',
        category: 'Database',
        notes: 'Currently on free tier. Monitor usage.',
        isEssential: true
    },
    {
        id: '7',
        name: 'Apify (Scraper)',
        cost: 49,
        billingCycle: 'monthly',
        renewalDate: 'Optional',
        category: 'Data / Discovery',
        notes: 'For automated daily county-wide scraping.',
        isEssential: false
    }
];

export const BillingTracker: React.FC = () => {
    const [services] = useState<Service[]>(INITIAL_SERVICES);

    const totals = useMemo(() => {
        let monthly = 0;
        let annual = 0;

        services.forEach(s => {
            if (s.billingCycle === 'monthly') {
                monthly += s.cost;
                annual += s.cost * 12;
            } else {
                annual += s.cost;
                monthly += s.cost / 12;
            }
        });

        return { monthly, annual };
    }, [services]);

    return (
        <div className="space-y-6">
            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Monthly Burn</p>
                    <p className="text-3xl font-bold text-emerald-400 mt-1">${totals.monthly.toFixed(2)}</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Annual Estimated</p>
                    <p className="text-3xl font-bold text-sky-400 mt-1">${totals.annual.toFixed(2)}</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Active Services</p>
                    <p className="text-3xl font-bold text-amber-400 mt-1">{services.length}</p>
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                <div className="flex items-start gap-4">
                    <div className="text-amber-400 text-xl font-bold mt-1">💡</div>
                    <div>
                        <h4 className="text-amber-400 font-bold mb-1">Cost-Cutting Opportunities</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Your tech stack is lean. OpenRouter (Haiku) is much cheaper than direct Claude/GPT-4 plans.
                            If lead volume grows, look at annual plans for Excess Elite to save ~15%.
                        </p>
                    </div>
                </div>
            </div>

            {/* Service Table */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-950/50">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Cost</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Renewal</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {services.map((service) => (
                                <tr key={service.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${service.isEssential ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                                            <span className="font-medium text-slate-100">{service.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm">{service.category}</td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-slate-100">${service.cost}</span>
                                        <span className="text-slate-500 text-xs ml-1">/{service.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm uppercase tracking-tighter">{service.renewalDate}</td>
                                    <td className="px-6 py-4 text-slate-400 text-sm max-w-xs truncate">{service.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
