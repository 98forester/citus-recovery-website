import { Testimonial, ServiceStep, FAQItem, SurplusType, Stat } from './types';

// ────────────────────────────────────────────────────
// COMPANY INFO — Real data from citusrecoverysolutions.com
// ────────────────────────────────────────────────────
export const COMPANY = {
  phone: "(407) 917-8640",
  phoneTel: "+14079178640",
  email: "support@citusrecoverysolutions.com",
  calendly: "https://calendly.com/citusrecoverysolutions/30min",
  address: "7901 4th St N, Suite 300",
  city: "St. Petersburg, FL 33702",
  links: {
    serviceAgreement: "https://www.rabbitsign.com/template/link/m2wG6luxTSBVEM5RZ9bhl1",
    lpoa: "https://www.rabbitsign.com/template/link/uxDXjdngjM2KrNKFPlQ6XT",
  }
};

// ────────────────────────────────────────────────────
// STATS — Social proof strip
// ────────────────────────────────────────────────────
export const STATS: Stat[] = [
  { value: "67", label: "Florida Counties Covered" },
  { value: "$0", label: "Upfront Cost to You" },
  { value: "30–60", label: "Days Average Turnaround" },
  { value: "100%", label: "Virtual — No Travel Needed" },
];

// ────────────────────────────────────────────────────
// TESTIMONIALS — Real reviews from citusrecoverysolutions.com
// + expanded fictional variants modeled on real tone
// ────────────────────────────────────────────────────
export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Mary M.",
    location: "Miami, Florida",
    text: "Citus Recovery Solutions helped me reclaim surplus funds from the foreclosure after I lost my husband and our home. Thanks to them, I regained stability and a fresh start. Their compassion and dedication truly made a difference when I needed it most.",
    amount: "$47,000",
    isHighlight: true,
  },
  {
    name: "The Gomez Family",
    location: "Lakeland, Florida",
    text: "When we found out that we couldn't keep the property we inherited, we were devastated. Citus Recovery Solutions stepped in and helped us file our surplus claim. Their expertise and dedication made the process seamless. Thanks to Citus, we were able to move forward with financial stability.",
    amount: "$38,200",
  },
  {
    name: "Robert & Linda P.",
    location: "Palm Beach County",
    text: "The bank told us there was nothing left. We had given up. A friend recommended Citus, and within 48 hours they confirmed we had surplus funds we never knew existed. They handled everything — the court filings, the lien disputes, all of it. We never stepped foot in a courtroom.",
    amount: "$92,000",
  },
  {
    name: "James L.",
    location: "Miami-Dade County",
    text: "I was hours from the filing deadline. Other firms wouldn't even take my call because of the timeline. Citus went to work immediately — filed the motion that same night. They fought a second lienholder all the way to a hearing and won.",
    amount: "$67,500",
  },
  {
    name: "Elena G.",
    location: "Hillsborough County",
    text: "Me explicaron todo en español desde el primer momento. No pagué nada por adelantado. El proceso fue completamente virtual — firmé todo desde mi teléfono. Recibí mi cheque en 45 días. No confíen en compañías que cobran 30 o 40 por ciento.",
    amount: "$29,800",
  },
  {
    name: "David S.",
    location: "Orange County",
    text: "Three different companies sent me letters asking me to sign away my rights for 40% of my money. Citus explained exactly what those 'Assignment of Rights' agreements really meant, took my case, and recovered every dollar I was owed.",
    amount: "$44,000",
  },
];

// ────────────────────────────────────────────────────
// PROCESS STEPS — Expanded 3-step (Taormina model)
// Matches the real Citus process from their site
// ────────────────────────────────────────────────────
export const STEPS: ServiceStep[] = [
  {
    id: "01",
    title: "Free Consultation & Fund Search",
    description: "We start with a no-cost, no-obligation conversation about your situation. Whether you lost your home to foreclosure or you're facing one right now, we'll search the Clerk of Courts across all 67 Florida counties to find out exactly what you're owed or explore creative options to help you keep your home.",
  },
  {
    id: "02",
    title: "Virtual Onboarding",
    description: "Once we confirm your funds or develop your strategy, you sign a simple agreement form from your phone via e-Notary. No office visits. No complicated paperwork. Our team handles all court filings, lien negotiations, attorney coordination, and hearing appearances on your behalf.",
  },
  {
    id: "03",
    title: "Resolution & Recovery",
    description: "For surplus claims, your check is mailed directly to your door — most cases resolve in 30 to 60 days. For foreclosure prevention, we work to stop the process using creative finance strategies. Either way, you only pay if we deliver results.",
  },
];

