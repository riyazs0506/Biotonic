import { demo } from './demo';
import { pending, type Confirmable } from './pending';

/**
 * Quality & applications. The knowledge-first approach comes from the strategy's value
 * proposition and USPs; certifications and order documentation still need client confirmation.
 */
export interface Certification {
  name: string;
  issuer: string;
  /** Certificate number or reference, if the client wants it published. */
  reference?: string;
}

export interface QualityContent {
  overview: string;
  process: { title: string; body: string }[];
  compliance: string;
  certifications: Confirmable<Certification[]>;
  /** Documents supplied with orders, e.g. "Certificate of Analysis". */
  documentation: Confirmable<string[]>;
}

export const quality: QualityContent = {
  overview:
    'Genuine, traceable products from India’s leading principals — and the knowledge to use them well, before and after the sale.',
  process: [
    {
      title: 'Understand the application',
      body: 'We start with your process, your substrate and your conditions — not with a price list.',
    },
    {
      title: 'Explain the chemistry',
      body: 'Selection, dosage and application are explained before we quote, so you buy the right product once.',
    },
    {
      title: 'Supply genuine brands',
      body: 'Traceable products from Zydex, Pidilite and India Glycols, from stock proven over 20+ years.',
    },
    {
      title: 'Support after the sale',
      body: 'Application support on site and stock alerts, so results stay consistent order after order.',
    },
  ],
  compliance:
    'Across the Tiruppur cluster, compliance pressure — ZDHC and zero liquid discharge — keeps rising. That is why we lead with advice: the right chemical, used the right way.',
  // No demo certifications: certification claims must only ever come from the client.
  certifications: pending('Certifications and regulatory approvals with issuing bodies'),
  documentation: pending(
    'Documents supplied with orders (e.g. COA, SDS/MSDS)',
    demo.quality.documentation,
  ),
};
