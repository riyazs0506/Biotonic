import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import { createApp } from './app';
import { loadConfig } from './config';
import { createMailer } from './smtp';

/** Production entry: serves the prerendered site and the enquiry API. */
const config = loadConfig();
const mailer = createMailer(config.mail);
const here = path.dirname(fileURLToPath(import.meta.url));
const staticRoot = path.resolve(here, '../client');

const app = createApp({ config, mailer, staticRoot });

serve({ fetch: app.fetch, port: config.port, hostname: config.host }, (info) => {
  console.log(
    JSON.stringify({
      event: 'server_started',
      port: info.port,
      env: config.env,
      mail: config.mail.transport,
    }),
  );
  if (config.mail.transport === 'disabled') {
    console.warn(
      JSON.stringify({
        event: 'mail_not_configured',
        detail: 'Enquiry form will return 503 until MAIL_TRANSPORT=smtp is configured.',
      }),
    );
  }
});
