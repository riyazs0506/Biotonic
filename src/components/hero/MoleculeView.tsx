import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ELEMENT_NAMES,
  elementsOf,
  MAX_MOLECULE_ATOMS as MAX_ATOMS,
  molarMass,
  type Element,
  type Molecule,
} from './molecules';
import styles from './MoleculeView.module.css';

/**
 * The hero's centrepiece: a "molecule viewer" instrument. A ball-and-stick molecule is drawn
 * on a 2D canvas (no 3D engine, so it also runs on phones) inside measurement rings, with
 * readouts computed from the molecule itself. On load the atoms drift in from a scattered cloud
 * and bond together; when the market changes, the molecule bursts apart and re-assembles as the
 * next one while a scan sweeps the dial. It rotates slowly, follows the pointer, and can be
 * dragged to spin it (with inertia). Reduced motion draws a still frame that still responds to
 * dragging; rendering stops while off-screen.
 */
const STYLE: Record<Element, { base: string; light: string; radius: number }> = {
  C: { base: '#1d2129', light: '#7a8290', radius: 0.36 },
  O: { base: '#0f8a50', light: '#86f2bf', radius: 0.34 },
  H: { base: '#cfcabe', light: '#ffffff', radius: 0.22 },
  Si: { base: '#46505d', light: '#c9d1db', radius: 0.46 },
};

const MORPH_MS = 1500;
const INTRO_MS = 2000;
/** Share of the canvas the molecule's bounding sphere may fill. */
const FILL = 0.4;

type Vec = [number, number, number];

