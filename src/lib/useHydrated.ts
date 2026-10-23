import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False during prerendering and the hydration pass, true afterwards. Use it to apply
 * URL query state (e.g. ?category=) after hydration so the client's first render matches
 * the prerendered HTML exactly.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
