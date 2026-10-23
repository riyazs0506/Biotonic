import { Link } from 'react-router';
import { PageHeader } from '../components/layout/PageHeader';
import { QuoteCta } from '../components/layout/QuoteCta';
import { Container } from '../components/ui/Layout';
import { show } from '../content/pending';
import { quality } from '../content/quality';
import { catalogue } from '../lib/catalog';
import { isPublished } from '../lib/publication';
import { paths } from '../lib/routes';
import { getPageMeta } from '../lib/seo';
import { NotFoundPage } from './NotFoundPage';
import styles from './ContentPage.module.css';

export function QualityPage() {
  const meta = getPageMeta(paths.quality);
  if (!meta.found) return <NotFoundPage />;

  // `show` returns confirmed content, or demo content in draft builds; nothing otherwise.
  const process = show(quality.process);
  const certifications = show(quality.certifications);
  const documentation = show(quality.documentation);
  const applications = Array.from(new Set(catalogue.products.flatMap((p) => p.applications)));

  return (
    <>
      <PageHeader
        eyebrow="Quality & applications"
        title={
          <>
            Quality, made <em>clear.</em>
          </>
        }
        lead={show(quality.overview)}
        breadcrumbs={meta.breadcrumbs}
      />

      <div className={styles.body}>
        <Container>
          {process && (
            <section className={`${styles.block} ${styles.split}`} aria-labelledby="process">
              <h2 id="process" className={`display ${styles.splitTitle}`}>
                Our quality process
              </h2>
              <ol className={styles.cards}>
                {process.map((step, i) => (
                  <li key={step.title} className={styles.card}>
                    <span className={styles.cardIndex}>{String(i + 1).padStart(2, '0')}</span>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {certifications && (
            <section className={`${styles.block} ${styles.split}`} aria-labelledby="certifications">
              <h2 id="certifications" className={`display ${styles.splitTitle}`}>
                Certifications &amp; approvals
              </h2>
              <ul className={styles.cards}>
                {certifications.map((c) => (
                  <li key={c.name} className={styles.card}>
                    <h3>{c.name}</h3>
                    <p>Issued by {c.issuer}</p>
                    {c.reference && <p className={styles.meta}>Ref. {c.reference}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {documentation && (
            <section className={`${styles.block} ${styles.split}`} aria-labelledby="documentation">
              <h2 id="documentation" className={`display ${styles.splitTitle}`}>
                Documentation
              </h2>
              <div className={styles.prose}>
                <ul className={styles.list}>
                  {documentation.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                {isPublished('resources') && (
                  <p>
                    Browse documents in our <Link to={paths.resources}>technical resources</Link>.
                  </p>
                )}
              </div>
            </section>
          )}

          {applications.length > 0 && (
            <section className={`${styles.block} ${styles.split}`} aria-labelledby="applications">
              <h2 id="applications" className={`display ${styles.splitTitle}`}>
                Applications
              </h2>
              <div className={styles.prose}>
                <p>Applications across the current catalogue:</p>
                <ul className={styles.list}>
                  {applications.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
                <p>
                  <Link to={paths.products}>Explore the product catalogue</Link>
                </p>
              </div>
            </section>
          )}
        </Container>
      </div>

      <QuoteCta />
    </>
  );
}
