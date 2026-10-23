import { Monogram } from '../components/brand/Monogram';
import { PageHeader } from '../components/layout/PageHeader';
import { QuoteCta } from '../components/layout/QuoteCta';
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

  // `show` returns confirmed content, or demo content in draft builds; nothing otherwise.
  const name = show(founder.name) ?? 'Our founder';
  const title = show(founder.title);
  const portrait = show(founder.portrait);
  const biography = show(founder.biography);
  const philosophy = show(founder.philosophy);
  const vision = show(founder.vision);
  const experience = show(founder.experience);
  const achievements = show(founder.achievements);
  const links = show(founder.links);

  return (
    <>
      <PageHeader
        eyebrow="Leadership"
        title={
          <>
            The person behind <em>Biotonic.</em>
          </>
        }
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
                  <Monogram name={name} size="lg" />
                )}
              </div>
            </div>

            <div className={styles.prose}>
              <div>
                <h2 id="founder-name" className={`display ${styles.profileName}`}>
                  {name}
                </h2>
                {title && <p className={styles.meta}>{title}</p>}
              </div>

              {biography?.map((p) => (
                <p key={p}>{p}</p>
              ))}

              {philosophy && (
                <blockquote className={styles.statement}>
                  <p className={styles.statementLabel}>Leadership philosophy</p>
                  <p className={styles.statementText}>{philosophy}</p>
                </blockquote>
              )}

              {vision && (
                <>
                  <h2>Vision for Biotonic</h2>
                  <p>{vision}</p>
                </>
              )}

              {experience && (
                <>
                  <h2>Experience</h2>
                  <ul className={styles.list}>
                    {experience.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </>
              )}

              {achievements && (
                <>
                  <h2>Achievements</h2>
                  <ul className={styles.list}>
                    {achievements.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </>
              )}

              {links && (
                <p>
                  {links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label}
                      <span className="visually-hidden"> — {name} (opens in a new tab)</span>
                    </a>
                  ))}
                </p>
              )}
            </div>
          </section>
        </Container>
      </div>

      <QuoteCta />
    </>
  );
}
