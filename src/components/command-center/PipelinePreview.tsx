import React, { useState } from 'react';

// ════════════════════════════════════════════════════════════════
// Pipeline Preview — Visual walkthrough of the email sequence
// ════════════════════════════════════════════════════════════════

interface StepData {
    type: 'info' | 'email';
    icon: string;
    label: string;
    colorClass: string;
    title?: string;
    infoContent?: React.ReactNode;
    day?: string;
    dayClass?: string;
    subject?: string;
    emailBody?: React.ReactNode;
}

const steps: StepData[] = [
    // 0: Check Claim
    {
        type: 'info', icon: '🔍', label: 'Check\nClaim', colorClass: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
        title: '🔍 Check Claim — Pre-Import Verification',
        infoContent: (
            <>
                <p>Before importing a lead, verify no one has already filed a claim.</p>
                <p className="mt-3"><strong>Process:</strong> Click "🔍 Check Claim" → opens <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">{'{county}'}.realtdm.com</code> → search by Case Number → check Documents tab.</p>
                <div className="mt-4 space-y-2">
                    <p className="font-semibold">Possible outcomes:</p>
                    <p><span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">✅ No Claim Filed</span> — Safe to pursue</p>
                    <p><span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">⛔ Claim Filed</span> — Someone beat you to it</p>
                    <p><span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">⚠️ Partial Claim</span> — Lienholder claim, check remaining amount</p>
                </div>
            </>
        ),
    },
    // 1: Qualify
    {
        type: 'info', icon: '🧠', label: 'Qualify', colorClass: 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
        title: '🧠 Qualify Lead',
        infoContent: (
            <>
                <p>Evaluate the lead's recovery potential before outreach.</p>
                <p className="mt-3"><strong>Evaluates:</strong> surplus amount, liens, competing claims, waiting period compliance, county-specific rules.</p>
                <div className="mt-4 space-y-2">
                    <p className="font-semibold">Assigns tier:</p>
                    <p><span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">🔥 Tier 1 Priority</span> — High value, no complications → pursue first</p>
                    <p><span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/30">Qualified</span> — Good to go, standard priority</p>
                    <p><span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">Needs Review</span> — Has liens or complications</p>
                </div>
            </>
        ),
    },
    // 2: Initial Outreach (Day 0)
    {
        type: 'email', icon: '🚀', label: 'Initial\nOutreach', colorClass: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
        day: 'DAY 0 — INITIAL OUTREACH', dayClass: 'bg-purple-600',
        subject: 'John, unclaimed funds from your Miami-Dade County property',
        emailBody: (
            <>
                <p className="text-gray-400 text-xs mb-5">March 4, 2026</p>
                <p>Dear John,</p>
                <p>We understand that property matters can be stressful, and we hope this message brings some positive news. Our team has identified surplus funds that may belong to you from a recent property sale in <strong>Miami-Dade County, Florida</strong>.</p>
                <p>Under Florida Statute §197.582, former property owners are entitled to claim surplus proceeds when a property sells for more than the amount owed. Based on our research, funds have been identified in connection with your name.</p>
                <div className="bg-gray-50 border border-gray-200 p-3.5 my-4 text-xs">
                    <table className="w-full"><tbody>
                        <tr><td className="font-semibold text-gray-500 w-32 py-0.5">Case Reference:</td><td>2025A00886</td></tr>
                        <tr><td className="font-semibold text-gray-500 py-0.5">Surplus Status:</td><td className="font-semibold">Funds on file — available upon verification</td></tr>
                        <tr><td className="font-semibold text-gray-500 py-0.5">Jurisdiction:</td><td>Miami-Dade County, FL</td></tr>
                        <tr><td className="font-semibold text-gray-500 py-0.5">Property Address:</td><td>200 Biscayne Blvd Way, Unit 3406, Miami FL 33131</td></tr>
                    </tbody></table>
                </div>
                <p>Citus Recovery Solutions handles the entire recovery process — case research, document preparation, court filing, and follow-through. <strong>There is no upfront cost</strong>; our fee is contingent upon successful recovery of your funds.</p>
                <div className="bg-emerald-50 border border-emerald-200 p-3 my-4 text-center text-xs text-emerald-700 font-medium">✅ All claims are prepared and reviewed by licensed legal counsel. No upfront fees — ever.</div>
                <p>Please note: surplus funds held by the Clerk of Court are subject to statutory deadlines. Unclaimed proceeds may eventually be transferred to the State. We encourage you to review your claim promptly.</p>
                <div className="text-center my-6">
                    <span className="inline-block bg-[#1a1a2e] text-white px-7 py-3 text-sm font-semibold rounded">Check If You're Eligible →</span>
                </div>
            </>
        ),
    },
    // 3: Day 1
    {
        type: 'email', icon: '📧', label: 'Day 1', colorClass: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30',
        day: 'DAY 1 — FOLLOW-UP', dayClass: 'bg-indigo-500',
        subject: 'John, did you see our message about your surplus?',
        emailBody: (
            <>
                <p className="text-gray-400 text-xs mb-5">March 5, 2026</p>
                <p>Dear John,</p>
                <p>I wanted to follow up on our message from yesterday about surplus funds that may belong to you from a property matter in <strong>Miami-Dade County</strong>.</p>
                <div className="bg-gray-50 border border-gray-200 p-3.5 my-4 text-xs">
                    <table className="w-full"><tbody>
                        <tr><td className="font-semibold text-gray-500 w-32 py-0.5">Case Reference:</td><td>2025A00886</td></tr>
                        <tr><td className="font-semibold text-gray-500 py-0.5">Surplus Status:</td><td className="font-semibold">Funds on file — available upon verification</td></tr>
                        <tr><td className="font-semibold text-gray-500 py-0.5">Jurisdiction:</td><td>Miami-Dade County, FL</td></tr>
                    </tbody></table>
                </div>
                <p>You might be wondering: <em>"Is this real?"</em> — and that's a fair question. There are unfortunately many scams in this space. Here's how we're different:</p>
                <p>• We <strong>never</strong> ask for money upfront — our fee is only collected if we recover your funds<br />
                    • All claims are prepared and filed by licensed legal counsel<br />
                    • You can verify the surplus exists through the county Clerk of Court</p>
                <div className="text-center my-6">
                    <span className="inline-block bg-[#1a1a2e] text-white px-7 py-3 text-sm font-semibold rounded">Check If You're Eligible →</span>
                </div>
            </>
        ),
    },
    // 4: Day 3
    {
        type: 'email', icon: '📧', label: 'Day 3', colorClass: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
        day: 'DAY 3 — ACTION NEEDED', dayClass: 'bg-yellow-500 text-black',
        subject: 'Action needed — surplus funds deadline approaching, Miami-Dade County',
        emailBody: (
            <>
                <p className="text-gray-400 text-xs mb-5">March 7, 2026</p>
                <p>Dear John,</p>
                <p>We previously reached out about potential surplus funds in your name in Miami-Dade County. We wanted to give you a clearer picture of how the recovery process works:</p>
                <div className="bg-gray-50 border border-gray-200 p-3.5 my-4 text-xs">
                    <table className="w-full"><tbody>
                        <tr><td className="font-semibold text-gray-500 w-32 py-0.5">Case Reference:</td><td>2025A00886</td></tr>
                        <tr><td className="font-semibold text-gray-500 py-0.5">Surplus Status:</td><td className="font-semibold">Funds on file — available upon verification</td></tr>
                    </tbody></table>
                </div>
                <p><strong>Here's what happens if you decide to move forward:</strong></p>
                <p>1. You review and sign a simple agreement authorizing us to file on your behalf<br />
                    2. We handle all paperwork, court filings, and follow-up with the Clerk<br />
                    3. Once approved, your funds are disbursed directly to you</p>
                <p>The process typically takes 60–90 days. Under Florida law, surplus funds are subject to statutory deadlines — unclaimed proceeds may eventually be transferred to the State.</p>
                <div className="bg-emerald-50 border border-emerald-200 p-3 my-4 text-center text-xs text-emerald-700 font-medium">✅ No upfront fees. No hidden costs. We only get paid when you do.</div>
            </>
        ),
    },
    // 5: Day 7
    {
        type: 'email', icon: '📧', label: 'Day 7', colorClass: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
        day: 'DAY 7 — PERSONAL TOUCH', dayClass: 'bg-orange-500',
        subject: 'John, would a quick phone call help? Re: unclaimed funds',
        emailBody: (
            <>
                <p className="text-gray-400 text-xs mb-5">March 11, 2026</p>
                <p>Dear John,</p>
                <p>I know emails can feel impersonal, especially when it involves something as important as unclaimed funds. I wanted to reach out one more time regarding the surplus identified in Miami-Dade County.</p>
                <div className="bg-gray-50 border border-gray-200 p-3.5 my-4 text-xs">
                    <table className="w-full"><tbody>
                        <tr><td className="font-semibold text-gray-500 w-32 py-0.5">Case Reference:</td><td>2025A00886</td></tr>
                        <tr><td className="font-semibold text-gray-500 py-0.5">Surplus Status:</td><td className="font-semibold">Funds on file — available upon verification</td></tr>
                    </tbody></table>
                </div>
                <p><strong>Would a quick phone call be easier?</strong> I'm happy to walk you through everything in 5 minutes — no pressure, no obligation. You can reach me directly at <span className="text-purple-600 font-medium">(407) 917-8640</span>.</p>
                <div className="text-center my-6">
                    <span className="inline-block bg-[#1a1a2e] text-white px-7 py-3 text-sm font-semibold rounded">Check If You're Eligible →</span>
                </div>
            </>
        ),
    },
    // 6: Day 14
    {
        type: 'email', icon: '📧', label: 'Day 14', colorClass: 'from-red-500/20 to-red-600/10 border-red-500/30',
        day: 'DAY 14 — FINAL NOTICE', dayClass: 'bg-red-500',
        subject: 'Final notice — your surplus claim file is closing, John',
        emailBody: (
            <>
                <p className="text-gray-400 text-xs mb-5">March 18, 2026</p>
                <p>Dear John,</p>
                <p>This is our final notice regarding the surplus funds matter referenced below.</p>
                <div className="bg-gray-50 border border-gray-200 p-3.5 my-4 text-xs">
                    <table className="w-full"><tbody>
                        <tr><td className="font-semibold text-gray-500 w-32 py-0.5">Case Reference:</td><td>2025A00886</td></tr>
                        <tr><td className="font-semibold text-gray-500 py-0.5">Surplus Status:</td><td className="font-semibold">Funds on file — available upon verification</td></tr>
                    </tbody></table>
                </div>
                <p>We've reached out several times because we believe these funds may rightfully belong to you. If we don't hear back, we'll close this file in our records.</p>
                <p>If you ever wish to revisit this claim in the future, you're welcome to contact us directly at <span className="text-purple-600 font-medium">(407) 917-8640</span> or <span className="text-purple-600 font-medium">support@citusrecoverysolutions.com</span>.</p>
                <p>We appreciate your time and wish you all the best.</p>
            </>
        ),
    },
    // 7: HOT LEAD
    {
        type: 'info', icon: '🔥', label: 'HOT\nLEAD', colorClass: 'from-red-500/20 to-red-600/10 border-red-500/40',
        title: '🔥 HOT LEAD — Click Detected!',
        infoContent: (
            <>
                <p className="text-red-400 font-semibold text-base">Lead clicked the email link — they're interested.</p>
                <div className="mt-4 space-y-2">
                    <p className="font-semibold">What happens automatically:</p>
                    <p>✅ Status changes to <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">🔥 HOT LEAD</span></p>
                    <p>✅ Follow-up sequence <strong>stops immediately</strong></p>
                    <p>✅ Lead is redirected to your <strong>Client Portal</strong></p>
                    <p>✅ Instant alert → <strong>Email + Telegram</strong></p>
                    <p>✅ Appears on <strong>🔥 Call List</strong> tab</p>
                </div>
                <p className="mt-4"><strong>Your action:</strong> Call/text them immediately while they're engaged.</p>
            </>
        ),
    },
    // 8: Portal Sign
    {
        type: 'info', icon: '📝', label: 'Portal\nSign', colorClass: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
        title: '📝 Client Portal — Sign Agreement',
        infoContent: (
            <>
                <p>Lead lands on <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">/portal</code> — 4-step onboarding flow:</p>
                <div className="mt-3 space-y-1.5">
                    <p><strong>Step 1:</strong> Client Info (name, email, phone)</p>
                    <p><strong>Step 2:</strong> Documents (upload driver's license)</p>
                    <p><strong>Step 3:</strong> Review & Sign (read Service Agreement → signature pad)</p>
                    <p><strong>Step 4:</strong> Confirmation (download signed .docx)</p>
                </div>
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-emerald-400 font-semibold text-sm">💰 This is where they learn the surplus amount — only after signing the agreement.</p>
                </div>
                <p className="mt-3 text-white/40 text-xs">Coming soon: RabbitSign integration for legally binding e-signatures.</p>
            </>
        ),
    },
];

export function PipelinePreview() {
    const [activeStep, setActiveStep] = useState(0);
    const step = steps[activeStep];

    return (
        <div className="space-y-6">
            {/* ── Pipeline Steps ─────────────────────────────── */}
            <div className="flex items-center gap-0 overflow-x-auto pb-2 px-1">
                {steps.map((s, i) => (
                    <React.Fragment key={i}>
                        {i > 0 && <span className="text-white/15 text-lg mx-1.5 pb-6 flex-shrink-0">→</span>}
                        <button
                            onClick={() => setActiveStep(i)}
                            className={`flex flex-col items-center gap-2 min-w-[80px] group flex-shrink-0 transition-all duration-200`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 bg-gradient-to-br transition-all duration-300 ${s.colorClass} ${activeStep === i
                                    ? 'border-purple-500 shadow-lg shadow-purple-500/20 scale-110'
                                    : 'border-white/10 hover:scale-105'
                                }`}>
                                {s.icon}
                            </div>
                            <span className={`text-[10px] font-semibold uppercase tracking-wider text-center leading-tight whitespace-pre-line ${activeStep === i ? 'text-purple-400' : 'text-white/30 group-hover:text-white/50'
                                }`}>{s.label}</span>
                        </button>
                    </React.Fragment>
                ))}
            </div>

            {/* ── Preview Content ────────────────────────────── */}
            {step.type === 'info' ? (
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-8 max-w-[700px]">
                    <h3 className="text-lg font-bold mb-4">{step.title}</h3>
                    <div className="text-white/60 text-sm leading-relaxed space-y-2.5">{step.infoContent}</div>
                </div>
            ) : (
                <div className="max-w-[700px]">
                    {/* Day badge + meta */}
                    <div className="mb-3">
                        <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold ${step.dayClass} text-white`}>{step.day}</span>
                    </div>
                    <div className="flex gap-6 mb-3 text-xs text-white/50">
                        <span><strong className="text-white/70">Subject:</strong> {step.subject}</span>
                    </div>
                    <div className="flex gap-6 mb-4 text-xs text-white/50">
                        <span><strong className="text-white/70">From:</strong> Michael Miranda &lt;support@citusrecoverysolutions.com&gt;</span>
                        <span><strong className="text-white/70">To:</strong> John Smith &lt;jsmith@email.com&gt;</span>
                    </div>

                    {/* Email frame */}
                    <div className="bg-white rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                        <div className="bg-[#1a1a2e] px-7 py-5 border-b-[3px] border-purple-600">
                            <h2 className="text-white text-base font-bold tracking-wide">Citus Recovery Solutions</h2>
                            <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Surplus Funds Recovery</p>
                        </div>
                        <div className="px-7 py-6 font-serif text-gray-900 text-[13.5px] leading-relaxed space-y-3">
                            {step.emailBody}
                            {/* Signature */}
                            <div className="mt-6 pt-4 border-t border-gray-200 font-sans text-xs text-gray-500 space-y-0.5">
                                <strong className="text-gray-700 block">Michael Miranda</strong>
                                <span>Recovery Specialist</span><br />
                                <span>Citus Recovery Solutions LLC</span><br />
                                <span>📞 <span className="text-purple-600">(407) 917-8640</span></span><br />
                                <span>📧 <span className="text-purple-600">support@citusrecoverysolutions.com</span></span><br />
                                <span>🌐 <span className="text-purple-600">citusrecoverysolutions.com</span></span>
                            </div>
                            <p className="text-[10px] text-gray-400 italic mt-4">This correspondence is intended solely for the individual(s) named above. To opt out, reply "STOP." This is not legal advice.</p>
                        </div>
                        <div className="bg-gray-50 px-7 py-3 border-t border-gray-200">
                            <p className="text-gray-400 text-[9px]">Citus Recovery Solutions LLC · Re: 200 Biscayne Blvd Way, Unit 3406, Miami FL 33131</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
