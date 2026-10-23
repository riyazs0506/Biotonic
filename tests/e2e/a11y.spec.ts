import AxeBuilder from '@axe-core/playwright';
import { expect, hydrated, test } from './fixtures';

const describe = (
  violations: { id: string; impact?: string | null; nodes: { target: unknown[] }[] }[],
) =>
  violations.map(
    (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  );

const paths = [
  '/',
  '/products',
  '/products/caustic-soda-flakes',
  '/industries',
  '/resources',
  '/about',
  '/leadership',
  '/quality',
  '/contact',
  '/request-a-quote',
  '/privacy-policy',
  '/this-does-not-exist',
];

test.describe('automated accessibility (axe, WCAG 2.2 A/AA rules)', () => {
  for (const path of paths) {
    test(`${path} has no detectable violations`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await hydrated(page);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();
      expect(describe(results.violations)).toEqual([]);
    });
  }

  test('form error state is accessible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/contact');
    await hydrated(page);
    await page.getByRole('button', { name: 'Send enquiry' }).click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    expect(describe(results.violations)).toEqual([]);
  });

  test('open mobile menu is accessible', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await hydrated(page);
    await page.getByRole('button', { name: 'Open menu' }).click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    expect(describe(results.violations)).toEqual([]);
  });
});
