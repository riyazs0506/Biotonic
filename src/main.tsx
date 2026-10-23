import '@fontsource-variable/inter/wght.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import './styles/global.css';

import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { AppErrorBoundary } from './app/errors';
import { routes } from './app/routes';

const container = document.getElementById('root');
if (!container) throw new Error('Root element missing');

const router = createBrowserRouter(routes);
const app = (
  <StrictMode>
    <AppErrorBoundary>
      <RouterProvider router={router} />
    </AppErrorBoundary>
  </StrictMode>
);

// Prerendered pages are hydrated; the dev server serves an empty shell and renders from scratch.
if (container.hasChildNodes()) hydrateRoot(container, app);
else createRoot(container).render(app);
