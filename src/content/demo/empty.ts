/**
 * Release-build stand-in for `./index.ts` (swapped in by vite.config.ts). Every
 * `demo.<group>.<key>` lookup resolves to `undefined`, so no demo text is bundled.
 */
import type { demo as DemoContent } from './index';

export const demo = new Proxy({}, { get: () => ({}) }) as typeof DemoContent;
