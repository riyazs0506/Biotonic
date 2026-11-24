import { paths } from '../../lib/routes';
import { ButtonLink } from '../ui/Button';
import { HeroVisual } from './HeroVisual';
import styles from './Hero.module.css';

/**
 * B2B hero: the promise, two clear next steps (quote or catalogue) and the molecule viewer,
 * which tours the chemistry of each market Biotonic serves.
 */
export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            B2B chemical distribution <span aria-hidden="true">·</span> Tiruppur
          </p>
          <h1 id="hero-title" className={`display ${styles.title}`}>
            Chemistry You Can <em>Trust.</em>
          </h1>
          <p className={styles.lead}>
            Genuine textile, construction and industrial chemicals from Zydex, Pidilite and India
            Glycols — with the advice to use them right.
          </p>
          <div className={styles.actions}>
            <ButtonLink to={paths.quote} icon="arrowRight">
              Request a quote
            </ButtonLink>
            <ButtonLink to={paths.products} variant="secondary">
              Explore products
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
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
