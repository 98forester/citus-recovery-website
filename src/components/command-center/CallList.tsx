import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

// ════════════════════════════════════════════════════════════════
// Call List — HOT LEADs to contact today
// Shows all HOT_LEAD status leads with call/text tracking
// ════════════════════════════════════════════════════════════════

interface Lead {
    id: string;
    owner_name: string;
    email: string | null;
    phone: string | null;
    county: string | null;
    surplus_amount: string | null;
    case_number: string | null;
    property_address: string | null;
    status: string;
    created_at: string;
    outreach_sent_at: string | null;
    contacted_at: string | null;
    contact_method: string | null;
    contact_notes: string | null;
}

interface CallListProps {
    leads: Lead[];
    onRefresh: () => void;
}

export function CallList({ leads, onRefresh }: CallListProps) {
    const [notesInput, setNotesInput] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState<string | null>(null);

    const hotLeads = leads
        .filter((l) => l.status === 'HOT_LEAD')
        .sort((a, b) => {
            // Uncontacted first, then by most recent
            if (!a.contacted_at && b.contacted_at) return -1;
            if (a.contacted_at && !b.contacted_at) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

    const handleMarkContacted = async (leadId: string, method: 'called' | 'texted') => {
        setSaving(leadId);
        try {
            const notes = notesInput[leadId] || '';
            await supabase
                .from('leads')
                .update({
                    contacted_at: new Date().toISOString(),
                    contact_method: method,
                    contact_notes: notes || null,
                })
                .eq('id', leadId);

            await supabase.from('lead_activity_logs').insert({
                lead_id: leadId,
                action: `lead_${method}`,
                details: { method, notes, timestamp: new Date().toISOString() },
                performed_by: 'owner',
            });

            setNotesInput((prev) => ({ ...prev, [leadId]: '' }));
            onRefresh();
        } catch (err) {
            console.error('Error marking contacted:', err);
        } finally {
            setSaving(null);
        }
    };

    const handleMoveToSigned = async (leadId: string) => {
        setSaving(leadId);
        try {
            await supabase
                .from('leads')
                .update({ status: 'agreement_signed' })
                .eq('id', leadId);

            await supabase.from('lead_activity_logs').insert({
                lead_id: leadId,
                action: 'status_changed_to_signed',
                details: { timestamp: new Date().toISOString() },
                performed_by: 'owner',
            });

            onRefresh();
        } catch (err) {
            console.error('Error updating status:', err);
        } finally {
            setSaving(null);
        }
    };

    if (hotLeads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl mb-4">📵</div>
                <h3 className="text-lg font-medium text-white/60">No HOT LEADs right now</h3>
                <p className="text-sm text-white/30 mt-1">
                    When a lead clicks your email, they'll appear here with their phone number.
                </p>
            </div>
        );
    }

    const uncontacted = hotLeads.filter((l) => !l.contacted_at).length;
    const contacted = hotLeads.filter((l) => l.contacted_at).length;

    return (
        <div className="space-y-4">
            {/* Summary bar */}
            <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                    <span className="text-xs text-red-400 font-semibold">🔥 {uncontacted} to call</span>
                </div>
                {contacted > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-xs text-emerald-400 font-semibold">✅ {contacted} contacted</span>
                    </div>
                )}
            </div>

            {/* Lead cards */}
            {hotLeads.map((lead) => {
                const isContacted = !!lead.contacted_at;
                const isSaving = saving === lead.id;

                return (
                    <div
                        key={lead.id}
                        className={`rounded-xl border p-5 transition-all ${isContacted
                                ? 'bg-white/[0.02] border-white/5 opacity-60'
                                : 'bg-gradient-to-r from-red-500/[0.06] to-transparent border-red-500/20 shadow-lg shadow-red-500/5'
                            }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            {/* Left: Lead info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-base font-semibold truncate">{lead.owner_name}</h3>
                                    {isContacted && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                            ✅ {lead.contact_method}
                                        </span>
                                    )}
                                    {!isContacted && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/20 animate-pulse">
                                            ⚡ CALL NOW
                                        </span>
                                    )}
                                </div>

                                {/* Contact info - prominent */}
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    {lead.phone && (
                                        <a
                                            href={`tel:${lead.phone}`}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                                        >
                                            <span className="text-lg">📞</span>
                                            <div>
                                                <div className="text-xs text-white/40">Phone</div>
                                                <div className="text-sm font-medium group-hover:text-violet-400 transition-colors">{lead.phone}</div>
                                            </div>
                                        </a>
                                    )}
                                    {lead.email && (
                                        <a
                                            href={`mailto:${lead.email}`}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                                        >
                                            <span className="text-lg">📧</span>
                                            <div>
                                                <div className="text-xs text-white/40">Email</div>
                                                <div className="text-sm font-medium truncate group-hover:text-violet-400 transition-colors">{lead.email}</div>
                                            </div>
                                        </a>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex flex-wrap gap-3 text-xs text-white/40">
                                    {lead.county && <span>🏛️ {lead.county} County</span>}
                                    {lead.case_number && <span>📋 {lead.case_number}</span>}
                                    {lead.surplus_amount && <span>💰 {lead.surplus_amount}</span>}
                                    {lead.property_address && <span>📍 {lead.property_address}</span>}
                                </div>

                                {/* Contacted note */}
                                {isContacted && lead.contact_notes && (
                                    <div className="mt-2 text-xs text-white/30 italic">
                                        📝 {lead.contact_notes}
                                    </div>
                                )}
                                {isContacted && lead.contacted_at && (
                                    <div className="mt-1 text-[10px] text-white/20">
                                        Contacted: {new Date(lead.contacted_at).toLocaleString()}
                                    </div>
                                )}
                            </div>

                            {/* Right: Actions */}
                            <div className="flex flex-col gap-2 flex-shrink-0">
                                {!isContacted ? (
                                    <>
                                        {/* Notes input */}
                                        <input
                                            type="text"
                                            placeholder="Quick note..."
                                            value={notesInput[lead.id] || ''}
                                            onChange={(e) => setNotesInput((prev) => ({ ...prev, [lead.id]: e.target.value }))}
                                            className="w-40 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
                                        />
                                        <button
                                            onClick={() => handleMarkContacted(lead.id, 'called')}
                                            disabled={isSaving}
                                            className="px-4 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-semibold text-emerald-400 transition-all disabled:opacity-50"
                                        >
                                            {isSaving ? '...' : '📞 Mark Called'}
                                        </button>
                                        <button
                                            onClick={() => handleMarkContacted(lead.id, 'texted')}
                                            disabled={isSaving}
                                            className="px-4 py-2 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-xs font-semibold text-blue-400 transition-all disabled:opacity-50"
                                        >
                                            {isSaving ? '...' : '💬 Mark Texted'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleMoveToSigned(lead.id)}
                                        disabled={isSaving}
                                        className="px-4 py-2 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-xs font-semibold text-violet-400 transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? '...' : '📝 Move to Signed'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
