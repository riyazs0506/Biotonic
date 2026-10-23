import { demo } from './demo';
import { pending, type Confirmable } from './pending';

/**
 * About-page and homepage company content.
 *
 * `principles` restate the brand intent documented in the approved logo presentation
 * (authoritative, scientific, dependable supply, scalable). They describe how Biotonic
 * presents itself, not verifiable performance claims.
 */
export interface Principle {
  title: string;
  body: string;
}

export interface Capability {
  title: string;
  body: string;
}

export interface CompanyContent {
  introduction: string;
  history: Confirmable<string[]>;
  mission: Confirmable<string>;
  vision: Confirmable<string>;
  principles: Principle[];
  capabilities: Confirmable<Capability[]>;
  customerApproach: Confirmable<string>;
}

export const company: CompanyContent = {
  introduction:
    'Biotonic supplies chemical products to businesses. In industrial purchasing, reliability is proven long before the first delivery — in how clearly a supplier communicates, how precisely it specifies and how consistently it follows through.',
  history: pending(
    'Company history and establishment story (2–3 short paragraphs)',
    demo.company.history,
  ),
  mission: pending('Mission statement', demo.company.mission),
  vision: pending('Vision statement', demo.company.vision),
  principles: [
    {
      title: 'Authoritative',
      body: 'Clear, established and direct — the way a dependable industrial partner should communicate from the very first interaction.',
    },
    {
      title: 'Scientific',
      body: 'An unmistakable link to the laboratory. Our identity starts with a test tube because chemistry is what we do.',
    },
    {
      title: 'Always on',
      body: 'The green “ON” inside our name stands for consistency: the same care and attention on every order.',
    },
    {
      title: 'Scalable',
      body: 'Built to work from a single drum to a long-term supply relationship, across every touchpoint of a business.',
    },
  ],
  capabilities: pending(
    'Confirmed business capabilities (e.g. sourcing, packaging options, logistics, documentation)',
    demo.company.capabilities,
  ),
  customerApproach: pending(
    'How Biotonic works with customers, from enquiry to delivery',
    demo.company.customerApproach,
  ),
};
