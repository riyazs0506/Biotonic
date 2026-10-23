import { expect, hydrated, test } from './fixtures';

test.describe('enquiry and quotation forms', () => {
  test('client-side validation explains every problem', async ({ page }) => {
    await page.goto('/contact');
    await hydrated(page);
    await page.getByRole('button', { name: 'Send enquiry' }).click();
    await expect(page.getByRole('textbox', { name: /^Full name/ })).toBeFocused();
    await expect(page.getByRole('textbox', { name: /^Full name/ })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await expect(page.getByText('Please enter your business email.')).toBeVisible();
    await expect(page.getByText(/Please confirm you have read the Privacy Policy/)).toBeVisible();
  });

  test('a quotation request is delivered and confirmed with a reference', async ({ page }) => {
    await page.goto('/request-a-quote');
    await hydrated(page);
    await page.getByRole('textbox', { name: /^Full name/ }).fill('Asha Rao');
    await page.getByRole('textbox', { name: /^Company/ }).fill('Acme Coatings');
    await page.getByRole('textbox', { name: /^Business email/ }).fill('asha@acme.example');
    await page.getByLabel(/Product of interest/).selectOption({ label: 'Caustic Soda Flakes' });
    await page.getByLabel(/Quantity/).fill('500');
    await page.getByLabel(/^Unit/).selectOption('kg');
    await page
      .getByLabel(/Requirements/)
      .fill('Monthly supply, 25 kg bags, delivered to our plant.');
    await page.getByRole('checkbox').check();
    // The server rejects forms submitted faster than a person could (anti-bot timing check).
    await page.waitForTimeout(2600);

    const responsePromise = page.waitForResponse('/api/enquiry');
    await page.getByRole('button', { name: 'Request quotation' }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    await expect(
      page.getByRole('heading', { name: /quotation request has been sent/ }),
    ).toBeVisible();
    await expect(page.getByText(/^BT-[0-9A-F]{10}$/)).toBeVisible();
  });

  test('service failures keep the data and offer a working retry', async ({ page }) => {
    let calls = 0;
    await page.route('/api/enquiry', async (route) => {
      calls += 1;
      if (calls === 1) {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: false,
            code: 'unavailable',
            message: 'We could not send your enquiry just now. Please try again in a few minutes.',
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, reference: 'BT-ABCDEF0123' }),
        });
      }
    });

    await page.goto('/contact');
    await hydrated(page);
    await page.getByRole('textbox', { name: /^Full name/ }).fill('Asha Rao');
    await page.getByRole('textbox', { name: /^Company/ }).fill('Acme Coatings');
    await page.getByRole('textbox', { name: /^Business email/ }).fill('asha@acme.example');
    await page.getByLabel(/^Message/).fill('Do you supply in bulk containers?');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Send enquiry' }).click();

    await expect(page.getByRole('alert')).toContainText('Your enquiry has not been sent');
    await expect(page.getByRole('textbox', { name: /^Full name/ })).toHaveValue('Asha Rao');
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByText('BT-ABCDEF0123')).toBeVisible();
    expect(calls).toBe(2);
  });
});
