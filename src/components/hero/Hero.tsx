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
            The right chemical, the right brand and the right advice — delivered on time. Biotonic
            brings genuine products from India’s leading principals to the businesses that build,
            dye and make.
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
              <dt>Since 2024</dt>
              <dd>On a 20+ year legacy</dd>
            </div>
            <div>
              <dt>Principal brands</dt>
              <dd>Zydex · Pidilite · India Glycols</dd>
            </div>
            <div>
              <dt>Serving</dt>
              <dd>Tiruppur · Erode · Coimbatore</dd>
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
