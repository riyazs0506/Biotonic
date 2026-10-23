import { useEffect, useRef, useState } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { applyMeta } from '../lib/applyMeta';
import { getPageMeta } from '../lib/seo';
import styles from './RootLayout.module.css';

/** Announces page changes to screen-reader users after client-side navigation. */
function useRouteAnnouncement() {
  const location = useLocation();
  const [message, setMessage] = useState('');
  const first = useRef(true);

  useEffect(() => {
    const meta = getPageMeta(location.pathname);
    applyMeta(meta);
    if (first.current) {
      first.current = false;
      return;
    }
    setMessage(meta.title.split(' | ')[0] ?? meta.title);
  }, [location.pathname]);

  return message;
}

export function RootLayout() {
  const announcement = useRouteAnnouncement();
  return (
    <>
      <a href="#main" className={styles.skip}>
        Skip to main content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      <ScrollRestoration />
    </>
  );
}
