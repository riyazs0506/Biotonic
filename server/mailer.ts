import nodemailer from 'nodemailer';
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

export function createSmtpMailer(
  config: Extract<ServerConfig['mail'], { transport: 'smtp' }>,
): Mailer {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: !config.secure,
    auth: config.user ? { user: config.user, pass: config.pass } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return {
    name: 'smtp',
    async send(mail) {
      const info = await transporter.sendMail({
        ...mail,
        disableFileAccess: true,
        disableUrlAccess: true,
      });
      if (!info.accepted?.length) throw new Error('SMTP server did not accept the recipient');
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

export function createMailer(config: ServerConfig['mail']): Mailer | null {
  switch (config.transport) {
    case 'smtp':
      return createSmtpMailer(config);
    case 'capture':
      return createCaptureMailer();
    case 'disabled':
      return null;
  }
}
