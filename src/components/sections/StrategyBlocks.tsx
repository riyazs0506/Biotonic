import { company, type JourneyStep, type Stat } from '../../content/company';
import type { Award, TimelineStep } from '../../content/leadership';
import { paths } from '../../lib/routes';
import { ButtonLink } from '../ui/Button';
import { Icon } from '../ui/Icon';
import styles from './StrategyBlocks.module.css';

/** Large figures with short labels ("At a glance", market context). */
export function StatGrid({ stats, tone = 'light' }: { stats: Stat[]; tone?: 'light' | 'ink' }) {
  return (
    <dl className={`${styles.stats} ${tone === 'ink' ? styles.statsInk : ''}`}>
      {stats.map((stat) => (
        <div key={stat.value} className={styles.stat}>
          <dt className={styles.statLabel}>{stat.label}</dt>
          <dd className={styles.statValue}>{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The principal brands Biotonic works with — set as type, never as third-party logos. */
export function PrincipalStrip({ label = 'Trusted channel partner of' }: { label?: string }) {
  return (
    <div className={styles.principals}>
      <p className={styles.principalsLabel}>{label}</p>
      <ul className={styles.principalList}>
        {company.principals.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  );
}

const audienceAction: Record<string, { label: string; to: string }> = {
  'b2b-clients': { label: 'Request a quote', to: paths.quote },
  dealers: { label: 'Become a dealer', to: `${paths.contact}?role=dealer` },
  principals: { label: 'Partner with us', to: `${paths.contact}?role=principal` },
};

/** "What each side gets" — buyers, dealers and principals. */
export function AudienceCards({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  const Heading = `h${headingLevel}` as const;
  return (
    <ul className={styles.audiences}>
      {company.audiences.map((audience) => {
        const action = audienceAction[audience.slug];
        return (
          <li key={audience.slug} className={styles.audience} id={audience.slug}>
            <p className={styles.audiencePriority}>{audience.priority}</p>
            <Heading className={styles.audienceName}>{audience.name}</Heading>
            <p className={styles.audienceDesc}>{audience.description}</p>
            <p className={styles.getsLabel}>What you get</p>
            <ul className={styles.gets}>
              {audience.gets.map((item) => (
                <li key={item}>
                  <Icon name="check" size={16} />
                  {item}
                </li>
              ))}
            </ul>
            {action && (
              <ButtonLink
                to={action.to}
                variant="ghost"
                icon="arrowRight"
                className={styles.audienceAction}
              >
                {action.label}
              </ButtonLink>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function AwardList({ awards, tone = 'light' }: { awards: Award[]; tone?: 'light' | 'ink' }) {
  return (
    <ul className={`${styles.awards} ${tone === 'ink' ? styles.awardsInk : ''}`}>
      {awards.map((award) => (
        <li key={award.title} className={styles.award}>
          <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.awardIcon}>
            <path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L12 16.9l-5.25 2.7 1-5.8L3.5 9.7l5.9-.9z" />
          </svg>
          <span className={styles.awardTitle}>{award.title}</span>
          <span className={styles.awardFrom}>{award.from}</span>
        </li>
      ))}
    </ul>
  );
}

export function FounderTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className={styles.timeline}>
      {steps.map((step, index) => (
        <li
          key={step.period}
          className={`${styles.step} ${index === steps.length - 1 ? styles.stepCurrent : ''}`}
        >
          <span className={styles.stepPeriod}>{step.period}</span>
          <span className={styles.stepTitle}>{step.title}</span>
          {step.detail && <span className={styles.stepDetail}>{step.detail}</span>}
        </li>
      ))}
    </ol>
  );
}

export function JourneySteps({ steps }: { steps: JourneyStep[] }) {
  return (
    <ol className={styles.journey}>
      {steps.map((step, index) => (
        <li key={step.stage} className={styles.journeyStep}>
          <span className={styles.journeyIndex}>{String(index + 1).padStart(2, '0')}</span>
          <span className={styles.journeyStage}>{step.stage}</span>
          <h3 className={styles.journeyTitle}>{step.title}</h3>
          <p>{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
