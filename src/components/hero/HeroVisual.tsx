import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useHydrated } from '../../lib/useHydrated';
import styles from './HeroVisual.module.css';

const ProductScene = lazy(() => import('./model/ProductScene'));

/** Static render of the 3D scene (scripts/generate-hero-poster.ts). */
const HERO_POSTER = { src: '/images/hero/products-poster.webp', width: 1120, height: 960 };

function canRun3D(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  // Phones and small tablets get the poster (a frame of the same scene) with a CSS float:
  // parsing three.js on a mobile CPU costs ~1 s of main-thread time.
  if (!window.matchMedia('(min-width: 900px)').matches) return false;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (memory !== undefined && memory < 4) return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return false;
  if (typeof WebGLRenderingContext === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Hero visual: a static poster (instant, used for prerendering and as the fallback) that is
 * replaced by the realistic animated 3D model once it has loaded and rendered.
 */
export function HeroVisual() {
  const hydrated = useHydrated();
  const rootRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const capture = hydrated && window.location.hash === '#capture-poster';

  // Load the 3D chunk after hydration, when the browser is idle.
  useEffect(() => {
    if (!hydrated || (!capture && !canRun3D())) return;
    const start = () => setEnabled(true);
    if (capture) {
      start();
      return;
    }
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 600);
    return () => clearTimeout(id);
  }, [hydrated, capture]);

  // Pause rendering off-screen; follow the pointer on fine-pointer devices.
  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return;
    const observer = new IntersectionObserver(([entry]) =>
      setActive(Boolean(entry?.isIntersecting)),
    );
    observer.observe(root);
    const section = root.closest('section') ?? root;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      pointer.current = {
        x: clamp((event.clientX - (rect.left + rect.width / 2)) / rect.width),
        y: clamp((event.clientY - (rect.top + rect.height / 2)) / rect.height),
      };
    };
    const onLeave = () => {
      pointer.current = { x: 0, y: 0 };
    };
    if (fine) {
      section.addEventListener('pointermove', onMove as EventListener, { passive: true });
      section.addEventListener('pointerleave', onLeave);
    }
    return () => {
      observer.disconnect();
      section.removeEventListener('pointermove', onMove as EventListener);
      section.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled]);

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-scene-ready={ready ? 'true' : undefined}
      aria-hidden="true"
    >
      <div className={styles.glow} />
      <img
        className={`${styles.poster} ${ready ? styles.hidden : ''}`}
        src={HERO_POSTER.src}
        alt=""
        width={HERO_POSTER.width}
        height={HERO_POSTER.height}
        fetchPriority="high"
        decoding="async"
      />
      {enabled && (
        <div className={`${styles.canvas} ${ready ? styles.shown : ''}`}>
          <Suspense fallback={null}>
            <ProductScene
              pointer={pointer}
              active={active}
              capture={capture}
              onReady={() => setReady(true)}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
