import { demo } from './demo';
import { pending, type Confirmable } from './pending';

export interface Industry {
  slug: string;
  name: string;
  summary: string;
  /** Product slugs relevant to this industry. */
  productSlugs: string[];
}

/**
 * Industries Biotonic serves. Only list industries the client has confirmed.
 * Demo values are illustrative only (draft builds).
 */
export const industries: Confirmable<Industry[]> = pending(
  'Industries / applications Biotonic serves, with a one-line summary for each',
  demo.industries.list,
);
