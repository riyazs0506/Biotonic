import { Link } from 'react-router';
import { PageHeader } from '../components/layout/PageHeader';
import { QuoteCta } from '../components/layout/QuoteCta';
import { Container } from '../components/ui/Layout';
import { industries } from '../content/industries';
import { show } from '../content/pending';
import { getProduct } from '../lib/catalog';
import { paths } from '../lib/routes';
import { getPageMeta } from '../lib/seo';
import { NotFoundPage } from './NotFoundPage';
import styles from './ContentPage.module.css';

export function IndustriesPage() {
  const meta = getPageMeta(paths.industries);
  if (!meta.found) return <NotFoundPage />;

  const list = show(industries) ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Industries & solutions"
        title={
          <>
            Chemistry for the way <em>you work.</em>
          </>
        }
        lead="The industries Biotonic supplies, and the products most relevant to each."
        breadcrumbs={meta.breadcrumbs}
      />

      <div className={styles.body}>
        <Container>
          <ul className={`${styles.cards} ${styles.cards3}`}>
            {list.map((industry, i) => {
              const products = industry.productSlugs
                .map((slug) => getProduct(slug))
                .filter((p) => p !== undefined);
              return (
                <li key={industry.slug} id={industry.slug} className={styles.card}>
                  <span className={styles.cardIndex}>{String(i + 1).padStart(2, '0')}</span>
                  <h2 className={styles.cardTitle}>{industry.name}</h2>
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
        </Container>
      </div>

      <QuoteCta />
    </>
  );
}
