import { expect, hydrated, test } from './fixtures';

const pages = [
  { path: '/', h1: /Chemistry You Can Trust/ },
  { path: '/products', h1: /Chemical products/ },
  { path: '/products/caustic-soda-flakes', h1: /Caustic Soda Flakes/ },
  { path: '/about', h1: /Chemistry you can trust/ },
  { path: '/leadership', h1: /The person behind/ },
  { path: '/quality', h1: /Quality, made clear/ },
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
    await page.getByRole('link', { name: 'Explore Products' }).click();
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

    await page.getByRole('searchbox', { name: 'Search products' }).fill('Acetone');
    await expect(cards).toHaveCount(1);
    await expect(page).toHaveURL(/\?q=Acetone/);

    await page.getByRole('searchbox', { name: 'Search products' }).fill('zzzz');
    await expect(page.getByText('No products match your search')).toBeVisible();
    await page.getByRole('button', { name: 'Clear search and filters' }).click();
    await expect(cards).toHaveCount(total);

    await page.getByText('Industrial Acids').first().click();
    await expect(page).toHaveURL(/category=acids/);
    await expect(cards).toHaveCount(2);
  });

  test('category links from the homepage pre-filter the catalogue', async ({ page }) => {
    await page.goto('/products?category=solvents');
    await hydrated(page);
    await expect(page.getByRole('article')).toHaveCount(2);
    await expect(page.getByRole('radio', { name: /Solvents/ })).toBeChecked();
  });

  test('product page links to a prefilled quotation request', async ({ page }) => {
    await page.goto('/products/hydrochloric-acid');
    await hydrated(page);
    await page.getByRole('link', { name: 'Request a quote for this product' }).click();
    await expect(page).toHaveURL('/request-a-quote?product=hydrochloric-acid');
    await expect(page.getByLabel(/Product of interest/)).toHaveValue('Hydrochloric Acid 33%');
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
  test('hero animation stops for reduced-motion users', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const animation = await page
      .locator('svg path[class*="wave"]')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe('none');
  });

  test('hero animates by default', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const animation = await page
      .locator('svg path[class*="wave"]')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).not.toBe('none');
  });
});
