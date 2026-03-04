import React from 'react';

// ════════════════════════════════════════════════════════════════
// LeadFilters — Status/Tier/Search filters for Command Center
// ════════════════════════════════════════════════════════════════

type FilterStatus = 'all' | 'pending_review' | 'qualified' | 'needs_review' | 'outreach_sent' | 'HOT_LEAD' | 'low_value';
type FilterTier = 'all' | 'tier_1_priority' | 'qualified' | 'standard';

interface LeadFiltersProps {
    filterStatus: FilterStatus;
    filterTier: FilterTier;
    searchQuery: string;
    onStatusChange: (status: FilterStatus) => void;
    onTierChange: (tier: FilterTier) => void;
    onSearchChange: (query: string) => void;
}

const statusOptions: { value: FilterStatus; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '📊' },
    { value: 'pending_review', label: 'Pending', icon: '⏳' },
    { value: 'qualified', label: 'Qualified', icon: '✅' },
    { value: 'needs_review', label: 'Needs Review', icon: '⚠️' },
    { value: 'outreach_sent', label: 'Outreach Sent', icon: '✉️' },
    { value: 'HOT_LEAD', label: 'Hot Lead', icon: '🔥' },
    { value: 'low_value', label: 'Low Value', icon: '📉' },
];

const tierOptions: { value: FilterTier; label: string }[] = [
    { value: 'all', label: 'All Tiers' },
    { value: 'tier_1_priority', label: '🔥 Tier 1' },
    { value: 'qualified', label: '⭐ Qualified' },
    { value: 'standard', label: '○ Standard' },
];

export function LeadFilters({
    filterStatus,
    filterTier,
    searchQuery,
    onStatusChange,
    onTierChange,
    onSearchChange,
}: LeadFiltersProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search by name, case, county..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/25 transition-all"
                />
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
                {statusOptions.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => onStatusChange(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${filterStatus === opt.value
                                ? 'bg-violet-500/20 border border-violet-500/40 text-violet-300'
                                : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'
                            }`}
                    >
                        <span className="mr-1">{opt.icon}</span>
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Tier Dropdown */}
            <select
                value={filterTier}
                onChange={(e) => onTierChange(e.target.value as FilterTier)}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 focus:outline-none focus:border-violet-500/50 cursor-pointer appearance-none"
                style={{ backgroundImage: 'none' }}
            >
                {tierOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#1a1a2e] text-white">
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
