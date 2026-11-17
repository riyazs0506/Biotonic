
import { Monogram } from '../components/brand/Monogram';
import { PageHeader } from '../components/layout/PageHeader';
import { QuoteCta } from '../components/layout/QuoteCta';
import {
  AwardList,
  FounderTimeline,
  JourneySteps,
  PrincipalStrip,
  StatGrid,
} from '../components/sections/StrategyBlocks';
import { ButtonLink } from '../components/ui/Button';
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

  // Founder profile assets
  const portrait = show(founder.portrait);
  const links = show(founder.links);

  return (
    <>
      {/* =========================================
          01. ABOUT HERO SECTION
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
      />

      <div className={styles.body}>
        <Container>

          {/* =========================================
              02. COMPANY POSITIONING & STATISTICS
          ========================================= */}

          <section
            className={styles.block}
            aria-labelledby="positioning"
          >
            <h2 id="positioning" className="visually-hidden">
              Our positioning
            </h2>

            <p className={`display ${styles.positioning}`}>
              {company.positioning}
            </p>

            <div className={styles.glance}>
              <StatGrid stats={company.atAGlance} />
            </div>
          </section>


          {/* =========================================
              03. OUR STORY
          ========================================= */}

          <section
            className={`${styles.block} ${styles.split}`}
            aria-labelledby="story"
          >
            <h2
              id="story"
              className={`display ${styles.splitTitle}`}
            >
              Our story
            </h2>

            <div className={styles.prose}>
              {company.history.map((p) => (
                <p key={p}>{p}</p>
              ))}

              <PrincipalStrip />
            </div>
          </section>


          {/* =========================================
              04. MISSION & VISION
          ========================================= */}

          <section
            className={`${styles.block} ${styles.split}`}
            aria-labelledby="purpose"
          >
            <h2
              id="purpose"
              className={`display ${styles.splitTitle}`}
            >
              Mission &amp; vision
            </h2>

            <div className={styles.prose}>
              <div className={styles.statement}>
                <p className={styles.statementLabel}>
                  Mission
                </p>

                <p className={styles.statementText}>
                  {company.mission}
                </p>
              </div>

              <div className={styles.statement}>
                <p className={styles.statementLabel}>
                  Vision
                </p>

                <p className={styles.statementText}>
                  {company.vision}
                </p>
              </div>
            </div>
          </section>


          {/* =========================================
              05. COMPANY VALUES
          ========================================= */}

          <section
            className={styles.block}
            aria-labelledby="values"
          >
            <div className={styles.split}>
              <h2
                id="values"
                className={`display ${styles.splitTitle}`}
              >
                Expert · Dependable · Decisive
              </h2>

              <p className={styles.prose}>
                How we want every buyer, dealer and principal
                to know us: the chemistry partner with answers,
                and the people who get the deal done.
              </p>
            </div>

            <ul
              className={`${styles.cards} ${styles.cards3} ${styles.cardsSpaced}`}
            >
              {company.values.map((value, i) => (
                <li
                  key={value.title}
                  className={styles.card}
                >
                  <span className={styles.cardIndex}>
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <h3>{value.title}</h3>

                  <p>{value.body}</p>
                </li>
              ))}
            </ul>
          </section>


          {/* =========================================
              06. WORKING WITH BIOTONIC
          ========================================= */}

          <section
            className={styles.block}
            aria-labelledby="working-with-us"
          >
            <div className={styles.split}>
              <h2
                id="working-with-us"
                className={`display ${styles.splitTitle}`}
              >
                Working with Biotonic
              </h2>

              <div className={styles.prose}>
                <p>
                  <strong>
                    {company.pricePositioning.title}.
                  </strong>{' '}
                  {company.pricePositioning.body}
                </p>
              </div>
            </div>

            <div className={styles.cardsSpaced}>
              <JourneySteps steps={company.journey} />
            </div>
          </section>


          {/* =========================================
              07. THE IDEA BEHIND THE NAME
          ========================================= */}

          <section
            className={`${styles.block} ${styles.split}`}
            aria-labelledby="the-name"
          >
            <h2
              id="the-name"
              className={`display ${styles.splitTitle}`}
            >
              The idea behind the name
            </h2>

            <div className={styles.prose}>
              <p>{company.nameStory}</p>

              <p className={styles.brandIdea}>
                {company.brandIdea}
              </p>
            </div>
          </section>


          {/* =========================================
              08. FOUNDER PROFILE
          ========================================= */}

          {isPublished('leadership') && (
            <>
              <section
                className={`${styles.block} ${styles.split}`}
                aria-labelledby="founder-profile"
              >
                <div>
                  <h2
                    id="founder-profile"
                    className={`display ${styles.splitTitle}`}
                  >
                    The person behind Biotonic
                  </h2>

                  <p className={styles.prose}>
                    Leadership, experience and a vision
                    built on industry knowledge and
                    meaningful relationships.
                  </p>
                </div>

                <div className={styles.prose}>
                  <p>{founder.storyAngle}</p>
                </div>
              </section>


              {/* =========================================
                  09. FOUNDER BIOGRAPHY
              ========================================= */}

              <section
                className={`${styles.block} ${styles.split}`}
                aria-labelledby="founder-name"
              >
                <div>
                  <div className={styles.portrait}>
                    {portrait ? (
                      <img
                        src={portrait.src}
                        alt={portrait.alt}
                        width={portrait.width}
                        height={portrait.height}
                        loading="lazy"
                      />
                    ) : (
                      <Monogram
                        name={founder.name}
                        size="lg"
                      />
                    )}
                  </div>
                </div>

                <div className={styles.prose}>
                  <div>
                    <h2
                      id="founder-name"
                      className={`display ${styles.profileName}`}
                    >
                      {founder.name}
                    </h2>

                    <p className={styles.meta}>
                      {founder.title} · Industrial expert
                      &amp; deal maker
                    </p>
                  </div>

                  <blockquote className={styles.statement}>
                    <p className={styles.statementLabel}>
                      In one line
                    </p>

                    <p className={styles.statementText}>
                      {founder.statement}
                    </p>
                  </blockquote>

                  {founder.biography.map((p) => (
                    <p key={p}>{p}</p>
                  ))}

                  {links && (
                    <p>
                      {links.map((l) => (
                        <a
                          key={l.href}
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
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


              {/* =========================================
                  10. FOUNDER JOURNEY TIMELINE
              ========================================= */}

              <section
                className={styles.block}
                aria-labelledby="founder-journey"
              >
                <h2
                  id="founder-journey"
                  className={`display ${styles.splitTitle} ${styles.formTitle}`}
                >
                  The founder journey
                </h2>

                <FounderTimeline
                  steps={founder.timeline}
                />
              </section>


              {/* =========================================
                  11. INDUSTRIAL EXPERT & DEAL MAKER
              ========================================= */}

              <section
                className={styles.block}
                aria-labelledby="expert-deal-maker"
              >
                <h2
                  id="expert-deal-maker"
                  className={`display ${styles.splitTitle} ${styles.formTitle}`}
                >
                  The industrial expert &amp; deal maker
                </h2>

                <ul className={styles.twoCol}>
                  {founder.roles.map((role, i) => (
                    <li
                      key={role.title}
                      className={styles.card}
                    >
                      <span className={styles.cardIndex}>
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <h3>{role.title}</h3>

                      <p>{role.body}</p>

                      <ul
                        className={styles.proofList}
                        aria-label={`Proof: ${role.title}`}
                      >
                        {role.proof.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </section>


              {/* =========================================
                  12. AWARDS & RECOGNITION
              ========================================= */}

              <section
                className={styles.block}
                aria-labelledby="recognition"
              >
                <h2
                  id="recognition"
                  className={`display ${styles.splitTitle} ${styles.formTitle}`}
                >
                  Proof that he delivers
                </h2>

                <AwardList
                  awards={founder.awards}
                />
              </section>


              {/* =========================================
                  13. FOUNDER'S VISION
              ========================================= */}

              <section
                className={`${styles.block} ${styles.split}`}
                aria-labelledby="founder-vision"
              >
                <h2
                  id="founder-vision"
                  className={`display ${styles.splitTitle}`}
                >
                  Vision for Biotonic
                </h2>

                <div className={styles.prose}>
                  <p className={styles.statementText}>
                    {founder.vision}
                  </p>
                </div>
              </section>
            </>
          )}

        </Container>
      </div>


      {/* =========================================
          14. FINAL QUOTE CTA
      ========================================= */}

      <QuoteCta />
    </>
  );
}
