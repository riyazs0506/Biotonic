import { expect, hydrated, test } from './fixtures';

const pages = [
  { path: '/', h1: /Chemistry You Can Trust/ },
  { path: '/products', h1: /Chemical products/ },
  { path: '/products/waterproofing-coating', h1: /Waterproofing Coating/ },
  { path: '/about', h1: /A chemical partner built on a legacy/ },
  { path: '/leadership', h1: /From the godown floor to founder/ },
  { path: '/quality', h1: /Knowledge first/ },
  { path: '/industries', h1: /Chemistry for the way/ },
  { path: '/resources', h1: /Documents and/ },
  { path: '/contact', h1: /Let’s talk/ },
  { path: '/request-a-quote', h1: /Discuss your/ },
  { path: '/privacy-policy', h1: /Privacy Policy/ },
  { path: '/terms', h1: /Terms of Use/ },
];

test.describe('every route', () => {
  for (const { path, h1 } of pages) {
    test(`${path} is prerendered with complete metadata`, async ({ page, request }) => {
      // Raw HTML (what a crawler sees before JavaScript runs)
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      const html = await res.text();
      expect(html).toMatch(/<title>[^<]*Biotonic[^<]*<\/title>/);
      expect(html).toContain('<meta name="description"');
      const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1] ?? '';
      expect(new URL(canonical).pathname).toBe(path);
      expect(html).toContain('<meta property="og:title"');
      expect(html).toMatch(/<h1[^>]*>/);

      await page.goto(path);
      await hydrated(page);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(h1);
    });
  }
});

test('no placeholder markers are visible to visitors', async ({ request }) => {
  for (const { path } of pages) {
    const html = await (await request.get(path)).text();
    expect(html, path).not.toContain('CLIENT TO CONFIRM');
  }
});

test('titles are unique across pages', async ({ request }) => {
  const titles = await Promise.all(
    pages.map(
      async ({ path }) =>
        /<title>([^<]+)<\/title>/.exec(await (await request.get(path)).text())?.[1],
    ),
  );
  expect(new Set(titles).size).toBe(pages.length);
});

test.describe('errors and unknown URLs', () => {
  test('unknown URL returns HTTP 404 with the branded page', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      /This reaction didn’t go as planned/,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await page.getByRole('main').getByRole('link', { name: 'Return to Homepage' }).click();
    await expect(page).toHaveURL('/');
  });

  test('unknown product returns 404', async ({ request }) => {
    expect((await request.get('/products/no-such-product')).status()).toBe(404);
  });

  test('client-side navigation to an unknown product shows the not-found state', async ({
    page,
  }) => {
    await page.goto('/products');
    await hydrated(page);
    await page.evaluate(() => {
      window.history.pushState({}, '', '/products/no-such-product');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await expect(page.getByText('We couldn’t find that product')).toBeVisible();
  });

  test('trailing slashes redirect to the canonical URL', async ({ request }) => {
    const res = await request.get('/about/', { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()['location']).toBe('/about');
  });
});

test.describe('navigation', () => {
  test('primary navigation and CTAs reach their destinations', async ({ page, isMobile }) => {
    await page.goto('/');
    await hydrated(page);
    await page
      .getByRole('region', { name: /Chemistry You Can/ })
      .getByRole('link', { name: 'Explore products' })
      .click();
    await expect(page).toHaveURL('/products');
    await expect(page).toHaveTitle(/Chemical Product Catalogue/);

    if (isMobile) {
      await page.getByRole('button', { name: 'Open menu' }).click();
      await page
        .getByRole('navigation', { name: 'Mobile' })
        .getByRole('link', { name: /About/ })
        .click();
    } else {
      await page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: 'About' })
        .click();
    }
    await expect(page).toHaveURL('/about');
    await expect(page).toHaveTitle(/About Biotonic/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /^https?:\/\/[^/]+\/about$/,
    );

    await page.getByRole('contentinfo').getByRole('link', { name: 'Privacy Policy' }).click();
    await expect(page).toHaveURL('/privacy-policy');
  });

  test('skip link moves focus to the main content', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard journey');
    await page.goto('/');
    await hydrated(page);
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });

  test('no page scrolls horizontally', async ({ page }) => {
    for (const { path } of pages) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('product catalogue', () => {
  test('search, filter and empty state', async ({ page }) => {
    await page.goto('/products');
    await hydrated(page);
    const cards = page.getByRole('article');
    const total = await cards.count();
    expect(total).toBeGreaterThan(1);

    await page.getByRole('searchbox', { name: 'Search products' }).fill('Diethylene');
    await expect(cards).toHaveCount(1);
    await expect(page).toHaveURL(/\?q=Diethylene/);

    await page.getByRole('searchbox', { name: 'Search products' }).fill('zzzz');
    await expect(page.getByText('No products match your search')).toBeVisible();
    await page.getByRole('button', { name: 'Clear search and filters' }).click();
    await expect(cards).toHaveCount(total);

    await page.getByText('Construction Chemicals').first().click();
    await expect(page).toHaveURL(/category=construction-chemicals/);
    await expect(cards).toHaveCount(2);
  });

  test('category links from the homepage pre-filter the catalogue', async ({ page }) => {
    await page.goto('/products?category=glycols');
    await hydrated(page);
    await expect(page.getByRole('article')).toHaveCount(2);
    await expect(page.getByRole('radio', { name: /Glycols/ })).toBeChecked();
  });

  test('product page links to a prefilled quotation request', async ({ page }) => {
    await page.goto('/products/pigment-printing-emulsion');
    await hydrated(page);
    await page.getByRole('link', { name: 'Request a quote for this product' }).click();
    await expect(page).toHaveURL('/request-a-quote?product=pigment-printing-emulsion');
    await expect(page.getByLabel(/Product of interest/)).toHaveValue('Pigment Printing Emulsion');
  });
});

test.describe('technical SEO files', () => {
  test('sitemap lists every public page', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname);
    for (const { path } of pages) expect(locs).toContain(path);
    expect(xml).not.toContain('/404');
  });

  test('draft robots.txt blocks indexing', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('Disallow: /');
  });

  test('structured data is valid JSON', async ({ page }) => {
    await page.goto('/');
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = blocks.map((b) => (JSON.parse(b) as { '@type': string })['@type']);
    expect(types).toEqual(['Organization', 'WebSite']);
  });
});

