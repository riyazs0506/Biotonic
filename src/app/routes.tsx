import type { RouteObject } from 'react-router';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage, RequestQuotePage } from '../pages/EnquiryPages';
import { HomePage } from '../pages/HomePage';
import { IndustriesPage } from '../pages/IndustriesPage';
import { LeadershipPage } from '../pages/LeadershipPage';
import { PrivacyPage, TermsPage } from '../pages/LegalPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { ProductsPage } from '../pages/ProductsPage';
import { QualityPage } from '../pages/QualityPage';
import { ResourcesPage } from '../pages/ResourcesPage';
import { RouteError } from './errors';
import { RootLayout } from './RootLayout';

/**
 * Route table shared by the browser router and the prerenderer. Pages are bundled eagerly:
 * the whole site is small, and eager modules keep hydration of prerendered HTML exact.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'products', element: <ProductsPage /> },
          { path: 'products/:slug', element: <ProductDetailPage /> },
          { path: 'about', element: <AboutPage /> },
          { path: 'leadership', element: <LeadershipPage /> },
          { path: 'quality', element: <QualityPage /> },
          { path: 'industries', element: <IndustriesPage /> },
          { path: 'resources', element: <ResourcesPage /> },
          { path: 'contact', element: <ContactPage /> },
          { path: 'request-a-quote', element: <RequestQuotePage /> },
          { path: 'privacy-policy', element: <PrivacyPage /> },
          { path: 'terms', element: <TermsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
];
