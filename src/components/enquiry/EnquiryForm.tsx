import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { show } from '../../content/pending';
import { site } from '../../content/site';
import { catalogue } from '../../lib/catalog';
import { newIdempotencyKey, submitEnquiry, type SubmitResult } from '../../lib/enquiryClient';
import { paths } from '../../lib/routes';
import { LIMITS, parseEnquiry, UNITS, type FieldErrors } from '../../shared/enquiry';
import { Button } from '../ui/Button';
import { Checkbox, SelectField, TextArea, TextField } from '../ui/Field';
import { Alert, Spinner } from '../ui/Feedback';
import styles from './EnquiryForm.module.css';

type Status =
  | { state: 'idle' }
  | { state: 'submitting' }
  | { state: 'success'; reference: string }
  | { state: 'error'; result: Exclude<SubmitResult, { ok: true }> };

interface EnquiryFormProps {
  kind: 'contact' | 'quote';
  /** Product slug to preselect, e.g. from /request-a-quote?product=slug. */
  defaultProduct?: string;
}

const FIELD_ORDER = [
  'name',
  'company',
  'email',
  'phone',
  'product',
  'quantity',
  'unit',
  'message',
  'consent',
] as const;

export function EnquiryForm({ kind, defaultProduct }: EnquiryFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const startedAt = useRef(0);
  const idempotencyKey = useRef('');
  const lastPayload = useRef<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState<Status>({ state: 'idle' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [messageLength, setMessageLength] = useState(0);

  useEffect(() => {
    startedAt.current = Date.now();
    idempotencyKey.current = newIdempotencyKey();
  }, []);

  useEffect(() => {
    if (status.state === 'success') successRef.current?.focus();
  }, [status.state]);

  const defaultProductName = catalogue.products.find((p) => p.slug === defaultProduct)?.name ?? '';
  const isQuote = kind === 'quote';
  const busy = status.state === 'submitting';

  async function send(payload: Record<string, unknown>) {
    setStatus({ state: 'submitting' });
    const result = await submitEnquiry(payload, idempotencyKey.current);
    if (result.ok) {
      setStatus({ state: 'success', reference: result.reference });
      return;
    }
    if (result.code === 'validation' && result.fields) {
      setErrors(result.fields);
      focusFirstError(result.fields);
    }
    setStatus({ state: 'error', result });
  }

  function focusFirstError(found: FieldErrors) {
    const first = FIELD_ORDER.find((name) => found[name]);
    const element = first ? formRef.current?.elements.namedItem(first) : null;
    if (element instanceof HTMLElement) element.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return; // Duplicate-submission guard.
    const data = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = {
      kind,
      name: data.get('name'),
      company: data.get('company'),
      email: data.get('email'),
      phone: data.get('phone'),
      product: data.get('product'),
      quantity: data.get('quantity') ?? undefined,
      unit: data.get('unit') ?? undefined,
      message: data.get('message'),
      consent: data.get('consent') === 'on',
      website: data.get('website') ?? '',
      startedAt: startedAt.current || Date.now(),
    };

    const parsed = parseEnquiry(payload);
    if (!parsed.success) {
      const found = parsed.errors;
      setErrors(found);
      setStatus({ state: 'idle' });
      focusFirstError(found);
      return;
    }
    setErrors({});
    lastPayload.current = payload;
    await send(payload);
  }

  function reset() {
    setStatus({ state: 'idle' });
    setErrors({});
    setMessageLength(0);
    startedAt.current = Date.now();
    idempotencyKey.current = newIdempotencyKey();
  }

  if (status.state === 'success') {
    return (
      <div className={styles.success}>
        <div className={styles.successMark} aria-hidden="true">
          <svg viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="22" />
            <path d="m15 24.5 6 6 12-13" />
          </svg>
        </div>
        <h2 ref={successRef} tabIndex={-1} className={`display ${styles.successTitle}`}>
          Thank you — your {isQuote ? 'quotation request' : 'enquiry'} has been sent.
        </h2>
        <p>
          Your reference is <strong className={styles.reference}>{status.reference}</strong>. Please
          quote it if you contact us about this request.
        </p>
        <p className={styles.successNote}>
          The Biotonic team will review your details and reply to the email address you provided.
        </p>
        <div className={styles.successActions}>
          <Button variant="secondary" onClick={reset}>
            Send another enquiry
          </Button>
          <Link to={paths.products} className={styles.textLink}>
            Continue browsing products
          </Link>
        </div>
      </div>
    );
  }

  const errorCount = Object.keys(errors).length;
  const failure = status.state === 'error' ? status.result : null;
  const email = show(site.email);

  return (
    <form
      ref={formRef}
      className={styles.form}
      noValidate
      onSubmit={handleSubmit}
      aria-busy={busy}
      aria-describedby="enquiry-required-note"
    >
      <p id="enquiry-required-note" className={styles.requiredNote}>
        Fields marked <span aria-hidden="true">*</span>
        <span className="visually-hidden">with an asterisk</span> are required.
      </p>

      {errorCount > 0 && failure?.code !== 'validation' && (
        <Alert
          tone="error"
          title={`Please check ${errorCount === 1 ? 'one field' : `${errorCount} fields`}.`}
        >
          The highlighted fields need your attention before we can send your{' '}
          {isQuote ? 'request' : 'enquiry'}.
        </Alert>
      )}

      {failure && (
        <Alert
          tone="error"
          title={
            failure.code === 'validation'
              ? 'Please check the highlighted fields.'
              : failure.code === 'rate_limited'
                ? 'Too many attempts'
                : 'Your enquiry has not been sent'
          }
          action={
            failure.code === 'network' ||
            failure.code === 'unavailable' ||
            failure.code === 'server_error' ? (
              <Button
                variant="secondary"
                icon="refresh"
                onClick={() => lastPayload.current && send(lastPayload.current)}
              >
                Try again
              </Button>
            ) : undefined
          }
        >
          <p>{failure.message}</p>
          {failure.code === 'unavailable' && email && (
            <p>
              You can also email us at <a href={`mailto:${email}`}>{email}</a>.
            </p>
          )}
          {failure.code !== 'validation' && <p>Your details are still in the form below.</p>}
        </Alert>
      )}

      <div className={styles.grid}>
        <TextField
          label="Full name"
          name="name"
          autoComplete="name"
          required
          maxLength={LIMITS.name}
          error={errors.name}
        />
        <TextField
          label="Company"
          name="company"
          autoComplete="organization"
          required
          maxLength={LIMITS.company}
          error={errors.company}
        />
        <TextField
          label="Business email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          maxLength={LIMITS.email}
          error={errors.email}
        />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={LIMITS.phone}
          hint="Include the country code, e.g. +91."
          error={errors.phone}
        />

        {catalogue.products.length > 0 ? (
          <SelectField
            label="Product of interest"
            name="product"
            defaultValue={defaultProductName}
            error={errors.product}
            className={isQuote ? undefined : styles.full}
          >
            <option value="">Select a product</option>
            {catalogue.products.map((p) => (
              <option key={p.slug} value={p.name}>
                {p.name}
              </option>
            ))}
            <option value="Other / not listed">Other / not listed</option>
          </SelectField>
        ) : (
          <TextField
            label="Product of interest"
            name="product"
            maxLength={LIMITS.product}
            defaultValue={defaultProductName}
            error={errors.product}
            className={isQuote ? undefined : styles.full}
          />
        )}

        {isQuote && (
          <div className={styles.quantityRow}>
            <TextField
              label="Quantity"
              name="quantity"
              inputMode="decimal"
              maxLength={LIMITS.quantity}
              hint="Per order or per month"
              error={errors.quantity}
            />
            <SelectField label="Unit" name="unit" defaultValue="" error={errors.unit}>
              <option value="">Select</option>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u.charAt(0).toUpperCase() + u.slice(1)}
                </option>
              ))}
            </SelectField>
          </div>
        )}

        <TextArea
          label={isQuote ? 'Requirements' : 'Message'}
          name="message"
          required
          rows={6}
          maxLength={LIMITS.message}
          className={styles.full}
          placeholder={
            isQuote
              ? 'Grade or specification, packaging, delivery location and timing…'
              : 'How can we help?'
          }
          hint={`${messageLength} / ${LIMITS.message} characters`}
          error={errors.message}
          onChange={(e) => setMessageLength(e.target.value.length)}
        />

        {/* Honeypot: hidden from people and assistive technology; bots tend to fill it. */}
        <div className={styles.trap} aria-hidden="true">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>

        <Checkbox
          name="consent"
          className={styles.full}
          error={errors.consent}
          label={
            <>
              I agree that Biotonic may use these details to respond to my{' '}
              {isQuote ? 'request' : 'enquiry'}, as described in the{' '}
              <Link to={paths.privacy}>Privacy Policy</Link>.
            </>
          }
        />
      </div>

      <div className={styles.submitRow}>
        <Button type="submit" size="lg" icon={busy ? undefined : 'arrowRight'} disabled={busy}>
          {busy ? (
            <>
              <Spinner /> Sending…
            </>
          ) : isQuote ? (
            'Request quotation'
          ) : (
            'Send enquiry'
          )}
        </Button>
        <p className={styles.submitNote}>We only use your details to respond to this request.</p>
      </div>
      <p className="visually-hidden" role="status" aria-live="polite">
        {busy ? 'Sending your enquiry…' : ''}
      </p>
    </form>
  );
}