test.describe('security', () => {
  test('responses carry security headers', async ({ request }) => {
    const res = await request.get('/');
    const headers = res.headers();
    expect(headers['content-security-policy']).toContain("script-src 'self'");
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toContain('camera=()');
  });

  test('server-side validation rejects bad input even without the browser form', async ({
    request,
  }) => {
    const res = await request.post('/api/enquiry', {
      headers: { Origin: 'http://localhost:4310' },
      data: { kind: 'contact', name: '<script>', email: 'nope', consent: true, startedAt: 1 },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe('motion', () => {
  const orbitAnimation = (page: import('@playwright/test').Page) =>
    page.locator('[data-orbit]').evaluate((el) => getComputedStyle(el).animationName);

  test('hero animation stops for reduced-motion users', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    expect(await orbitAnimation(page)).toBe('none');
  });

  test('hero animates by default', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    expect(await orbitAnimation(page)).not.toBe('none');
  });
});

test.describe('phone layout', () => {
  test('card rows swipe sideways on phones and form a grid on laptops', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/');
    const rows = page.locator('ul.swipe-row');
    await expect(rows).toHaveCount(2);
    for (const row of await rows.all()) {
      const [scroll, client] = await row.evaluate((el) => [el.scrollWidth, el.clientWidth]);
      if (isMobile) expect(scroll).toBeGreaterThan(client);
      else expect(scroll).toBeLessThanOrEqual(client);
    }
  });
});

test.describe('hero molecule viewer', () => {
  const caption = (page: import('@playwright/test').Page) =>
    page.getByText('Chemistry at work').locator('..');
  const viewer = (page: import('@playwright/test').Page) => page.locator('section figure');

  /** A fingerprint of what the molecule canvas currently shows (0 = blank). */
  const pixels = (page: import('@playwright/test').Page) =>
    page.locator('figure canvas').evaluate((el) => {
      const canvas = el as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      if (!ctx || !canvas.width) return 0;
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let sum = 0;
      for (let i = 0; i < data.length; i += 4) sum += ((data[i] ?? 0) * (i % 97)) % 9973;
      return sum;
    });

  test('is the only visual: no 3D engine or product images are loaded', async ({ page }) => {
    const heavy: string[] = [];
    page.on('request', (r) => {
      if (/three|ProductScene|poster/i.test(r.url())) heavy.push(r.url());
    });
    await page.goto('/');
    await hydrated(page);
    await expect(page.locator('canvas')).toHaveCount(1);
    expect(heavy).toEqual([]);
  });

  test("re-forms into the chosen market's chemistry, with live readouts", async ({ page }) => {
    await page.goto('/');
    await hydrated(page);
    await expect(caption(page)).toContainText('Acetic acid');
    await expect(viewer(page)).toContainText('60.05 g/mol');
    const chips = page.getByRole('group', { name: /chemistry of a market/ });
    await chips.getByRole('button', { name: 'Construction' }).click();
    await expect(caption(page)).toContainText('Methyltrimethoxysilane');
    await expect(viewer(page)).toContainText('136.22 g/mol');
    await expect(viewer(page)).toContainText('20 atoms · 19 bonds');
    await chips.getByRole('button', { name: 'Industrial' }).click();
    await expect(caption(page)).toContainText('Ethylene glycol');
    await expect.poll(() => pixels(page)).toBeGreaterThan(0);
  });

  /** The tour's timer: the progress bar inside the active chip. */
  const tourTimer = (page: import('@playwright/test').Page) =>
    page.locator('button[aria-pressed="true"] > span[aria-hidden="true"]');

  test('tours the markets on its own until the visitor picks one', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await hydrated(page);
    await expect(tourTimer(page)).toHaveCount(1);
    expect(await tourTimer(page).evaluate((el) => getComputedStyle(el).animationName)).not.toBe(
      'none',
    );
    await page
      .getByRole('group', { name: /chemistry of a market/ })
      .getByRole('button', { name: 'Industrial' })
      .click();
    await expect(tourTimer(page)).toHaveCount(0);
  });

  test('never tours on its own under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await hydrated(page);
    expect(await tourTimer(page).evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  });

  test('reduced motion: a still molecule that can still be turned by dragging', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'mouse drag; touch uses the same pointer events');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await hydrated(page);
    await expect.poll(() => pixels(page)).toBeGreaterThan(0);
    const still = await pixels(page);
    await page.waitForTimeout(400);
    expect(await pixels(page)).toBe(still);

    const box = await page.locator('figure canvas').boundingBox();
    if (!box) throw new Error('canvas not laid out');
    await page.mouse.move(box.x + box.width * 0.35, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.65, box.y + box.height / 2, { steps: 6 });
    await page.mouse.up();
    expect(await pixels(page)).not.toBe(still);
  });
});
