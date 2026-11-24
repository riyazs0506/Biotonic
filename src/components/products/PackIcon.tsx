import type { PackType } from '../../lib/catalog';
import styles from './PackIcon.module.css';

/** Line drawings of the packs Biotonic ships: steel drum, HDPE carboy, pail and bag. */
const drawings: Record<PackType, React.ReactNode> = {
  drum: (
    <>
      <ellipse cx="24" cy="9" rx="13" ry="3.5" className={styles.top} />
      <path d="M11 9v29c0 1.9 5.8 3.5 13 3.5s13-1.6 13-3.5V9" />
      <path d="M11 19c0 1.9 5.8 3.5 13 3.5s13-1.6 13-3.5M11 29c0 1.9 5.8 3.5 13 3.5s13-1.6 13-3.5" />
      <rect x="15" y="22.5" width="18" height="6" rx="1" className={styles.label} />
    </>
  ),
  can: (
    <>
      <path d="M14 14h20a3 3 0 0 1 3 3v21a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V17a3 3 0 0 1 3-3Z" />
      <path d="M15 14V10a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v4M19 14v-3h5v3" />
      <rect x="30" y="8" width="5" height="6" rx="1.5" className={styles.cap} />
      <rect x="15" y="22" width="18" height="10" rx="1" className={styles.label} />
    </>
  ),
  pail: (
    <>
      <path
        d="M10 15h28l-3 25a2.5 2.5 0 0 1-2.5 2H15.5a2.5 2.5 0 0 1-2.5-2L10 15Z"
        className={styles.body}
      />
      <path d="M9 15h30" />
      <path d="M11 15c2-7 24-7 26 0" />
      <rect x="14" y="24" width="20" height="8" rx="1" className={styles.label} />
    </>
  ),
  bag: (
    <>
      <path d="M13 8h22l2 6-1 25a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3l-1-25 2-6Z" />
      <path d="M13 8c3 2 19 2 22 0M12 14h24" />
      <rect x="16" y="22" width="16" height="10" rx="1" className={styles.label} />
    </>
  ),
};

export function PackIcon({ type, size = 48 }: { type: PackType; size?: number }) {
  return (
    <svg
      className={styles.icon}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      {drawings[type]}
    </svg>
  );
}
