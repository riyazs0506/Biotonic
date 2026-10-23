import { demo } from './demo';
import { pending, type Confirmable } from './pending';

export interface Certification {
  name: string;
  issuer: string;
  /** Certificate number or reference, if the client wants it published. */
  reference?: string;
}

export interface QualityContent {
  overview: Confirmable<string>;
  process: Confirmable<{ title: string; body: string }[]>;
  certifications: Confirmable<Certification[]>;
  /** Documents supplied with orders, e.g. "Certificate of Analysis". */
  documentation: Confirmable<string[]>;
}

/** Demo values are illustrative only (draft builds); replace with approved information. */
export const quality: QualityContent = {
  overview: pending('Quality approach overview', demo.quality.overview),
  process: pending(
    'Quality control steps (sourcing, testing, packaging, dispatch)',
    demo.quality.process,
  ),
  // No demo certifications: certification claims must only ever come from the client.
  certifications: pending('Certifications and regulatory approvals with issuing bodies'),
  documentation: pending(
    'Documents supplied with orders (e.g. COA, SDS/MSDS)',
    demo.quality.documentation,
  ),
};
