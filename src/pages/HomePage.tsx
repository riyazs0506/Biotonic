import { Link } from 'react-router';
import { Monogram } from '../components/brand/Monogram';
import { Hero } from '../components/hero/Hero';
import { QuoteCta } from '../components/layout/QuoteCta';
import { ProductCard } from '../components/products/ProductCard';
import { ButtonLink } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { Section } from '../components/ui/Layout';
import { company } from '../content/company';
import { industries } from '../content/industries';
import { founder } from '../content/leadership';
import { show } from '../content/pending';
import { catalogue, categoryCounts, featuredProducts } from '../lib/catalog';
import { isPublished } from '../lib/publication';
import { paths } from '../lib/routes';
import styles from './HomePage.module.css';

export function HomePage() {
  const counts = categoryCounts();
  const featured = featuredProducts();
  // `show` returns confirmed content, or demo content in draft builds; nothing otherwise.
  const capabilities = show(company.capabilities);
  const founderName = show(founder.name);
  const founderTitle = show(founder.title);
  const founderIntro = show(founder.introduction);
  const industryList = show(industries);

  return (
    <>
      <Hero />

      <Section
        id="categories"
        eyebrow="Product discovery"
        title={
          <>
            Find the right <em>chemistry</em> for your operation.
          </>
        }
        intro="Browse the catalogue by category, compare specifications and request a quotation in a few steps."
        action={
          <ButtonLink to={paths.products} variant="ghost" icon="arrowRight">
            View the full catalogue
          </ButtonLink>
        }
      >
        {catalogue.categories.length > 0 ? (
          <ul className={styles.categories}>
            {catalogue.categories.map((category, index) => (
              <li key={category.slug}>
                <Link
                  to={`${paths.products}?category=${category.slug}`}
                  className={styles.category}
                >
                  <span className={styles.categoryIndex}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.categoryName}>{category.name}</span>
                  <span className={styles.categoryDesc}>{category.description}</span>
                  <span className={styles.categoryFoot}>
                    <span>
                      {counts.get(category.slug) ?? 0}{' '}
                      {counts.get(category.slug) === 1 ? 'product' : 'products'}
                    </span>
                    <Icon name="arrowUpRight" size={18} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.notice}>
            Our online catalogue is being prepared.{' '}
            <Link to={paths.quote}>Tell us what you need</Link> and we will respond with product
            information and a quotation.
          </p>
        )}
      </Section>

      {featured.length > 0 && (
        <Section
          id="featured"
          tone="sunken"
          eyebrow="Featured products"
          title="Selected from the catalogue"
        >
          <ul className={styles.productGrid}>
            {featured.map((product) => (
              <li key={product.slug}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <section className={styles.intro} aria-labelledby="intro-title">
        <div className={styles.introInner}>
          <div>
            <p className={styles.introEyebrow}>About Biotonic</p>
            <h2 id="intro-title" className={`display ${styles.introTitle}`}>
              Trusted at <em>first sight.</em>
            </h2>
          </div>
          <div className={styles.introBody}>
            <p>{company.introduction}</p>
            <ButtonLink to={paths.about} variant="secondary" icon="arrowRight">
              About Biotonic
            </ButtonLink>
          </div>
        </div>
        <ol className={styles.principles}>
          {company.principles.map((p, i) => (
            <li key={p.title} className={styles.principle}>
              <span className={styles.principleIndex}>{String(i + 1).padStart(2, '0')}</span>
              <h3 className={styles.principleTitle}>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {capabilities && (
        <Section
          id="capabilities"
          tone="sunken"
          eyebrow="Capabilities & quality"
          title="How we support your supply"
          action={
            isPublished('quality') && (
              <ButtonLink to={paths.quality} variant="ghost" icon="arrowRight">
                Our quality approach
              </ButtonLink>
            )
          }
        >
          <ul className={styles.capabilities}>
            {capabilities.map((c, i) => (
              <li key={c.title}>
                <span className={styles.principleIndex}>{String(i + 1).padStart(2, '0')}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {founderName && founderIntro && (
        <Section id="founder" eyebrow="Leadership" title="The people behind Biotonic">
          <div className={styles.founder}>
            <div className={styles.founderCard}>
              <Monogram name={founderName} />
              <div>
                <p className={styles.founderName}>{founderName}</p>
                {founderTitle && <p className={styles.founderRole}>{founderTitle}</p>}
              </div>
            </div>
            <div className={styles.introBody}>
              <p className={styles.founderQuote}>{founderIntro}</p>
              {isPublished('leadership') && (
                <ButtonLink to={paths.leadership} variant="secondary" icon="arrowRight">
                  Meet our founder
                </ButtonLink>
              )}
            </div>
          </div>
        </Section>
      )}

      {industryList && (
        <Section
          id="industries"
          tone="sunken"
          eyebrow="Industries"
          title="Where our chemistry works"
          action={
            isPublished('industries') && (
              <ButtonLink to={paths.industries} variant="ghost" icon="arrowRight">
                All industries
              </ButtonLink>
            )
          }
        >
          <ul className={styles.capabilities}>
            {industryList.map((industry) => (
              <li key={industry.slug}>
                <h3>{industry.name}</h3>
                <p>{industry.summary}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <QuoteCta />
    </>
  );
}
