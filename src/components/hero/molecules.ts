/**
 * Ball-and-stick molecules shown in the hero — one representative piece of chemistry per
 * market, part of Biotonic's "spread real awareness about chemicals" mission. Coordinates are
 * in ångström-like units with realistic bond lengths and angles (simplified conformations).
 * They illustrate the chemistry of each market; they are not product claims.
 */
export type Element = 'C' | 'H' | 'O' | 'Si';

export interface Atom {
  el: Element;
  p: [number, number, number];
}

export interface Molecule {
  id: string;
  name: string;
  /** Formula with Unicode subscripts. */
  formula: string;
  /** One line on what it does, in plain words. */
  role: string;
  atoms: Atom[];
  /** Pairs of atom indexes; a third value of 2 marks a double bond. */
  bonds: [number, number, (1 | 2)?][];
}

/** Size of the renderer's particle pool; every molecule must fit in it. */
export const MAX_MOLECULE_ATOMS = 24;

type Vec = [number, number, number];
const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec, s: number): Vec => [a[0] * s, a[1] * s, a[2] * s];
const norm = (a: Vec): Vec => scale(a, 1 / Math.hypot(...a));
const cross = (a: Vec, b: Vec): Vec => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** Three hydrogens in a tetrahedral fan around a carbon, pointing away from `bondedFrom`. */
function methylHydrogens(carbon: Vec, bondedFrom: Vec): Vec[] {
  const axis = norm([
    carbon[0] - bondedFrom[0],
    carbon[1] - bondedFrom[1],
    carbon[2] - bondedFrom[2],
  ]);
  const helper: Vec = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = norm(cross(axis, helper));
  const v = cross(axis, u);
  // cos(109.5° - 90°) along the axis, sin for the fan.
  return [0, 1, 2].map((k) => {
    const a = (k * 2 * Math.PI) / 3;
    const dir = add(
      scale(axis, 0.334),
      scale(add(scale(u, Math.cos(a)), scale(v, Math.sin(a))), 0.943),
    );
    return add(carbon, scale(dir, 1.09));
  });
}

function build(
  meta: Omit<Molecule, 'atoms' | 'bonds'>,
  atoms: Atom[],
  bonds: Molecule['bonds'],
): Molecule {
  return { ...meta, atoms, bonds };
}

/* Ethylene glycol, HOCH₂CH₂OH (anti conformation). */
const ethyleneGlycol = build(
  {
    id: 'ethylene-glycol',
    name: 'Ethylene glycol',
    formula: 'C₂H₆O₂',
    role: 'The building block of polyester fibre and engine coolants.',
  },
  [
    { el: 'C', p: [-0.76, 0, 0] },
    { el: 'C', p: [0.76, 0, 0] },
    { el: 'O', p: [-1.3, 1.33, 0] },
    { el: 'O', p: [1.3, -1.33, 0] },
    { el: 'H', p: [-2.26, 1.28, 0] },
    { el: 'H', p: [2.26, -1.28, 0] },
    { el: 'H', p: [-1.13, -0.53, 0.89] },
    { el: 'H', p: [-1.13, -0.53, -0.89] },
    { el: 'H', p: [1.13, 0.53, 0.89] },
    { el: 'H', p: [1.13, 0.53, -0.89] },
  ],
  [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 4],
    [3, 5],
    [0, 6],
    [0, 7],
    [1, 8],
    [1, 9],
  ],
);

