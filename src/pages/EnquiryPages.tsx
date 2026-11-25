import { useSearchParams } from 'react-router';
import { EnquiryForm } from '../components/enquiry/EnquiryForm';
import { PageHeader } from '../components/layout/PageHeader';
import { imagery } from '../content/imagery';
import { Icon } from '../components/ui/Icon';
import { Container } from '../components/ui/Layout';
import { Confirm } from '../components/ui/Pending';
import { geography } from '../content/industries';
import { site } from '../content/site';
import { parseRequirement } from '../lib/requirement';
import { whatsappHref } from '../lib/whatsapp';
import { paths } from '../lib/routes';
import { getPageMeta } from '../lib/seo';
import { useHydrated } from '../lib/useHydrated';
import styles from './ContentPage.module.css';

function ContactDetails() {
  const whatsapp = whatsappHref();
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
      {whatsapp && (
        <a className={styles.contactLine} href={whatsapp} target="_blank" rel="noopener noreferrer">
          <Icon name="chat" /> WhatsApp — quick quotes
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      )}
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

/** "A decision-maker who picks up the phone" — from the brand's value proposition. */
function DecisionMaker() {
  return (
    <div className={styles.sideBlock}>
      <h2 className={styles.sideTitle}>Talk to a decision-maker</h2>
      <p className={styles.meta}>
        Quotes come from the people who can approve them. Dealers and principals get a direct line
        to our founder, Keerthi Vasan.
      </p>
      <p className={styles.meta}>
        Serving the {geography.current}; expanding across {geography.next}.
      </p>
    </div>
  );
}

export function ContactPage() {
  const meta = getPageMeta(paths.contact);
  const hydrated = useHydrated();
  const [params] = useSearchParams();
  const role = hydrated ? (params.get('role') ?? undefined) : undefined;
  return (
    <div className={styles.compact}>
      <PageHeader
        compact
        eyebrow="Contact"
        title={
          <>
            Let’s talk <em>chemistry.</em>
          </>
        }
        lead="A product question, a quote, or a dealer or principal partnership? Send us a message or WhatsApp us — a decision-maker will reply."
        breadcrumbs={meta.breadcrumbs}
        image={imagery.contact}
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
              {/* Re-mount after hydration so a ?role= preselection matches the prerendered HTML first. */}
              <EnquiryForm key={hydrated ? 'client' : 'server'} kind="contact" defaultRole={role} />
            </section>
            <aside className={styles.sidebar} aria-label="Other ways to reach us">
              <ContactDetails />
              <DecisionMaker />
              <NextSteps />
            </aside>
          </div>
        </Container>
      </div>
    </div>
  );
}

export function RequestQuotePage() {
  const meta = getPageMeta(paths.quote);
  const hydrated = useHydrated();
  const [params] = useSearchParams();
  const product = hydrated ? (params.get('product') ?? undefined) : undefined;
  // A requirement composed in the hero sentence (option keys only — see lib/requirement).
  const composed = hydrated ? parseRequirement(params) : {};

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
        image={imagery.quote}
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
                defaultMessage={composed.message}
                defaultQuantity={composed.quantity}
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
