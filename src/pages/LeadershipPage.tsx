import { Monogram } from '../components/brand/Monogram';
import { PageHeader } from '../components/layout/PageHeader';
import { QuoteCta } from '../components/layout/QuoteCta';
import { AwardList, FounderTimeline } from '../components/sections/StrategyBlocks';
import { Container } from '../components/ui/Layout';
import { founder } from '../content/leadership';
import { show } from '../content/pending';
import { paths } from '../lib/routes';
import { getPageMeta } from '../lib/seo';
import { NotFoundPage } from './NotFoundPage';
import styles from './ContentPage.module.css';

export function LeadershipPage() {
  const meta = getPageMeta(paths.leadership);
  if (!meta.found) return <NotFoundPage />;

  // Portrait and profile links are still to be supplied; everything else is confirmed.
  const portrait = show(founder.portrait);
  const links = show(founder.links);

  return (
    <>
      <PageHeader
        eyebrow="Founder"
        title={
          <>
            From the godown floor <em>to founder.</em>
          </>
        }
        lead={founder.storyAngle}
        breadcrumbs={meta.breadcrumbs}
      />

      <div className={styles.body}>
        <Container>
          <section className={styles.split} aria-labelledby="founder-name">
            <div>
              <div className={styles.portrait}>
                {portrait ? (
                  <img
                    src={portrait.src}
                    alt={portrait.alt}
                    width={portrait.width}
                    height={portrait.height}
                    loading="eager"
                  />
                ) : (
                  <Monogram name={founder.name} size="lg" />
                )}
              </div>
            </div>

            <div className={styles.prose}>
              <div>
                <h2 id="founder-name" className={`display ${styles.profileName}`}>
                  {founder.name}
                </h2>
                <p className={styles.meta}>{founder.title} · Industrial expert &amp; deal maker</p>
              </div>

              <blockquote className={styles.statement}>
                <p className={styles.statementLabel}>In one line</p>
                <p className={styles.statementText}>{founder.statement}</p>
              </blockquote>

              {founder.biography.map((p) => (
                <p key={p}>{p}</p>
              ))}

              {links && (
                <p>
                  {links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label}
                      <span className="visually-hidden">
                        {' '}
                        — {founder.name} (opens in a new tab)
                      </span>
                    </a>
                  ))}
                </p>
              )}
            </div>
          </section>

          <section className={styles.block} aria-labelledby="journey">
            <h2 id="journey" className={`display ${styles.splitTitle} ${styles.formTitle}`}>
              The founder story
            </h2>
            <FounderTimeline steps={founder.timeline} />
          </section>

          <section className={styles.block} aria-labelledby="expert-deal-maker">
            <h2
              id="expert-deal-maker"
              className={`display ${styles.splitTitle} ${styles.formTitle}`}
            >
              The industrial expert &amp; deal maker
            </h2>
            <ul className={`${styles.twoCol}`}>
              {founder.roles.map((role, i) => (
                <li key={role.title} className={styles.card}>
                  <span className={styles.cardIndex}>{String(i + 1).padStart(2, '0')}</span>
                  <h3>{role.title}</h3>
                  <p>{role.body}</p>
                  <ul className={styles.proofList} aria-label={`Proof: ${role.title}`}>
                    {role.proof.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.block} aria-labelledby="recognition">
            <h2 id="recognition" className={`display ${styles.splitTitle} ${styles.formTitle}`}>
              Proof that he delivers
            </h2>
            <AwardList awards={founder.awards} />
          </section>

          <section className={`${styles.block} ${styles.split}`} aria-labelledby="vision">
            <h2 id="vision" className={`display ${styles.splitTitle}`}>
              Vision for Biotonic
            </h2>
            <div className={styles.prose}>
              <p className={styles.statementText}>{founder.vision}</p>
            </div>
          </section>
        </Container>
      </div>

      <QuoteCta />
    </>
  );
}
