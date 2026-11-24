import { useEffect, useRef, useState } from 'react';
import { industries } from '../../content/industries';
import { MoleculeView } from './MoleculeView';
import { moleculeFor } from './molecules';
import styles from './HeroVisual.module.css';

/** "Textile processing" → "Textile": short labels for the market chips. */
const shortName = (name: string) => name.split(' ')[0] ?? name;

/**
 * Hero visual: the molecule viewer plus one chip per market. Until the visitor picks a market,
 * it tours them on its own; the progress bar's CSS animation is the timer, so the tour pauses
 * with it (hover, keyboard focus, off-screen) and never runs under reduced motion.
 */
export function HeroVisual() {
  const [market, setMarket] = useState(industries[0]?.slug ?? '');
  const [touring, setTouring] = useState(true);
  const [paused, setPaused] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = industries.find((i) => i.slug === market);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) =>
      setOffscreen(!(entry?.isIntersecting ?? true)),
    );
    observer.observe(root);
    // Hold the tour while a mouse is over the viewer or focus is inside it.
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') setPaused(true);
    };
    const onLeave = () => setPaused(false);
    const onFocusIn = () => setPaused(true);
    const onFocusOut = (event: FocusEvent) => {
      if (!root.contains(event.relatedTarget as Node | null)) setPaused(false);
    };
    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    return () => {
      observer.disconnect();
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  const next = () => {
    const i = industries.findIndex((m) => m.slug === market);
    setMarket(industries[(i + 1) % industries.length]?.slug ?? market);
  };

  const choose = (slug: string) => {
    setMarket(slug);
    setTouring(false);
  };

  const chips =
    industries.length > 1 ? (
      <div className={styles.markets} role="group" aria-label="Show the chemistry of a market">
        {industries.map((industry) => {
          const active = industry.slug === market;
          return (
            <button
              key={industry.slug}
              type="button"
              className={styles.chip}
              aria-pressed={active}
              onClick={() => choose(industry.slug)}
            >
              {shortName(industry.name)}
              {active && touring && (
                <span
                  key={market}
                  className={`${styles.progress} ${paused || offscreen ? styles.paused : ''}`}
                  onAnimationEnd={next}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    ) : null;

  return (
    <div ref={rootRef} className={styles.frame}>
      <MoleculeView molecule={moleculeFor(market)} market={current?.name ?? ''} controls={chips} />
    </div>
  );
}
