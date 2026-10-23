import type { Enquiry } from '../src/shared/enquiry';
import type { ServerConfig } from './config';

export interface OutgoingMail {
  from: string;
  to: string;
  replyTo: { name: string; address: string };
  subject: string;
  text: string;
}

/** Delivers an enquiry. Resolves only after the provider accepted the message. */
export interface Mailer {
  readonly name: string;
  send(mail: OutgoingMail): Promise<void>;
}

export function composeEnquiryMail(
  enquiry: Enquiry,
  reference: string,
  addresses: { from: string; to: string },
): OutgoingMail {
  const kind = enquiry.kind === 'quote' ? 'Quotation request' : 'Website enquiry';
  const quantity = [enquiry.quantity, enquiry.unit].filter(Boolean).join(' ');
  const rows: [string, string | undefined][] = [
    ['Reference', reference],
    ['Type', kind],
    ['Name', enquiry.name],
    ['Company', enquiry.company],
    ['Email', enquiry.email],
    ['Phone', enquiry.phone],
    ['Product', enquiry.product],
    ['Quantity', quantity || undefined],
  ];
  const text = [
    ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
    '',
    'Message:',
    enquiry.message,
    '',
    '— Sent from the Biotonic website enquiry form. Reply to this email to respond to the sender.',
  ].join('\n');

  // Plain text only. All values were normalised server-side (no CR/LF in single-line fields),
  // and nodemailer encodes header values, so user input cannot inject headers.
  return {
    from: addresses.from,
    to: addresses.to,
    replyTo: { name: enquiry.name, address: enquiry.email },
    subject: `${kind} from ${enquiry.company} [${reference}]`,
    text,
  };
}

/**
 * Resend (https://resend.com) HTTP API transport. Uses only `fetch`, so it works on the Node
 * server and on Cloudflare Workers. The API key is a server-side secret.
 */
export function createResendMailer(
  config: Extract<ServerConfig['mail'], { transport: 'resend' }>,
  fetchImpl: typeof fetch = fetch,
): Mailer {
  return {
    name: 'resend',
    async send(mail) {
      // Name is already CR/LF-free (normalised); strip quotes so it stays one display name.
      const replyName = mail.replyTo.name.replace(/["\\<>]/g, '');
      const response = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: mail.from,
          to: [mail.to],
          reply_to: `"${replyName}" <${mail.replyTo.address}>`,
          subject: mail.subject,
          text: mail.text,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        const error = new Error(`Resend responded ${response.status}`);
        error.name = `ResendHttp${response.status}`;
        throw error;
      }
    },
  };
}

/** Development/test transport: records messages in memory instead of sending them. */
export function createCaptureMailer(): Mailer & { outbox: OutgoingMail[] } {
  const outbox: OutgoingMail[] = [];
  return {
    name: 'capture',
    outbox,
    async send(mail) {
      outbox.push(mail);
    },
  };
}
