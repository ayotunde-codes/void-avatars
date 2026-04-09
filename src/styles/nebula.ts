/**
 * NEBULA — Layered, blurry elliptical blobs that look like deep-space photography.
 *
 * Design:
 * - 4–5 overlapping, highly blurred ellipse elements with varying opacities (30–60%)
 * - Off-center drift using seeded randomness (never center-aligned)
 * - feColorMatrix "color bleed" effect where blobs overlap, creating vibrant new hues
 * - Deep void charcoal background (#0A0A0A)
 *
 * GSAP-targetable IDs / classes:
 *   id="va-${uid}-nebula-blobs"    — blobs container group ("The Drift" animation)
 *   class="va-nb-${uid}"           — individual blob ellipses (cx/cy float targets)
 *   id="va-${uid}-nebula-blob-N"   — individual blob by index
 *   id="va-${uid}-nebula-stars"    — star dots group (mood eyes target)
 */

import { Palette, cssHsl } from "../lib/color";
import { FilterIds } from "../lib/filters";
import { seededRands } from "../lib/hash";

export function renderNebula(
  seed: string,
  size: number,
  palette: Palette,
  ids: FilterIds,
  uid: string,
): { extraDefs: string; body: string } {
  const r = seededRands(seed + ":nebula", 40);

  const bgColor = "#0A0A0A";
  const blobCount = 4 + Math.floor(r[0] * 2); // 4–5 blobs

  // Generate blobs — off-center positions with drift
  interface Blob {
    cx: number; cy: number;
    rx: number; ry: number;
    color: string;
    opacity: number;
    blur: number;
  }

  const blobs: Blob[] = Array.from({ length: blobCount }, (_, i) => {
    const ci = i % palette.colors.length;
    const c = palette.colors[ci];
    // Drift off-center: range 15%–85% of size
    const cx = size * (0.15 + r[(i * 4) % r.length] * 0.70);
    const cy = size * (0.15 + r[(i * 4 + 1) % r.length] * 0.70);
    // Elliptical radii — large, overlapping
    const rx = size * (0.18 + r[(i * 4 + 2) % r.length] * 0.22);
    const ry = size * (0.15 + r[(i * 4 + 3) % r.length] * 0.25);
    const opacity = 0.30 + r[(i * 3 + 20) % r.length] * 0.30; // 30–60%
    const blur = size * (0.06 + r[(i * 2 + 25) % r.length] * 0.08); // heavy blur

    return { cx, cy, rx, ry, color: cssHsl(c), opacity, blur };
  });

  // Per-blob blur filters
  const blobFilters = blobs.map((b, i) =>
    `<filter id="va-nbf-${uid}-${i}" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="${b.blur.toFixed(1)}"/>
    </filter>`,
  ).join("\n  ");

  // Color bleed filter — feColorMatrix that shifts hues where blobs overlap
  const colorBleedFilter = `<filter id="va-ncb-${uid}" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
    <feColorMatrix type="matrix" values="
      1.2  0.15 0.0  0 0
      0.0  1.1  0.2  0 0
      0.15 0.0  1.3  0 0
      0    0    0    1 0
    "/>
  </filter>`;

  const blobEls = blobs.map((b, i) =>
    `<ellipse
      cx="${b.cx.toFixed(2)}" cy="${b.cy.toFixed(2)}"
      rx="${b.rx.toFixed(2)}" ry="${b.ry.toFixed(2)}"
      fill="${b.color}" opacity="${b.opacity.toFixed(2)}"
      filter="url(#va-nbf-${uid}-${i})"
      class="va-nb-${uid}" id="va-${uid}-nebula-blob-${i}"/>`,
  ).join("\n    ");

  // Small bright star dots scattered across the field
  const starCount = 6 + Math.floor(r[35] * 8);
  const starEls = Array.from({ length: starCount }, (_, i) => {
    const sx = size * (0.05 + r[(i * 2 + 30) % r.length] * 0.90);
    const sy = size * (0.05 + r[(i * 2 + 31) % r.length] * 0.90);
    const sr = size * (0.003 + r[(i + 36) % r.length] * 0.006);
    const brightness = 70 + Math.floor(r[(i + 38) % r.length] * 30); // 70–100% lightness
    return `<circle cx="${sx.toFixed(2)}" cy="${sy.toFixed(2)}" r="${sr.toFixed(2)}"
      fill="hsl(0,0%,${brightness}%)" opacity="${(0.4 + r[(i + 32) % r.length] * 0.6).toFixed(2)}"/>`;
  }).join("\n    ");

  const extraDefs = blobFilters + "\n  " + colorBleedFilter;

  const body = `
  <!-- Deep void background -->
  <rect width="${size}" height="${size}" fill="${bgColor}"/>

  <!-- Nebula blobs with color bleed overlay -->
  <g id="va-${uid}-nebula-blobs" filter="url(#va-ncb-${uid})">
    ${blobEls}
  </g>

  <!-- Star field -->
  <g id="va-${uid}-nebula-stars">
    ${starEls}
  </g>

  <!-- Grain overlay -->
  <rect width="${size}" height="${size}" fill="transparent" filter="url(#${ids.grain})" opacity="0.35"/>`;

  return { extraDefs, body };
}
