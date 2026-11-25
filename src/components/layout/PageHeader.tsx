import type { ReactNode } from 'react';
import type { Crumb } from '../../lib/seo';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { Eyebrow } from '../ui/Layout';
import styles from './PageHeader.module.css';

export interface HeaderImage {
  src: string;
  alt: string;
}

/** Opening block for inner pages: breadcrumbs, eyebrow, display title, lead and an optional photo. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  breadcrumbs,
  image,
  compact,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  breadcrumbs?: Crumb[];
  image?: HeaderImage;
  /** Smaller title, photo and padding for utility pages such as Contact. */
  compact?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={`${styles.header} ${image ? styles.withImage : ''} ${compact ? styles.compact : ''}`}
    >
      <div className={styles.inner}>
        <div className={styles.text}>
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className={`display ${styles.title}`}>{title}</h1>
          {lead && <div className={styles.lead}>{lead}</div>}
          {children}
        </div>
        {image && (
          <figure className={styles.photo}>
            <img
              src={image.src}
              alt={image.alt}
              width={1400}
              height={1050}
              loading="eager"
              decoding="async"
            />
          </figure>
        )}
      </div>
    </div>
  );
}
