import type { ReactNode } from 'react';
import { imagery } from '../../content/imagery';
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
      <img
        className={styles.photo}
        src={imagery.quoteCta.src}
        alt=""
        width={1200}
        height={1100}
        loading="lazy"
        decoding="async"
      />
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
