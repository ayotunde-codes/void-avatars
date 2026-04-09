/**
 * CHROMATIC HALFTONE — CMY dot layers with chromatic aberration and organic clumping.
 *
 * Design:
 * - Absolute black background (#000000) for extreme contrast
 * - Three overlapping dot layers: Cyan, Magenta, Yellow (CMY printing)
 * - 1px seed-based offset per layer creates chromatic aberration
 * - Dots follow a clumped noise pattern (not a perfect grid) for organic feel
 * - feColorMatrix glow filter makes dots "burn through a dark lens"
 *
 * GSAP-targetable IDs / classes:
 *   id="va-${uid}-ht-dots"         — all halftone dots container ("The Pulse" r animation)
 *   id="va-${uid}-ht-cyan"         — cyan layer group
 *   id="va-${uid}-ht-magenta"      — magenta layer group
 *   id="va-${uid}-ht-yellow"       — yellow layer group
 *   class="va-hd-${uid}"           — individual dot circles (radius sine-wave target)
 *   id="va-${uid}-ht-dot-N"        — individual dot by index
 */

import { Palette, cssHsl } from "../lib/color";
import { FilterIds } from "../lib/filters";
import { seededRands } from "../lib/hash";

export function renderHalftone(
  seed: string,
  size: number,
  palette: Palette,
  ids: FilterIds,
  uid: string,
): { extraDefs: string; body: string } {
  const r = seededRands(seed + ":halftone", 120);

  // CMY colors — printing primaries
  const cyan    = "#00e5ff";
  const magenta = "#ff00aa";
  const yellow  = "#ffe600";

  // Chromatic aberration offsets — 1px random drift per layer based on seed
  const cOff = { x: (r[0] - 0.5) * size * 0.025, y: (r[1] - 0.5) * size * 0.025 };
  const mOff = { x: (r[2] - 0.5) * size * 0.025, y: (r[3] - 0.5) * size * 0.025 };
  const yOff = { x: (r[4] - 0.5) * size * 0.025, y: (r[5] - 0.5) * size * 0.025 };

  // Clumped noise pattern — use seeded pseudo-Perlin noise to determine density
  // We simulate noise by combining multiple scaled random lookups
  function noiseAt(x: number, y: number, octave: number): number {
    const idx = (Math.floor(x * 7 + y * 13 + octave * 37)) % r.length;
    return r[Math.abs(idx) % r.length];
  }

  function clumpedNoise(nx: number, ny: number): number {
    // Two octaves of noise for organic clumping
    const n1 = noiseAt(nx, ny, 0);
    const n2 = noiseAt(nx * 2.3, ny * 2.3, 1);
    return n1 * 0.65 + n2 * 0.35;
  }

  // Dot grid — slightly irregular spacing for organic feel
  const baseStep = Math.max(3, Math.floor(size / 16));
  const cols = Math.ceil(size / baseStep) + 1;
  const rows = Math.ceil(size / baseStep) + 1;

  // Gradient center for density falloff
  const gcx = size * (0.30 + r[6] * 0.40);
  const gcy = size * (0.30 + r[7] * 0.40);
  const maxDist = size * 0.72;

  function generateLayer(color: string, offset: { x: number; y: number }, layerIdx: number): string {
    const dots: string[] = [];
    let di = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Base grid position with jitter for organic feel
        const jitterScale = baseStep * 0.25;
        const ri = (layerIdx * 400 + row * cols + col) % r.length;
        const cx = col * baseStep + (r[ri] - 0.5) * jitterScale;
        const cy = row * baseStep + (r[(ri + 1) % r.length] - 0.5) * jitterScale;

        // Clumped noise determines whether this dot appears
        const noise = clumpedNoise(col / cols, row / rows);
        // Distance from gradient center affects density threshold
        const dist = Math.hypot(cx - gcx, cy - gcy);
        const normalDist = Math.min(1, dist / maxDist);

        // Clumped threshold — dots cluster more near center
        const threshold = 0.25 + normalDist * 0.35;
        if (noise < threshold) continue;

        // Dot radius: larger near center, smaller at edges (with noise modulation)
        const minR = baseStep * 0.06;
        const maxR = baseStep * 0.42;
        const densityR = maxR - normalDist * (maxR - minR);
        const dotR = densityR * (0.6 + noise * 0.5);

        if (dotR < 0.3) continue;

        dots.push(
          `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}"
            r="${dotR.toFixed(2)}" fill="${color}" opacity="${(0.55 + noise * 0.40).toFixed(2)}"
            class="va-hd-${uid}" id="va-${uid}-ht-dot-${layerIdx * 1000 + di}"/>`,
        );
        di++;
      }
    }
    return dots.join("\n      ");
  }

  const cyanDots    = generateLayer(cyan, cOff, 0);
  const magentaDots = generateLayer(magenta, mOff, 1);
  const yellowDots  = generateLayer(yellow, yOff, 2);

  // High-intensity glow filter — dots burn through the dark lens
  const glowFilter = `<filter id="va-htglow-${uid}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
    <feGaussianBlur stdDeviation="${(size * 0.008).toFixed(2)}" result="b"/>
    <feColorMatrix type="matrix" in="b" values="
      1.6 0.1 0.0 0 0.05
      0.0 1.5 0.1 0 0.03
      0.1 0.0 1.7 0 0.05
      0   0   0   1 0
    " result="glow"/>
    <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;

  const extraDefs = glowFilter;

  const body = `
  <!-- Absolute black background -->
  <rect width="${size}" height="${size}" fill="#000000"/>

  <!-- CMY dot layers with chromatic aberration offsets -->
  <g id="va-${uid}-ht-dots" filter="url(#va-htglow-${uid})">
    <g id="va-${uid}-ht-cyan" transform="translate(${cOff.x.toFixed(2)},${cOff.y.toFixed(2)})" style="mix-blend-mode:screen">
      ${cyanDots}
    </g>
    <g id="va-${uid}-ht-magenta" transform="translate(${mOff.x.toFixed(2)},${mOff.y.toFixed(2)})" style="mix-blend-mode:screen">
      ${magentaDots}
    </g>
    <g id="va-${uid}-ht-yellow" transform="translate(${yOff.x.toFixed(2)},${yOff.y.toFixed(2)})" style="mix-blend-mode:screen">
      ${yellowDots}
    </g>
  </g>

  <!-- Grain overlay -->
  <rect width="${size}" height="${size}" fill="transparent" filter="url(#${ids.grain})" opacity="0.25"/>`;

  return { extraDefs, body };
}
