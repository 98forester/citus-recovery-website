import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { StatsBar } from '../components/command-center/StatsBar';
import { LeadFilters } from '../components/command-center/LeadFilters';
import { LeadCard } from '../components/command-center/LeadCard';

// ════════════════════════════════════════════════════════════════
// Command Center — Citus-Antigravity HITL Dashboard
// ════════════════════════════════════════════════════════════════

interface Lead {
    id: string;
    created_at: string;
    owner_name: string;
    email: string | null;
    phone: string | null;
    property_address: string | null;
    county: string | null;
    surplus_amount: string | null;
    surplus_amount_numeric: number | null;
    case_number: string | null;
    case_type: string | null;
    mailing_address: string | null;
    last_known_address: string | null;
    notes: string | null;
    source: string | null;
    status: string;
    tier: string;
    recovery_memo: string | null;
    qualified_at: string | null;
    outreach_sent_at: string | null;
    state: string | null;
    waiting_period_end: string | null;
    liens: unknown;
    competing_claims: unknown;
    claim_status: string | null;
    claim_details: Record<string, unknown> | null;
    follow_up_step: number | null;
    sequence_active: boolean | null;
    next_follow_up_at: string | null;
}

type FilterStatus = 'all' | 'pending_review' | 'qualified' | 'needs_review' | 'outreach_sent' | 'HOT_LEAD' | 'low_value';
type FilterTier = 'all' | 'tier_1_priority' | 'qualified' | 'standard';

