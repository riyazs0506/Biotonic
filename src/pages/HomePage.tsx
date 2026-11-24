import { Monogram } from '../components/brand/Monogram';
import { Hero } from '../components/hero/Hero';
import { QuoteCta } from '../components/layout/QuoteCta';
import { ProductCard } from '../components/products/ProductCard';
import {
  AudienceCards,
  AwardList,
  PrincipalStrip,
  StatGrid,
} from '../components/sections/StrategyBlocks';
import { ButtonLink } from '../components/ui/Button';
import { Section } from '../components/ui/Layout';
import { company } from '../content/company';
import { industries } from '../content/industries';
import { founder } from '../content/leadership';
import { featuredProducts } from '../lib/catalog';
import { isPublished } from '../lib/publication';
import { paths } from '../lib/routes';
import styles from './HomePage.module.css';

export function HomePage() {
  const featured = featuredProducts();

  return (
    <>
      <Hero />

      {featured.length > 0 && (
        <Section
          id="featured"
          tone="sunken"
          eyebrow="Featured products"
          title="Selected from the catalogue"
        >
          <ul className={`${styles.productGrid} swipe-row`}>
            {featured.map((product) => (
              <li key={product.slug}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <section className={styles.intro} aria-labelledby="intro-title">
        <div className={styles.introInner}>
          <div>
            <p className={styles.introEyebrow}>About Biotonic</p>
            <h2 id="intro-title" className={`display ${styles.introTitle}`}>
              A chemical partner built on a <em>legacy.</em>
            </h2>
          </div>
          <div className={styles.introBody}>
            {company.history.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <ButtonLink to={paths.about} variant="secondary" icon="arrowRight">
              Our story
            </ButtonLink>
          </div>
        </div>
        <div className={styles.glance}>
          <StatGrid stats={company.atAGlance} />
        </div>
        <div className={styles.principalRow}>
          <PrincipalStrip />
        </div>
      </section>

      <Section
        id="why-biotonic"
        tone="sunken"
        eyebrow="Why Biotonic"
        title={
          <>
            Genuine brands. Expert advice. A decision-maker <em>on call.</em>
          </>
        }
        intro={company.valueProposition}
      >
        <ol className={styles.usps}>
          {company.usps.map((usp, i) => (
            <li key={usp.title}>
              <span className={styles.principleIndex}>{String(i + 1).padStart(2, '0')}</span>
              <h3>{usp.title}</h3>
              <p>{usp.body}</p>
            </li>
          ))}
        </ol>
        <p className={styles.priceNote}>
          <strong>{company.pricePositioning.title}.</strong> {company.pricePositioning.body}
        </p>
      </Section>

      <Section
        id="who-we-serve"
        eyebrow="Who we serve"
        title={
          <>
            One partner for every side of the <em>deal.</em>
          </>
        }
        intro="Buyers get the right chemical, dealers get genuine brands to grow with, and principals get a channel partner that sells."
      >
        <AudienceCards />
      </Section>

      <section className={styles.founderBand} aria-labelledby="founder-title">
        <div className={styles.founderInner}>
          <div className={styles.founderLead}>
            <p className={styles.founderEyebrow}>Founder</p>
            <div className={styles.founderCard}>
              <Monogram name={founder.name} />
              <div>
                <h2 id="founder-title" className={`display ${styles.founderName}`}>
                  {founder.name}
                </h2>
                <p className={styles.founderRole}>Industrial expert &amp; deal maker</p>
              </div>
            </div>
            <blockquote className={`display ${styles.founderQuote}`}>
              <p>{founder.statement}</p>
            </blockquote>
            <p className={styles.founderStory}>{founder.storyAngle}</p>
            {isPublished('leadership') && (
              <ButtonLink
                to={paths.leadership}
                variant="inverse-outline"
                icon="arrowRight"
                className={styles.founderCta}
              >
                From the godown floor to founder
              </ButtonLink>
            )}
          </div>
          <div className={styles.founderProof}>
            <p className={styles.founderEyebrow}>Proof that he delivers</p>
            <AwardList awards={founder.awards} tone="ink" />
          </div>
        </div>
      </section>

      <Section
        id="industries"
        tone="sunken"
        eyebrow="Markets"
        title="Where our chemistry works"
        intro="Three markets across the Tiruppur, Erode and Coimbatore belt — every garment, building and factory in the region runs on chemistry."
        action={
          isPublished('industries') && (
            <ButtonLink to={paths.industries} variant="ghost" icon="arrowRight">
              Markets &amp; partners
            </ButtonLink>
          )
        }
      >
        <ul className={styles.markets}>
          {industries.map((industry, i) => (
            <li key={industry.slug}>
              <span className={styles.principleIndex}>{String(i + 1).padStart(2, '0')}</span>
              <h3>{industry.name}</h3>
              <p className={styles.marketBuyers}>{industry.buyers}</p>
              <p>{industry.summary}</p>
            </li>
          ))}
        </ul>
      </Section>

      <QuoteCta />
    </>
  );
}
