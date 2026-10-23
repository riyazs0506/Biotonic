import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';
import { AppErrorBoundary } from './app/errors';
import { routes } from './app/routes';
import { getPageMeta } from './lib/seo';
import { publicPaths } from './lib/routes';
import { SITE_URL, CONTENT_MODE } from './lib/env';

export { getPageMeta, publicPaths, SITE_URL, CONTENT_MODE };

/** Renders one route to HTML for prerendering. */
export async function render(path: string): Promise<string> {
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(`http://prerender.local${path}`));
  if (context instanceof Response) throw new Error(`Unexpected redirect while rendering ${path}`);
  const router = createStaticRouter(handler.dataRoutes, context);
  return renderToString(
    <StrictMode>
      <AppErrorBoundary>
        {/* hydrate={false}: no inline hydration script, so the CSP needs no 'unsafe-inline'. */}
        <StaticRouterProvider router={router} context={context} hydrate={false} />
      </AppErrorBoundary>
    </StrictMode>,
  );
}