export function CommandCenter() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [filterTier, setFilterTier] = useState<FilterTier>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [outreachLoading, setOutreachLoading] = useState<string | null>(null);
    const [claimCheckLoading, setClaimCheckLoading] = useState<string | null>(null);
    const [expandedMemo, setExpandedMemo] = useState<string | null>(null);

    // ── Fetch leads ────────────────────────────────────────────
    const fetchLeads = useCallback(async () => {
        try {
            let query = supabase.from('leads').select('*').order('created_at', { ascending: false });

            if (filterStatus !== 'all') {
                query = query.eq('status', filterStatus);
            }
            if (filterTier !== 'all') {
                query = query.eq('tier', filterTier);
            }

            const { data, error } = await query;
            if (error) {
                console.error('Failed to fetch leads:', error);
                return;
            }

            // Sort: Tier 1 Priority first, then by surplus amount desc
            const sorted = (data || []).sort((a: Lead, b: Lead) => {
                if (a.tier === 'tier_1_priority' && b.tier !== 'tier_1_priority') return -1;
                if (b.tier === 'tier_1_priority' && a.tier !== 'tier_1_priority') return 1;
                return (b.surplus_amount_numeric || 0) - (a.surplus_amount_numeric || 0);
            });

            setLeads(sorted);
        } catch (err) {
            console.error('Error fetching leads:', err);
        } finally {
            setLoading(false);
        }
    }, [filterStatus, filterTier]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // ── Real-time subscription ─────────────────────────────────
    useEffect(() => {
        const channel = supabase
            .channel('leads-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
                fetchLeads();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchLeads]);

    // ── Launch Outreach ────────────────────────────────────────
    const handleLaunchOutreach = async (leadId: string) => {
        setOutreachLoading(leadId);
        try {
            const res = await fetch('/api/launch-outreach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead_id: leadId }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(`Outreach failed: ${data.error || data.message || 'Unknown error'}`);
                return;
            }

            // Refresh leads
            fetchLeads();
        } catch (err) {
            alert(`Outreach error: ${err}`);
        } finally {
            setOutreachLoading(null);
        }
    };

    // ── Qualify Lead ───────────────────────────────────────────
    const handleQualifyLead = async (leadId: string) => {
        try {
            const res = await fetch('/api/qualify-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead_id: leadId }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(`Qualification failed: ${data.error || 'Unknown error'}`);
                return;
            }

            fetchLeads();
        } catch (err) {
            alert(`Qualify error: ${err}`);
        }
    };

    // ── Check Claim ───────────────────────────────────────────
    const handleCheckClaim = async (lead: Lead) => {
        if (!lead.case_number || !lead.county) {
            // No case number — open realtdm for the county in a new tab
            alert('This lead has no case number. Please add one before checking claims.');
            return;
        }

        setClaimCheckLoading(lead.id);
        try {
            const res = await fetch('/api/check-claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead_id: lead.id }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(`Claim check failed: ${data.error || 'Unknown error'}`);
                return;
            }

            // Open the realtdm URL in a new tab for manual verification
            if (data.realtdm_url) {
                window.open(data.realtdm_url, '_blank');
            }

            fetchLeads();
        } catch (err) {
            alert(`Claim check error: ${err}`);
        } finally {
            setClaimCheckLoading(null);
        }
    };

    // ── Export CSV for Excess Elite ───────────────────────────
    const handleExportCSV = () => {
        if (filteredLeads.length === 0) {
            alert('No leads to export.');
            return;
        }

        // Excess Elite CSV format: First Name, Last Name, Email, Phone 1, Phone 1 Type, Address, City, State, Zip, Tags
        const headers = ['First Name', 'Last Name', 'Email', 'Phone 1', 'Phone 1: Type', 'Address 1', 'City', 'State', 'Postal Code', 'Tags'];

        const rows = filteredLeads.map((lead) => {
            const nameParts = (lead.owner_name || '').split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            const tags = [
                lead.state?.toLowerCase() || 'fl',
                lead.county?.toLowerCase() || '',
                lead.case_type?.toLowerCase() || 'surplus',
                lead.tier || '',
            ].filter(Boolean).join(', ');

            // Parse address parts
            const addr = lead.mailing_address || lead.last_known_address || lead.property_address || '';

            return [
                firstName,
                lastName,
                lead.email || '',
                lead.phone || '',
                'mobile',
                addr,
                '',
                lead.state || 'FL',
                '',
                tags,
            ];
        });

        const csvContent = [headers, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `excess-elite-import-${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
        URL.revokeObjectURL(url);
    };

    // ── Filter leads by search ─────────────────────────────────
    const filteredLeads = leads.filter((lead) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            lead.owner_name?.toLowerCase().includes(q) ||
            lead.case_number?.toLowerCase().includes(q) ||
            lead.county?.toLowerCase().includes(q) ||
            lead.property_address?.toLowerCase().includes(q)
        );
    });

    // ── Stats ──────────────────────────────────────────────────
    const stats = {
        total: leads.length,
        qualified: leads.filter((l) => l.status === 'qualified').length,
        hotLeads: leads.filter((l) => l.status === 'HOT_LEAD').length,
        tier1: leads.filter((l) => l.tier === 'tier_1_priority').length,
        totalSurplus: leads.reduce((sum, l) => sum + (l.surplus_amount_numeric || 0), 0),
        pendingReview: leads.filter((l) => l.status === 'pending_review').length,
        outreachSent: leads.filter((l) => l.status === 'outreach_sent').length,
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* ── Header ────────────────────────────────────────── */}
            <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-violet-500/25">
                            C
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold tracking-tight">Command Center</h1>
                            <p className="text-xs text-white/40">Citus-Antigravity v1.0</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs text-emerald-400 font-medium">System Online</span>
                        </div>
                        <button
                            onClick={handleExportCSV}
                            className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-sm text-red-400 transition-all duration-200 hover:border-red-500/30"
                        >
                            📤 Export for Excess Elite
                        </button>
                        <button
                            onClick={fetchLeads}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all duration-200 hover:border-white/20"
                        >
                            ↻ Refresh
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
                {/* ── Stats Bar ─────────────────────────────────── */}
                <StatsBar stats={stats} />

                {/* ── Filters ───────────────────────────────────── */}
                <LeadFilters
                    filterStatus={filterStatus}
                    filterTier={filterTier}
                    searchQuery={searchQuery}
                    onStatusChange={setFilterStatus}
                    onTierChange={setFilterTier}
                    onSearchChange={setSearchQuery}
                />

                {/* ── Lead List ─────────────────────────────────── */}
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                            <p className="text-white/40 text-sm">Loading pipeline data...</p>
                        </div>
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl mb-4">📭</div>
                        <h3 className="text-lg font-medium text-white/60">No leads found</h3>
                        <p className="text-sm text-white/30 mt-1">Adjust your filters or wait for Gravity Claw to find new leads.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Tier 1 Priority Section */}
                        {filteredLeads.some((l) => l.tier === 'tier_1_priority') && (
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-lg">🔥</span>
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400">
                                        Tier 1 Priority Queue
                                    </h2>
                                    <div className="flex-1 h-px bg-gradient-to-r from-amber-500/30 to-transparent" />
                                </div>
                                <div className="grid gap-4">
                                    {filteredLeads
                                        .filter((l) => l.tier === 'tier_1_priority')
                                        .map((lead) => (
                                            <LeadCard
                                                key={lead.id}
                                                lead={lead}
                                                isExpanded={expandedMemo === lead.id}
                                                isOutreachLoading={outreachLoading === lead.id}
                                                isClaimCheckLoading={claimCheckLoading === lead.id}
                                                onToggleMemo={() => setExpandedMemo(expandedMemo === lead.id ? null : lead.id)}
                                                onLaunchOutreach={() => handleLaunchOutreach(lead.id)}
                                                onQualify={() => handleQualifyLead(lead.id)}
                                                onCheckClaim={() => handleCheckClaim(lead)}
                                                isTier1
                                            />
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Standard Leads */}
                        {filteredLeads.some((l) => l.tier !== 'tier_1_priority') && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-lg">📋</span>
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">
                                        All Leads
                                    </h2>
                                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                                </div>
                                <div className="grid gap-3">
                                    {filteredLeads
                                        .filter((l) => l.tier !== 'tier_1_priority')
                                        .map((lead) => (
                                            <LeadCard
                                                key={lead.id}
                                                lead={lead}
                                                isExpanded={expandedMemo === lead.id}
                                                isOutreachLoading={outreachLoading === lead.id}
                                                isClaimCheckLoading={claimCheckLoading === lead.id}
                                                onToggleMemo={() => setExpandedMemo(expandedMemo === lead.id ? null : lead.id)}
                                                onLaunchOutreach={() => handleLaunchOutreach(lead.id)}
                                                onQualify={() => handleQualifyLead(lead.id)}
                                                onCheckClaim={() => handleCheckClaim(lead)}
                                            />
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* ── Footer ────────────────────────────────────────── */}
            <footer className="border-t border-white/5 py-6 mt-16">
                <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between text-xs text-white/20">
                    <span>Citus-Antigravity • Surplus Funds Recovery Pipeline</span>
                    <span>Powered by Gravity Claw + Citus1Bot + Excess Elite</span>
                </div>
            </footer>
        </div>
    );
}
