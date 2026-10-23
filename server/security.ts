import type { MiddlewareHandler } from 'hono';
import type { ServerConfig } from './config';

/**
 * Content Security Policy. The site ships only same-origin scripts, styles and fonts.
 * JSON-LD blocks are data (type="application/ld+json") and are not executed, so no
 * 'unsafe-inline' is required.
 */
export function contentSecurityPolicy(config: ServerConfig): string {
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

export function securityHeaders(config: ServerConfig): MiddlewareHandler {
  const csp = contentSecurityPolicy(config);
  return async (c, next) => {
    await next();
    const h = c.res.headers;
    h.set('Content-Security-Policy', csp);
    h.set('X-Content-Type-Options', 'nosniff');
    h.set('X-Frame-Options', 'DENY');
    h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    h.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
    );
    h.set('Cross-Origin-Opener-Policy', 'same-origin');
    h.set('Cross-Origin-Resource-Policy', 'same-origin');
    h.delete('X-Powered-By');
    if (config.forceHttps) {
      h.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
    }
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
