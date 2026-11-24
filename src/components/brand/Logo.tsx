/**
 * Official Biotonic wordmark (updated November 2026), generated from the client-supplied
 * artwork (master: brand-source/logo-2026-11-master.png). The wordmark is never re-typed or
 * redrawn. Brand rules: keep clear space equal to the "O" height; minimum width 120px on screen.
 */
const variants = {
  /** Full colour on light: black letters, green "ON". */
  continuous: { file: 'logo-continuous', width: 720, height: 81 },
  /** Reversed for dark backgrounds: Lab White letters, Reaction Green "ON". */
  reversed: { file: 'logo-continuous-reversed', width: 720, height: 81 },
  /** Mono white, for use on Biotonic Green. */
  'mono-white': { file: 'logo-mono-white', width: 720, height: 81 },
} as const;

export type LogoVariant = keyof typeof variants;

interface LogoProps {
  variant?: LogoVariant;
  /** Rendered height in px; width follows the artwork's aspect ratio. */
  height?: number;
  className?: string;
  /** Use "" when the logo sits inside a link that already names Biotonic. */
  alt?: string;
  priority?: boolean;
}

export function Logo({
  variant = 'continuous',
  height = 28,
  className,
  alt = 'Biotonic',
  priority,
}: LogoProps) {
  const v = variants[variant];
  const width = Math.max(120, Math.round((v.width / v.height) * height));
  return (
    <picture className={className}>
      <source srcSet={`/brand/${v.file}.webp`} type="image/webp" />
      <img
        src={`/brand/${v.file}.png`}
        alt={alt}
        width={width}
        height={Math.round((width * v.height) / v.width)}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        loading={priority ? 'eager' : 'lazy'}
      />
    </picture>
  );
}
