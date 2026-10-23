import { z } from 'zod';

/**
 * Server configuration, read once from environment variables. Secrets (SMTP credentials)
 * and the enquiry recipient exist only here and are never sent to the browser.
 */
const bool = z
  .enum(['true', 'false', '1', '0', ''])
  .optional()
  .transform((v) => v === 'true' || v === '1');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(8787),
  HOST: z.string().default('0.0.0.0'),
  /** Public origin of the site, e.g. https://www.example.com — used for the Origin check. */
  SITE_URL: z.url().optional(),
  /** Additional allowed origins (comma separated), e.g. a staging domain. */
  ALLOWED_ORIGINS: z.string().optional(),
  /** Set when running behind a reverse proxy / load balancer that sets X-Forwarded-*. */
  TRUST_PROXY: bool,
  /** Redirect HTTP to HTTPS (based on X-Forwarded-Proto) and send HSTS. */
  FORCE_HTTPS: bool,

  MAIL_TRANSPORT: z.enum(['smtp', 'resend', 'disabled', 'capture']).default('disabled'),
  /** API key for MAIL_TRANSPORT=resend (secret). */
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().optional(),
  SMTP_SECURE: bool,
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  /** Verified sender address, e.g. "Biotonic Website <website@example.com>". */
  MAIL_FROM: z.string().optional(),
  /** Fixed recipient for enquiries. Never taken from the request. */
  ENQUIRY_TO: z.string().optional(),

  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_GLOBAL_PER_HOUR: z.coerce.number().int().positive().default(200),
});

export type ServerEnv = z.infer<typeof envSchema>;

export interface ServerConfig {
  env: ServerEnv['NODE_ENV'];
  port: number;
  host: string;
  allowedOrigins: string[];
  trustProxy: boolean;
  forceHttps: boolean;
  mail:
    | { transport: 'disabled' }
    | { transport: 'capture'; to: string; from: string }
    | { transport: 'resend'; apiKey: string; from: string; to: string }
    | {
        transport: 'smtp';
        host: string;
        port: number;
        secure: boolean;
        user?: string;
        pass?: string;
        from: string;
        to: string;
      };
  rateLimit: { max: number; windowMs: number; globalPerHour: number };
}

export function loadConfig(source: Record<string, string | undefined> = process.env): ServerConfig {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    // Report which variables are wrong without echoing their values.
    const keys = parsed.error.issues.map((i) => i.path.join('.')).join(', ');
    throw new Error(`Invalid server environment: ${keys}`);
  }
  const env = parsed.data;

  const origins = [env.SITE_URL, ...(env.ALLOWED_ORIGINS?.split(',') ?? [])]
    .map((o) => o?.trim().replace(/\/+$/, ''))
    .filter((o): o is string => Boolean(o));

  let mail: ServerConfig['mail'] = { transport: 'disabled' };
  if (env.MAIL_TRANSPORT === 'smtp') {
    const { SMTP_HOST: host, MAIL_FROM: from, ENQUIRY_TO: to } = env;
    if (!host || !from || !to) {
      const missing = Object.entries({ SMTP_HOST: host, MAIL_FROM: from, ENQUIRY_TO: to })
        .filter(([, v]) => !v)
        .map(([k]) => k);
      throw new Error(`MAIL_TRANSPORT=smtp requires: ${missing.join(', ')}`);
    }
    mail = {
      transport: 'smtp',
      host,
      port: env.SMTP_PORT ?? (env.SMTP_SECURE ? 465 : 587),
      secure: env.SMTP_SECURE,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
      from,
      to,
    };
  } else if (env.MAIL_TRANSPORT === 'resend') {
    const { RESEND_API_KEY: apiKey, MAIL_FROM: from, ENQUIRY_TO: to } = env;
    if (!apiKey || !from || !to) {
      const missing = Object.entries({ RESEND_API_KEY: apiKey, MAIL_FROM: from, ENQUIRY_TO: to })
        .filter(([, v]) => !v)
        .map(([k]) => k);
      throw new Error(`MAIL_TRANSPORT=resend requires: ${missing.join(', ')}`);
    }
    mail = { transport: 'resend', apiKey, from, to };
  } else if (env.MAIL_TRANSPORT === 'capture') {
    if (env.NODE_ENV === 'production') {
      throw new Error('MAIL_TRANSPORT=capture is for development and tests only');
    }
    mail = {
      transport: 'capture',
      to: env.ENQUIRY_TO ?? 'enquiries@localhost.test',
      from: env.MAIL_FROM ?? 'website@localhost.test',
    };
  }

  if (env.NODE_ENV === 'production' && origins.length === 0) {
    throw new Error('SITE_URL is required in production');
  }

  return {
    env: env.NODE_ENV,
    port: env.PORT,
    host: env.HOST,
    allowedOrigins: origins,
    trustProxy: env.TRUST_PROXY,
    forceHttps: env.FORCE_HTTPS,
    mail,
    rateLimit: {
      max: env.RATE_LIMIT_MAX,
      windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60_000,
      globalPerHour: env.RATE_LIMIT_GLOBAL_PER_HOUR,
    },
  };
}
