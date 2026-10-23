import type { ReactNode } from 'react';
import type { Crumb } from '../../lib/seo';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { Eyebrow } from '../ui/Layout';
import styles from './PageHeader.module.css';

/** Opening block for inner pages: breadcrumbs, eyebrow, display title and lead. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  breadcrumbs,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  breadcrumbs?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <div className={styles.header}>
      <div className={styles.art} aria-hidden="true">
        <svg viewBox="0 0 120 260">
          <circle cx="66" cy="14" r="5" />
          <circle cx="50" cy="34" r="3.5" />
          <circle cx="64" cy="50" r="8" />
          <path d="M28 76h64M38 76v138a22 22 0 0 0 44 0V76" />
        </svg>
      </div>
      <div className={styles.inner}>
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className={`display ${styles.title}`}>{title}</h1>
        {lead && <div className={styles.lead}>{lead}</div>}
        {children}
      </div>
    </div>
  );
}
