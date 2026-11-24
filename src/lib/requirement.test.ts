import { describe, expect, it } from 'vitest';
import {
  ADVISE,
  composeSentence,
  defaultRequirement,
  needOptions,
  parseRequirement,
  quoteHref,
  whatsappMessage,
} from './requirement';

describe('hero requirement builder', () => {
  it('offers catalogue products for a market, plus "your recommendation"', () => {
    const options = needOptions('industrial');
    expect(options.map((o) => o.label)).toEqual([
      'Monoethylene Glycol (MEG)',
      'Diethylene Glycol (DEG)',
      'your recommendation',
    ]);
    expect(options.at(-1)?.value).toBe(ADVISE);
  });

  it('composes a natural sentence and WhatsApp message', () => {
    const req = { ...defaultRequirement('textile'), quantity: 'trial', frequency: 'once' };
    expect(composeSentence(req)).toBe(
      "I'm buying for a textile processing unit and need Pigment Printing Emulsion, about a trial quantity as a one-time order.",
    );
    expect(whatsappMessage({ ...req, need: ADVISE })).toContain(
      'need your recommendation on the right product',
    );
  });

  it('builds a quote link from option keys only', () => {
    const href = quoteHref(defaultRequirement('construction'));
    expect(href).toBe(
      '/request-a-quote?product=waterproofing-coating&market=construction&qty=100-500kg&freq=monthly',
    );
  });

  it('reads a builder link back, ignoring anything it does not recognise', () => {
    const ok = parseRequirement(
      new URLSearchParams('product=acetone-fake&market=industrial&qty=5t-plus&freq=weekly'),
    );
    // Unknown product falls back to "your recommendation"; known keys are kept.
    expect(ok.message).toBe(
      "I'm buying for manufacturing and need your recommendation on the right product, about 5+ tonnes every week.",
    );
    expect(ok.quantity).toBe('5+ tonnes');

    const tampered = parseRequirement(
      new URLSearchParams('market=industrial&qty=<script>&freq=hourly'),
    );
    expect(tampered.message).not.toMatch(/script|hourly/);
    expect(tampered.quantity).toBeUndefined();

    expect(parseRequirement(new URLSearchParams('market=unknown'))).toEqual({});
  });
});
