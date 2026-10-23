import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import styles from './Feedback.module.css';

type Tone = 'info' | 'success' | 'error';

const toneIcon: Record<Tone, IconName> = { info: 'info', success: 'check', error: 'alert' };

/**
 * Inline status message. Errors use role="alert" so assistive technology announces them;
 * other tones use a polite live region.
 */
export function Alert({
  tone = 'info',
  title,
  children,
  action,
}: {
  tone?: Tone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={`${styles.alert} ${styles[tone]}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={toneIcon[tone]} size={20} className={styles.alertIcon} />
      <div className={styles.alertBody}>
        <p className={styles.alertTitle}>{title}</p>
        {children && <div className={styles.alertText}>{children}</div>}
        {action && <div className={styles.alertAction}>{action}</div>}
      </div>
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <span className={styles.spinner} role={label ? 'status' : undefined}>
      <span className={styles.spinnerRing} aria-hidden="true" />
      {label && <span className="visually-hidden">{label}</span>}
    </span>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={styles.empty}>
      <svg className={styles.emptyArt} viewBox="0 0 64 96" aria-hidden="true">
        <circle cx="34" cy="10" r="3" />
        <circle cx="27" cy="20" r="2" />
        <circle cx="35" cy="26" r="4.5" />
        <path d="M18 36h28M22 36v40a10 10 0 0 0 20 0V36" />
      </svg>
      <h2 className={styles.emptyTitle}>{title}</h2>
      {children && <div className={styles.emptyText}>{children}</div>}
      {action && <div className={styles.emptyAction}>{action}</div>}
    </div>
  );
}
