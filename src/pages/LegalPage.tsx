import { PageHeader } from '../components/layout/PageHeader';
import { Container } from '../components/ui/Layout';
import { Confirm } from '../components/ui/Pending';
import { privacyPolicy, terms, type LegalDocument } from '../content/legal';
import { paths } from '../lib/routes';
import { getPageMeta } from '../lib/seo';
import styles from './ContentPage.module.css';

function LegalPage({ doc, path }: { doc: LegalDocument; path: string }) {
  const meta = getPageMeta(path);
  return (
    <>
      <PageHeader title={doc.title} lead={doc.description} breadcrumbs={meta.breadcrumbs}>
        <p className={styles.meta}>
          Last updated: <Confirm value={doc.lastUpdated} render={(d) => d} />
        </p>
      </PageHeader>
      <div className={styles.body}>
        <Container narrow>
          <div className={styles.legal}>
            {doc.sections.map((section) => (
              <section key={section.heading} aria-label={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((p, i) => (
                  <p key={i}>
                    <Confirm value={p} render={(text) => text} />
                  </p>
                ))}
              </section>
            ))}
          </div>
        </Container>
      </div>
    </>
  );
}

export function PrivacyPage() {
  return <LegalPage doc={privacyPolicy} path={paths.privacy} />;
}

export function TermsPage() {
  return <LegalPage doc={terms} path={paths.terms} />;
}
