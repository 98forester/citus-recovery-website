import React from 'react';

// ════════════════════════════════════════════════════════════════
// LeadCard — Premium lead card with tier badges, status pills,
// Recovery Memo expand, and Launch Outreach button
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
    dob: string | null;
    agreement_link: string | null;
    lpoa_link: string | null;
}

interface LeadCardProps {
    lead: Lead;
    isExpanded: boolean;
    isOutreachLoading: boolean;
    onToggleMemo: () => void;
    onLaunchOutreach: () => void;
    onQualify: () => void;
    onEditLinks: (lead: Lead) => void;
    onViewDetails: (lead: Lead) => void;
    onCheckClaim?: () => void;
    isClaimCheckLoading?: boolean;
    isTier1?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending_review: { label: 'Pending Review', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    qualified: { label: 'Qualified', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    needs_review: { label: 'Needs Review', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    outreach_sent: { label: 'Outreach Sent', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    HOT_LEAD: { label: '🔥 HOT LEAD', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    low_value: { label: 'Low Value', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
    new: { label: 'New', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    no_response: { label: 'No Response', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
    opted_out: { label: 'Opted Out', color: 'text-red-300', bg: 'bg-red-500/5 border-red-500/10' },
};

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatCurrency(amount: number | null): string {
    if (!amount) return '$0';
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function LeadCard({
    lead,
    isExpanded,
    isOutreachLoading,
    onToggleMemo,
    onLaunchOutreach,
    onQualify,
    onEditLinks,
    onViewDetails,
    onCheckClaim,
    isClaimCheckLoading = false,
    isTier1 = false,
}: LeadCardProps) {
    const statusInfo = statusConfig[lead.status] || statusConfig.new;
    const canLaunchOutreach = ['qualified', 'needs_review'].includes(lead.status);
    const canQualify = lead.status === 'pending_review' || lead.status === 'new';
    const canCheckClaim = !!lead.case_number && lead.claim_status !== 'no_claim';
    const hasLiens = !!(lead.liens && (Array.isArray(lead.liens) ? (lead.liens as unknown[]).length > 0 : typeof lead.liens === 'object' && Object.keys(lead.liens as Record<string, unknown>).length > 0));

    const isDeceased = (lead.notes?.toLowerCase().includes('deceased') ||
        lead.notes?.toLowerCase().includes('died') ||
        lead.case_type?.toLowerCase().includes('deceased') ||
        lead.owner_name?.toLowerCase().includes('est of') ||
        lead.owner_name?.toLowerCase().includes('estate'));

    const hasMultiplePhones = (lead.phone || '').split(/[,\s;/]+/).filter(p => p.trim()).length > 1;

    return (
        <div
            className={`rounded-xl border transition-all duration-300 overflow-hidden ${isTier1
                ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/[0.03] to-orange-500/[0.03] shadow-lg shadow-amber-500/5 hover:shadow-amber-500/10'
                : lead.status === 'HOT_LEAD'
                    ? 'border-red-500/30 bg-gradient-to-r from-red-500/[0.03] to-rose-500/[0.03] shadow-lg shadow-red-500/5'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15'
                }`}
        >
            <div className="p-5">
                {/* ── Top Row: Name + Badges ──────────────────── */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <button
                                onClick={() => onViewDetails(lead)}
                                className="text-base font-semibold text-white truncate hover:text-violet-400 transition-colors text-left"
                            >
                                {lead.owner_name || 'Unknown'}
                            </button>
                            {isTier1 && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider text-amber-400 whitespace-nowrap">
                                    🔥 Tier 1
                                </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-medium uppercase tracking-wider ${statusInfo.bg} ${statusInfo.color} whitespace-nowrap`}>
                                {statusInfo.label}
                            </span>
                            {isDeceased && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-500/10 border border-slate-500/20 text-[10px] font-bold text-slate-400 whitespace-nowrap flex items-center gap-1">
                                    <span>💀</span> Deceased
                                </span>
                            )}
                            <button
                                onClick={() => onEditLinks(lead)}
                                className="p-1 px-1.5 rounded bg-white/5 border border-white/10 text-white/40 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex items-center gap-1 group"
                                title="Edit Signature Links"
                            >
                                <span className="text-[10px]">🔗</span>
                                <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">LINKS</span>
                            </button>
                        </div>
                        <p className="text-xs text-white/30">
                            {lead.case_number && <span>Case #{lead.case_number} • </span>}
                            {lead.county && <span>{lead.county} County, {lead.state || 'FL'} • </span>}
                            {formatDate(lead.created_at)}
                        </p>
                    </div>

                    {/* Surplus Amount */}
                    <div className="text-right flex-shrink-0">
                        <div className={`text-xl font-bold tabular-nums ${isTier1 ? 'text-amber-400' : lead.status === 'HOT_LEAD' ? 'text-red-400' : 'text-emerald-400'}`}>
                            {formatCurrency(lead.surplus_amount_numeric)}
                        </div>
                        <p className="text-[10px] text-white/30 uppercase tracking-wider">Surplus</p>
                    </div>
                </div>

                {/* ── Details Grid ────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <DetailItem label="Property" value={lead.property_address} />
                    <DetailItem label="Mailing Address" value={lead.last_known_address} />
                    <DetailItem label="Source" value={lead.source} />
                    <DetailItem
                        label="Phone"
                        value={hasMultiplePhones ? '📞 Multiple Contacts' : lead.phone}
                        className={hasMultiplePhones ? 'text-violet-400 font-bold' : ''}
                    />
                </div>

                {/* ── Warnings & Status Badges ─────────────────── */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {hasLiens && (
                        <span className="px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-[10px] font-medium text-orange-400">
                            ⚠️ Has Liens
                        </span>
                    )}
                    {lead.waiting_period_end && new Date(lead.waiting_period_end) > new Date() && (
                        <span className="px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-medium text-yellow-400">
                            🕐 Waiting Period: {lead.waiting_period_end}
                        </span>
                    )}
                    {/* Claim Status Badge */}
                    {lead.claim_status === 'no_claim' && (
                        <span className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-400">
                            ✅ No Claim Filed
                        </span>
                    )}
                    {lead.claim_status === 'claim_filed' && (
                        <span className="px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-[10px] font-medium text-red-400">
                            ⛔ Claim Filed
                        </span>
                    )}
                    {lead.claim_status === 'partial_claim' && (
                        <span className="px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-medium text-amber-400">
                            ⚠️ Partial Claim (Check Amount)
                        </span>
                    )}
                    {/* Follow-Up Sequence Indicator */}
                    {lead.sequence_active && lead.follow_up_step !== null && (
                        <span className="px-2 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-[10px] font-medium text-violet-400">
                            📧 Follow-up {lead.follow_up_step}/4{lead.next_follow_up_at ? ` · Next: ${new Date(lead.next_follow_up_at).toLocaleDateString()}` : ''}
                        </span>
                    )}
                    {lead.status === 'no_response' && (
                        <span className="px-2 py-1 rounded-md bg-gray-500/10 border border-gray-500/20 text-[10px] font-medium text-gray-400">
                            📭 Sequence Complete — No Response
                        </span>
                    )}
                </div>

                {/* ── Action Buttons ──────────────────────────── */}
                <div className="flex items-center gap-2 flex-wrap">
                    {canCheckClaim && onCheckClaim && (
                        <button
                            onClick={onCheckClaim}
                            disabled={isClaimCheckLoading}
                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${isClaimCheckLoading
                                ? 'bg-white/5 border border-white/10 text-white/30 cursor-wait'
                                : 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25'
                                }`}
                        >
                            {isClaimCheckLoading ? '⏳ Checking...' : '🔍 Check Claim'}
                        </button>
                    )}

                    {canQualify && (
                        <button
                            onClick={onQualify}
                            className="px-4 py-2 rounded-lg bg-violet-500/15 border border-violet-500/30 text-xs font-medium text-violet-300 hover:bg-violet-500/25 transition-all duration-200"
                        >
                            🧠 Qualify with Citus1Bot
                        </button>
                    )}

                    {canLaunchOutreach && (
                        <button
                            onClick={onLaunchOutreach}
                            disabled={isOutreachLoading}
                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${isOutreachLoading
                                ? 'bg-white/5 border border-white/10 text-white/30 cursor-wait'
                                : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30'
                                }`}
                        >
                            {isOutreachLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 border border-white/30 border-t-white/80 rounded-full animate-spin" />
                                    Sending...
                                </span>
                            ) : (
                                '🚀 Launch Outreach'
                            )}
                        </button>
                    )}

                    {lead.status === 'HOT_LEAD' && (
                        <span className="px-4 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-xs font-bold text-red-400 animate-pulse">
                            🔥 READY TO CLOSE
                        </span>
                    )}

                    {lead.agreement_link && (
                        <a
                            href={lead.agreement_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg bg-emerald-500 text-emerald-950 text-xs font-bold hover:bg-emerald-400 transition-all duration-200 shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                        >
                            <span>📝</span> Sign Agreement
                        </a>
                    )}

                    {lead.lpoa_link && (
                        <a
                            href={lead.lpoa_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg bg-emerald-500 text-emerald-950 text-xs font-bold hover:bg-emerald-400 transition-all duration-200 shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                        >
                            <span>⚖️</span> Sign LPOA
                        </a>
                    )}

                    {lead.recovery_memo && (
                        <button
                            onClick={onToggleMemo}
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white/50 hover:bg-white/10 hover:text-white/70 transition-all duration-200 ml-auto"
                        >
                            {isExpanded ? '▲ Hide Memo' : '▼ View Recovery Memo'}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Expanded Recovery Memo ─────────────────────── */}
            {isExpanded && lead.recovery_memo && (
                <div className="border-t border-white/5 bg-white/[0.02] p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm">📋</span>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Recovery Memo — Citus1Bot Analysis</h4>
                    </div>
                    <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap font-mono bg-white/[0.02] rounded-lg p-4 border border-white/5">
                        {lead.recovery_memo}
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailItem({ label, value, className = '' }: { label: string; value: string | null; className?: string }) {
    return (
        <div>
            <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">{label}</p>
            <p className={`text-xs truncate ${className || 'text-white/60'}`}>{value || '—'}</p>
        </div>
    );
}
