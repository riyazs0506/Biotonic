import styles from './Monogram.module.css';

/** Initials in an emerald ring — stands in for a portrait until a photograph is supplied. */
export function Monogram({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return (
    <span className={`${styles.monogram} ${styles[size]}`} aria-hidden="true">
      {initials}
    </span>
  );
}
