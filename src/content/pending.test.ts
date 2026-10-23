import { describe, expect, it } from 'vitest';
import { collectPending, confirmed, isPending, pending } from './pending';

describe('pending content markers', () => {
  it('distinguishes pending values from confirmed ones', () => {
    expect(isPending(pending('x'))).toBe(true);
    expect(isPending('value')).toBe(false);
    expect(isPending(null)).toBe(false);
    expect(confirmed(pending('x'))).toBeUndefined();
    expect(confirmed('value')).toBe('value');
  });

  it('collects every pending marker with its path', () => {
    const content = { a: pending('A'), b: { c: [1, pending('C')] }, d: 'ok' };
    expect(collectPending(content)).toEqual([
      { path: 'a', note: 'A' },
      { path: 'b.c[1]', note: 'C' },
    ]);
  });
});
