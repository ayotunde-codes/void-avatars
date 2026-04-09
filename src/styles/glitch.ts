/**
 * GLITCH — 16×16 neon pixel grid + chromatic aberration + horizontal slice disruptions.
 *
 * GSAP-targetable IDs / classes:
 *   id="va-${uid}-glitch-base"   — main pixel grid group
 *   id="va-${uid}-glitch-slices" — offset slice disruption group
 *   class="va-pxc-${uid}"        — individual pixel rects (Binary Rain target)
 */

import { Palette, cssHsl } from "../lib/color";
import { FilterIds } from "../lib/filters";
import { seededRands } from "../lib/hash";

export function renderGlitch(
  seed: string,
  size: number,
  palette: Palette,
  ids: FilterIds,
  uid: string,
): { extraDefs: string; body: string } {
  const r = seededRands(seed + ":gl", 80);
  const GRID = 16;
  const cell = size / GRID;

  // Neon palette derived from focal hue + rotations
  const f = palette.focal;
  const neons = [
    `hsl(${f.h | 0},100%,62%)`,
    `hsl(${(f.h + 120) % 360 | 0},100%,58%)`,
    `hsl(${(f.h + 240) % 360 | 0},100%,62%)`,
    "#00ffcc",
    "#ff00aa",
  ];

  // Core 16×16 symmetric pixel grid
  let cells = "";
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID / 2; col++) {
      const v = r[(row * (GRID / 2) + col) % r.length];
      if (v > 0.48) {
        const ci = Math.floor(v * neons.length);
        const clr = neons[Math.min(ci, neons.length - 1)];
        const x = col * cell, mx = (GRID - 1 - col) * cell, y = row * cell;
        const pad = cell * 0.04;
        const w = cell - pad * 2, h = cell - pad * 2;
        cells += `<rect x="${x + pad}" y="${y + pad}" width="${w}" height="${h}" fill="${clr}" class="va-pxc-${uid}"/>`;
        if (col !== GRID / 2 - 1) {
          cells += `<rect x="${mx + pad}" y="${y + pad}" width="${w}" height="${h}" fill="${clr}" class="va-pxc-${uid}"/>`;
        }
      }
    }
  }

  // Horizontal slice disruptions (2–5 rows offset sideways)
  const sliceCount = 2 + Math.floor(r[70] * 4);
  let sliceDefs = "", sliceEls = "";
  for (let i = 0; i < sliceCount; i++) {
    const sliceRow = Math.floor(r[71 + i] * (GRID - 2)) + 1;
    const offset = (r[72 + i] - 0.5) * size * 0.28;
    const sliceH = cell * (0.8 + r[73 + i]);
    const cpId = `va-slcp-${uid}-${i}`;
    sliceDefs += `<clipPath id="${cpId}"><rect x="${-size}" y="${sliceRow * cell}" width="${size * 3}" height="${sliceH}"/></clipPath>`;
    sliceEls += `<g clip-path="url(#${cpId})" transform="translate(${offset},0)" opacity="0.9">${cells}</g>`;
  }

  // Chromatic aberration filter — RGB channel split
  const caOff = size * 0.022;
  const caFilter = `<filter id="va-caf-${uid}" x="-5%" y="0%" width="110%" height="100%" color-interpolation-filters="sRGB">
    <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>
    <feOffset in="r" dx="-${caOff}" dy="0" result="ro"/>
    <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
    <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/>
    <feOffset in="b" dx="${caOff}" dy="0" result="bo"/>
    <feMerge><feMergeNode in="ro"/><feMergeNode in="g"/><feMergeNode in="bo"/></feMerge>
  </filter>`;

  const extraDefs = caFilter + "\n  " + sliceDefs;

  const body = `
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#000"/>

  <!-- Main pixel grid with chromatic aberration -->
  <g id="va-${uid}-glitch-base" filter="url(#va-caf-${uid})">${cells}</g>

  <!-- Offset slice disruptions -->
  <g id="va-${uid}-glitch-slices" filter="url(#va-caf-${uid})" opacity="0.85">${sliceEls}</g>

  <!-- Grain overlay -->
  <rect width="${size}" height="${size}" fill="transparent" filter="url(#${ids.grain})" opacity="0.38"/>`;

  return { extraDefs, body };
}
