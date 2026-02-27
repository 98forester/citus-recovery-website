export interface Testimonial {
  name: string;
  location: string;
  text: string;
  isHighlight?: boolean;
}

export interface ServiceStep {
  id: string;
  title: string;
  description: string;
}