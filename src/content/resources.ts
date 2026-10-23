import { demo } from './demo';
import { pending, type Confirmable } from './pending';

export interface ResourceDocument {
  title: string;
  description: string;
  /**
   * Path under /public/resources/, an approved external URL, or a quote-request link
   * (`/request-a-quote?...`) for documents supplied on request.
   */
  href: string;
  format: 'PDF' | 'XLSX' | 'DOCX';
  /** Approximate size shown to the visitor, e.g. "420 KB". Omit for on-request documents. */
  size?: string;
  productSlug?: string;
}

/**
 * Downloadable technical resources. The Resources page is unpublished in release builds
 * until approved documents are added. Demo values are illustrative only (draft builds).
 */
export const resources: Confirmable<ResourceDocument[]> = pending(
  'Approved technical documents (specification sheets, SDS/MSDS, brochures)',
  demo.resources.list,
);
