import { show } from '../content/pending';
import { site } from '../content/site';

export const WHATSAPP_GREETING = 'Hello Biotonic, I would like a quote for ';

/**
 * WhatsApp click-to-chat link with an optional prefilled message, or `undefined` when no
 * number is available (release builds until the client confirms the business number).
 */
export function whatsappHref(text = WHATSAPP_GREETING): string | undefined {
  const number = show(site.whatsapp)?.replace(/\D/g, '');
  if (!number) return undefined;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
