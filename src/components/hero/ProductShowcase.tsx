import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router';
import { industries } from '../../content/industries';
import { getProduct, packType, type Product } from '../../lib/catalog';
import { paths } from '../../lib/routes';
import { PackIcon } from '../products/PackIcon';
import { Icon, type IconName } from '../ui/Icon';
import styles from './ProductShowcase.module.css';

const marketIcon: Record<string, IconName> = {
  textile: 'spool',
  construction: 'bricks',
  industrial: 'factory',
};

/** Short tab labels so all three markets fit; the full name is the tab's accessible name. */
const shortLabel: Record<string, string> = {
  textile: 'Textile',
  construction: 'Construction',
  industrial: 'Industrial',
};

const MAX_ROWS = 4;

const markets = industries.map((industry) => ({
  ...industry,
  products: industry.productSlugs
    .map((slug) => getProduct(slug))
    .filter((p): p is Product => p !== undefined),
}));

function ProductRow({ product }: { product: Product }) {
  const sizes = product.packaging.slice(0, 2).join(' · ');
  return (
    <li className={styles.row}>
      <span className={styles.thumb}>
        {product.image ? (
          <img
            src={product.image.src}
            alt={product.image.alt}
            width={56}
            height={56}
            loading="lazy"
          />
        ) : (
          <PackIcon type={packType(product)} size={40} />
        )}
      </span>
      <span className={styles.rowBody}>
        <Link to={paths.product(product.slug)} className={styles.rowName}>
          {product.name}
        </Link>
        <span className={styles.rowMeta}>
          {product.principal && <span className={styles.brand}>{product.principal}</span>}
          {sizes && <span>{sizes}</span>}
        </span>
      </span>
      <Link
        to={`${paths.quote}?product=${encodeURIComponent(product.slug)}`}
        className={styles.quote}
        aria-label={`Get a quote for ${product.name}`}
      >
        Quote <Icon name="arrowRight" size={14} />
      </Link>
    </li>
  );
}

/**
 * Hero product finder: real catalogue products grouped by the three markets in the brand
 * strategy, with their principal brand, pack sizes and a direct quote link. Implements the
 * WAI-ARIA tabs pattern (arrow keys, Home/End, roving tabindex).
 */
export function ProductShowcase() {
  const [active, setActive] = useState(0);
  // Animate the panel only when the visitor switches tabs, never on first paint.
  const [switched, setSwitched] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const market = markets[active] ?? markets[0];
  if (!market) return null;

  const select = (index: number) => {
    const next = (index + markets.length) % markets.length;
    setActive(next);
    setSwitched(true);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => select(active + 1),
      ArrowLeft: () => select(active - 1),
      Home: () => select(0),
      End: () => select(markets.length - 1),
    };
    const action = keys[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  };

  const total = markets.reduce((sum, m) => sum + m.products.length, 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Product finder</p>
            <p className={styles.title} id={`${baseId}-title`}>
              Genuine brands for your process
            </p>
          </div>
          <span className={styles.badge}>
            <Icon name="check" size={14} /> Principal brands
          </span>
        </div>

        <div role="tablist" aria-labelledby={`${baseId}-title`} className={styles.tabs}>
          {markets.map((m, index) => (
            <button
              key={m.slug}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${m.slug}`}
              aria-selected={index === active}
              aria-controls={`${baseId}-panel`}
              tabIndex={index === active ? 0 : -1}
              className={styles.tab}
              onClick={() => {
                setActive(index);
                setSwitched(true);
              }}
              onKeyDown={onKeyDown}
            >
              <Icon name={marketIcon[m.slug] ?? 'flask'} size={16} />
              <span aria-hidden="true">{shortLabel[m.slug] ?? m.name}</span>
              <span className="visually-hidden">{m.name}</span>
            </button>
          ))}
        </div>

        <div
          key={market.slug}
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${market.slug}`}
          className={`${styles.panelBody} ${switched ? styles.animate : ''}`}
        >
          <p className={styles.buyers}>{market.buyers}</p>
          {market.products.length > 0 ? (
            <>
              <ul className={styles.rows}>
                {market.products.slice(0, MAX_ROWS).map((product) => (
                  <ProductRow key={product.slug} product={product} />
                ))}
              </ul>
              {market.products.length > MAX_ROWS && (
                <Link to={`${paths.industries}#${market.slug}`} className={styles.more}>
                  +{market.products.length - MAX_ROWS} more for {market.name.toLowerCase()}
                </Link>
              )}
            </>
          ) : (
            <div className={styles.fallback}>
              <p>{market.summary}</p>
              <p className={styles.fallbackNote}>
                Our {market.name.toLowerCase()} range is being added online. Tell us what you need
                and we will come back with the right product and a quote.
              </p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <Link to={paths.products} className={styles.footerLink}>
            {total > 0 ? `View all ${total} products` : 'Product catalogue'}
            <Icon name="arrowRight" size={14} />
          </Link>
          <Link to={paths.quote} className={styles.footerCta}>
            Request a quote
            <Icon name="arrowRight" size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
