import type { Category } from '../../lib/catalog';
import { Icon } from '../ui/Icon';
import styles from './ProductFilters.module.css';

interface ProductFiltersProps {
  search: string;
  category: string;
  categories: Category[];
  counts: Map<string, number>;
  total: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (slug: string) => void;
}

export function ProductFilters({
  search,
  category,
  categories,
  counts,
  total,
  onSearchChange,
  onCategoryChange,
}: ProductFiltersProps) {
  return (
    <div className={styles.filters}>
      <form role="search" className={styles.search} onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="product-search" className="visually-hidden">
          Search products
        </label>
        <Icon name="search" size={20} className={styles.searchIcon} />
        <input
          id="product-search"
          type="search"
          value={search}
          placeholder="Search by product name, use or specification"
          autoComplete="off"
          maxLength={80}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
        {search && (
          <button type="button" className={styles.clear} onClick={() => onSearchChange('')}>
            <Icon name="close" size={16} />
            <span className="visually-hidden">Clear search</span>
          </button>
        )}
      </form>

      <fieldset className={styles.categories}>
        <legend className="visually-hidden">Filter by category</legend>
        {[{ slug: '', name: 'All products' }, ...categories].map((c) => {
          const count = c.slug ? (counts.get(c.slug) ?? 0) : total;
          const checked = category === c.slug;
          return (
            <label
              key={c.slug || 'all'}
              className={`${styles.chip} ${checked ? styles.chipActive : ''}`}
            >
              <input
                type="radio"
                name="category"
                value={c.slug}
                checked={checked}
                onChange={() => onCategoryChange(c.slug)}
                className="visually-hidden"
              />
              {c.name}
              <span className={styles.count}>{count}</span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}