// ────────────────────────────────────────────────────
// SERVICES — Expanded beyond surplus funds to include
// creative finance / foreclosure prevention
// ────────────────────────────────────────────────────
export const SURPLUS_TYPES: SurplusType[] = [
  {
    title: "Mortgage Foreclosure Surplus",
    description: "When your home sells at a mortgage foreclosure auction for more than the outstanding loan balance, the excess belongs to you — not the bank, not the servicer, not the county. We file the legal claim and fight any competing liens so you get what's rightfully yours.",
    statute: "FL Statute 45.032",
  },
  {
    title: "Tax Deed Sale Surplus",
    description: "If your property was sold at a tax deed sale for more than the delinquent taxes owed, you may be entitled to the overage. These cases have shorter filing deadlines and stricter procedural requirements — but we've handled hundreds of them across all 67 counties.",
    statute: "FL Statute 197.582",
  },
  {
    title: "HOA & COA Foreclosure Surplus",
    description: "Homeowner and condo associations can foreclose for unpaid assessments — sometimes just a few thousand dollars — while your property sells for far more. The difference is legally yours. We handle the claim and challenge the association's lien position when necessary.",
    statute: "FL Statute 45.032",
  },
  {
    title: "Heir & Probate Surplus Claims",
    description: "If a deceased family member's property was sold in foreclosure, the heirs may be entitled to surplus funds. These cases often require probate coordination, death certificates, and affidavits. We handle all of it — even if multiple heirs are involved across different states.",
    statute: "FL Statute 45.032(1)(b)",
  },
  {
    title: "Foreclosure Prevention & Creative Solutions",
    description: "If you haven't lost your home yet, it may not be too late. We use creative finance strategies — including subject-to agreements, seller financing, and deed-in-lieu negotiations — to help homeowners avoid foreclosure entirely and retain equity. Even if we can't do business together, we'll point you in the right direction.",
    statute: "Creative Finance",
  },
  {
    title: "Government & Code Enforcement Lien Disputes",
    description: "Government agencies, code enforcement boards, and utility companies often file competing claims against surplus funds. We litigate these disputes in court, challenging inflated lien amounts and improper claims to maximize your recovery.",
    statute: "FL Statute 45.032",
  },
];

