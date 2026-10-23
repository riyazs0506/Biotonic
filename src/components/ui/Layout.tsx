import type { ElementType, ReactNode } from 'react';
import styles from './Layout.module.css';

function cx(...names: (string | false | undefined)[]) {
  return names.filter(Boolean).join(' ');
}

export function Container({
  children,
  narrow,
  className,
}: {
  children: ReactNode;
  narrow?: boolean;
  className?: string;
}) {
  return <div className={cx(styles.container, narrow && styles.narrow, className)}>{children}</div>;
}

export function Eyebrow({ children, as: Tag = 'p' }: { children: ReactNode; as?: ElementType }) {
  return <Tag className={styles.eyebrow}>{children}</Tag>;
}

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  /** Right-aligned action in the section header, e.g. "View all products". */
  action?: ReactNode;
  tone?: 'page' | 'sunken' | 'ink';
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}

/** Standard page section with an optional editorial header. */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  action,
  tone = 'page',
  children,
  className,
}: SectionProps) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      className={cx(styles.section, styles[tone], className)}
      aria-labelledby={title ? headingId : undefined}
    >
      <Container>
        {(eyebrow || title || intro) && (
          <header className={styles.sectionHeader}>
            <div className={styles.sectionHeading}>
              {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
              {title && (
                <h2 id={headingId} className={cx('display', styles.sectionTitle)}>
                  {title}
                </h2>
              )}
            </div>
            {(intro || action) && (
              <div className={styles.sectionAside}>
                {intro && <p className={styles.sectionIntro}>{intro}</p>}
                {action}
              </div>
            )}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
