import type { ReactNode } from 'react';
import { show, type Confirmable } from '../../content/pending';

/**
 * Renders a confirmable value via `render`: the confirmed value, or its demo value in draft
 * builds. When there is nothing to show (release build, or no demo value) renders `fallback`.
 */
export function Confirm<T>({
  value,
  render,
  fallback = null,
}: {
  value: Confirmable<T>;
  render: (value: T) => ReactNode;
  fallback?: ReactNode;
}) {
  const shown = show(value);
  return <>{shown === undefined ? fallback : render(shown)}</>;
}
