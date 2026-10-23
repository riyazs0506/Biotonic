import { Link } from 'react-router';
import { PageHeader } from '../components/layout/PageHeader';
import { QuoteCta } from '../components/layout/QuoteCta';
import { Icon } from '../components/ui/Icon';
import { Container } from '../components/ui/Layout';
import { show } from '../content/pending';
import { resources } from '../content/resources';
import { paths } from '../lib/routes';
import { getPageMeta } from '../lib/seo';
import { NotFoundPage } from './NotFoundPage';
import styles from './ContentPage.module.css';

export function ResourcesPage() {
  const meta = getPageMeta(paths.resources);
  if (!meta.found) return <NotFoundPage />;

  const documents = show(resources) ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Technical resources"
        title={
          <>
            Documents and <em>data sheets.</em>
          </>
        }
        lead="Technical documentation for Biotonic products."
        breadcrumbs={meta.breadcrumbs}
      />

      <div className={styles.body}>
        <Container>
          <ul className={styles.cards}>
            {documents.map((doc) => (
              <li key={doc.title} className={styles.card}>
                <span className={styles.cardIndex}>{doc.format}</span>
                <h2 className={styles.cardTitle}>{doc.title}</h2>
                <p>{doc.description}</p>
                <p>
                  {doc.href.startsWith(paths.quote) ? (
                    <Link to={doc.href} className={styles.docLink}>
                      <Icon name="document" size={18} /> Request this document
                    </Link>
                  ) : (
                    <a
                      href={doc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.docLink}
                    >
                      <Icon name="document" size={18} /> Download {doc.format}
                      {doc.size && ` (${doc.size})`}
                      <span className="visually-hidden"> — {doc.title}, opens in a new tab</span>
                    </a>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </div>

      <QuoteCta />
    </>
  );
}
