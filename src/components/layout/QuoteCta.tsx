import type { ReactNode } from 'react';
import { paths } from '../../lib/routes';
import { ButtonLink } from '../ui/Button';
import styles from './QuoteCta.module.css';

/** Closing call to action shared by the homepage and content pages. */
export function QuoteCta({
  title = (
    <>
      Tell us what your operation <em>needs.</em>
    </>
  ),
}: {
  title?: ReactNode;
}) {
  return (
    <section className={styles.cta} aria-labelledby="quote-cta-title">
      <div className={styles.glow} aria-hidden="true" />
      <svg className={styles.art} viewBox="0 0 120 300" aria-hidden="true">
        <circle cx="68" cy="14" r="6" />
        <circle cx="50" cy="38" r="4" />
        <circle cx="66" cy="58" r="10" />
        <path d="M24 92h72M36 92v150a24 24 0 0 0 48 0V92" />
        <path className={styles.liquid} d="M36 180h48v62a24 24 0 0 1-48 0z" />
      </svg>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Request a quotation</p>
        <h2 id="quote-cta-title" className={`display ${styles.title}`}>
          {title}
        </h2>
        <p className={styles.lead}>
          Share the product, grade, quantity and delivery location. The Biotonic team will review
          your requirements and respond with a quotation.
        </p>
        <div className={styles.actions}>
          <ButtonLink to={paths.quote} variant="inverse" size="lg" icon="arrowRight">
            Request a Quote
          </ButtonLink>
          <ButtonLink to={paths.contact} variant="inverse-outline" size="lg">
            Contact Biotonic
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
