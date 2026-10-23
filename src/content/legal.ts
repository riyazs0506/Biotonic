import { demo } from './demo';
import { pending, type Confirmable } from './pending';

/**
 * Legal pages. Demo wording in `pending(...)` is shown in draft builds only. These drafts describe how this website actually handles data
 * (see docs/SECURITY.md). They are NOT legal advice and must be reviewed and
 * approved by the client's legal adviser. Set `approved: true` only after sign-off;
 * release builds fail while either document is unapproved.
 */
export interface LegalSection {
  heading: string;
  paragraphs: Confirmable<string>[];
}

export interface LegalDocument {
  title: string;
  description: string;
  approved: boolean;
  lastUpdated: Confirmable<string>;
  sections: LegalSection[];
}

export const privacyPolicy: LegalDocument = {
  title: 'Privacy Policy',
  description:
    'How Biotonic collects, uses and protects information submitted through this website.',
  approved: false,
  lastUpdated: pending('Effective date of the approved policy', demo.legal.privacyLastUpdated),
  sections: [
    {
      heading: 'Who we are',
      paragraphs: [
        pending(
          'Legal entity name, registered address and contact email of the data controller',
          demo.legal.privacyWhoWeAre,
        ),
      ],
    },
    {
      heading: 'Information we collect',
      paragraphs: [
        'When you submit an enquiry or quotation request, we receive the details you enter: your name, company, business email address, telephone number (if provided), the product you are interested in, quantities and your message.',
        'Our web server processes technical information needed to deliver and protect the website, such as your IP address and browser type. This website does not use advertising or analytics cookies.',
      ],
    },
    {
      heading: 'How we use your information',
      paragraphs: [
        'We use enquiry details only to respond to your request, prepare quotations and manage the resulting business relationship. We do not sell your information.',
        'IP addresses are used temporarily to limit abusive or automated submissions.',
      ],
    },
    {
      heading: 'How your enquiry is delivered',
      paragraphs: [
        'Enquiries are sent by email to Biotonic’s enquiry inbox through our email delivery provider. The website itself does not store enquiries in a database.',
        pending(
          'Name of the email delivery provider and hosting provider',
          demo.legal.privacyHowYourEnquiryIsDelivered,
        ),
      ],
    },
    {
      heading: 'Retention',
      paragraphs: [
        pending(
          'How long enquiry emails are retained and when they are deleted',
          demo.legal.privacyRetention,
        ),
      ],
    },
    {
      heading: 'Your rights',
      paragraphs: [
        pending(
          'Data-protection rights under the applicable law (e.g. India’s DPDP Act 2023) and how to exercise them',
          demo.legal.privacyYourRights,
        ),
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [pending('Contact details for privacy requests', demo.legal.privacyContact)],
    },
  ],
};

export const terms: LegalDocument = {
  title: 'Terms of Use',
  description: 'The terms that apply to your use of the Biotonic website.',
  approved: false,
  lastUpdated: pending('Effective date of the approved terms', demo.legal.termsLastUpdated),
  sections: [
    {
      heading: 'About these terms',
      paragraphs: [
        'These terms govern your use of this website. By using the website you agree to them. Supply of products is governed by the quotation, order confirmation and commercial terms agreed separately in writing.',
      ],
    },
    {
      heading: 'Product information',
      paragraphs: [
        'Product descriptions and specifications on this website are provided for general information. Always rely on the documentation supplied with your quotation or order, such as specification sheets and safety data sheets.',
      ],
    },
    {
      heading: 'Quotations',
      paragraphs: [
        'Submitting an enquiry does not create a contract. Prices, availability and delivery terms are confirmed only in a written quotation from Biotonic.',
      ],
    },
    {
      heading: 'Intellectual property',
      paragraphs: [
        'The Biotonic name, logo and website content are owned by Biotonic and may not be reproduced without permission.',
      ],
    },
    {
      heading: 'Liability',
      paragraphs: [
        pending(
          'Limitation-of-liability wording approved by legal adviser',
          demo.legal.termsLiability,
        ),
      ],
    },
    {
      heading: 'Governing law',
      paragraphs: [pending('Governing law and jurisdiction', demo.legal.termsGoverningLaw)],
    },
  ],
};
