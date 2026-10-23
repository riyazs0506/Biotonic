/**
 * In-memory fixed-window rate limiter.
 *
 * Suitable for a single server instance. When running several instances behind a load
 * balancer, replace with a shared store (e.g. Redis) or the platform's rate limiting —
 * see docs/SECURITY.md.
 */
export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export class RateLimiter {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  check(key: string): RateLimitResult {
    const now = this.now();
    if (this.hits.size > 10_000) this.prune(now);
    const entry = this.hits.get(key);
    if (!entry || entry.resetAt <= now) {
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }
    entry.count += 1;
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: entry.count <= this.max, retryAfterSeconds };
  }

  private prune(now: number): void {
    for (const [key, entry] of this.hits) if (entry.resetAt <= now) this.hits.delete(key);
  }
}

/** Remembers recently completed submissions so a retried request is not delivered twice. */
export class IdempotencyCache {
  private readonly entries = new Map<string, { reference: string; expiresAt: number }>();

  constructor(
    private readonly ttlMs = 15 * 60_000,
    private readonly now: () => number = Date.now,
  ) {}

  get(key: string): string | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.reference;
  }

  set(key: string, reference: string): void {
    if (this.entries.size > 5_000) {
      const now = this.now();
      for (const [k, e] of this.entries) if (e.expiresAt <= now) this.entries.delete(k);
    }
    this.entries.set(key, { reference, expiresAt: this.now() + this.ttlMs });
  }
}
