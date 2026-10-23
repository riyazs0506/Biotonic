import { useDeferredValue, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { PageHeader } from '../components/layout/PageHeader';
import { QuoteCta } from '../components/layout/QuoteCta';
import { ProductCard } from '../components/products/ProductCard';
import { ProductFilters } from '../components/products/ProductFilters';
import { Button, ButtonLink } from '../components/ui/Button';
import { EmptyState } from '../components/ui/Feedback';
import { Container } from '../components/ui/Layout';
import { catalogue, categoryCounts, filterProducts, getCategory } from '../lib/catalog';
import { paths } from '../lib/routes';
import { getPageMeta } from '../lib/seo';
import { useHydrated } from '../lib/useHydrated';
import styles from './ProductsPage.module.css';

export function ProductsPage() {
  const meta = getPageMeta(paths.products);
  const hydrated = useHydrated();
  const [params, setParams] = useSearchParams();

  // Query state is applied after hydration so the first client render matches the static HTML.
  const search = hydrated ? (params.get('q') ?? '') : '';
  const rawCategory = hydrated ? (params.get('category') ?? '') : '';
  const category = getCategory(rawCategory) ? rawCategory : '';
  const deferredSearch = useDeferredValue(search);

  const results = useMemo(
    () => filterProducts(catalogue.products, { search: deferredSearch, category }),
    [deferredSearch, category],
  );
  const counts = useMemo(() => categoryCounts(), []);

  const update = (key: 'q' | 'category', value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const clearAll = () =>
    setParams(new URLSearchParams(), { replace: true, preventScrollReset: true });
  const activeCategory = getCategory(category);

  return (
    <>
      <PageHeader
        eyebrow="Product catalogue"
        title={
          <>
            Chemical products, <em>clearly specified.</em>
          </>
        }
        lead="Search the catalogue, filter by category and open any product for its specifications. Every product can be quoted for your required quantity."
        breadcrumbs={meta.breadcrumbs}
      />

      <section className={styles.catalogue} aria-label="Product catalogue">
        <Container>
          {catalogue.products.length === 0 ? (
            <EmptyState
              title="Our catalogue is being prepared"
              action={
                <>
                  <ButtonLink to={paths.quote} icon="arrowRight">
                    Request a quote
                  </ButtonLink>
                  <ButtonLink to={paths.contact} variant="secondary">
                    Contact us
                  </ButtonLink>
                </>
              }
            >
              <p>
                Product listings will be published here soon. In the meantime, tell us the product
                and quantity you need and the Biotonic team will respond.
              </p>
            </EmptyState>
          ) : (
            <>
              <ProductFilters
                search={search}
                category={category}
                categories={catalogue.categories}
                counts={counts}
                total={catalogue.products.length}
                onSearchChange={(v) => update('q', v)}
                onCategoryChange={(v) => update('category', v)}
              />

              <p className={styles.resultCount} role="status" aria-live="polite">
                {results.length === catalogue.products.length
                  ? `Showing all ${results.length} products`
                  : `${results.length} of ${catalogue.products.length} products`}
                {activeCategory ? ` in ${activeCategory.name}` : ''}
                {search ? ` matching “${search}”` : ''}
              </p>

              {results.length > 0 ? (
                <ul className={styles.grid}>
                  {results.map((product) => (
                    <li key={product.slug}>
                      <ProductCard product={product} headingLevel={2} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="No products match your search"
                  action={
                    <>
                      <Button variant="secondary" onClick={clearAll}>
                        Clear search and filters
                      </Button>
                      <ButtonLink to={paths.quote} icon="arrowRight">
                        Ask us directly
                      </ButtonLink>
                    </>
                  }
                >
                  <p>
                    Try a different product name or specification, or{' '}
                    <Link to={paths.quote}>send us your requirements</Link> — we may be able to
                    supply products that are not listed online.
                  </p>
                </EmptyState>
              )}
            </>
          )}
        </Container>
      </section>

      <QuoteCta
        title={
          <>
            Can’t find what you <em>need?</em>
          </>
        }
      />
    </>
  );
}
