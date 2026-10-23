import nodemailer from 'nodemailer';
import type { ServerConfig } from './config';
import { createCaptureMailer, createResendMailer, type Mailer } from './mailer';

/** SMTP transport (Node only — Cloudflare Workers cannot open SMTP connections). */
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

/** Mailer for the Node server: SMTP, Resend, in-memory capture (dev/test) or none. */
export function createMailer(config: ServerConfig['mail']): Mailer | null {
  switch (config.transport) {
    case 'smtp':
      return createSmtpMailer(config);
    case 'resend':
      return createResendMailer(config);
    case 'capture':
      return createCaptureMailer();
    case 'disabled':
      return null;
  }
}
