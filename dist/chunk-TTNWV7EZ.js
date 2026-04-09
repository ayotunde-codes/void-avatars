import { seededRands } from './chunk-5QPN6A5Y.js';

// src/lib/color.ts
function hslToHex(h, s, l) {
  const sl = s / 100;
  const ll = l / 100;
  const a = sl * Math.min(ll, 1 - ll);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
function makeColor(h, s, l) {
  return { h, s, l, hex: hslToHex(h, s, l) };
}
function buildPalette(seed, custom) {
  if (custom && custom.length >= 5) {
    const colors2 = custom.slice(0, 5).map(hexToHsl);
    return { colors: colors2, focal: colors2[4], base: colors2[0] };
  }
  const rands = seededRands(seed + ":palette", 6);
  const baseHue = rands[0] * 360;
  const hueStep = 60 + rands[1] * 30;
  const baseSat = 58 + rands[2] * 28;
  const baseLit = 30 + rands[3] * 10;
  const colors = Array.from({ length: 5 }, (_, i) => {
    const hue = (baseHue + hueStep * i) % 360;
    const sat = Math.max(40, baseSat - i * 4);
    const lit = Math.min(78, baseLit + i * 10);
    return makeColor(hue, sat, lit);
  });
  return { colors, focal: colors[4], base: colors[0] };
}
function hexToHsl(hex) {
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
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return makeColor(Math.round(h * 360), Math.round(s * 100), Math.round(l * 100));
}
function cssHsl(c, alpha = 1) {
  return alpha < 1 ? `hsla(${c.h},${c.s}%,${c.l}%,${alpha})` : `hsl(${c.h},${c.s}%,${c.l}%)`;
}

export { buildPalette, cssHsl };
//# sourceMappingURL=chunk-TTNWV7EZ.js.map
//# sourceMappingURL=chunk-TTNWV7EZ.js.map