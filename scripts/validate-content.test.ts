import { describe, expect, it } from 'vitest';
import { checkContent } from './validate-content';

describe('content validation', () => {
  it('passes in draft mode while reporting pending items', () => {
    const report = checkContent(false, undefined);
    expect(report.errors).toEqual([]);
    expect(report.blocking).toEqual([]);
    expect(report.pending.length).toBeGreaterThan(0);
  });

  it('blocks a release while launch-critical facts are unconfirmed', () => {
    const report = checkContent(true, 'http://localhost:8787');
    expect(report.blocking.join('\n')).toMatch(/VITE_SITE_URL/);
    expect(report.blocking.join('\n')).toMatch(/site\.email/);
    expect(report.blocking.join('\n')).toMatch(/privacyPolicy\.approved/);
  });
});
