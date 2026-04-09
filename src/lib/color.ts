import { seededRands } from "./hash";

export interface Palette {
  /** 5 HSL color objects, sorted by luminance (darkest → brightest) */
  colors: HSLColor[];
  /** The focal color — always the brightest, used for the central shape */
  focal: HSLColor;
  /** Background color — always the darkest */
  base: HSLColor;
}

export interface HSLColor {
  h: number; // 0–360
  s: number; // 0–100
  l: number; // 0–100
  hex: string;
}

function hslToHex(h: number, s: number, l: number): string {
  const sl = s / 100;
  const ll = l / 100;
  const a = sl * Math.min(ll, 1 - ll);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function makeColor(h: number, s: number, l: number): HSLColor {
  return { h, s, l, hex: hslToHex(h, s, l) };
}

/**
 * Build a 5-color palette from a seed string.
 *
 * Luminance Hierarchy — each step up in the palette is ~8% brighter so the
 * focal (central) shape is always visually dominant over the background.
 *
 * You may also pass a custom palette array (5 hex strings) to override.
 */
export function buildPalette(seed: string, custom?: string[]): Palette {
  if (custom && custom.length >= 5) {
    const colors = custom.slice(0, 5).map(hexToHsl);
    return { colors, focal: colors[4], base: colors[0] };
  }

  const rands = seededRands(seed + ":palette", 6);

  const baseHue = rands[0] * 360;
  // Hues are spaced 60–90° apart so the palette always has visible variety
  const hueStep = 60 + rands[1] * 30;
  // Base saturation — vivid but not neon
  const baseSat = 58 + rands[2] * 28; // 58–86
  // Base lightness — starts at a mid-dark value, each step is +8%
  const baseLit = 30 + rands[3] * 10; // 30–40

  const colors: HSLColor[] = Array.from({ length: 5 }, (_, i) => {
    const hue = (baseHue + hueStep * i) % 360;
    const sat = Math.max(40, baseSat - i * 4); // slight desaturation as we go brighter
    const lit = Math.min(78, baseLit + i * 10); // +10% per step → focal is 40% brighter than base
    return makeColor(hue, sat, lit);
  });

  return { colors, focal: colors[4], base: colors[0] };
}

/** Parse a hex string into an HSLColor (approximate, for custom palettes) */
function hexToHsl(hex: string): HSLColor {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let s = 0, h = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return makeColor(Math.round(h * 360), Math.round(s * 100), Math.round(l * 100));
}

export function cssHsl(c: HSLColor, alpha = 1): string {
  return alpha < 1
    ? `hsla(${c.h},${c.s}%,${c.l}%,${alpha})`
    : `hsl(${c.h},${c.s}%,${c.l}%)`;
}
