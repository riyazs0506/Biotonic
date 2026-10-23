import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EnquiryForm } from './EnquiryForm';

function renderForm(kind: 'contact' | 'quote' = 'contact') {
  const router = createMemoryRouter([{ path: '/', element: <EnquiryForm kind={kind} /> }]);
  return render(<RouterProvider router={router} />);
}

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Full name/), 'Asha Rao');
  await user.type(screen.getByLabelText(/Company/), 'Acme Coatings');
  await user.type(screen.getByLabelText(/Business email/), 'asha@acme.example');
  await user.type(screen.getByLabelText(/^Message/), 'Please share availability for our plant.');
  await user.click(screen.getByRole('checkbox'));
}

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe('EnquiryForm', () => {
  it('shows accessible errors and focuses the first invalid field without calling the server', async () => {
    const fetchMock = mockFetch(200, { ok: true, reference: 'BT-X' });
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    const name = screen.getByLabelText(/Full name/);
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription('Please enter your name.');
    expect(name).toHaveFocus();
    expect(screen.getByText(/Please check 5 fields/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows success only after the server confirms, with the reference number', async () => {
    const fetchMock = mockFetch(200, { ok: true, reference: 'BT-1A2B3C4D5E' });
    const user = userEvent.setup();
    renderForm();
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    expect(await screen.findByRole('heading', { name: /enquiry has been sent/i })).toHaveFocus();
    expect(screen.getByText('BT-1A2B3C4D5E')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/enquiry');
    expect((init.headers as Record<string, string>)['Idempotency-Key']).toMatch(/.{16,}/);
    expect(JSON.parse(init.body as string)).toMatchObject({
      kind: 'contact',
      consent: true,
      website: '',
    });
  });

  it('keeps the data and offers a retry when the service is unavailable', async () => {
    mockFetch(503, {
      ok: false,
      code: 'unavailable',
      message: 'Online enquiries are temporarily unavailable.',
    });
    const user = userEvent.setup();
    renderForm();
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/has not been sent/);
    expect(alert).toHaveTextContent(/temporarily unavailable/);
    expect(screen.getByLabelText(/Full name/)).toHaveValue('Asha Rao');
    expect(screen.queryByText(/has been sent/)).not.toBeInTheDocument();

    const fetchMock = mockFetch(200, { ok: true, reference: 'BT-RETRY00001' });
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByText('BT-RETRY00001')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reports network failures without claiming success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const user = userEvent.setup();
    renderForm();
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach our server/i);
  });

  it('disables the submit button while sending to prevent duplicates', async () => {
    let resolve: (r: Response) => void = () => {};
    const fetchMock = vi.fn().mockReturnValue(new Promise<Response>((r) => (resolve = r)));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderForm();
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    const button = screen.getByRole('button', { name: /sending/i });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolve(
      new Response(JSON.stringify({ ok: true, reference: 'BT-0000000001' }), { status: 200 }),
    );
    await waitFor(() => expect(screen.getByText('BT-0000000001')).toBeInTheDocument());
  });

  it('shows server-side field errors', async () => {
    mockFetch(400, {
      ok: false,
      code: 'validation',
      message: 'Please correct the highlighted fields.',
      fields: { email: 'Please enter a valid email address, e.g. name@company.com.' },
    });
    const user = userEvent.setup();
    renderForm();
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));
    await waitFor(() =>
      expect(screen.getByLabelText(/Business email/)).toHaveAccessibleDescription(/valid email/),
    );
  });

  it('quote form includes quantity and unit fields', () => {
    renderForm('quote');
    expect(screen.getByLabelText(/Quantity/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Unit/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request quotation/i })).toBeInTheDocument();
  });
});
