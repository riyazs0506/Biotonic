import * as z from 'zod/mini';

/**
 * Enquiry contract shared by the browser form (for usability) and the server
 * (the security boundary). The server always re-validates; client checks are a convenience.
 * Uses `zod/mini` so the browser bundle only carries the validators it needs.
 */
export const LIMITS = {
  name: 100,
  company: 120,
  email: 254,
  phone: 25,
  product: 120,
  quantity: 40,
  message: 2000,
} as const;

export const UNITS = ['kg', 'litres', 'tonnes', 'drums', 'containers', 'other'] as const;
export const ENQUIRY_KINDS = ['contact', 'quote'] as const;

/** Minimum time a human plausibly needs to complete the form. */
export const MIN_FILL_MS = 2500;
/** Form tokens older than this are rejected (stale tab or replay). */
export const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;

// Control characters plus the Unicode line/paragraph separators (U+2028, U+2029).
/* eslint-disable no-control-regex -- intentionally matches control characters */
const CONTROL_CHARS = new RegExp(
  '[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F\\u2028\\u2029]',
  'g',
);
/* eslint-enable no-control-regex */

/** Single-line fields: strip control characters and line breaks, collapse whitespace. */
export function normaliseLine(value: string): string {
  return value
    .normalize('NFC')
    .replace(CONTROL_CHARS, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Multi-line fields: normalise line endings, strip control characters, limit blank lines. */
export function normaliseText(value: string): string {
  return value
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(CONTROL_CHARS, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const SINGLE_LINE = [
  'kind',
  'name',
  'company',
  'email',
  'phone',
  'product',
  'quantity',
  'unit',
  'website',
] as const;

/**
 * Normalises untrusted input before validation. Unknown keys are dropped; empty strings
 * become `undefined` so optional fields validate cleanly and required fields report "missing".
 */
export function normaliseEnquiry(raw: unknown): Record<string, unknown> {
  const input = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const out: Record<string, unknown> = {};
  for (const key of SINGLE_LINE) {
    const value = input[key];
    if (typeof value === 'string') {
      const clean = normaliseLine(value);
      if (clean !== '') out[key] = key === 'email' ? clean.toLowerCase() : clean;
    } else if (value !== undefined && value !== null) {
      out[key] = value;
    }
  }
  if (typeof input.message === 'string') {
    const message = normaliseText(input.message);
    if (message !== '') out.message = message;
  } else if (input.message !== undefined) {
    out.message = input.message;
  }
  out.consent = input.consent;
  out.startedAt = input.startedAt;
  return out;
}

const tooLong = (max: number) => `Please keep this under ${max} characters.`;

const required = (label: string, min: number, max: number) =>
  z
    .string({ error: `Please enter your ${label}.` })
    .check(
      z.minLength(min, `Please enter at least ${min} characters.`),
      z.maxLength(max, tooLong(max)),
    );

const optionalText = (max: number) => z.optional(z.string().check(z.maxLength(max, tooLong(max))));

export const enquirySchema = z.object({
  kind: z.enum(ENQUIRY_KINDS),
  name: required('name', 2, LIMITS.name),
  company: required('company name', 2, LIMITS.company),
  email: z
    .email({
      error: (issue) =>
        issue.input === undefined
          ? 'Please enter your business email.'
          : 'Please enter a valid email address, e.g. name@company.com.',
    })
    .check(z.maxLength(LIMITS.email, 'Please enter a shorter email address.')),
  phone: z.optional(
    z
      .string()
      .check(
        z.maxLength(LIMITS.phone, tooLong(LIMITS.phone)),
        z.regex(
          /^\+?[0-9][0-9\s().-]{5,23}$/,
          'Please enter a valid phone number, including the country code.',
        ),
      ),
  ),
  product: optionalText(LIMITS.product),
  quantity: optionalText(LIMITS.quantity),
  unit: z.optional(z.enum(UNITS)),
  message: z
    .string({ error: 'Please tell us about your requirements.' })
    .check(
      z.minLength(10, 'Please add a little more detail (at least 10 characters).'),
      z.maxLength(LIMITS.message, `Please keep your message under ${LIMITS.message} characters.`),
    ),
  consent: z.literal(true, { error: 'Please confirm you have read the Privacy Policy.' }),
  /** Honeypot — real visitors never see or fill this field. */
  website: z.optional(z.string().check(z.maxLength(0))),
  /** Epoch ms when the form was rendered; used to reject instant bot submissions. */
  startedAt: z.int().check(z.positive()),
});

export type Enquiry = z.infer<typeof enquirySchema>;
export type FieldErrors = Partial<Record<keyof Enquiry, string>>;

export type ParseResult =
  { success: true; data: Enquiry } | { success: false; errors: FieldErrors };

/** Normalise and validate. Returns the first message per field. */
export function parseEnquiry(raw: unknown): ParseResult {
  const result = enquirySchema.safeParse(normaliseEnquiry(raw));
  if (result.success) return { success: true, data: result.data };
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof Enquiry | undefined;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { success: false, errors };
}

/** Response shape returned by POST /api/enquiry. */
export type EnquiryResponse =
  | { ok: true; reference: string }
  | {
      ok: false;
      code: 'validation' | 'rate_limited' | 'rejected' | 'unavailable' | 'server_error';
      message: string;
      fields?: FieldErrors;
      retryAfterSeconds?: number;
    };
