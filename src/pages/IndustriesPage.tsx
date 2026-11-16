import { Link } from 'react-router';
import { PageHeader } from '../components/layout/PageHeader';
import { QuoteCta } from '../components/layout/QuoteCta';
import { AudienceCards, StatGrid } from '../components/sections/StrategyBlocks';
import { Container } from '../components/ui/Layout';
import { geography, industries, marketContext } from '../content/industries';
import { getProduct } from '../lib/catalog';
import { paths } from '../lib/routes';
import { getPageMeta } from '../lib/seo';
import { NotFoundPage } from './NotFoundPage';
import styles from './ContentPage.module.css';

export function IndustriesPage() {
  const meta = getPageMeta(paths.industries);
  if (!meta.found) return <NotFoundPage />;

  return (
    <>
      <PageHeader
        eyebrow="Markets & partners"
        title={
          <>
            Chemistry for the way <em>you work.</em>
          </>
        }
        lead={`Textile, construction and industrial chemicals for businesses across the ${geography.current} — expanding across ${geography.next}.`}
        breadcrumbs={meta.breadcrumbs}
      />

      <div className={styles.body}>
        <Container>
          <section aria-labelledby="markets">
            <h2 id="markets" className="visually-hidden">
              Markets we serve
            </h2>
            <ul className={`${styles.cards} ${styles.cards3}`}>
              {industries.map((industry, i) => {
                const products = industry.productSlugs
                  .map((slug) => getProduct(slug))
                  .filter((p) => p !== undefined);
                return (
                  <li key={industry.slug} id={industry.slug} className={styles.card}>
                    <span className={styles.cardIndex}>{String(i + 1).padStart(2, '0')}</span>
                    <h3 className={styles.cardTitle}>{industry.name}</h3>
                    <p className={styles.meta}>{industry.buyers}</p>
                    <p>{industry.summary}</p>
                    {products.length > 0 && (
                      <ul className={styles.list}>
                        {products.map((p) => (
                          <li key={p.slug}>
                            <Link to={paths.product(p.slug)}>{p.name}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className={styles.inkPanel} aria-labelledby="market-context">
            <h2 id="market-context" className={`display ${styles.splitTitle} ${styles.formTitle}`}>
              The market Biotonic serves
            </h2>
            <StatGrid stats={marketContext.stats} tone="ink" />
            <p className={styles.inkInsight}>{marketContext.insight}</p>
            <p className={styles.sources}>{marketContext.sources}</p>
          </section>

          <section className={styles.spaced} aria-labelledby="partners">
            <div className={styles.split}>
              <h2 id="partners" className={`display ${styles.splitTitle}`}>
                Buyers, dealers and principals
              </h2>
              <p className={styles.prose}>
                Biotonic works with every side of the deal. Dealers get genuine principal brands,
                training and a direct line to the founder; principals get a channel partner with
                proven sell-through across the region.
              </p>
            </div>
            <div className={styles.cardsSpaced}>
              <AudienceCards />
            </div>
          </section>
        </Container>
      </div>

      <QuoteCta />
    </>
  );
}
