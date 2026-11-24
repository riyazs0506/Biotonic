import { describe, expect, it } from 'vitest';
import { industries } from '../../content/industries';
import {
  DEFAULT_MOLECULE,
  elementsOf,
  MAX_MOLECULE_ATOMS,
  molarMass,
  MOLECULES,
  moleculeFor,
  type Element,
  type Molecule,
} from './molecules';

const VALENCE: Record<Element, number> = { H: 1, O: 2, C: 4, Si: 4 };

/** Atom counts the published formula stands for. */
const COMPOSITION: Record<string, Partial<Record<Element, number>>> = {
  'acetic-acid': { C: 2, H: 4, O: 2 },
  methyltrimethoxysilane: { Si: 1, C: 4, H: 12, O: 3 },
  'ethylene-glycol': { C: 2, H: 6, O: 2 },
};

const all: Molecule[] = [...new Set([...Object.values(MOLECULES), DEFAULT_MOLECULE])];
const distance = (m: Molecule, a: number, b: number) => {
  const p = m.atoms[a]?.p ?? [0, 0, 0];
  const q = m.atoms[b]?.p ?? [0, 0, 0];
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
};

describe('hero molecules', () => {
  it('has one for every market, and a default for anything else', () => {
    for (const industry of industries) {
      expect(MOLECULES[industry.slug], industry.slug).toBeDefined();
    }
    expect(moleculeFor(undefined)).toBe(DEFAULT_MOLECULE);
    expect(moleculeFor('not-a-market')).toBe(DEFAULT_MOLECULE);
  });

  it('reports textbook molar masses and element lists', () => {
    const byId = Object.fromEntries(all.map((m) => [m.id, m]));
    const mass = (id: string) => Number(molarMass(byId[id] ?? DEFAULT_MOLECULE).toFixed(2));
    expect(mass('acetic-acid')).toBe(60.05);
    expect(mass('methyltrimethoxysilane')).toBe(136.22);
    expect(mass('ethylene-glycol')).toBe(62.07);
    expect(elementsOf(byId['methyltrimethoxysilane'] ?? DEFAULT_MOLECULE)).toEqual([
      'C',
      'H',
      'O',
      'Si',
    ]);
  });

  describe.each(all.map((m) => [m.name, m] as const))('%s', (_, m) => {
    it('matches its formula and fits the renderer', () => {
      const counts: Partial<Record<Element, number>> = {};
      for (const atom of m.atoms) counts[atom.el] = (counts[atom.el] ?? 0) + 1;
      expect(counts).toEqual(COMPOSITION[m.id]);
      expect(m.atoms.length).toBeLessThanOrEqual(MAX_MOLECULE_ATOMS);
    });

    it('obeys valence with valid, unique bonds', () => {
      const order = new Array<number>(m.atoms.length).fill(0);
      const seen = new Set<string>();
      for (const [a, b, kind = 1] of m.bonds) {
        expect(a).not.toBe(b);
        expect(m.atoms[a]).toBeDefined();
        expect(m.atoms[b]).toBeDefined();
        const key = [a, b].sort((x, y) => x - y).join('-');
        expect(seen.has(key), key).toBe(false);
        seen.add(key);
        order[a] = (order[a] ?? 0) + kind;
        order[b] = (order[b] ?? 0) + kind;
      }
      m.atoms.forEach((atom, i) => expect(order[i], `${atom.el}#${i}`).toBe(VALENCE[atom.el]));
    });

    it('is one connected molecule', () => {
      const reached = new Set([0]);
      let grew = true;
      while (grew) {
        grew = false;
        for (const [a, b] of m.bonds) {
          if (reached.has(a) !== reached.has(b)) {
            reached.add(a).add(b);
            grew = true;
          }
        }
      }
      expect(reached.size).toBe(m.atoms.length);
    });

    it('has realistic geometry', () => {
      const bonded = new Set(m.bonds.map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`));
      for (const [a, b] of m.bonds) {
        const d = distance(m, a, b);
        expect(d).toBeGreaterThan(0.9);
        expect(d).toBeLessThan(1.9);
      }
      for (let a = 0; a < m.atoms.length; a++) {
        for (let b = a + 1; b < m.atoms.length; b++) {
          if (!bonded.has(`${a}-${b}`)) expect(distance(m, a, b)).toBeGreaterThan(1.5);
        }
      }
    });
  });
});
