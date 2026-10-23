/**
 * Demo content shown in draft builds only (client review), so pages look complete before
 * real facts are supplied. Release builds replace this module with `empty.ts` at build time
 * (see vite.config.ts), so none of this text can reach a public page or bundle.
 *
 * Everything here is ILLUSTRATIVE. Replace the matching `pending(...)` in the content files
 * with the client-approved value; never move a demo value into real content unconfirmed.
 */
import type { Category, Product } from '../catalogue/schema';
import type { Industry } from '../industries';
import type { ResourceDocument } from '../resources';
import demoCategories from './catalogue-categories.json';
import demoProducts from './catalogue-products.json';

export const demo = {
  site: {
    legalName: 'Biotonic Chemicals Private Limited',
    email: 'sales@biotonic.in',
    phone: '+91 98765 43210',
    whatsapp: '919876543210',
    address: ['Plot 14, Industrial Estate', 'Chennai 600098, Tamil Nadu, India'],
    established: '2018',
    supplyRegions: 'Pan-India supply',
    businessHours: 'Monday to Saturday, 9:30 am – 6:30 pm IST',
  },
  company: {
    history: [
      'Biotonic was founded to make industrial chemical purchasing simpler and more dependable. What began as a focused trading operation serving local manufacturers has grown into a supply partner for businesses across several industries.',
      'From the start, the company has been built around a simple discipline: specify clearly, document properly and deliver consistently — so that buyers can plan production with confidence.',
    ],
    mission:
      'To supply industrial chemicals with the precision, documentation and consistency that modern businesses depend on.',
    vision:
      'To be the chemical supply partner businesses trust at first glance — and keep trusting with every order.',
    capabilities: [
      {
        title: 'Reliable sourcing',
        body: 'Established relationships with manufacturers so the same grade arrives order after order.',
      },
      {
        title: 'Flexible packaging',
        body: 'Bags, drums, carboys and bulk options matched to how your plant receives and stores material.',
      },
      {
        title: 'Clear documentation',
        body: 'Specification sheets, safety data sheets and certificates of analysis supplied with your order.',
      },
      {
        title: 'Planned logistics',
        body: 'Scheduled dispatches and regular supply programmes that keep production running.',
      },
      {
        title: 'Responsive service',
        body: 'A dedicated contact who answers enquiries quickly and follows each order through to delivery.',
      },
      {
        title: 'Technical guidance',
        body: 'Help selecting the right grade and pack size for your process and volumes.',
      },
    ],
    customerApproach:
      'Every relationship starts with a clear understanding of your process, grade requirements and volumes. We confirm specifications in writing, quote transparently and keep you informed from dispatch to delivery — then follow up to make sure the material performs as expected.',
  },
  founder: {
    name: 'Arjun Menon',
    title: 'Founder & Managing Director',
    introduction:
      'Biotonic was founded on a simple belief: businesses deserve a chemical supplier they can rely on without a second thought. That belief still shapes how we specify, document and deliver every order.',
    biography: [
      'Arjun founded Biotonic after more than a decade working alongside manufacturers who needed dependable access to industrial chemicals. He saw that buyers valued one thing above all else: knowing that what arrives is exactly what was ordered.',
      'Today he leads the company’s commercial direction, supplier partnerships and customer relationships, and remains personally involved in how Biotonic serves its key accounts.',
    ],
    vision:
      'To build Biotonic into a supply partner that businesses trust at first glance — precise in its specifications, transparent in its quotations and consistent on every delivery.',
    philosophy:
      'Trust is earned in the details: a clear specification, an honest quotation and a delivery that arrives exactly as promised.',
    experience: [
      'Over ten years in industrial chemical supply and distribution',
      'Experience working with manufacturing, water treatment and process industries',
      'Background in supplier development and quality-focused procurement',
    ],
  },
  quality: {
    overview:
      'Every order is checked against its agreed specification before it leaves us, and supplied with the documentation your quality team needs.',
    process: [
      {
        title: 'Qualified sourcing',
        body: 'Material is sourced from approved manufacturers with a consistent production record.',
      },
      {
        title: 'Specification check',
        body: 'Each batch is matched against the agreed grade and specification before dispatch.',
      },
      {
        title: 'Secure packaging',
        body: 'Packed in suitable, clearly labelled containers with batch identification.',
      },
      {
        title: 'Documented dispatch',
        body: 'Orders leave with the relevant certificates and safety information.',
      },
    ],
    documentation: [
      'Certificate of Analysis (COA) for each batch',
      'Safety Data Sheet (SDS)',
      'Technical data sheet on request',
    ],
  },
  industries: {
    list: [
      {
        slug: 'water-treatment',
        name: 'Water treatment',
        summary: 'Chemicals for pH correction, neutralisation and process water conditioning.',
        productSlugs: ['caustic-soda-flakes', 'hydrochloric-acid'],
      },
      {
        slug: 'textiles',
        name: 'Textiles & dyeing',
        summary: 'Alkalis and acids used across scouring, bleaching and dyeing processes.',
        productSlugs: ['caustic-soda-flakes', 'soda-ash-light'],
      },
      {
        slug: 'pharmaceuticals',
        name: 'Pharmaceuticals',
        summary: 'Solvents for cleaning, extraction and formulation support.',
        productSlugs: ['isopropyl-alcohol', 'acetone'],
      },
      {
        slug: 'paints-coatings',
        name: 'Paints & coatings',
        summary: 'Solvents for thinning, cleaning and surface preparation.',
        productSlugs: ['acetone', 'isopropyl-alcohol'],
      },
      {
        slug: 'detergents',
        name: 'Soaps & detergents',
        summary: 'Alkalis for saponification and detergent manufacturing.',
        productSlugs: ['caustic-soda-flakes', 'soda-ash-light'],
      },
      {
        slug: 'metal-processing',
        name: 'Metal processing',
        summary: 'Acids for pickling, cleaning and surface treatment.',
        productSlugs: ['hydrochloric-acid', 'sulphuric-acid'],
      },
    ] satisfies Industry[],
  },
  resources: {
    list: [
      {
        title: 'Product catalogue',
        description: 'Overview of Biotonic’s product range, grades and pack sizes.',
        href: '/request-a-quote?document=catalogue',
        format: 'PDF',
      },
      {
        title: 'Safety Data Sheets',
        description: 'SDS for each product, supplied with every order and on request.',
        href: '/request-a-quote?document=sds',
        format: 'PDF',
      },
      {
        title: 'Technical data sheets',
        description: 'Typical properties and specifications for each grade.',
        href: '/request-a-quote?document=tds',
        format: 'PDF',
      },
      {
        title: 'Certificate of Analysis sample',
        description: 'An example of the batch documentation that accompanies deliveries.',
        href: '/request-a-quote?document=coa',
        format: 'PDF',
      },
    ] satisfies ResourceDocument[],
  },
  legal: {
    privacyLastUpdated: '22 October 2026',
    privacyWhoWeAre:
      'This website is operated by Biotonic Chemicals Private Limited, Plot 14, Industrial Estate, Chennai 600098, Tamil Nadu, India. You can contact us at sales@biotonic.in.',
    privacyHowYourEnquiryIsDelivered:
      'Our website hosting and email delivery providers process this information on our behalf and only for this purpose.',
    privacyRetention:
      'We keep enquiry emails for as long as needed to respond and manage any resulting business relationship, and delete enquiries that do not lead to a business relationship within 24 months.',
    privacyYourRights:
      'You may ask us for access to, correction of or deletion of the personal information you have sent us, and you may withdraw your consent at any time. Contact us using the details below and we will respond within a reasonable time.',
    privacyContact:
      'For any privacy question or request, email sales@biotonic.in with the subject “Privacy request”.',
    termsLastUpdated: '22 October 2026',
    termsLiability:
      'We take care to keep this website accurate and available, but we do not guarantee that it is free from errors or interruptions. To the extent permitted by law, we are not liable for losses arising from the use of this website.',
    termsGoverningLaw:
      'These terms are governed by the laws of India, and the courts of Chennai have exclusive jurisdiction.',
  },
  catalogue: {
    categories: demoCategories as Category[],
    products: demoProducts as Product[],
  },
};
