import { PageHeader } from '../components/layout/PageHeader';
import { QuoteCta } from '../components/layout/QuoteCta';
import { JourneySteps, PrincipalStrip, StatGrid } from '../components/sections/StrategyBlocks';
import { ButtonLink } from '../components/ui/Button';
import { Container } from '../components/ui/Layout';
import { company } from '../content/company';
import { founder } from '../content/leadership';
import { isPublished } from '../lib/publication';
import { paths } from '../lib/routes';
import { getPageMeta } from '../lib/seo';
import styles from './ContentPage.module.css';

export function AboutPage() {
  const meta = getPageMeta(paths.about);

  return (
    <>
      <PageHeader
        eyebrow="About Biotonic"
        title={
          <>
            A chemical partner built on a <em>legacy.</em>
          </>
        }
        lead={company.introduction}
        breadcrumbs={meta.breadcrumbs}
      />

      <div className={styles.body}>
        <Container>
          <section className={styles.block} aria-labelledby="positioning">
            <h2 id="positioning" className="visually-hidden">
              Our positioning
            </h2>
            <p className={`display ${styles.positioning}`}>{company.positioning}</p>
            <div className={styles.glance}>
              <StatGrid stats={company.atAGlance} />
            </div>
          </section>

          <section className={`${styles.block} ${styles.split}`} aria-labelledby="story">
            <h2 id="story" className={`display ${styles.splitTitle}`}>
              Our story
            </h2>
            <div className={styles.prose}>
              {company.history.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <PrincipalStrip />
            </div>
          </section>

          <section className={`${styles.block} ${styles.split}`} aria-labelledby="purpose">
            <h2 id="purpose" className={`display ${styles.splitTitle}`}>
              Mission &amp; vision
            </h2>
            <div className={styles.prose}>
              <div className={styles.statement}>
                <p className={styles.statementLabel}>Mission</p>
                <p className={styles.statementText}>{company.mission}</p>
              </div>
              <div className={styles.statement}>
                <p className={styles.statementLabel}>Vision</p>
                <p className={styles.statementText}>{company.vision}</p>
              </div>
            </div>
          </section>

          <section className={styles.block} aria-labelledby="values">
            <div className={styles.split}>
              <h2 id="values" className={`display ${styles.splitTitle}`}>
                Expert · Dependable · Decisive
              </h2>
              <p className={styles.prose}>
                How we want every buyer, dealer and principal to know us: the chemistry partner with
                answers, and the people who get the deal done.
              </p>
            </div>
            <ul className={`${styles.cards} ${styles.cards3} ${styles.cardsSpaced}`}>
              {company.values.map((value, i) => (
                <li key={value.title} className={styles.card}>
                  <span className={styles.cardIndex}>{String(i + 1).padStart(2, '0')}</span>
                  <h3>{value.title}</h3>
                  <p>{value.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.block} aria-labelledby="working-with-us">
            <div className={styles.split}>
              <h2 id="working-with-us" className={`display ${styles.splitTitle}`}>
                Working with Biotonic
              </h2>
              <div className={styles.prose}>
                <p>
                  <strong>{company.pricePositioning.title}.</strong> {company.pricePositioning.body}
                </p>
              </div>
            </div>
            <div className={styles.cardsSpaced}>
              <JourneySteps steps={company.journey} />
            </div>
          </section>

          <section className={`${styles.block} ${styles.split}`} aria-labelledby="the-name">
            <h2 id="the-name" className={`display ${styles.splitTitle}`}>
              The idea behind the name
            </h2>
            <div className={styles.prose}>
              <p>{company.nameStory}</p>
              <p className={styles.brandIdea}>{company.brandIdea}</p>
            </div>
          </section>

          {isPublished('leadership') && (
            <section
              className={`${styles.block} ${styles.split}`}
              aria-labelledby="leadership-link"
            >
              <h2 id="leadership-link" className={`display ${styles.splitTitle}`}>
                Led by {founder.name}
              </h2>
              <div className={styles.prose}>
                <p>{founder.storyAngle}</p>
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
