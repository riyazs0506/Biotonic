import { useSearchParams } from 'react-router';
import { EnquiryForm } from '../components/enquiry/EnquiryForm';
import { PageHeader } from '../components/layout/PageHeader';
import { Icon } from '../components/ui/Icon';
import { Container } from '../components/ui/Layout';
import { Confirm } from '../components/ui/Pending';
import { site } from '../content/site';
import { paths } from '../lib/routes';
import { getPageMeta } from '../lib/seo';
import { useHydrated } from '../lib/useHydrated';
import styles from './ContentPage.module.css';

function ContactDetails() {
  return (
    <div className={styles.sideBlock}>
      <h2 className={styles.sideTitle}>Contact details</h2>
      <Confirm
        value={site.email}
        render={(email) => (
          <a className={styles.contactLine} href={`mailto:${email}`}>
            <Icon name="mail" /> {email}
          </a>
        )}
      />
      <Confirm
        value={site.phone}
        render={(phone) => (
          <a className={styles.contactLine} href={`tel:${phone.replace(/[^\d+]/g, '')}`}>
            <Icon name="phone" /> {phone}
          </a>
        )}
      />
      <Confirm
        value={site.whatsapp}
        render={(number) => (
          <a
            className={styles.contactLine}
            href={`https://wa.me/${number.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="chat" /> WhatsApp
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        )}
      />
      <Confirm
        value={site.address}
        render={(lines) => (
          <address className={styles.contactLine}>
            <Icon name="pin" />
            <span>
              {lines.map((l) => (
                <span key={l}>
                  {l}
                  <br />
                </span>
              ))}
            </span>
          </address>
        )}
      />
      <Confirm value={site.businessHours} render={(h) => <p className={styles.meta}>{h}</p>} />
    </div>
  );
}

function NextSteps() {
  return (
    <div className={styles.sideBlock}>
      <h2 className={styles.sideTitle}>What happens next</h2>
      <ol className={styles.steps}>
        <li>
          <span>
            <strong>We receive your request</strong>
            You will see a reference number as soon as it is sent.
          </span>
        </li>
        <li>
          <span>
            <strong>We review your requirements</strong>
            The Biotonic team checks product, grade and quantity.
          </span>
        </li>
        <li>
          <span>
            <strong>We reply by email</strong>
            With product information, questions or a quotation.
          </span>
        </li>
      </ol>
    </div>
  );
}

export function ContactPage() {
  const meta = getPageMeta(paths.contact);
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={
          <>
            Let’s talk <em>chemistry.</em>
          </>
        }
        lead="Questions about a product, availability or supply? Send us a message and the Biotonic team will reply by email."
        breadcrumbs={meta.breadcrumbs}
      />
      <div className={styles.body}>
        <Container>
          <div className={styles.contactGrid}>
            <section className={styles.formPanel} aria-labelledby="contact-form-title">
              <h2
                id="contact-form-title"
                className={`display ${styles.splitTitle} ${styles.formTitle}`}
              >
                Send an enquiry
              </h2>
              <EnquiryForm kind="contact" />
            </section>
            <aside className={styles.sidebar} aria-label="Other ways to reach us">
              <ContactDetails />
              <NextSteps />
            </aside>
          </div>
        </Container>
      </div>
    </>
  );
}

export function RequestQuotePage() {
  const meta = getPageMeta(paths.quote);
  const hydrated = useHydrated();
  const [params] = useSearchParams();
  const product = hydrated ? (params.get('product') ?? undefined) : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Request a quote"
        title={
          <>
            Discuss your <em>requirements.</em>
          </>
        }
        lead="Share the product, quantity and delivery details your business needs. The more specific you are, the more precise our quotation can be."
        breadcrumbs={meta.breadcrumbs}
      />
      <div className={styles.body}>
        <Container>
          <div className={styles.contactGrid}>
            <section className={styles.formPanel} aria-labelledby="quote-form-title">
              <h2
                id="quote-form-title"
                className={`display ${styles.splitTitle} ${styles.formTitle}`}
              >
                Quotation request
              </h2>
              {/* Re-mount after hydration so a ?product= preselection matches the prerendered HTML first. */}
              <EnquiryForm
                key={hydrated ? 'client' : 'server'}
                kind="quote"
                defaultProduct={product}
              />
            </section>
            <aside className={styles.sidebar} aria-label="Quotation guidance">
              <div className={styles.sideBlock}>
                <h2 className={styles.sideTitle}>Helpful details to include</h2>
                <ul className={styles.list}>
                  <li>Product name and required grade or specification</li>
                  <li>Quantity per order and expected frequency</li>
                  <li>Preferred packaging</li>
                  <li>Delivery location and timing</li>
                  <li>Any documentation you need with the order</li>
                </ul>
              </div>
              <NextSteps />
              <ContactDetails />
            </aside>
          </div>
        </Container>
      </div>
    </>
  );
}
