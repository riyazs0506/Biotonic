import { Link } from 'react-router';
import type { Product } from '../../lib/catalog';
import { getCategory } from '../../lib/catalog';
import { paths } from '../../lib/routes';
import { Icon } from '../ui/Icon';
import styles from './ProductCard.module.css';

export function ProductCard({
  product,
  headingLevel = 3,
}: {
  product: Product;
  headingLevel?: 2 | 3;
}) {
  const category = getCategory(product.category);
  const Heading = `h${headingLevel}` as const;
  return (
    <article className={styles.card}>
      <div className={styles.meta}>
        <span className={styles.category}>{category?.name}</span>
      </div>
      <Heading className={styles.title}>
        <Link to={paths.product(product.slug)} className={styles.link}>
          {product.name}
        </Link>
      </Heading>
      <p className={styles.summary}>{product.summary}</p>
      {product.specifications.length > 0 && (
        <dl className={styles.specs}>
          {product.specifications.slice(0, 2).map((spec) => (
            <div key={spec.label}>
              <dt>{spec.label}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <span className={styles.more} aria-hidden="true">
        View product <Icon name="arrowRight" size={16} />
      </span>
    </article>
  );
}
