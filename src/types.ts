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