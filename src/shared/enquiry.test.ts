import { describe, expect, it } from 'vitest';
import { normaliseEnquiry, parseEnquiry } from './enquiry';

const valid = {
  kind: 'quote',
  name: 'Asha Rao',
  company: 'Acme Coatings',
  email: 'Asha@Acme.example',
  phone: '+91 98765 43210',
  product: 'Sample Product A',
  quantity: '200',
  unit: 'kg',
  message: 'We need a monthly supply for our plant.',
  consent: true,
  website: '',
  startedAt: 1_700_000_000_000,
};

describe('enquiry validation', () => {
  it('accepts a complete enquiry and normalises the email', () => {
    const result = parseEnquiry(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('asha@acme.example');
  });

  it('strips CR/LF from single-line fields so they cannot inject email headers', () => {
    const result = parseEnquiry({ ...valid, company: 'Acme\r\nBcc: victim@example.com' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company).not.toMatch(/[\r\n]/);
      expect(result.data.company).toBe('Acme Bcc: victim@example.com');
    }
  });

  it('rejects an email address containing a line break', () => {
    const result = parseEnquiry({ ...valid, email: 'a@b.com\nBcc: x@y.com' });
    expect(result.success).toBe(false);
  });

  it('reports a friendly message per missing required field', () => {
    const result = parseEnquiry({ kind: 'contact', startedAt: 1, consent: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.name).toBe('Please enter your name.');
      expect(result.errors.email).toBe('Please enter your business email.');
      expect(result.errors.message).toBe('Please tell us about your requirements.');
      expect(result.errors.consent).toMatch(/Privacy Policy/);
    }
  });

  it('enforces length limits', () => {
    const result = parseEnquiry({ ...valid, message: 'x'.repeat(2001) });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.message).toMatch(/under 2000/);
  });

  it('rejects an invalid phone number but allows it to be omitted', () => {
    expect(parseEnquiry({ ...valid, phone: 'call me' }).success).toBe(false);
    expect(parseEnquiry({ ...valid, phone: '' }).success).toBe(true);
  });

  it('flags a filled honeypot field', () => {
    const result = parseEnquiry({ ...valid, website: 'https://spam.example' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.website).toBeDefined();
  });

  it('drops unknown keys and control characters', () => {
    const out = normaliseEnquiry({ ...valid, admin: true, name: 'Asha\u0000 Rao ' });
    expect(out).not.toHaveProperty('admin');
    expect(out.name).toBe('Asha Rao');
  });
});
