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
  established: Confirmable<string>;
  supplyRegions: Confirmable<string>;
  businessHours: Confirmable<string>;
  social: Confirmable<SocialLink[]>;
}

export const site: SiteContent = {
  brandName: 'Biotonic',
  tagline: 'Chemistry you can trust, at first glance.',
  summary: 'Biotonic supplies chemical products to businesses.',
  legalName: pending('Registered legal company name', demo.site.legalName),
  email: pending('Public sales / enquiry email address', demo.site.email),
  phone: pending('Business telephone number', demo.site.phone),
  whatsapp: pending('WhatsApp business number (international format)', demo.site.whatsapp),
  address: pending('Registered business address', demo.site.address),
  established: pending('Year the company was established', demo.site.established),
  supplyRegions: pending('Regions or countries Biotonic supplies', demo.site.supplyRegions),
  businessHours: pending('Business hours for enquiries', demo.site.businessHours),
  social: pending('Official social media / LinkedIn profile URLs'),
};
