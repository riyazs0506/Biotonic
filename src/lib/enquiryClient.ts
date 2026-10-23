import type { EnquiryResponse } from '../shared/enquiry';

export type SubmitResult = EnquiryResponse | { ok: false; code: 'network'; message: string };

/**
 * Posts an enquiry to the server. Success is reported only when the server confirms the
 * message was accepted by the email provider.
 */
export async function submitEnquiry(
  payload: Record<string, unknown>,
  idempotencyKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<SubmitResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetchImpl('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const body = (await response.json().catch(() => null)) as EnquiryResponse | null;
    if (body && typeof body.ok === 'boolean') {
      // Defend against a proxy returning 200 with an unexpected body.
      if (body.ok && !response.ok) {
        return { ok: false, code: 'server_error', message: 'Unexpected response from the server.' };
      }
      return body;
    }
    return {
      ok: false,
      code: response.status === 503 || response.status === 502 ? 'unavailable' : 'server_error',
      message: 'Our enquiry service is not responding right now.',
    };
  } catch {
    return {
      ok: false,
      code: 'network',
      message: 'We could not reach our server. Please check your connection and try again.',
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}-key`;
}
