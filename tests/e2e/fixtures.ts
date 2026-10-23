import { test as base, expect, type Page } from '@playwright/test';

/**
 * Shared fixture: fails a test if the page logs a console error, throws, violates the CSP or
 * requests a same-origin asset that is missing.
 */
export const test = base.extend<{ consoleProblems: string[] }>({
  consoleProblems: [
    async ({ page }, use) => {
      const problems: string[] = [];
      page.on('console', (msg) => {
        // Failed requests are checked below (where expected 404 documents are excluded).
        if (msg.type() === 'error' && !msg.text().startsWith('Failed to load resource')) {
          problems.push(`console: ${msg.text()}`);
        }
      });
      page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
      page.on('response', (response) => {
        const url = new URL(response.url());
        // Documents may legitimately be 404 (error pages); API errors are asserted by each test.
        const expected404 =
          response.request().resourceType() === 'document' || url.pathname.startsWith('/api/');
        if (url.hostname === 'localhost' && response.status() >= 400 && !expected404) {
          problems.push(`${response.status()} ${url.pathname}`);
        }
      });
      await use(problems);
      expect(problems, 'browser console / network problems').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** Waits until React has hydrated the prerendered page. */
export async function hydrated(page: Page) {
  await page.waitForFunction(() => {
    const root = document.getElementById('root');
    return !!root && Object.keys(root).some((k) => k.startsWith('__reactContainer'));
  });
}
