import { demo } from './demo';
import { pending, type Confirmable } from './pending';

/**
 * Company-wide facts. Replace each `pending(...)` with the client-approved value.
 * Do not invent values: an unconfirmed field must stay pending.
 */
export interface SocialLink {
  label: string;
  href: string;
}

export interface SiteContent {
  brandName: string;
  tagline: string;
  /** One-sentence description confirmed by the brand presentation. */
  summary: string;
  legalName: Confirmable<string>;
  email: Confirmable<string>;
  phone: Confirmable<string>;
  /** International format, digits only, e.g. "919800000000". */
  whatsapp: Confirmable<string>;
  address: Confirmable<string[]>;
  established: string;
  supplyRegions: string;
  businessHours: Confirmable<string>;
  social: Confirmable<SocialLink[]>;
}

export const site: SiteContent = {
  brandName: 'Biotonic',
  tagline: 'Chemistry you can trust, at first glance.',
  summary:
    'Biotonic is a B2B chemical distribution company serving textile, construction and industrial businesses across the Tiruppur, Erode and Coimbatore belt.',
  legalName: pending('Registered legal company name', demo.site.legalName),
  email: pending('Public sales / enquiry email address', demo.site.email),
  phone: pending('Business telephone number', demo.site.phone),
  whatsapp: pending('WhatsApp business number (international format)', demo.site.whatsapp),
  address: pending('Registered business address', demo.site.address),
  established: '2024',
  supplyRegions: 'Tiruppur, Erode and Coimbatore — expanding across Tamil Nadu and South India',
  businessHours: pending('Business hours for enquiries', demo.site.businessHours),
  social: pending('Official social media / LinkedIn profile URLs'),
};