// ────────────────────────────────────────────────────
// FAQ — Combines real Citus FAQs + competitor best practices
// + creative finance questions
// ────────────────────────────────────────────────────
export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What are surplus funds?",
    answer: "Surplus funds are the money left over when a foreclosed property is sold at auction for more than what was owed on the mortgage, taxes, or liens. That extra money doesn't go to the bank or the county — it belongs to you, the former owner of the property. In Florida, this right is protected under Statute 45.032.",
  },
  {
    question: "How do surplus funds occur?",
    answer: "Surplus funds are created when a foreclosed property is sold at auction and the sale price exceeds the total amount owed to the lender — including the remaining mortgage balance, accrued interest, and foreclosure-related expenses. The excess is held by the Clerk of Courts until the rightful owner files a legal claim.",
  },
  {
    question: "How do I know if I have surplus funds?",
    answer: "Many people don't even know they're owed money. We conduct a thorough investigation across all 67 Florida county court records to determine if surplus funds exist in your name. This search is completely free and comes with zero obligation. If funds exist, we'll tell you exactly how much before you commit to anything.",
  },
  {
    question: "Who is eligible to claim surplus funds?",
    answer: "The previous owner whose property was foreclosed upon is typically the primary claimant. However, other parties — including junior lienholders, judgment creditors, and in the case of a deceased owner, their legal heirs — may also have eligible claims. We help determine your standing and fight competing claims.",
  },
  {
    question: "How much does it cost to hire Citus Recovery Solutions?",
    answer: "We work on a contingency fee basis — there are no upfront costs, no retainers, and no out-of-pocket expenses. Our fee is a percentage of the surplus funds recovered, and it's negotiated on a case-by-case basis depending on the complexity and amount involved. If we don't recover your funds, you don't owe us a cent. We'll always work to beat any competitor's pricing.",
  },
  {
    question: "How long does the process take?",
    answer: "The typical timeline is 30 to 60 days from the date your claim is filed. However, more complex cases — especially those involving competing liens, probate, or multiple claimants — may take longer. We'll give you a realistic timeline upfront and keep you informed at every step.",
  },
  {
    question: "Can I file the claim myself?",
    answer: "You can try, but the legal process is complex and unforgiving. You must file a formal motion with the court, serve notice to all interested parties (including the lender, any lienholders, and the Clerk), and potentially attend hearings. One procedural error can delay or destroy your claim entirely. That's why most people work with experienced professionals like us.",
  },
  {
    question: "What if another lienholder or creditor claims my surplus funds?",
    answer: "This happens more often than you'd think. Banks, HOAs, government agencies, and code enforcement boards frequently file competing claims against surplus funds. As your legal team, we challenge illegitimate and inflated claims in court. This is one of the biggest reasons to work with us rather than a recovery company — they can't represent you if it goes to a hearing.",
  },
  {
    question: "Do I need to come to Florida or appear in court?",
    answer: "No. Our entire process is 100% virtual. You sign documents from your phone via e-Notary, and our attorneys attend all court hearings on your behalf. We serve clients throughout all 67 Florida counties and you never need to travel.",
  },
  {
    question: "How did you get my information? Is this a scam?",
    answer: "We obtain contact information from public records related to the property foreclosure process — these are legal, court-filed documents. Citus Recovery Solutions is a legitimate company based in St. Petersburg, Florida. We're transparent about our process, our fees, and our results. If you'd prefer not to be contacted, just let us know and we'll respect that immediately.",
  },
  {
    question: "What's the difference between you and those recovery companies that send letters?",
    answer: "Most 'surplus recovery companies' are unregulated, unlicensed third parties who ask you to sign an 'Assignment of Rights' — essentially giving them your claim in exchange for a cut (often 30–40%). They can't represent you in court, can't fight competing liens, and many violate Florida's fee cap under Statute 45.033. We work with licensed attorneys, charge a fair contingency rate we negotiate case by case, and provide full legal representation from start to finish.",
  },
  {
    question: "I'm currently facing foreclosure. Can you help me keep my home?",
    answer: "Potentially, yes. Unlike most surplus funds firms, we also offer foreclosure prevention consulting using creative finance strategies. Depending on your situation, we may be able to help you explore options like subject-to agreements, seller financing, loan modifications, or deed-in-lieu negotiations. Even if we determine that we can't directly help, we'll connect you with the right resources — because our goal is to help you, period.",
  },
  {
    question: "What if the foreclosure happened years ago?",
    answer: "You may still be eligible. While it's best to file as soon as possible, surplus funds don't immediately vanish. However, if unclaimed for too long, they can be transferred to the state's unclaimed property division, which adds another layer of complexity. Contact us for a free check — we'll determine if your funds are still claimable.",
  },
  {
    question: "What information do I need to get started?",
    answer: "Just some basic information: your name, contact details, and any information about the foreclosed property (address, county, approximate date). That's it. We handle the research, the paperwork, and the legal filing. You can get started in under five minutes with a free consultation.",
  },
  {
    question: "What is 'creative finance' and how does it relate to foreclosure?",
    answer: "Creative finance refers to non-traditional real estate strategies that can help homeowners avoid foreclosure without relying on banks or conventional refinancing. This includes subject-to transactions (where an investor takes over your existing mortgage payments), seller financing, and other structured arrangements that can protect your equity and credit score. We're one of the few surplus funds firms that also offers this kind of guidance.",
  },
];