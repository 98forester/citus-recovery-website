import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { StatsBar } from '../components/command-center/StatsBar';
import { LeadFilters } from '../components/command-center/LeadFilters';
import { LeadCard } from '../components/command-center/LeadCard';
import { CallList } from '../components/command-center/CallList';
import { PipelinePreview } from '../components/command-center/PipelinePreview';
import { BillingTracker } from '../components/command-center/BillingTracker';
import { CountyStrategy } from '../components/command-center/CountyStrategy';

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
    dob: string | null;
    agreement_link: string | null;
    lpoa_link: string | null;
    relatives_data?: RelativeData[] | null;
}

interface RelativeData {
    name: string;
    relationship: string;
    age: string | null;
    location: string;
    phones: string[];
    emails: string[];
}

type FilterStatus = 'all' | 'pending_review' | 'qualified' | 'needs_review' | 'outreach_sent' | 'HOT_LEAD' | 'low_value';
type FilterTier = 'all' | 'tier_1_priority' | 'qualified' | 'standard';
type ActiveTab = 'pipeline' | 'call_list' | 'email_preview' | 'billing' | 'strategy';

export function CommandCenter() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ActiveTab>('pipeline');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [filterTier, setFilterTier] = useState<FilterTier>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [outreachLoading, setOutreachLoading] = useState<string | null>(null);
    const [claimCheckLoading, setClaimCheckLoading] = useState<string | null>(null);
    const [expandedMemo, setExpandedMemo] = useState<string | null>(null);
    const [importStatus, setImportStatus] = useState<string | null>(null);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [viewingLead, setViewingLead] = useState<Lead | null>(null);
    const [qualifyingAll, setQualifyingAll] = useState(false);

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
            const res = await fetch('/.netlify/functions/launch-outreach', {
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

    // ── Qualify All ───────────────────────────────────────────
    const handleQualifyAll = async () => {
        const pendingLeads = leads.filter(l => l.status === 'pending_review' || l.status === 'new');
        if (pendingLeads.length === 0) {
            alert('No pending leads to qualify.');
            return;
        }

        if (!confirm(`Are you sure you want to qualify all ${pendingLeads.length} pending leads? This will trigger AI analysis for each.`)) {
            return;
        }

        setQualifyingAll(true);
        try {
            for (const lead of pendingLeads) {
                await fetch('/api/qualify-lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lead_id: lead.id }),
                });
            }
            alert(`Successfully triggered qualification for ${pendingLeads.length} leads.`);
            fetchLeads();
        } catch (err) {
            alert(`Qualify All error: ${err}`);
        } finally {
            setQualifyingAll(false);
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
            const res = await fetch('/.netlify/functions/check-claim', {
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

    // ── Update Links ──────────────────────────────────────────
    const handleUpdateLinks = async (leadId: string, agreementLink: string, lpoaLink: string) => {
        try {
            const { error } = await supabase
                .from('leads')
                .update({
                    agreement_link: agreementLink || null,
                    lpoa_link: lpoaLink || null
                })
                .eq('id', leadId);

            if (error) throw error;
            fetchLeads();
        } catch (err) {
            alert(`Failed to update links: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    // ── Update Lead (General) ──────────────────────────────────
    const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
        try {
            const res = await fetch('/.netlify/functions/update-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead_id: leadId, updates }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update lead');
            }

            fetchLeads();
            return true;
        } catch (err) {
            alert(`Update error: ${err}`);
            return false;
        }
    };

    // ── Import CSV ────────────────────────────────────────────
    const handleImportCSV = async (file: File) => {
        setImportStatus('⏳ Importing...');
        try {
            const text = await file.text();
            // Simple CSV parser: split by newlines, then by commas
            const lines = text.split(/\r?\n/).filter(l => l.trim());
            if (lines.length < 2) {
                setImportStatus('❌ CSV needs a header row + at least one data row');
                return;
            }

            // Parse header
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[\s/]+/g, '_'));

            // Map common CSV column names to our database fields
            const FIELD_MAP: Record<string, string> = {
                'owner_name': 'owner_name', 'name': 'owner_name', 'full_name': 'owner_name', 'contact_name': 'owner_name',
                'email': 'email', 'email_address': 'email',
                'phone': 'phone', 'phone_number': 'phone', 'phone_1': 'phone', 'cell': 'phone', 'mobile': 'phone',
                'property_address': 'property_address', 'address': 'property_address', 'prop_address': 'property_address',
                'county': 'county',
                'surplus_amount': 'surplus_amount', 'surplus': 'surplus_amount', 'amount': 'surplus_amount',
                'case_number': 'case_number', 'case_no': 'case_number', 'case': 'case_number', 'case_#': 'case_number',
                'case_type': 'case_type', 'type': 'case_type',
                'mailing_address': 'mailing_address', 'mail_address': 'mailing_address',
                'notes': 'notes', 'note': 'notes',
                'state': 'state',
                'dob': 'dob', 'date_of_birth': 'dob', 'birth_date': 'dob', 'd.o.b': 'dob',
            };

            // Map header indices to db fields
            const fieldIndices: { index: number; field: string }[] = [];
            headers.forEach((h, i) => {
                const mapped = FIELD_MAP[h];
                if (mapped) fieldIndices.push({ index: i, field: mapped });
            });

            if (fieldIndices.length === 0) {
                setImportStatus(`❌ No recognized columns found. Expected: owner_name, email, phone, county, case_number, etc. Found: ${headers.join(', ')}`);
                return;
            }

            // Parse rows
            const leads: Record<string, unknown>[] = [];
            for (let i = 1; i < lines.length; i++) {
                // Handle quoted CSV fields
                const fields: string[] = [];
                let current = '';
                let inQuotes = false;
                for (const char of lines[i]) {
                    if (char === '"') { inQuotes = !inQuotes; continue; }
                    if (char === ',' && !inQuotes) { fields.push(current.trim()); current = ''; continue; }
                    current += char;
                }
                fields.push(current.trim());

                const lead: Record<string, unknown> = {};
                for (const { index, field } of fieldIndices) {
                    if (fields[index] && fields[index].trim()) {
                        lead[field] = fields[index].trim();
                    }
                }

                // Parse surplus_amount_numeric if surplus_amount exists
                if (lead.surplus_amount) {
                    const num = parseFloat(String(lead.surplus_amount).replace(/[^0-9.]/g, ''));
                    if (!isNaN(num)) lead.surplus_amount_numeric = num;
                }

                if (lead.owner_name) leads.push(lead);
            }

            if (leads.length === 0) {
                setImportStatus('❌ No valid rows found (each row needs at least owner_name)');
                return;
            }

            setImportStatus(`⏳ Importing ${leads.length} leads with dedup...`);

            // Send to the import-leads function
            const resp = await fetch('/.netlify/functions/import-leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leads }),
            });
            const result = await resp.json();

            if (resp.ok) {
                setImportStatus(`✅ ${result.message}`);
                fetchLeads(); // Refresh the list
                setTimeout(() => setImportStatus(null), 8000);
            } else {
                setImportStatus(`❌ ${result.error || 'Import failed'}`);
            }
        } catch (err) {
            setImportStatus(`❌ ${err instanceof Error ? err.message : 'Import failed'}`);
        }
    };

    // ── Export CSV for Excess Elite (calls/texts only — we handle email) ───
    const handleExportCSV = () => {
        // Only export leads that have a phone number
        const phoneleads = filteredLeads.filter(l => l.phone?.trim());
        if (phoneleads.length === 0) {
            alert('No leads with phone numbers to export.');
            return;
        }

        // Excess Elite CSV format: First Name, Last Name, Email, Phone 1, Phone 1 Type, Address, City, State, Zip, Tags, Age
        // Email left blank — Citus handles emailing; EE only does calls/texts
        // Excess Elite CSV format: First Name, Last Name, Email, Phone 1, Phone 1 Type, Address, City, State, Zip, Tags, Age
        const headers = ['First Name', 'Last Name', 'Email', 'Phone 1', 'Phone 1: Type', 'Address 1', 'City', 'State', 'Postal Code', 'Tags', 'Age'];
        const rows: string[][] = [];

        phoneleads.forEach((lead) => {
            const nameParts = (lead.owner_name || '').split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            // Split phones by comma, semicolon, or space
            const phones = (lead.phone || '').split(/[,\s;/]+/).filter(p => p.trim());

            // Create a row for EACH phone number (Excess Elite duplicate contact requirement)
            phones.forEach((phone) => {
                // Calculate age if DOB exists
                let age = '';
                if (lead.dob) {
                    const birthDate = new Date(lead.dob);
                    const today = new Date();
                    let calcAge = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        calcAge--;
                    }
                    age = calcAge > 0 ? String(calcAge) : '';
                }

                const tags = [
                    lead.state?.toLowerCase() || 'fl',
                    lead.county?.toLowerCase() || '',
                    lead.case_type?.toLowerCase() || 'surplus',
                    lead.tier || '',
                    'surplus-call',
                ].filter(Boolean).join(', ');

                // Parse address parts
                const addr = lead.mailing_address || lead.last_known_address || lead.property_address || '';

                rows.push([
                    firstName,
                    lastName,
                    '', // Email intentionally blank — we handle emailing via Citus
                    phone.trim(),
                    'mobile',
                    addr,
                    '',
                    lead.state || 'FL',
                    '',
                    tags,
                    age,
                ]);
            });
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
                        <label className="px-4 py-2 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-sm text-violet-400 transition-all duration-200 hover:border-violet-500/30 cursor-pointer">
                            📥 Import CSV
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImportCSV(file);
                                    e.target.value = ''; // Reset for re-upload
                                }}
                            />
                        </label>
                        <button
                            onClick={handleQualifyAll}
                            disabled={!!qualifyingAll}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${qualifyingAll
                                ? 'bg-violet-500/10 border-violet-500/20 text-violet-400 cursor-wait'
                                : 'bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20 text-violet-400 hover:border-violet-500/30'
                                }`}
                        >
                            {qualifyingAll ? '🧠 Qualifying All...' : '🧠 Qualify All Pending'}
                        </button>
                        <button
                            onClick={fetchLeads}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all duration-200 hover:border-white/20"
                        >
                            ↻ Refresh
                        </button>
                    </div>
                    {importStatus && (
                        <div className={`mt-2 text-right text-xs font-medium ${importStatus.startsWith('✅') ? 'text-emerald-400' :
                            importStatus.startsWith('❌') ? 'text-red-400' :
                                'text-amber-400'
                            }`}>
                            {importStatus}
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
                {/* ── Stats Bar ─────────────────────────────────── */}
                <StatsBar stats={stats} />

                {/* ── Tab Switcher ──────────────────────────────── */}
                <div className="flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/5 w-fit">
                    <button
                        onClick={() => setActiveTab('pipeline')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'pipeline'
                            ? 'bg-white/10 text-white shadow-sm'
                            : 'text-white/40 hover:text-white/60'
                            }`}
                    >
                        📋 Pipeline
                    </button>
                    <button
                        onClick={() => setActiveTab('call_list')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'call_list'
                            ? 'bg-red-500/15 text-red-400 shadow-sm border border-red-500/20'
                            : 'text-white/40 hover:text-white/60'
                            }`}
                    >
                        🔥 Call List
                        {leads.filter(l => l.status === 'HOT_LEAD' && !(l as any).contacted_at).length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold min-w-[18px] text-center animate-pulse">
                                {leads.filter(l => l.status === 'HOT_LEAD' && !(l as any).contacted_at).length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('email_preview')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'email_preview'
                            ? 'bg-purple-500/15 text-purple-400 shadow-sm border border-purple-500/20'
                            : 'text-white/40 hover:text-white/60'
                            }`}
                    >
                        ✉️ Email Preview
                    </button>
                    <button
                        onClick={() => setActiveTab('billing')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'billing'
                            ? 'bg-emerald-500/15 text-emerald-400 shadow-sm border border-emerald-500/20'
                            : 'text-white/40 hover:text-white/60'
                            }`}
                    >
                        💰 Billing
                    </button>
                    <button
                        onClick={() => setActiveTab('strategy')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'strategy'
                            ? 'bg-emerald-500/15 text-emerald-400 shadow-sm border border-emerald-500/20'
                            : 'text-white/40 hover:text-white/60'
                            }`}
                    >
                        📈 Strategy
                    </button>
                </div>

                {/* ── Call List Tab ─────────────────────────────── */}
                {activeTab === 'call_list' && (
                    <CallList leads={leads as any} onRefresh={fetchLeads} />
                )}

                {/* ── Email Preview Tab ────────────────────────── */}
                {activeTab === 'email_preview' && (
                    <PipelinePreview />
                )}

                {/* ── Billing Tab ──────────────────────────────── */}
                {activeTab === 'billing' && (
                    <BillingTracker />
                )}

                {/* ── Strategy Tab ─────────────────────────────── */}
                {activeTab === 'strategy' && (
                    <CountyStrategy />
                )}

                {/* ── Pipeline Tab ─────────────────────────────── */}
                {activeTab === 'pipeline' && (
                    <>
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
                                                        onEditLinks={setEditingLead}
                                                        onViewDetails={setViewingLead}
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
                                                        onEditLinks={setEditingLead}
                                                        onViewDetails={setViewingLead}
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* ── Modals ────────────────────────────────────────── */}
            {editingLead && (
                <LeadLinkEditorModal
                    lead={editingLead}
                    onClose={() => setEditingLead(null)}
                    onSave={(agreement, lpoa) => {
                        handleUpdateLinks(editingLead.id, agreement, lpoa);
                        setEditingLead(null);
                    }}
                />
            )}

            {viewingLead && (
                <LeadDetailsModal
                    lead={viewingLead}
                    onClose={() => setViewingLead(null)}
                    onUpdate={(updates) => handleUpdateLead(viewingLead.id, updates)}
                />
            )}
            <footer className="border-t border-white/5 py-6 mt-16">
                <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between text-xs text-white/20">
                    <span>Citus-Antigravity • Surplus Funds Recovery Pipeline</span>
                    <span>Powered by Gravity Claw + Citus1Bot + Excess Elite</span>
                </div>
            </footer>
        </div>
    );
}

// ── LeadDetailsModal Component ──────────────────────────────
function LeadDetailsModal({ lead, onClose, onUpdate }: { lead: Lead, onClose: () => void, onUpdate: (updates: Partial<Lead>) => Promise<boolean> }) {
    const [selectedRelativeName, setSelectedRelativeName] = useState<string | null>(null);

    const rawPhones = (lead.phone || '').split(/[;,\n]+/).map(p => p.trim()).filter(Boolean);
    const rawEmails = (lead.email || '').split(/[;,\n]+/).map(e => e.trim()).filter(Boolean);

    // Calculate Age
    const calculateAge = (dob: string | null) => {
        if (!dob) return null;
        const birthDate = new Date(dob);
        if (isNaN(birthDate.getTime())) return null;
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };
    const age = calculateAge(lead.dob);

    // Advanced Parsing (Looking for labels like "REL:" or "DAUGHTER:")
    const contacts = rawPhones.map((p, idx) => {
        const parts = p.split(':');
        return {
            id: `phone-${idx}`,
            raw: p,
            label: parts.length > 1 ? parts[0].trim() : (idx === 0 ? 'Primary' : 'Relative'),
            value: parts.length > 1 ? parts[1].trim() : p,
            type: 'phone',
            rank: idx === 0 ? '⭐ Top' : null
        };
    });

    const parsedEmails = rawEmails.map((e, idx) => {
        const parts = e.split(':');
        return {
            id: `email-${idx}`,
            raw: e,
            label: parts.length > 1 ? parts[0].trim() : (idx === 0 ? 'Primary' : 'Relative'),
            value: parts.length > 1 ? parts[1].trim() : e,
            type: 'email'
        };
    });

    const handleDeleteContact = async (type: 'phone' | 'email', valueToRemove: string) => {
        if (!confirm(`Are you sure you want to remove this ${type}?`)) return;

        const currentValues = type === 'phone' ? rawPhones : rawEmails;
        const updatedValues = currentValues.filter(v => v !== valueToRemove);
        const updateObj = type === 'phone' ? { phone: updatedValues.join('; ') } : { email: updatedValues.join('; ') };

        await onUpdate(updateObj);
    };

    const isDeceased = (lead.notes?.toLowerCase().includes('deceased') ||
        lead.notes?.toLowerCase().includes('died') ||
        lead.case_type?.toLowerCase().includes('deceased') ||
        lead.owner_name?.toLowerCase().includes('est of') ||
        lead.owner_name?.toLowerCase().includes('estate'));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-4xl bg-[#0d0d12] border border-white/10 rounded-3xl shadow-2xl p-0 shadow-violet-500/5 max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header Header */}
                <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-3xl font-bold text-white tracking-tight">{lead.owner_name}</h3>
                            {age && <span className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[10px] font-bold text-white/40 uppercase tracking-widest">{age} Years Old</span>}
                            {isDeceased && <span className="bg-slate-500/20 border border-slate-500/30 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2">💀 Deceased</span>}
                        </div>
                        <p className="text-sm text-white/30 flex items-center gap-2">
                            System ID: <code className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded">{lead.id.slice(0, 8)}</code>
                            <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                            Tier: <span className="text-violet-400 font-bold uppercase">{lead.tier?.replace('_', ' ')}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full text-white/40 transition-colors text-xl">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* Left Column: Family Discovery & Tree */}
                    <div className="md:col-span-7 space-y-8">
                        <div>
                            <SectionTitle icon="🌳" title="Family Discovery & Life Events" />
                            <div className="mt-4 bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                                {/* Connection Lines (Visual Decor) */}
                                <div className="absolute top-10 left-10 w-px h-[80%] bg-gradient-to-b from-violet-500/20 to-transparent" />

                                <div className="space-y-6 relative z-10">
                                    {/* Primary Owner Node */}
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm shadow-lg shadow-violet-600/20">👤</div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">Primary Estate Owner</p>
                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                <p className="text-sm font-bold text-white">{lead.owner_name}</p>
                                                <p className="text-[10px] text-white/40 mt-1">DOB: {lead.dob || 'Unknown'} • Preferred contact via daughters</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Heirs / Relatives Group */}
                                    <div className="pl-6 space-y-4">
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-6">Discovered Heirs & Relatives</p>

                                        <div className="grid grid-cols-1 gap-3 ml-6">
                                            {/* Render Structured Relatives if available */}
                                            {lead.relatives_data && lead.relatives_data.length > 0 ? (
                                                lead.relatives_data.map((rel, idx) => (
                                                    <div key={`rel-${idx}`} className="space-y-2">
                                                        <div className="flex gap-4 items-start group">
                                                            <div className="w-px h-full bg-white/5 group-last:h-4 -ml-4" />
                                                            <div className="w-6 h-px bg-white/5 mt-5 -ml-4" />
                                                            <div
                                                                onClick={() => setSelectedRelativeName(selectedRelativeName === rel.name ? null : rel.name)}
                                                                className={`flex-1 p-4 rounded-xl border transition-all cursor-pointer ${selectedRelativeName === rel.name
                                                                    ? 'bg-violet-500/10 border-violet-500/50 shadow-lg shadow-violet-500/10'
                                                                    : 'bg-white/[0.03] border-white/5 hover:border-violet-500/30'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">{rel.relationship}</span>
                                                                        {rel.age && <span className="text-[8px] bg-white/10 text-white/40 px-1.5 py-0.5 rounded font-bold">Age {rel.age}</span>}
                                                                    </div>
                                                                    <span className="text-[9px] text-white/20 italic">{rel.location || 'Location Unknown'}</span>
                                                                </div>
                                                                <p className="text-sm text-white font-bold">{rel.name}</p>
                                                            </div>
                                                        </div>

                                                        {/* Reveal Contacts on Click */}
                                                        {selectedRelativeName === rel.name && (
                                                            <div className="ml-10 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                                {rel.phones.map((p, pIdx) => (
                                                                    <div key={`p-${pIdx}`} className="flex items-center justify-between p-2 px-3 rounded-lg bg-white/5 border border-white/5">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-emerald-400">📞</span>
                                                                            <span className="text-xs text-white/80 font-medium">{p}</span>
                                                                        </div>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                navigator.clipboard.writeText(p.replace(/[^0-9]/g, ''));
                                                                            }}
                                                                            className="text-[10px] text-white/40 hover:text-white transition-colors"
                                                                        >
                                                                            Copy
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                {rel.emails.map((em, eIdx) => (
                                                                    <div key={`e-${eIdx}`} className="flex items-center justify-between p-2 px-3 rounded-lg bg-white/5 border border-white/5">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-blue-400">✉️</span>
                                                                            <span className="text-xs text-white/60 font-medium truncate max-w-[200px]">{em}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {rel.phones.length === 0 && rel.emails.length === 0 && (
                                                                    <p className="text-[10px] text-white/20 italic italic ml-6">No contact details found for this relative.</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                /* Fallback to legacy string parsing if no relatives_data */
                                                <>
                                                    {contacts.map((c, idx) => (
                                                        <div key={c.id} className="flex gap-4 items-start group">
                                                            <div className="w-px h-full bg-white/5 group-last:h-4 -ml-4" />
                                                            <div className="w-6 h-px bg-white/5 mt-5 -ml-4" />
                                                            <div className="flex-1 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-violet-500/30 transition-all flex items-center justify-between">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{c.label}</span>
                                                                        {c.rank && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">{c.rank}</span>}
                                                                    </div>
                                                                    <p className="text-xs text-white font-medium">{c.value}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => navigator.clipboard.writeText(c.value.replace(/[^0-9]/g, ''))}
                                                                        className="p-1 px-2 rounded bg-white/5 hover:bg-violet-500/20 text-[9px] text-white/40 hover:text-violet-300 transition-all"
                                                                    >
                                                                        Copy
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteContact('phone', c.raw)}
                                                                        className="p-1 px-2 rounded bg-red-500/5 hover:bg-red-500/20 text-[9px] text-red-400/30 hover:text-red-400 transition-all"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {parsedEmails.map((e, idx) => (
                                                        <div key={e.id} className="flex gap-4 items-start group">
                                                            <div className="w-px h-full bg-white/5 group-last:h-4 -ml-4" />
                                                            <div className="w-6 h-px bg-white/5 mt-5 -ml-4" />
                                                            <div className="flex-1 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition-all flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">{e.label} Email</p>
                                                                    <p className="text-xs text-blue-300/80 font-medium truncate max-w-[180px]">{e.value}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleDeleteContact('email', e.raw)}
                                                                    className="p-1 px-2 rounded bg-red-500/5 hover:bg-red-500/20 text-[9px] text-red-400/30 hover:text-red-400 transition-all"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            )}

                                            {(!lead.relatives_data || lead.relatives_data.length === 0) && contacts.length === 0 && parsedEmails.length === 0 && (
                                                <p className="text-xs text-white/20 italic ml-6">No specific heir contacts linked yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <SectionTitle icon="📍" title="Mapped addresses" />
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">Subject Property</p>
                                    <p className="text-sm text-white/80 leading-relaxed font-medium">{lead.property_address || '—'}</p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">Mailing / Last Known</p>
                                    <p className="text-sm text-white/80 leading-relaxed font-medium">{lead.mailing_address || lead.last_known_address || '—'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Case Deep Dive */}
                    <div className="md:col-span-5 space-y-8">
                        <div>
                            <SectionTitle icon="💰" title="Financial Breakdown" />
                            <div className="mt-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
                                <div className="flex items-end justify-between mb-4">
                                    <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest">Available Surplus</p>
                                    <p className="text-3xl font-black text-emerald-400 tracking-tight">
                                        {lead.surplus_amount || (lead.surplus_amount_numeric ? `$${lead.surplus_amount_numeric.toLocaleString()}` : '—')}
                                    </p>
                                </div>
                                <div className="space-y-3 pt-4 border-t border-emerald-500/10">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-white/40">Status</span>
                                        <span className="text-white/80 font-bold uppercase tracking-widest">{lead.status}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-white/40">Claim Status</span>
                                        <span className={`font-bold uppercase tracking-widest ${lead.claim_status === 'no_claim' ? 'text-emerald-400' : 'text-white/80'}`}>
                                            {lead.claim_status || 'Unchecked'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <SectionTitle icon="📂" title="Excess Elite Data" />
                            <div className="mt-4 bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
                                <DetailsRow label="Case ID" value={lead.case_number} />
                                <DetailsRow label="Case Type" value={lead.case_type} />
                                <DetailsRow label="County" value={lead.county} />
                                <DetailsRow label="Created In System" value={new Date(lead.created_at).toLocaleDateString()} />
                                <DetailsRow label="Data Source" value={lead.source} />
                            </div>
                        </div>

                        <div>
                            <SectionTitle icon="📜" title="Notes & History" />
                            <div className="mt-4 bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                                <p className="text-xs text-white/50 leading-relaxed whitespace-pre-wrap">
                                    {lead.notes || 'No activity logged yet.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/60 tracking-widest uppercase transition-all"
                    >
                        Close Portal
                    </button>
                    <button
                        onClick={() => window.open(`http://localhost:5175/portal?ref=${lead.id.slice(0, 8)}`, '_blank')}
                        className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white tracking-widest uppercase transition-all shadow-lg shadow-violet-600/20"
                    >
                        View Public Portal
                    </button>
                </div>
            </div>
        </div>
    );
}

function SectionTitle({ icon, title }: { icon: string, title: string }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">{title}</h4>
        </div>
    );
}

function DetailsRow({ label, value, highlight = false }: { label: string, value: string | null, highlight?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-white/30">{label}</span>
            <span className={`text-xs font-medium truncate ${highlight ? 'text-emerald-400 font-bold' : 'text-white/70'}`}>
                {value || '—'}
            </span>
        </div>
    );
}

// ── LeadLinkEditorModal Component ──────────────────────────────
function LeadLinkEditorModal({ lead, onClose, onSave }: { lead: Lead, onClose: () => void, onSave: (agreement: string, lpoa: string) => void }) {
    const [agreementLink, setAgreementLink] = useState(lead.agreement_link || '');
    const [lpoaLink, setLpoaLink] = useState(lead.lpoa_link || '');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl p-6 shadow-emerald-500/5">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Edit Signature Links</h3>
                        <p className="text-xs text-white/40">{lead.owner_name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-white/40">✕</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">RabbitSign Agreement Link</label>
                        <input
                            type="text"
                            value={agreementLink}
                            onChange={(e) => setAgreementLink(e.target.value)}
                            placeholder="https://rabbitsign.com/..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">RabbitSign LPOA Link</label>
                        <input
                            type="text"
                            value={lpoaLink}
                            onChange={(e) => setLpoaLink(e.target.value)}
                            placeholder="https://rabbitsign.com/..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-white/60 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(agreementLink, lpoaLink)}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 text-emerald-950 text-sm font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        Save Links
                    </button>
                </div>
            </div>
        </div>
    );
}
