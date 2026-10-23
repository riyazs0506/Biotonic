import { demo } from './demo';
import { pending, type Confirmable } from './pending';

export interface ProfileLink {
  label: string;
  href: string;
}

export interface Portrait {
  /** Path under /public, e.g. "/images/leadership/founder.webp". */
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface LeaderProfile {
  name: Confirmable<string>;
  title: Confirmable<string>;
  portrait: Confirmable<Portrait>;
  /** Short introduction used on the homepage. */
  introduction: Confirmable<string>;
  biography: Confirmable<string[]>;
  vision: Confirmable<string>;
  philosophy: Confirmable<string>;
  experience: Confirmable<string[]>;
  achievements: Confirmable<string[]>;
  links: Confirmable<ProfileLink[]>;
}

/** Demo values are illustrative only (draft builds); replace with the approved profile. */
export const founder: LeaderProfile = {
  name: pending('Founder / owner full name', demo.founder.name),
  title: pending('Founder / owner job title', demo.founder.title),
  // No demo portrait: a monogram is shown until the approved photograph is supplied.
  portrait: pending('Approved professional portrait (min. 1200×1500 px)'),
  introduction: pending(
    'Two-sentence founder introduction for the homepage',
    demo.founder.introduction,
  ),
  biography: pending('Approved professional biography (2–4 paragraphs)', demo.founder.biography),
  vision: pending('Founder’s business vision for Biotonic', demo.founder.vision),
  philosophy: pending('Leadership philosophy (short quote or paragraph)', demo.founder.philosophy),
  experience: pending('Verified relevant experience (list)', demo.founder.experience),
  achievements: pending('Approved achievements (list, optional)'),
  links: pending('Professional profile links, e.g. LinkedIn (optional)'),
};
