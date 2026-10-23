import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeAll, describe, expect, it } from 'vitest';
import { routes } from '../app/routes';
import { catalogue } from '../lib/catalog';

beforeAll(() => {
  // jsdom lacks these browser APIs used by the hero and header.
  window.scrollTo = () => {};
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia;
  globalThis.IntersectionObserver ??= class {
    observe() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
});

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('routing', () => {
  it.each([
    ['/', /Chemistry You Can/],
    ['/products', /Chemical products/],
    ['/about', /Chemistry you can trust/],
    ['/leadership', /The person behind/],
    ['/quality', /Quality, made/],
    ['/industries', /Chemistry for the way/],
    ['/resources', /Documents and/],
    ['/contact', /Let’s talk/],
    ['/request-a-quote', /Discuss your/],
    ['/privacy-policy', /Privacy Policy/],
    ['/terms', /Terms of Use/],
  ])('%s renders a single h1', (path, heading) => {
    renderAt(path);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(heading);
  });

  it('renders the branded 404 for unknown routes', () => {
    renderAt('/this/does/not/exist');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/This reaction didn’t go/);
    const main = screen.getByRole('main');
    expect(within(main).getByRole('link', { name: 'Return to Homepage' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(within(main).getByRole('link', { name: 'Explore Products' })).toHaveAttribute(
      'href',
      '/products',
    );
    expect(within(main).getByRole('link', { name: 'Contact Biotonic' })).toHaveAttribute(
      'href',
      '/contact',
    );
  });

  it('renders a product-not-found state for an unknown product slug', () => {
    renderAt('/products/unknown-product');
    expect(screen.getByText(/couldn’t find that product/)).toBeInTheDocument();
  });

  it('hero CTAs point to the catalogue and the quote form', () => {
    renderAt('/');
    const hero = screen.getByRole('region', { name: /Chemistry You Can/ });
    expect(within(hero).getByRole('link', { name: /Explore Products/ })).toHaveAttribute(
      'href',
      '/products',
    );
    expect(within(hero).getByRole('link', { name: /Discuss Your Requirements/ })).toHaveAttribute(
      'href',
      '/request-a-quote',
    );
  });

  it('draft builds show demo content and never placeholder markers', () => {
    renderAt('/');
    expect(screen.queryByText(/CLIENT TO CONFIRM/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Sample$/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How we support your supply' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Where our chemistry works' })).toBeInTheDocument();
  });
});

describe('product catalogue', () => {
  it('filters by search and shows a recoverable empty state', async () => {
    const user = userEvent.setup();
    renderAt('/products');
    const list = await screen.findAllByRole('article');
    expect(list).toHaveLength(catalogue.products.length);

    const search = screen.getByRole('searchbox', { name: 'Search products' });
    await user.type(search, 'Acetone');
    expect(screen.getAllByRole('article')).toHaveLength(1);

    await user.clear(search);
    await user.type(search, 'zzzz-no-match');
    expect(screen.queryAllByRole('article')).toHaveLength(0);
    expect(screen.getByText('No products match your search')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Clear search and filters/ }));
    expect(screen.getAllByRole('article')).toHaveLength(catalogue.products.length);
  });

  it('filters by category', async () => {
    const user = userEvent.setup();
    const router = renderAt('/products');
    const first = catalogue.categories[0]!;
    await user.click(screen.getByRole('radio', { name: new RegExp(first.name) }));
    const expected = catalogue.products.filter((p) => p.category === first.slug).length;
    expect(screen.getAllByRole('article')).toHaveLength(expected);
    expect(router.state.location.search).toBe(`?category=${first.slug}`);
  });

  it('product cards link to their detail page, which links to a prefilled quote', async () => {
    const user = userEvent.setup();
    const product = catalogue.products[0]!;
    renderAt('/products');
    await user.click(screen.getByRole('link', { name: product.name }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(product.name);
    expect(screen.getByRole('link', { name: /Request a quote for this product/ })).toHaveAttribute(
      'href',
      `/request-a-quote?product=${product.slug}`,
    );
  });
});

describe('header navigation', () => {
  it('opens and closes the mobile menu with the keyboard', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const toggle = screen.getByRole('button', { name: 'Open menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    const mobileNav = screen.getByRole('navigation', { name: 'Mobile' });
    expect(within(mobileNav).getByRole('link', { name: /Home/ })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveFocus();
  });

  it('closes the mobile menu after navigating', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(
      within(screen.getByRole('navigation', { name: 'Mobile' })).getByRole('link', {
        name: /About/,
      }),
    );
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Chemistry you can trust/);
  });
});
