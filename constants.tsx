import { Testimonial, ServiceStep } from './types';

export const TESTIMONIALS: Testimonial[] = [
  { name: "Robert & Linda P.", location: "Palm Beach County", text: "The bank told us there was nothing left. Citus found $92,000. It allowed us to start over." },
  { name: "James L.", location: "Miami-Dade County", text: "I had 24 hours to file before losing everything. Citus went to work immediately.", isHighlight: true },
  { name: "Elena G.", location: "Hillsborough County", text: "No pagué nada por adelantado. Fueron honestos y el proceso fue totalmente virtual." },
  { name: "David S.", location: "Orange County", text: "They beat every other firm's price and their professionalism was unmatched." },
  { name: "Sarah K.", location: "Duval County", text: "They fought the HOA in court for me and won. I got my check for $44,000 yesterday." },
  { name: "Thomas L.", location: "Broward County", text: "I received my check for $44,000 yesterday. Citus made a painful process simple." }
];

export const STEPS: ServiceStep[] = [
  { id: "01", title: "Forensic Audit", description: "We audit the Clerk of Courts across all 67 Florida counties to verify exactly what is owed to you." },
  { id: "02", title: "Virtual Onboarding", description: "Sign your legal documents securely via e-Notary from your smartphone. No travel required." },
  { id: "03", title: "Direct Release", description: "Our attorneys file the motions and attend hearings. Your check is mailed directly to your door." }
];