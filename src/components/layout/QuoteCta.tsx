import type { ReactNode } from 'react';
import { paths } from '../../lib/routes';
import { whatsappHref } from '../../lib/whatsapp';
import { ButtonLink } from '../ui/Button';
import { Icon } from '../ui/Icon';
import styles from './QuoteCta.module.css';

/** Closing call to action shared by the homepage and content pages. */
export function QuoteCta({
  title = (
    <>
      The right chemistry. <em>The right deal.</em>
    </>
  ),
}: {
  title?: ReactNode;
}) {
  const whatsapp = whatsappHref();
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
          Share the product, quantity and delivery location — or the problem you are solving. A
          decision-maker will come back to you with the right chemical, the right brand and a clear
          quote.
        </p>
        <div className={styles.actions}>
          <ButtonLink to={paths.quote} variant="inverse" size="lg" icon="arrowRight">
            Request a Quote
          </ButtonLink>
          {whatsapp ? (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsapp}
            >
              <Icon name="chat" size={18} />
              Quick quote on WhatsApp
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          ) : (
            <ButtonLink to={paths.contact} variant="inverse-outline" size="lg">
              Contact Biotonic
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  );
}