interface Particle {
  from: Vec;
  to: Vec;
  fromColor: Element;
  toColor: Element;
  fromAlpha: number;
  toAlpha: number;
  seed: number;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function hexToRgb(hex: string): Vec {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a: string, b: string, t: number, shade = 1): string {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  const c = x.map((v, i) => Math.round((v + ((y[i] ?? v) - v) * t) * shade));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

/** Atom positions centred on the molecule's middle. */
function centred(m: Molecule): Vec[] {
  const n = m.atoms.length;
  const c = m.atoms.reduce<Vec>(
    (s, a) => [s[0] + a.p[0] / n, s[1] + a.p[1] / n, s[2] + a.p[2] / n],
    [0, 0, 0],
  );
  return m.atoms.map((a) => [a.p[0] - c[0], a.p[1] - c[1], a.p[2] - c[2]]);
}

function extent(points: Vec[]): number {
  return Math.max(1.5, ...points.map((p) => Math.hypot(...p))) + 0.5;
}

function scatter(seed: number): Vec {
  // Deterministic pseudo-random point on a wide shell.
  const a = Math.sin(seed * 12.9898) * 43758.5453;
  const b = Math.sin(seed * 78.233) * 12345.678;
  const u = a - Math.floor(a);
  const v = b - Math.floor(b);
  const theta = u * Math.PI * 2;
  const phi = Math.acos(2 * v - 1);
  const r = 6 + ((u * 3) % 2);
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
}

export function MoleculeView({
  molecule,
  market,
  controls,
}: {
  molecule: Molecule;
  /** Market name shown in the viewer's top-left readout. */
  market: string;
  /** Rendered between the dial and the caption (the market chips). */
  controls?: ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useRef<{ setMolecule: (m: Molecule) => void } | null>(null);
  // The "drag to rotate" hint fades once the visitor has tried it.
  const [dragged, setDragged] = useState(false);

  // Set up the renderer once.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const particles: Particle[] = Array.from({ length: MAX_ATOMS }, (_, i) => ({
      from: scatter(i + 1),
      to: scatter(i + 1),
      fromColor: 'H',
      toColor: 'H',
      fromAlpha: 0,
      toAlpha: 0,
      seed: i * 1.7,
    }));
    let current: Molecule | null = null;
    let previous: Molecule | null = null;
    let morphStart = 0;
    let morphMs = INTRO_MS;
    let fromScale = 1;
    let toScale = 1;
    let width = 0;
    let height = 0;
    let visible = true;
    let frame = 0;
    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    const drag = { id: -1, x: 0, y: 0, yaw: 0, pitch: 0, vYaw: 0, vPitch: 0 };
    const t0 = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) draw(performance.now());
    };

    /** Current interpolated state of every particle. */
    const sample = (now: number) => {
      const raw = reduced ? 1 : Math.min(1, (now - morphStart) / morphMs);
      const t = ease(raw);
      const burst = reduced ? 0 : Math.sin(Math.PI * raw) * 1.1;
      return {
        t: raw,
        scale: fromScale + (toScale - fromScale) * t,
        atoms: particles.map((p, i) => {
          const pos: Vec = [0, 0, 0];
          for (let k = 0; k < 3; k++) {
            pos[k] = (p.from[k] ?? 0) + ((p.to[k] ?? 0) - (p.from[k] ?? 0)) * t;
          }
          // Burst outwards mid-morph, then settle: the "reaction".
          const len = Math.hypot(...pos) || 1;
          const out = burst * (0.6 + (i % 3) * 0.25);
          return {
            pos: [
              pos[0] + (pos[0] / len) * out,
              pos[1] + (pos[1] / len) * out,
              pos[2] + (pos[2] / len) * out,
            ] as Vec,
            alpha: p.fromAlpha + (p.toAlpha - p.fromAlpha) * t,
            colorT: t,
            p,
          };
        }),
      };
    };

    const draw = (now: number) => {
      const time = (now - t0) / 1000;
      const s = sample(now);
      ctx.clearRect(0, 0, width, height);
      if (!current || width === 0) return;

      pointer.sx += (pointer.x - pointer.sx) * 0.06;
      pointer.sy += (pointer.y - pointer.sy) * 0.06;
      if (drag.id === -1 && !reduced) {
        // Inertia after a flick, then the tilt eases back to the resting view.
        drag.yaw += drag.vYaw;
        drag.pitch = clamp(drag.pitch + drag.vPitch, -0.9, 0.9) * 0.992;
        drag.vYaw *= 0.95;
        drag.vPitch *= 0.88;
      }
      const yaw = (reduced ? 0.6 : time * 0.32) + pointer.sx * 0.7 + drag.yaw;
      const pitch =
        -0.32 + pointer.sy * 0.35 + drag.pitch + (reduced ? 0 : Math.sin(time * 0.45) * 0.08);
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const unit = (Math.min(width, height) * FILL) / s.scale;
      const cx0 = width / 2;
      const cy0 = height / 2 + (reduced ? 0 : Math.sin(time * 0.8) * 3);
      const camera = 14;

      const projected = s.atoms.map((a, i) => {
        const vib = reduced ? 0 : 0.035;
        const x0 = a.pos[0] + Math.sin(time * 7 + a.p.seed) * vib;
        const y0 = a.pos[1] + Math.cos(time * 6 + a.p.seed * 1.3) * vib;
        const z0 = a.pos[2] + Math.sin(time * 5 + a.p.seed * 0.7) * vib;
        const x1 = x0 * cy + z0 * sy;
        const z1 = -x0 * sy + z0 * cy;
        const y2 = y0 * cp - z1 * sp;
        const z2 = y0 * sp + z1 * cp;
        const f = camera / (camera - z2);
        const color = a.colorT < 0.5 ? a.p.fromColor : a.p.toColor;
        return { i, x: cx0 + x1 * unit * f, y: cy0 - y2 * unit * f, z: z2, f, a, color };
      });

      // Soft field behind the molecule.
      const pulse = reduced ? 1 : 0.85 + Math.sin(time * 1.6) * 0.15;
      const glow = ctx.createRadialGradient(cx0, cy0, 0, cx0, cy0, Math.min(width, height) * 0.4);
      glow.addColorStop(0, `rgba(33,191,117,${0.16 * pulse})`);
      glow.addColorStop(1, 'rgba(33,191,117,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      type Item = { z: number; draw: () => void };
      const items: Item[] = [];

      const addBonds = (m: Molecule | null, alpha: number) => {
        if (!m || alpha <= 0.01) return;
        for (const [a, b, order] of m.bonds) {
          const A = projected[a];
          const B = projected[b];
          if (!A || !B) continue;
          const w = 0.11 * unit * ((A.f + B.f) / 2);
          items.push({
            z: (A.z + B.z) / 2 - 0.01,
            draw: () => {
              const dx = B.x - A.x;
              const dy = B.y - A.y;
              const len = Math.hypot(dx, dy) || 1;
              const nx = -dy / len;
              const ny = dx / len;
              const offsets = order === 2 ? [-w * 0.9, w * 0.9] : [0];
              const grad = ctx.createLinearGradient(A.x, A.y, B.x, B.y);
              grad.addColorStop(0, STYLE[A.color].base);
              grad.addColorStop(1, STYLE[B.color].base);
              ctx.globalAlpha = alpha * Math.min(A.a.alpha, B.a.alpha);
              ctx.strokeStyle = grad;
              ctx.lineCap = 'round';
              ctx.lineWidth = order === 2 ? w * 0.7 : w;
              for (const o of offsets) {
                ctx.beginPath();
                ctx.moveTo(A.x + nx * o, A.y + ny * o);
                ctx.lineTo(B.x + nx * o, B.y + ny * o);
                ctx.stroke();
              }
              ctx.globalAlpha = 1;
            },
          });
        }
      };
      addBonds(previous, 1 - smooth(0, 0.3, s.t));
      addBonds(current, smooth(0.62, 1, s.t));

      for (const P of projected) {
        if (P.a.alpha <= 0.01) continue;
        const from = STYLE[P.a.p.fromColor];
        const to = STYLE[P.a.p.toColor];
        const base = mix(from.base, to.base, P.a.colorT);
        const light = mix(from.light, to.light, P.a.colorT);
        const edge = mix(from.base, to.base, P.a.colorT, 0.55);
        const r = (from.radius + (to.radius - from.radius) * P.a.colorT) * unit * P.f;
        items.push({
          z: P.z,
          draw: () => {
            ctx.globalAlpha = P.a.alpha;
            const g = ctx.createRadialGradient(
              P.x - r * 0.38,
              P.y - r * 0.42,
              r * 0.08,
              P.x,
              P.y,
              r,
            );
            g.addColorStop(0, light);
            g.addColorStop(0.45, base);
            g.addColorStop(1, edge);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(P.x, P.y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          },
        });
      }

      items.sort((a, b) => a.z - b.z).forEach((item) => item.draw());
    };

    const loop = (now: number) => {
      frame = 0;
      draw(now);
      if (visible && !reduced) frame = requestAnimationFrame(loop);
    };

    const setMolecule = (m: Molecule) => {
      const now = performance.now();
      const state = current ? sample(now) : null;
      const targets = centred(m);
      particles.forEach((p, i) => {
        const cur = state?.atoms[i];
        p.from = cur ? cur.pos : scatter(i + 1);
        p.fromAlpha = cur ? cur.alpha : 0;
        p.fromColor = cur
          ? cur.colorT < 0.5
            ? cur.p.fromColor
            : cur.p.toColor
          : (m.atoms[i]?.el ?? 'H');
        const target = targets[i];
        const atom = m.atoms[i];
        p.to = target ?? [0, 0, 0];
        p.toAlpha = atom ? 1 : 0;
        p.toColor = atom?.el ?? p.fromColor;
      });
      previous = current;
      fromScale = current ? toScale : extent(targets);
      toScale = extent(targets);
      morphMs = current ? MORPH_MS : INTRO_MS;
      morphStart = now;
      current = m;
      if (reduced) draw(now);
      else if (!frame && visible) frame = requestAnimationFrame(loop);
    };

    engine.current = { setMolecule };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible && !reduced && !frame) frame = requestAnimationFrame(loop);
    });
    io.observe(canvas);

    // Drag (mouse, pen or a horizontal swipe; vertical swipes still scroll the page).
    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      drag.id = event.pointerId;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.vYaw = 0;
      drag.vPitch = 0;
      canvas.setPointerCapture(event.pointerId);
    };
    const onDrag = (event: PointerEvent) => {
      if (event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.vYaw = dx * 0.012;
      drag.vPitch = dy * 0.008;
      drag.yaw += drag.vYaw;
      drag.pitch = clamp(drag.pitch + drag.vPitch, -0.9, 0.9);
      if (Math.abs(dx) + Math.abs(dy) > 2) setDragged(true);
      if (reduced) draw(performance.now());
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== drag.id) return;
      drag.id = -1;
      if (reduced) {
        drag.vYaw = 0;
        drag.vPitch = 0;
      }
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onDrag);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    // Gentle follow of the pointer anywhere in the hero.
    const section = canvas.closest('section') ?? canvas;
    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = clamp((event.clientX - (rect.left + rect.width / 2)) / rect.width, -1, 1);
      pointer.y = clamp((event.clientY - (rect.top + rect.height / 2)) / (rect.height * 2), -1, 1);
    };
    const onLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };
    if (fine && !reduced) {
      section.addEventListener('pointermove', onMove as EventListener, { passive: true });
      section.addEventListener('pointerleave', onLeave);
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      io.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onDrag);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      section.removeEventListener('pointermove', onMove as EventListener);
      section.removeEventListener('pointerleave', onLeave);
      engine.current = null;
    };
  }, []);

  // Morph whenever the molecule changes (and assemble the first one on mount).
  useEffect(() => {
    engine.current?.setMolecule(molecule);
  }, [molecule]);

  const elements = elementsOf(molecule);
  const bondCount = molecule.bonds.length;

  return (
    <figure className={styles.figure}>
      <div className={styles.instrument}>
        <div className={styles.plate} aria-hidden="true" />
        <div className={styles.ticks} aria-hidden="true" />
        <div className={styles.orbit} data-orbit="" aria-hidden="true" />
        <div key={molecule.id} className={styles.scan} aria-hidden="true" />
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

        <p className={`${styles.corner} ${styles.topLeft}`}>
          <span className={styles.kicker}>Molecule viewer</span>
          <span className={styles.value}>{market}</span>
        </p>
        <p className={`${styles.corner} ${styles.topRight}`}>
          <span className={styles.kicker}>Molar mass</span>
          <span className={styles.value}>{molarMass(molecule).toFixed(2)} g/mol</span>
        </p>
        <ul className={`${styles.corner} ${styles.bottomLeft} ${styles.legend}`}>
          {elements.map((el) => (
            <li key={el} title={ELEMENT_NAMES[el]}>
              <span className={styles.dot} data-el={el} aria-hidden="true" />
              {el}
              <span className="visually-hidden"> ({ELEMENT_NAMES[el]})</span>
            </li>
          ))}
        </ul>
        <p className={`${styles.corner} ${styles.bottomRight} ${styles.value}`}>
          {molecule.atoms.length} atoms · {bondCount} bonds
        </p>
        <span className={`${styles.hint} ${dragged ? styles.hintDone : ''}`} aria-hidden="true">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
            <path
              d="M13 8a5 5 0 1 1-1.46-3.54M13 2.5v2.4h-2.4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Drag to rotate
        </span>
      </div>
      {controls}
      <figcaption key={molecule.id} className={styles.caption}>
        <span className={styles.label}>Chemistry at work</span>
        <span className={styles.name}>
          {molecule.name} <span className={styles.formula}>{molecule.formula}</span>
        </span>
        <span className={styles.role}>{molecule.role}</span>
      </figcaption>
    </figure>
  );
}
