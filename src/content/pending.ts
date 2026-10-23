import { IS_RELEASE } from '../lib/env';

/**
 * Content-integrity primitives.
 *
 * Any fact the client has not yet confirmed is stored as `pending('what is needed', demo)`.
 * - Draft builds (client review) show the optional `demo` value so pages look complete.
 * - Release builds never show demo values: the value renders nothing, sections that depend
 *   on it are hidden, and `npm run content:check` fails if a launch-critical value is pending.
 * Demo values are illustrative only — replace each `pending(...)` with the approved fact.
 */
export const PLACEHOLDER_LABEL = '[CLIENT TO CONFIRM]';

export interface Pending<T = unknown> {
  readonly __pending: true;
  /** What the client needs to supply, e.g. "Registered business address". */
  readonly note: string;
  /** Illustrative value shown in draft builds only. */
  readonly demo?: T;
}

export type Confirmable<T> = T | Pending<T>;

export function pending<T = never>(note: string, demo?: T): Pending<T> {
  return demo === undefined ? { __pending: true, note } : { __pending: true, note, demo };
}

export function isPending(value: unknown): value is Pending<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { __pending?: unknown }).__pending === true
  );
}

export function isConfirmed<T>(value: Confirmable<T>): value is T {
  return !isPending(value);
}

/** Returns the confirmed value or `undefined`. */
export function confirmed<T>(value: Confirmable<T>): T | undefined {
  return isPending(value) ? undefined : value;
}

/**
 * The value to display: the confirmed value; in draft builds the demo value; otherwise
 * `undefined`. Empty arrays count as nothing to show.
 */
export function show<T>(value: Confirmable<T>, release = IS_RELEASE): T | undefined {
  const out = isPending(value) ? (release ? undefined : (value as Pending<T>).demo) : value;
  return Array.isArray(out) && out.length === 0 ? undefined : out;
}

/** Recursively collects every pending marker in a content object, with its path. */
export function collectPending(value: unknown, path = ''): { path: string; note: string }[] {
  if (isPending(value)) return [{ path, note: value.note }];
  if (Array.isArray(value)) return value.flatMap((v, i) => collectPending(v, `${path}[${i}]`));
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([k, v]) => collectPending(v, path ? `${path}.${k}` : k));
  }
  return [];
}
