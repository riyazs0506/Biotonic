import type { MiddlewareHandler } from 'hono';
import type { ServerConfig } from './config';

/**
 * Content Security Policy. The site ships only same-origin scripts, styles and fonts.
 * JSON-LD blocks are data (type="application/ld+json") and are not executed, so no
 * 'unsafe-inline' is required.
 */
export function contentSecurityPolicy(config: Pick<ServerConfig, 'forceHttps'>): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  if (config.forceHttps) directives.push('upgrade-insecure-requests');
  return directives.join('; ');
}

/**
 * Security headers for every response. Shared by the Hono middleware (Node server, Worker API)
 * and by the prerender step, which writes them to Cloudflare's `_headers` file for static pages.
 */
export function securityHeaderEntries(
  config: Pick<ServerConfig, 'forceHttps'>,
): Record<string, string> {
  return {
    'Content-Security-Policy': contentSecurityPolicy(config),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    ...(config.forceHttps
      ? { 'Strict-Transport-Security': 'max-age=63072000; includeSubDomains' }
      : {}),
  };
}

export function securityHeaders(config: ServerConfig): MiddlewareHandler {
  const entries = Object.entries(securityHeaderEntries(config));
  return async (c, next) => {
    await next();
    for (const [name, value] of entries) c.res.headers.set(name, value);
    c.res.headers.delete('X-Powered-By');
  };
}

/** Redirects plain-HTTP requests to HTTPS when running behind a TLS-terminating proxy. */
export function httpsRedirect(config: ServerConfig): MiddlewareHandler {
  return async (c, next) => {
    if (!config.forceHttps) return next();
    const proto = config.trustProxy ? c.req.header('x-forwarded-proto') : undefined;
    const url = new URL(c.req.url);
    const isHttps = proto ? proto.split(',')[0]?.trim() === 'https' : url.protocol === 'https:';
    if (isHttps) return next();
    // Never trust the Host header for the redirect target; use the configured origin.
    const origin = config.allowedOrigins[0];
    if (!origin) return next();
    return c.redirect(`${origin}${url.pathname}${url.search}`, 301);
  };
}
