import type { ReactNode } from 'react';
import { ButtonLink } from '../components/ui/Button';
import { paths } from '../lib/routes';
import styles from './NotFoundPage.module.css';

/** Spilled-vial illustration shared by the 404 and error pages. */
function SpilledVial() {
  return (
    <svg className={styles.art} viewBox="0 0 320 260" aria-hidden="true">
      <defs>
        <linearGradient id="nf-liquid" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#21bf75" />
          <stop offset="1" stopColor="#109255" />
        </linearGradient>
      </defs>
      <ellipse cx="190" cy="214" rx="110" ry="12" fill="#0e1016" opacity="0.06" />
      <path
        className={styles.puddle}
        d="M120 212c18-10 70-12 110-6 26 4 36 10 14 13-38 5-110 6-130 1-8-2-4-6 6-8Z"
        fill="url(#nf-liquid)"
        opacity="0.85"
      />
      <g transform="rotate(-72 150 170)">
        <rect x="104" y="40" width="92" height="20" rx="10" fill="#0e1016" />
        <path d="M116 60v110a34 34 0 0 0 68 0V60" fill="#fffefb" stroke="#0e1016" strokeWidth="5" />
        <path d="M121 150h58v20a29 29 0 0 1-58 0Z" fill="url(#nf-liquid)" />
      </g>
      <g className={styles.bubbles} fill="#21bf75">
        <circle cx="236" cy="150" r="7" />
        <circle cx="262" cy="126" r="4.5" />
        <circle cx="250" cy="98" r="3" />
      </g>
    </svg>
  );
}

export function ErrorLayout({
  code,
  title,
  children,
  actions,
}: {
  code: string;
  title: ReactNode;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <section className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.code}>{code}</p>
          <h1 className={`display ${styles.title}`}>{title}</h1>
          <div className={styles.text}>{children}</div>
          <div className={styles.actions}>{actions}</div>
        </div>
        <SpilledVial />
      </div>
    </section>
  );
}

export function NotFoundPage() {
  return (
    <ErrorLayout
      code="Error 404 · Page not found"
      title={
        <>
          This reaction didn’t go <em>as planned.</em>
        </>
      }
      actions={
        <>
          <ButtonLink to={paths.home} icon="arrowRight">
            Return to Homepage
          </ButtonLink>
          <ButtonLink to={paths.products} variant="secondary">
            Explore Products
          </ButtonLink>
          <ButtonLink to={paths.contact} variant="ghost">
            Contact Biotonic
          </ButtonLink>
        </>
      }
    >
      <p>
        The page you were looking for doesn’t exist or may have moved. Check the address, or
        continue from one of the pages below.
      </p>
    </ErrorLayout>
  );
}
