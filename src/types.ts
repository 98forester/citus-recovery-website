export interface Testimonial {
  name: string;
  location: string;
  text: string;
  amount?: string;
  isHighlight?: boolean;
}

export interface ServiceStep {
  id: string;
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SurplusType {
  title: string;
  description: string;
  statute: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface RelativeData {
  name: string;
  relationship: string;
  age: string | null;
  location: string;
  phones: string[];
  emails: string[];
}

export interface Lead {
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
  qualified_at: string | null;
  outreach_sent_at: string | null;
  state: string | null;
  waiting_period_end: string | null;
  liens: any;
  competing_claims: any;
  claim_status: string | null;
  claim_details: Record<string, any> | null;
  follow_up_step: number | null;
  sequence_active: boolean | null;
  next_follow_up_at: string | null;
  dob: string | null;
  agreement_link: string | null;
  lpoa_link: string | null;
  other_link: string | null;
  reference_id?: string | null;
  signature_data?: string | null;
  contacted_at: string | null;
  contact_method: string | null;
  contact_notes: string | null;
  relatives_data?: RelativeData[] | null;
  documents?: string[] | null;
  is_deceased?: boolean;
}

export interface LeadActivityLog {
  id: string;
  lead_id: string;
  action: string;
  details: any;
  performed_by: 'owner' | 'citus1bot' | 'system';
  created_at: string;
}