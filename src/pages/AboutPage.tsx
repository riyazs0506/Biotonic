import { Monogram } from '../components/brand/Monogram';
import { PageHeader } from '../components/layout/PageHeader';
import { imagery } from '../content/imagery';
import { QuoteCta } from '../components/layout/QuoteCta';
import {
  AwardList,
  FounderTimeline,
  JourneySteps,
  PrincipalStrip,
  StatGrid,
} from '../components/sections/StrategyBlocks';
import { Container } from '../components/ui/Layout';
import { company } from '../content/company';
import { founder } from '../content/leadership';
import { show } from '../content/pending';
import { isPublished } from '../lib/publication';
import { paths } from '../lib/routes';
import { getPageMeta } from '../lib/seo';
import styles from './ContentPage.module.css';

export function AboutPage() {
  const meta = getPageMeta(paths.about);

  const portrait = show(founder.portrait);
  const links = show(founder.links);
  const showFounder = isPublished('leadership');

  return (
    <>
      {/* =========================================
          01. ABOUT HERO
      ========================================= */}

      <PageHeader
        eyebrow="About Biotonic"
        title={
          <>
            A chemical partner built on a <em>legacy.</em>
          </>
        }
        lead={company.introduction}
        breadcrumbs={meta.breadcrumbs}
        image={imagery.about}
      />

      <div className={styles.body}>
        <Container>
          {/* =========================================
              02. FOUNDER PROFILE
              Founder comes first in company profile
          ========================================= */}

          {showFounder && (
            <>
              <section
                className={`${styles.block} ${styles.split}`}
                aria-labelledby="founder-profile"
              >
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
                  <p className={styles.statementLabel}>Founder &amp; Leadership</p>

                  <h2 id="founder-profile" className={`display ${styles.profileName}`}>
                    {founder.name}
                  </h2>

                  <p className={styles.meta}>
                    {founder.title} · Industrial Expert &amp; Deal Maker
                  </p>

                  <blockquote className={styles.statement}>
                    <p className={styles.statementLabel}>In one line</p>

                    <p className={styles.statementText}>{founder.statement}</p>
                  </blockquote>

                  <p>{founder.storyAngle}</p>

                  {links && (
                    <p>
                      {links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.label}
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

              {/* =========================================
                  03. FOUNDER BIOGRAPHY
              ========================================= */}

              <section
                className={`${styles.block} ${styles.split}`}
                aria-labelledby="founder-story"
              >
                <h2 id="founder-story" className={`display ${styles.splitTitle}`}>
                  The story behind the founder
                </h2>

                <div className={styles.prose}>
                  {founder.biography.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}

                  <div className={styles.statement}>
                    <p className={styles.statementLabel}>Education</p>

                    <p className={styles.statementText}>{founder.education.degree}</p>

                    <p>{founder.education.college}</p>

                    <p>{founder.education.school}</p>
                  </div>
                </div>
              </section>

              {/* =========================================
                  04. FOUNDER JOURNEY
              ========================================= */}

              <section className={styles.block} aria-labelledby="founder-journey">
                <h2
                  id="founder-journey"
                  className={`display ${styles.splitTitle} ${styles.formTitle}`}
                >
                  The founder journey
                </h2>

                <FounderTimeline steps={founder.timeline} />
              </section>

              {/* =========================================
                  05. INDUSTRIAL EXPERT & DEAL MAKER
              ========================================= */}

              <section className={styles.block} aria-labelledby="expert-deal-maker">
                <h2
                  id="expert-deal-maker"
                  className={`display ${styles.splitTitle} ${styles.formTitle}`}
                >
                  The industrial expert &amp; deal maker
                </h2>

                <ul className={styles.twoCol}>
                  {founder.roles.map((role, index) => (
                    <li key={role.title} className={styles.card}>
                      <span className={styles.cardIndex}>{String(index + 1).padStart(2, '0')}</span>

                      <h3>{role.title}</h3>

                      <p>{role.body}</p>

                      <ul className={styles.proofList} aria-label={`Proof: ${role.title}`}>
                        {role.proof.map((proof) => (
                          <li key={proof}>{proof}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </section>

              {/* =========================================
                  06. AWARDS & RECOGNITION
              ========================================= */}

              <section className={styles.block} aria-labelledby="recognition">
                <h2 id="recognition" className={`display ${styles.splitTitle} ${styles.formTitle}`}>
                  Awards &amp; recognition
                </h2>

                <AwardList awards={founder.awards} />
              </section>

              {/* =========================================
                  07. FOUNDER'S VISION
              ========================================= */}

              <section
                className={`${styles.block} ${styles.split}`}
                aria-labelledby="founder-vision"
              >
                <h2 id="founder-vision" className={`display ${styles.splitTitle}`}>
                  Vision for Biotonic
                </h2>

                <div className={styles.prose}>
                  <p className={styles.statementText}>{founder.vision}</p>
                </div>
              </section>
            </>
          )}

          {/* =========================================
              08. COMPANY POSITIONING & STATISTICS
          ========================================= */}

          <section className={styles.block} aria-labelledby="positioning">
            <h2 id="positioning" className="visually-hidden">
              Our positioning
            </h2>

            <p className={`display ${styles.positioning}`}>{company.positioning}</p>

            <div className={styles.glance}>
              <StatGrid stats={company.atAGlance} />
            </div>
          </section>

          {/* =========================================
              09. OUR COMPANY STORY
          ========================================= */}

          <section className={`${styles.block} ${styles.split}`} aria-labelledby="company-story">
            <h2 id="company-story" className={`display ${styles.splitTitle}`}>
              Our story
            </h2>

            <div className={styles.prose}>
              {company.history.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}

              <PrincipalStrip />
            </div>
          </section>

          {/* =========================================
              10. COMPANY MISSION & VISION
          ========================================= */}

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

          {/* =========================================
              11. COMPANY VALUES
          ========================================= */}

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
              {company.values.map((value, index) => (
                <li key={value.title} className={styles.card}>
                  <span className={styles.cardIndex}>{String(index + 1).padStart(2, '0')}</span>

                  <h3>{value.title}</h3>

                  <p>{value.body}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* =========================================
              12. WORKING WITH BIOTONIC
          ========================================= */}

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

          {/* =========================================
              13. THE IDEA BEHIND THE NAME
          ========================================= */}

          <section className={`${styles.block} ${styles.split}`} aria-labelledby="the-name">
            <h2 id="the-name" className={`display ${styles.splitTitle}`}>
              The idea behind the name
            </h2>

            <div className={styles.prose}>
              <p>{company.nameStory}</p>

              <p className={styles.brandIdea}>{company.brandIdea}</p>
            </div>
          </section>
        </Container>
      </div>

      {/* =========================================
          14. FINAL QUOTE CTA
      ========================================= */}

      <QuoteCta />
    </>
  );
}
