/**
 * Official Biotonic logo artwork, extracted at full resolution from the approved
 * "Biotonic – Logo Presentation". The wordmark is never re-typed or redrawn.
 * Brand rules: keep clear space equal to the "O" height; minimum width 120px on screen.
 */
const variants = {
  /** Lockup B · continuous, full colour on light. */
  continuous: { file: 'logo-continuous', width: 640, height: 99 },
  /** Lockup A · spaced, full colour on light. */
  spaced: { file: 'logo-spaced', width: 960, height: 136 },
  /** Continuous, reversed for dark backgrounds. */
  reversed: { file: 'logo-continuous-reversed', width: 640, height: 98 },
  /** Mono white, for use on Biotonic Green. */
  'mono-white': { file: 'logo-mono-white', width: 640, height: 99 },
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
