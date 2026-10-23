import { Link } from 'react-router';
import type { Crumb } from '../../lib/seo';
import styles from './Breadcrumbs.module.css';

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length < 2) return null;
  return (
    <nav aria-label="Breadcrumb" className={styles.nav}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.path} className={styles.item}>
              {last ? (
                <span aria-current="page">{item.label}</span>
              ) : (
                <Link to={item.path}>{item.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
