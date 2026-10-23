import { useEffect, useRef } from 'react';
import styles from './LivingReaction.module.css';

/**
 * "The Living Reaction" — the hero's scientific visual, derived from the logo's vial,
 * emerald liquid and three rising bubbles.
 *
 * Rendering strategy: one inline SVG animated with compositor-friendly CSS transforms.
 * - Animations stop for `prefers-reduced-motion` (the static frame is the fallback).
 * - Animations pause while the hero is off-screen.
 * - Pointer response only on devices with a fine pointer and hover, throttled to rAF.
 * WebGL was considered and rejected: it would add ~150 KB+ of JavaScript for an effect
 * this SVG achieves at a fraction of the cost (see docs/HANDOVER.md, "Hero").
 */
export function LivingReaction() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(([entry]) => {
      root.dataset.paused = entry?.isIntersecting ? 'false' : 'true';
    });
    observer.observe(root);

    const canTilt =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canTilt) return () => observer.disconnect();

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      targetX = Math.max(
        -1,
        Math.min(1, (event.clientX - (rect.left + rect.width / 2)) / rect.width),
      );
      targetY = Math.max(
        -1,
        Math.min(1, (event.clientY - (rect.top + rect.height / 2)) / rect.height),
      );
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          root.style.setProperty('--px', targetX.toFixed(3));
          root.style.setProperty('--py', targetY.toFixed(3));
        });
      }
    };
    const onLeave = () => {
      root.style.setProperty('--px', '0');
      root.style.setProperty('--py', '0');
    };
    const section = root.closest('section') ?? root;
    section.addEventListener('pointermove', onMove as EventListener, { passive: true });
    section.addEventListener('pointerleave', onLeave);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      section.removeEventListener('pointermove', onMove as EventListener);
      section.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      <div className={styles.glow} />
      <svg className={styles.scene} viewBox="0 0 520 640" focusable="false">
        <defs>
          <linearGradient id="lr-liquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3fd18b" />
            <stop offset="0.35" stopColor="#21bf75" />
            <stop offset="1" stopColor="#0c6e40" />
          </linearGradient>
          <linearGradient id="lr-liquid-back" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7fe3b2" />
            <stop offset="1" stopColor="#21bf75" />
          </linearGradient>
          <linearGradient id="lr-glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="0.18" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="0.6" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="0.9" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="lr-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="lr-caustic" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#21bf75" stopOpacity="0.55" />
            <stop offset="1" stopColor="#21bf75" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lr-shadow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#0e1016" stopOpacity="0.22" />
            <stop offset="1" stopColor="#0e1016" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lr-bubble" cx="0.35" cy="0.3" r="0.75">
            <stop offset="0" stopColor="#d9fbe9" />
            <stop offset="0.45" stopColor="#21bf75" />
            <stop offset="1" stopColor="#109255" />
          </radialGradient>
          <clipPath id="lr-inner">
            <path d="M202 150 V496 A58 58 0 0 0 318 496 V150 Z" />
          </clipPath>
        </defs>

        {/* Precision dial — concentric hairlines behind the vial */}
        <g className={styles.dial}>
          <circle cx="260" cy="330" r="236" className={styles.ring} />
          <circle cx="260" cy="330" r="204" className={styles.ticks} />
          <circle cx="260" cy="330" r="172" className={styles.ringFaint} />
        </g>

        {/* Floor: contact shadow and green caustic refracted through the liquid */}
        <ellipse cx="260" cy="590" rx="130" ry="16" fill="url(#lr-shadow)" />
        <ellipse
          className={styles.caustic}
          cx="282"
          cy="586"
          rx="84"
          ry="12"
          fill="url(#lr-caustic)"
        />

        <g className={styles.vessel}>
          {/* Liquid, clipped to the glass interior */}
          <g clipPath="url(#lr-inner)">
            <rect x="196" y="140" width="128" height="430" fill="#ffffff" fillOpacity="0.35" />
            <path
              className={styles.waveBack}
              d="M80 322 q30 -7 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 V580 H80 Z"
              fill="url(#lr-liquid-back)"
              opacity="0.55"
            />
            <path
              className={styles.wave}
              d="M80 330 q30 -6 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 V580 H80 Z"
              fill="url(#lr-liquid)"
            />
            <g className={styles.fizz} fill="#e9fff4">
              <circle cx="228" cy="540" r="3" />
              <circle cx="252" cy="548" r="2" />
              <circle cx="276" cy="536" r="4" />
              <circle cx="296" cy="546" r="2.5" />
              <circle cx="240" cy="552" r="1.8" />
              <circle cx="286" cy="556" r="2.2" />
            </g>
            <rect
              className={styles.sheen}
              x="120"
              y="140"
              width="60"
              height="440"
              fill="url(#lr-sheen)"
            />
          </g>

          {/* Glass body */}
          <path
            d="M196 150 V496 A64 64 0 0 0 324 496 V150"
            fill="url(#lr-glass)"
            stroke="#0e1016"
            strokeOpacity="0.88"
            strokeWidth="3"
          />
          <path
            d="M212 170 V488"
            stroke="#ffffff"
            strokeOpacity="0.9"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M306 190 V300"
            stroke="#ffffff"
            strokeOpacity="0.55"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Graduations */}
          <g stroke="#0e1016" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round">
            <path d="M300 240 H314 M306 270 H314 M300 300 H314 M306 330 H314 M300 360 H314 M306 390 H314 M300 420 H314" />
          </g>
          {/* Rim — echoes the logo's vial cap */}
          <rect x="178" y="126" width="164" height="26" rx="13" fill="#0e1016" />
          <rect x="190" y="132" width="60" height="4" rx="2" fill="#ffffff" opacity="0.18" />
        </g>

        {/* The three rising bubbles from the logo */}
        <g className={styles.bubbles}>
          <circle className={styles.b1} cx="262" cy="98" r="12" fill="url(#lr-bubble)" />
          <circle className={styles.b2} cx="236" cy="62" r="7.5" fill="url(#lr-bubble)" />
          <circle className={styles.b3} cx="274" cy="34" r="5" fill="url(#lr-bubble)" />
        </g>
      </svg>

      <ul className={styles.notes}>
        <li className={styles.note1}>
          <span className={styles.noteIndex}>01</span>
          <span>
            <strong>Rising bubbles</strong> An active, living reaction
          </span>
        </li>
        <li className={styles.note2}>
          <span className={styles.noteIndex}>02</span>
          <span>
            <strong>The vial</strong> Product and lab in one symbol
          </span>
        </li>
        <li className={styles.note3}>
          <span className={styles.noteIndex}>03</span>
          <span>
            <strong>Always on</strong> Consistent care, every order
          </span>
        </li>
      </ul>
    </div>
  );
}
