import { useParams } from 'react-router';
import { PageHeader } from '../components/layout/PageHeader';
import { ProductCard } from '../components/products/ProductCard';
import { ButtonLink } from '../components/ui/Button';
import { EmptyState } from '../components/ui/Feedback';
import { Icon } from '../components/ui/Icon';
import { Container, Section } from '../components/ui/Layout';
import { getCategory, getProduct, relatedProducts } from '../lib/catalog';
import { paths } from '../lib/routes';
import { getPageMeta } from '../lib/seo';
import styles from './ProductDetailPage.module.css';

export function ProductDetailPage() {
  const { slug = '' } = useParams();
  const product = getProduct(slug);

  if (!product) return <ProductNotFound />;

  const meta = getPageMeta(paths.product(product.slug));
  const category = getCategory(product.category);
  const related = relatedProducts(product);
  const quoteHref = `${paths.quote}?product=${encodeURIComponent(product.slug)}`;

  return (
    <>
      <PageHeader
        eyebrow={category?.name}
        title={product.name}
        lead={product.summary}
        breadcrumbs={meta.breadcrumbs}
      >
        <div className={styles.headerActions}>
          <ButtonLink to={quoteHref} size="lg" icon="arrowRight">
            Request a quote for this product
          </ButtonLink>
        </div>
      </PageHeader>

      <section className={styles.body} aria-label="Product details">
        <Container>
          <div className={styles.layout}>
            <div className={styles.main}>
              <h2 className={styles.heading}>Overview</h2>
              <div className={styles.prose}>
                {product.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              {product.applications.length > 0 && (
                <>
                  <h2 className={styles.heading}>Applications</h2>
                  <ul className={styles.tags}>
                    {product.applications.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <aside className={styles.aside} aria-label="Specifications and documents">
              {product.specifications.length > 0 && (
                <div className={styles.panel}>
                  <h2 className={styles.panelTitle}>Specifications</h2>
                  <table className={styles.specs}>
                    <caption className="visually-hidden">Specifications for {product.name}</caption>
                    <tbody>
                      {product.specifications.map((spec) => (
                        <tr key={spec.label}>
                          <th scope="row">{spec.label}</th>
                          <td>{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {product.packaging.length > 0 && (
                <div className={styles.panel}>
                  <h2 className={styles.panelTitle}>Packaging</h2>
                  <ul className={styles.list}>
                    {product.packaging.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>Technical documents</h2>
                {product.documents.length > 0 ? (
                  <ul className={styles.docs}>
                    {product.documents.map((doc) => (
                      <li key={doc.href}>
                        <a href={doc.href} target="_blank" rel="noopener noreferrer">
                          <Icon name="document" size={18} />
                          {doc.label}
                          <span className="visually-hidden"> (opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.muted}>
                    Documents for this product will be listed here once published. Mention any
                    documentation you need in your quotation request.
                  </p>
                )}
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <Section
          id="related"
          tone="sunken"
          eyebrow="Related products"
          title={`More in ${category?.name ?? 'this category'}`}
        >
          <ul className={styles.related}>
            {related.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}

export function ProductNotFound() {
  return (
    <section className={styles.notFound}>
      <Container narrow>
        <h1 className="visually-hidden">Product not found</h1>
        <EmptyState
          title="We couldn’t find that product"
          action={
            <>
              <ButtonLink to={paths.products} icon="arrowRight">
                Browse all products
              </ButtonLink>
              <ButtonLink to={paths.quote} variant="secondary">
                Request a quote
              </ButtonLink>
            </>
          }
        >
          <p>
            It may have been renamed or removed from the catalogue. Browse the current catalogue, or
            tell us what you need and we will help.
          </p>
        </EmptyState>
      </Container>
    </section>
  );
}
