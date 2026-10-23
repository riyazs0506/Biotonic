import { paths } from '../../lib/routes';
import { ButtonLink } from '../ui/Button';
import { LivingReaction } from './LivingReaction';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            Precision <span aria-hidden="true">·</span> Chemistry <span aria-hidden="true">·</span>{' '}
            Partnership
          </p>
          <h1 id="hero-title" className={`display ${styles.title}`}>
            Chemistry You Can <em>Trust.</em>
          </h1>
          <p className={styles.lead}>
            Biotonic supplies chemical products to businesses. Tell us the product, grade and
            quantity your operation needs — we will respond with clear product information and a
            quotation.
          </p>
          <div className={styles.ctas}>
            <ButtonLink to={paths.products} size="lg" icon="arrowRight">
              Explore Products
            </ButtonLink>
            <ButtonLink to={paths.quote} size="lg" variant="secondary">
              Discuss Your Requirements
            </ButtonLink>
          </div>
          <dl className={styles.detail}>
            <div>
              <dt>Supply</dt>
              <dd>Chemical products for business</dd>
            </div>
            <div>
              <dt>Enquiries</dt>
              <dd>Answered by the Biotonic team</dd>
            </div>
          </dl>
        </div>
        <div className={styles.visual}>
          <LivingReaction />
        </div>
      </div>
    </section>
  );
}
