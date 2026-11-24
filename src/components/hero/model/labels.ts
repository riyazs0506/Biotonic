import * as THREE from 'three';

/**
 * Printed pack labels for the 3D hero, drawn on canvases with the real Biotonic wordmark.
 * Everything is same-origin (no external textures), so the site's CSP is unchanged.
 */
const LOGO_SRC = '/brand/logo-continuous.png';

let logoPromise: Promise<HTMLImageElement> | undefined;

export function loadLogo(): Promise<HTMLImageElement> {
  logoPromise ??= new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Logo failed to load'));
    img.src = LOGO_SRC;
  });
  return logoPromise;
}

export interface LabelSpec {
  width: number;
  height: number;
  band: string;
  caption: string;
  footer?: string;
  /** Logo width as a share of the label width. */
  logoScale?: number;
}

const FONT = '"Inter Variable", Inter, system-ui, sans-serif';

export function drawLabel(spec: LabelSpec, logo: HTMLImageElement): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = spec.width;
  canvas.height = spec.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  const { width: w, height: h } = spec;

  // Paper with a faint vertical falloff, like a printed label under studio light.
  const paper = ctx.createLinearGradient(0, 0, 0, h);
  paper.addColorStop(0, '#fdfcf9');
  paper.addColorStop(1, '#f1eee6');
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, w, h);

  // Brand band
  const bandH = Math.round(h * 0.2);
  ctx.fillStyle = '#109255';
  ctx.fillRect(0, 0, w, bandH);
  ctx.fillStyle = '#fbfaf7';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(bandH * 0.42)}px ${FONT}`;
  ctx.letterSpacing = `${Math.round(bandH * 0.12)}px`;
  ctx.fillText(spec.band, w / 2, bandH / 2 + 1);

  // Wordmark
  const logoW = w * (spec.logoScale ?? 0.62);
  const logoH = (logo.height / logo.width) * logoW;
  ctx.drawImage(logo, (w - logoW) / 2, bandH + (h - bandH) * 0.26, logoW, logoH);

  // Caption
  ctx.fillStyle = '#5b5f68';
  ctx.font = `600 ${Math.round(h * 0.07)}px ${FONT}`;
  ctx.letterSpacing = `${Math.round(h * 0.018)}px`;
  ctx.fillText(spec.caption, w / 2, bandH + (h - bandH) * 0.66);

  if (spec.footer) {
    ctx.strokeStyle = '#d9d5ca';
    ctx.lineWidth = Math.max(2, h * 0.006);
    ctx.beginPath();
    ctx.moveTo(w * 0.18, h * 0.84);
    ctx.lineTo(w * 0.82, h * 0.84);
    ctx.stroke();
    ctx.fillStyle = '#8a8d94';
    ctx.font = `500 ${Math.round(h * 0.052)}px ${FONT}`;
    ctx.letterSpacing = `${Math.round(h * 0.01)}px`;
    ctx.fillText(spec.footer, w / 2, h * 0.92);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
