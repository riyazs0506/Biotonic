import { serve } from '@hono/node-server';
import { createApp } from './app';
import { loadConfig } from './config';
import { createMailer } from './smtp';

/**
 * Development API server used behind the Vite dev proxy (`npm run dev` + `npm run dev:server`).
 * Defaults to the in-memory capture transport so the form can be exercised locally without
 * sending email. Messages are NOT delivered anywhere in this mode.
 */
const config = loadConfig({
  MAIL_TRANSPORT: 'capture',
  ALLOWED_ORIGINS: 'http://localhost:5173',
  ...process.env,
  NODE_ENV: 'development',
});
const mailer = createMailer(config.mail);
const app = createApp({ config, mailer });

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`Enquiry API (dev, mail transport: ${config.mail.transport}) on :${info.port}`);
});
