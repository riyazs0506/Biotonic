/**
 * Company content. Source: "Biotonic — Strategy Framework" (Visionary X, November 2026),
 * supplied by the client. Internal strategy material (SWOT, competitor analysis, KPIs,
 * rollout plan, content pillars) is deliberately not published on the website.
 */
export interface TitledText {
  title: string;
  body: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Audience {
  slug: string;
  /** Priority from the strategy: Primary, Secondary, Strategic. */
  priority: string;
  name: string;
  description: string;
  /** "What each side gets". */
  gets: string[];
}

export interface JourneyStep {
  stage: string;
  title: string;
  body: string;
}

export const company = {
  /** Brand idea from the strategy. */
  brandIdea: 'The right chemistry. The right deal.',

  introduction:
    'Biotonic is a B2B chemical distribution company founded in 2024 by Keerthi Vasan to spread real awareness about chemicals among the businesses that use them, and to supply products they can trust.',

  /** Positioning statement. */
  positioning:
    'For businesses that build, dye and make, Biotonic is the chemical partner that brings genuine brands and expert know-how together, backed by 20+ years with India’s leading principals and led by a founder who learned the trade from the godown floor up.',

  valueProposition:
    'The right chemical, the right brand and the right advice, delivered on time, with a decision-maker who picks up the phone.',

  legacyTitle: 'A chemical partner built on a legacy',
  history: [
    'Biotonic stands on the legacy of TMR and Co, the family chemical distribution business in Tiruppur and a trusted partner of Zydex, Pidilite and India Glycols for more than 20 years.',
    'Founded in 2024 by Keerthi Vasan, Biotonic carries that experience forward with a clear purpose: to spread real awareness about chemicals among the businesses that use them, and to supply products they can trust.',
  ],

  atAGlance: [
    { value: '2024', label: 'Founded by Keerthi Vasan' },
    { value: '20+ yrs', label: 'Principal partnerships, through the TMR and Co legacy' },
    { value: '3', label: 'Markets: textile, construction and industrial chemicals' },
  ] satisfies Stat[],

  /** Principal brands Biotonic works with (text only — no third-party logos). */
  principals: ['Zydex Industries', 'Pidilite Industries', 'India Glycols'],

  mission:
    'To spread real awareness about chemicals among the businesses that use them, and to supply products they can trust.',
  vision:
    'To be the region’s knowledge-led chemical partner — the first call for buyers, dealers and principals.',

  /** "Perceived as" from the positioning. */
  values: [
    {
      title: 'Expert',
      body: 'We explain the chemistry — selection, dosage and application — before we quote, and stay with you after the sale.',
    },
    {
      title: 'Dependable',
      body: 'Genuine, traceable products, with stock, dispatch and collections systems proven over 20+ years.',
    },
    {
      title: 'Decisive',
      body: 'A decision-maker who picks up the phone, with direct access to the founder for pricing, partnerships and problem-solving.',
    },
  ] satisfies TitledText[],

  /** Unique selling proposition. */
  usps: [
    {
      title: 'Genuine brands',
      body: 'Long-standing partnerships with Zydex, Pidilite and India Glycols. Genuine, traceable products.',
    },
    {
      title: 'Knowledge first',
      body: 'We explain the chemistry — selection, dosage and application — before we quote.',
    },
    {
      title: 'Supply you can plan on',
      body: 'Stock, dispatch and collections systems proven over 20+ years.',
    },
    {
      title: 'A deal maker at the table',
      body: 'Direct access to the founder for pricing, partnerships and problem-solving.',
    },
  ] satisfies TitledText[],

  pricePositioning: {
    title: 'Value, not cheapest',
    body: 'Competitive on genuine brands, justified by advice, reliability and service — never a race to the bottom.',
  } satisfies TitledText,

  audiences: [
    {
      slug: 'b2b-clients',
      priority: 'Primary',
      name: 'B2B clients',
      description:
        'Textile dyeing, printing and processing units; garment exporters; construction contractors, applicators and builders; manufacturers using glycols and performance chemicals.',
      gets: [
        'Genuine products from Zydex, Pidilite and India Glycols',
        'Application advice before and after the sale',
        'Reliable stock and delivery, proven over 20+ years',
      ],
    },
    {
      slug: 'dealers',
      priority: 'Secondary',
      name: 'Distributors & dealers',
      description:
        'Sub-dealers and retailers who want genuine principal brands, product training and dependable supply to grow their own business.',
      gets: [
        'Access to leading principal brands',
        'Product training and sales support',
        'Fair terms and a direct line to the founder',
      ],
    },
    {
      slug: 'principals',
      priority: 'Strategic',
      name: 'Suppliers & principals',
      description:
        'Chemical manufacturers looking for a high-performing, well-connected channel partner in South India.',
      gets: [
        'Award-winning sell-through for Zydex and Pidilite',
        'Reach across textile, construction and industry',
        'Ground-level market intelligence',
      ],
    },
  ] satisfies Audience[],

  /** How working with Biotonic works — the customer-facing journey touchpoints. */
  journey: [
    {
      stage: 'Talk to us',
      title: 'A quick, direct quote',
      body: 'Send an enquiry or a WhatsApp message. You get a fast quote — and a founder call when it matters.',
    },
    {
      stage: 'Try us',
      title: 'Samples, trials and site visits',
      body: 'We test the right chemical on your process and visit your site to get the application right.',
    },
    {
      stage: 'Stay with us',
      title: 'On-time dispatch and support',
      body: 'Reliable dispatch, application support after the sale and stock alerts so you can plan ahead.',
    },
    {
      stage: 'Grow together',
      title: 'A partnership that lasts',
      body: 'A dealer programme, shared client stories and community meets across the region.',
    },
  ] satisfies JourneyStep[],

  /** The idea behind the logo (from the approved logo presentation). */
  nameStory:
    'In the Biotonic logo the letter I is a test tube and three bubbles rise from it: a living reaction. The green ON inside TONIC stands for always on — consistent supply, every order.',
};
