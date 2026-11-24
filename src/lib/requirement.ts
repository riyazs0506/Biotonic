import { industries, type Industry } from '../content/industries';
import { getProduct, type Product } from './catalog';
import { paths } from './routes';

/**
 * The hero's "say it in one sentence" requirement builder.
 *
 *   I'm buying for [market] and need [product], about [quantity] [frequency].
 *
 * Everything is built from fixed option keys (never free text), so the composed WhatsApp
 * message and the quote-page link can only contain values defined here or in the catalogue.
 */
export const QUANTITIES = [
  { value: 'trial', label: 'a trial quantity' },
  { value: 'upto-100kg', label: 'up to 100 kg' },
  { value: '100-500kg', label: '100–500 kg' },
  { value: '500kg-1t', label: '500 kg – 1 tonne' },
  { value: '1-5t', label: '1–5 tonnes' },
  { value: '5t-plus', label: '5+ tonnes' },
] as const;

export const FREQUENCIES = [
  { value: 'once', label: 'as a one-time order' },
  { value: 'monthly', label: 'every month' },
  { value: 'weekly', label: 'every week' },
] as const;

export const ADVISE = 'advise';
const ADVISE_LABEL = 'your recommendation';

export interface NeedOption {
  value: string;
  label: string;
  product?: Product;
}

export interface Requirement {
  market: string;
  need: string;
  quantity: string;
  frequency: string;
}

export function marketFor(slug: string): Industry | undefined {
  return industries.find((i) => i.slug === slug);
}

/** Catalogue products for the market, else its broad product families; always "advise me". */
export function needOptions(marketSlug: string): NeedOption[] {
  const market = marketFor(marketSlug);
  if (!market) return [{ value: ADVISE, label: ADVISE_LABEL }];
  const products = market.productSlugs
    .map((slug) => getProduct(slug))
    .filter((p): p is Product => p !== undefined)
    .map((product) => ({ value: `p:${product.slug}`, label: product.name, product }));
  const families = market.needs.map((label, i) => ({ value: `n:${i}`, label }));
  return [...(products.length ? products : families), { value: ADVISE, label: ADVISE_LABEL }];
}

export function defaultRequirement(marketSlug = industries[0]?.slug ?? ''): Requirement {
  return {
    market: marketSlug,
    need: needOptions(marketSlug)[0]?.value ?? ADVISE,
    quantity: '100-500kg',
    frequency: 'monthly',
  };
}

function labelOf<T extends { value: string; label: string }>(list: readonly T[], value: string) {
  return list.find((o) => o.value === value)?.label;
}

export function describe(req: Requirement) {
  const market = marketFor(req.market);
  const need = needOptions(req.market).find((o) => o.value === req.need);
  return {
    market,
    need,
    quantity: labelOf(QUANTITIES, req.quantity),
    frequency: labelOf(FREQUENCIES, req.frequency),
  };
}

/** The requirement as one plain sentence, e.g. for WhatsApp or the quote form. */
export function composeSentence(req: Requirement): string {
  const d = describe(req);
  const need =
    !d.need || d.need.value === ADVISE ? 'your recommendation on the right product' : d.need.label;
  const parts = [
    d.market ? `I'm buying for ${d.market.buyerPhrase} and need ${need}` : `I need ${need}`,
    d.quantity ? `about ${d.quantity}` : undefined,
  ].filter(Boolean);
  return `${parts.join(', ')}${d.frequency ? ` ${d.frequency}` : ''}.`;
}

export function whatsappMessage(req: Requirement): string {
  return `Hello Biotonic, ${composeSentence(req)} Please share availability and a quote.`;
}

/** Link to the quote form, carrying only option keys. */
export function quoteHref(req: Requirement): string {
  const params = new URLSearchParams();
  const need = describe(req).need;
  if (need?.product) params.set('product', need.product.slug);
  params.set('market', req.market);
  if (need && !need.product) params.set('need', need.value);
  params.set('qty', req.quantity);
  params.set('freq', req.frequency);
  return `${paths.quote}?${params.toString()}`;
}

/** Reads a builder link back into a requirement; unknown keys are ignored. */
export function parseRequirement(params: URLSearchParams): {
  message?: string;
  quantity?: string;
} {
  const market = params.get('market') ?? '';
  if (!marketFor(market)) return {};
  const options = needOptions(market);
  const product = params.get('product');
  const needParam = product ? `p:${product}` : (params.get('need') ?? ADVISE);
  const req: Requirement = {
    market,
    need: options.some((o) => o.value === needParam) ? needParam : ADVISE,
    quantity: QUANTITIES.some((q) => q.value === params.get('qty'))
      ? (params.get('qty') ?? '')
      : '',
    frequency: FREQUENCIES.some((f) => f.value === params.get('freq'))
      ? (params.get('freq') ?? '')
      : '',
  };
  return { message: composeSentence(req), quantity: labelOf(QUANTITIES, req.quantity) };
}
