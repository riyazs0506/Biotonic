// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { loadConfig } from './config';
import { createResendMailer, type OutgoingMail } from './mailer';

const mail: OutgoingMail = {
  from: 'Biotonic Website <website@biotonic.test>',
  to: 'sales@biotonic.test',
  replyTo: { name: 'Asha "The Buyer" Rao', address: 'asha@acme.example' },
  subject: 'Website enquiry from Acme [BT-0000000001]',
  text: 'Hello',
};
const config = {
  transport: 'resend' as const,
  apiKey: 're_test_key',
  from: mail.from,
  to: mail.to,
};

describe('Resend transport', () => {
  it('posts the message to the Resend API with the server-side key', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"id":"x"}', { status: 200 }));
    await createResendMailer(config, fetchMock).send(mail);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer re_test_key');
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({ from: mail.from, to: ['sales@biotonic.test'], text: 'Hello' });
    // Quotes are stripped from the display name so it cannot break the header.
    expect(body.reply_to).toBe('"Asha The Buyer Rao" <asha@acme.example>');
  });

  it('throws when Resend rejects the message, so the API never reports false success', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 422 }));
    await expect(createResendMailer(config, fetchMock).send(mail)).rejects.toThrow(/422/);
  });

  it('config requires the key, sender and recipient', () => {
    expect(() =>
      loadConfig({ NODE_ENV: 'production', SITE_URL: 'https://x.test', MAIL_TRANSPORT: 'resend' }),
    ).toThrow(/RESEND_API_KEY, MAIL_FROM, ENQUIRY_TO/);
  });
});
