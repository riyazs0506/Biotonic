/**
 * Demo content shown in draft builds only (client review), so pages look complete before
 * real facts are supplied. Release builds replace this module with `empty.ts` at build time
 * (see vite.config.ts), so none of this text can reach a public page or bundle.
 *
 * Everything here is ILLUSTRATIVE. Replace the matching `pending(...)` in the content files
 * with the client-approved value; never move a demo value into real content unconfirmed.
 */
import type { Category, Product } from '../catalogue/schema';
import type { ResourceDocument } from '../resources';
import demoCategories from './catalogue-categories.json';
import demoProducts from './catalogue-products.json';

export const demo = {
  site: {
    legalName: 'Biotonic Chemicals Private Limited',
    email: 'sales@biotonic.in',
    phone: '+91 98765 43210',
    whatsapp: '919876543210',
    address: ['No. 14, Industrial Estate', 'Tiruppur 641604, Tamil Nadu, India'],
    businessHours: 'Monday to Saturday, 9:30 am – 6:30 pm IST',
  },
  quality: {
    documentation: [
      'Certificate of Analysis (COA) for each batch',
      'Safety Data Sheet (SDS)',
      'Technical data sheet on request',
    ],
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
      'This website is operated by Biotonic Chemicals Private Limited, No. 14, Industrial Estate, Tiruppur 641604, Tamil Nadu, India. You can contact us at sales@biotonic.in.',
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
      'These terms are governed by the laws of India, and the courts of Tiruppur have exclusive jurisdiction.',
  },
  catalogue: {
    categories: demoCategories as Category[],
    products: demoProducts as Product[],
  },
};
