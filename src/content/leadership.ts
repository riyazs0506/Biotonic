import { pending, type Confirmable } from './pending';

/**
 * Founder profile. Source: "Biotonic — Strategy Framework" (Visionary X, November 2026),
 * section 02 "Founder-led brand: Keerthi Vasan".
 */
export interface ProfileLink {
  label: string;
  href: string;
}

export interface Portrait {
  src: '/images/founder/biotonic-founder.png',
  alt: 'Biotonic Founder – Professional Portrait',
  width: 1024,
  height: 1536,
}

export interface TimelineStep {
  period: string;
  title: string;
  detail?: string;
}

export interface Award {
  title: string;
  from: string;
}

export interface FounderRole {
  title: string;
  body: string;
  proof: string[];
}

export interface LeaderProfile {
  name: string;
  title: string;
  portrait: Confirmable<Portrait>;
  /** Personal brand statement, used on the homepage and leadership page. */
  statement: string;
  /** The story angle, shown as a pull quote. */
  storyAngle: string;
  biography: string[];
  vision: string;
  timeline: TimelineStep[];
  roles: FounderRole[];
  awards: Award[];
  education: { school: string; degree: string; college: string };
  links: Confirmable<ProfileLink[]>;
}

export const founder: LeaderProfile = {
  name: 'Keerthi Vasan',
  title: 'Founder, Biotonic',
  // The strategy schedules a founder photo shoot; until then a monogram is shown.
  portrait: pending('Approved professional portrait from the founder photo shoot'),
  statement:
    'Keerthi Vasan connects India’s leading chemical brands with the businesses that use them, and closes deals that last.',
  storyAngle:
    'He started at the bottom of his own family business and learned every job on the way up. That is why principals trust his word and buyers trust his advice.',
  biography: [
    'Keerthi Vasan founded Biotonic in 2024 to spread real awareness about chemicals among the businesses that use them, and to supply products they can trust.',
    'An automobile engineering graduate of Kumaraguru College of Technology, Coimbatore, he joined TMR and Co — his family’s chemical distribution business in Tiruppur — in 2017 as godown staff. He worked his way up through marketing to Head of Operations in 2020, and from 2021 took full charge of sales, marketing, collections, stock and supply.',
    'Today he is the face and voice of Biotonic: the industrial expert who explains the chemistry, and the deal maker who brings principals, distributors and buyers to the table.',
  ],
  vision:
    'To make Biotonic the first call for buyers, dealers and principals — and the region’s knowledge-led chemical partner.',
  timeline: [
    { period: 'School', title: 'Bharathi Vidya Bhavan', detail: 'Erode' },
    {
      period: 'Degree',
      title: 'BE Automobile Engineering',
      detail: 'Kumaraguru College of Technology, Coimbatore',
    },
    {
      period: '2015–16',
      title: 'Financial advisor',
      detail: 'For trucks, buses and heavy vehicles',
    },
    {
      period: '2017',
      title: 'Joins TMR and Co',
      detail: 'As godown staff, then marketing assistant, executive and manager',
    },
    { period: '2020', title: 'Head of Operations', detail: 'TMR and Co, Tiruppur' },
    {
      period: '2021',
      title: 'Takes full charge',
      detail: 'Of sales, marketing, collections, stock and supply',
    },
    // The strategy deck's timeline shows 2023 here, while every other slide says Biotonic was
    // founded in 2024. 2024 is used consistently on the site — confirm with the client.
    {
      period: '2024',
      title: 'Founds Biotonic',
      detail: 'To raise awareness about chemicals and supply good products',
    },
  ],
  roles: [
    {
      title: 'Industrial expert',
      body: 'Knows chemicals from the godown floor to the boardroom: products, applications, supply chains and markets.',
      proof: [
        'Hands-on in every role at TMR and Co',
        'Engineering graduate',
        'Champion of chemical awareness',
      ],
    },
    {
      title: 'Deal maker',
      body: 'Brings principals, distributors and buyers to the table and makes the numbers work for all three.',
      proof: [
        'Top sales awards from Zydex and Pidilite',
        '20+ years of principal relationships',
        'Runs sales and collections',
      ],
    },
  ],
  awards: [
    { title: 'Sales No. 1 Award', from: 'Zydex Industries' },
    { title: 'Pigments Sales Award', from: 'Pidilite Industries' },
    { title: 'Young Entrepreneur Award', from: 'Presented by Shri Ramdas Athawale' },
    { title: '20+ years', from: 'Trusted channel partner to Zydex, Pidilite and India Glycols' },
  ],
  education: {
    school: 'Bharathi Vidya Bhavan, Erode',
    degree: 'BE Automobile Engineering',
    college: 'Kumaraguru College of Technology',
  },
  links: pending('Founder LinkedIn profile URL'),
};
