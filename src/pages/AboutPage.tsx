import { PageHeader } from '../components/layout/PageHeader';
import { QuoteCta } from '../components/layout/QuoteCta';
import { ButtonLink } from '../components/ui/Button';
import { Container } from '../components/ui/Layout';
import { company } from '../content/company';
import { show } from '../content/pending';
import { site } from '../content/site';
import { isPublished } from '../lib/publication';
import { paths } from '../lib/routes';
import { getPageMeta } from '../lib/seo';
import styles from './ContentPage.module.css';

export function AboutPage() {
  const meta = getPageMeta(paths.about);
  // `show` returns confirmed content, or demo content in draft builds; nothing otherwise.
  const history = show(company.history);
  const established = show(site.established);
  const mission = show(company.mission);
  const vision = show(company.vision);
  const capabilities = show(company.capabilities);
  const approach = show(company.customerApproach);

  return (
    <>
      <PageHeader
        eyebrow="About Biotonic"
        title={
          <>
            Chemistry you can trust, <em>at first glance.</em>
          </>
        }
        lead={company.introduction}
        breadcrumbs={meta.breadcrumbs}
      />

      <div className={styles.body}>
        <Container>
          {history && (
            <section className={`${styles.block} ${styles.split}`} aria-labelledby="story">
              <h2 id="story" className={`display ${styles.splitTitle}`}>
                Our story
              </h2>
              <div className={styles.prose}>
                {history.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {established && <p className={styles.meta}>Established {established}.</p>}
              </div>
            </section>
          )}

          {(mission || vision) && (
            <section className={`${styles.block} ${styles.split}`} aria-labelledby="purpose">
              <h2 id="purpose" className={`display ${styles.splitTitle}`}>
                Mission &amp; vision
              </h2>
              <div className={styles.prose}>
                {mission && (
                  <div className={styles.statement}>
                    <p className={styles.statementLabel}>Mission</p>
                    <p className={styles.statementText}>{mission}</p>
                  </div>
                )}
                {vision && (
                  <div className={styles.statement}>
                    <p className={styles.statementLabel}>Vision</p>
                    <p className={styles.statementText}>{vision}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className={styles.block} aria-labelledby="principles">
            <div className={styles.split}>
              <h2 id="principles" className={`display ${styles.splitTitle}`}>
                The principles behind the name
              </h2>
              <p className={styles.prose}>
                Biotonic’s identity was designed around one idea: in business-to-business supply,
                the first impression is often the first proof of reliability.
              </p>
            </div>
            <ul className={`${styles.cards} ${styles.cards3} ${styles.cardsSpaced}`}>
              {company.principles.map((p, i) => (
                <li key={p.title} className={styles.card}>
                  <span className={styles.cardIndex}>{String(i + 1).padStart(2, '0')}</span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </li>
              ))}
            </ul>
          </section>

          {capabilities && (
            <section className={`${styles.block} ${styles.split}`} aria-labelledby="capabilities">
              <h2 id="capabilities" className={`display ${styles.splitTitle}`}>
                Capabilities
              </h2>
              <ul className={styles.cards}>
                {capabilities.map((c) => (
                  <li key={c.title} className={styles.card}>
                    <h3>{c.title}</h3>
                    <p>{c.body}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {approach && (
            <section className={`${styles.block} ${styles.split}`} aria-labelledby="approach">
              <h2 id="approach" className={`display ${styles.splitTitle}`}>
                Working with customers
              </h2>
              <div className={styles.prose}>
                <p>{approach}</p>
                <p>
                  <ButtonLink to={paths.quote} icon="arrowRight">
                    Start a quotation request
                  </ButtonLink>
                </p>
              </div>
            </section>
          )}

          {isPublished('leadership') && (
            <section
              className={`${styles.block} ${styles.split}`}
              aria-labelledby="leadership-link"
            >
              <h2 id="leadership-link" className={`display ${styles.splitTitle}`}>
                Leadership
              </h2>
              <div className={styles.prose}>
                <p>Meet the founder behind Biotonic and the vision guiding the company.</p>
                <p>
                  <ButtonLink to={paths.leadership} variant="secondary" icon="arrowRight">
                    Meet our founder
                  </ButtonLink>
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