/* Acetic acid, CH₃COOH. */
const aceticAcidMethyl: Vec = [-0.76, 0, 0];
const aceticAcidCarboxyl: Vec = [0.76, 0, 0];
const aceticAcid = build(
  {
    id: 'acetic-acid',
    name: 'Acetic acid',
    formula: 'CH₃COOH',
    role: 'Keeps dye baths at the right pH, so colours fix evenly.',
  },
  [
    { el: 'C', p: aceticAcidMethyl },
    { el: 'C', p: aceticAcidCarboxyl },
    { el: 'O', p: [1.36, 1.05, 0] },
    { el: 'O', p: [1.38, -1.15, 0] },
    { el: 'H', p: [2.33, -1.02, 0] },
    ...methylHydrogens(aceticAcidMethyl, aceticAcidCarboxyl).map((p) => ({ el: 'H' as const, p })),
  ],
  [
    [0, 1],
    [1, 2, 2],
    [1, 3],
    [3, 4],
    [0, 5],
    [0, 6],
    [0, 7],
  ],
);

/* Methyltrimethoxysilane, CH₃Si(OCH₃)₃ — the kind of silane used in water repellents. */
const si: Vec = [0, 0.2, 0];
const siMethyl: Vec = [0, 2.05, 0];
const oxygenDirs: Vec[] = [
  [0.943, -0.333, 0],
  [-0.471, -0.333, 0.816],
  [-0.471, -0.333, -0.816],
];
const oxygens = oxygenDirs.map((d) => add(si, scale(d, 1.64)));
const methoxyCarbons = oxygens.map((o, i) => {
  const d = oxygenDirs[i] ?? [1, 0, 0];
  return add(o, scale(norm(add(d, [0, -0.55, 0])), 1.43));
});
const silaneAtoms: Atom[] = [
  { el: 'Si', p: si },
  { el: 'C', p: siMethyl },
  ...oxygens.map((p) => ({ el: 'O' as const, p })),
  ...methoxyCarbons.map((p) => ({ el: 'C' as const, p })),
  ...methylHydrogens(siMethyl, si).map((p) => ({ el: 'H' as const, p })),
  ...methoxyCarbons.flatMap((c, i) =>
    methylHydrogens(c, oxygens[i] ?? si).map((p) => ({ el: 'H' as const, p })),
  ),
];
const silaneBonds: Molecule['bonds'] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [2, 5],
  [3, 6],
  [4, 7],
  [1, 8],
  [1, 9],
  [1, 10],
  ...[5, 6, 7].flatMap((c, i) => [0, 1, 2].map((k): [number, number] => [c, 11 + i * 3 + k])),
];
const silane = build(
  {
    id: 'methyltrimethoxysilane',
    name: 'Methyltrimethoxysilane',
    formula: 'CH₃Si(OCH₃)₃',
    role: 'A silane: it bonds into concrete and leaves the surface water-repellent.',
  },
  silaneAtoms,
  silaneBonds,
);

/** Representative chemistry for each market slug in `content/industries.ts`. */
export const MOLECULES: Record<string, Molecule> = {
  textile: aceticAcid,
  construction: silane,
  industrial: ethyleneGlycol,
};

export const DEFAULT_MOLECULE = ethyleneGlycol;

export function moleculeFor(market: string | undefined): Molecule {
  return (market && MOLECULES[market]) || DEFAULT_MOLECULE;
}

/** Element names, in the order the legend lists them (Hill order: C, H, then alphabetical). */
export const ELEMENT_NAMES: Record<Element, string> = {
  C: 'Carbon',
  H: 'Hydrogen',
  O: 'Oxygen',
  Si: 'Silicon',
};

/** Standard atomic weights (IUPAC, conventional values). */
const ATOMIC_WEIGHT: Record<Element, number> = { C: 12.011, H: 1.008, O: 15.999, Si: 28.085 };

/** Molar mass in g/mol, computed from the atoms. */
export function molarMass(m: Molecule): number {
  return m.atoms.reduce((sum, atom) => sum + ATOMIC_WEIGHT[atom.el], 0);
}

/** The elements a molecule contains, in legend order. */
export function elementsOf(m: Molecule): Element[] {
  const present = new Set(m.atoms.map((a) => a.el));
  return (Object.keys(ELEMENT_NAMES) as Element[]).filter((el) => present.has(el));
}
