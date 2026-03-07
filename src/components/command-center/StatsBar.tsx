import React from 'react';

// ════════════════════════════════════════════════════════════════
// StatsBar — Glassmorphism stat cards for Command Center
// ════════════════════════════════════════════════════════════════

interface Stats {
    total: number;
    qualified: number;
    hotLeads: number;
    tier1: number;
    totalSurplus: number;
    pendingReview: number;
    outreachSent: number;
}

interface StatsBarProps {
    stats: Stats;
}

const statCards = [
    {
        key: 'total',
        label: 'Total Leads',
        icon: '📊',
        color: 'from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        format: (v: number) => v.toLocaleString(),
    },
    {
        key: 'tier1',
        label: 'Tier 1 Priority',
        icon: '🔥',
        color: 'from-amber-500/20 to-orange-500/20',
        border: 'border-amber-500/20',
        text: 'text-amber-400',
        format: (v: number) => v.toLocaleString(),
    },
    {
        key: 'hotLeads',
        label: 'Hot Leads',
        icon: '🎯',
        color: 'from-red-500/20 to-rose-500/20',
        border: 'border-red-500/20',
        text: 'text-red-400',
        format: (v: number) => v.toLocaleString(),
    },
    {
        key: 'qualified',
        label: 'Qualified',
        icon: '✅',
        color: 'from-emerald-500/20 to-green-500/20',
        border: 'border-emerald-500/20',
        text: 'text-emerald-400',
        format: (v: number) => v.toLocaleString(),
    },
    {
        key: 'pendingReview',
        label: 'Pending Review',
        icon: '⏳',
        color: 'from-yellow-500/20 to-amber-500/20',
        border: 'border-yellow-500/20',
        text: 'text-yellow-400',
        format: (v: number) => v.toLocaleString(),
    },
    {
        key: 'outreachSent',
        label: 'Outreach Sent',
        icon: '✉️',
        color: 'from-violet-500/20 to-purple-500/20',
        border: 'border-violet-500/20',
        text: 'text-violet-400',
        format: (v: number) => v.toLocaleString(),
    },
    {
        key: 'totalSurplus',
        label: 'Total Surplus Value',
        icon: '💰',
        color: 'from-emerald-500/20 to-teal-500/20',
        border: 'border-emerald-500/20',
        text: 'text-emerald-400',
        format: (v: number) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    },
];

export function StatsBar({ stats }: StatsBarProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {statCards.map((card) => {
                const value = stats[card.key as keyof Stats];
                return (
                    <div
                        key={card.key}
                        className={`relative overflow-hidden rounded-xl border ${card.border} bg-gradient-to-br ${card.color} backdrop-blur-sm p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group`}
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{card.icon}</span>
                                <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">{card.label}</span>
                            </div>
                            <div className={`text-2xl font-bold ${card.text} tabular-nums`}>
                                {card.format(value)}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
