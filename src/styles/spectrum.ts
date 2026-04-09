/**
 * SPECTRUM — Audio-visual vertical bars like a live audio feed.
 *
 * Design:
 * - 12–16 vertical bars of varying heights, centered in the frame
 * - Heights determined by a simulated Perlin noise snapshot
 * - Linear gradient per bar (Neon Purple to Electric Lime)
 * - High-energy, audio visualizer aesthetic
 *
 * GSAP-targetable IDs / classes:
 *   id="va-${uid}-spectrum-bars"    — bars container group
 *   class="va-sb-${uid}"           — individual bar rects ("The Bounce" scaleY stagger)
 *   id="va-${uid}-spec-bar-N"      — individual bar by index
 *   id="va-${uid}-spectrum-glow"   — glow/reflection group beneath bars
 */

import { Palette, cssHsl } from "../lib/color";
import { FilterIds } from "../lib/filters";
import { seededRands } from "../lib/hash";

export function renderSpectrum(
  seed: string,
  size: number,
  palette: Palette,
  ids: FilterIds,
  uid: string,
): { extraDefs: string; body: string } {
  const r = seededRands(seed + ":spectrum", 60);

  const bgColor = "#070710";
  const barCount = 12 + Math.floor(r[0] * 5); // 12–16 bars

  // Simulated Perlin noise wave for bar heights
  // Use layered sine waves at different frequencies for organic look
  function noiseHeight(i: number): number {
    const t = i / barCount;
    const n1 = Math.sin(t * Math.PI * 2 * (1.5 + r[1] * 2)) * 0.4;
    const n2 = Math.sin(t * Math.PI * 2 * (3 + r[2] * 3) + r[3] * Math.PI) * 0.25;
    const n3 = Math.sin(t * Math.PI * 2 * (6 + r[4] * 4) + r[5] * Math.PI) * 0.15;
    // Seed-specific base offset
    const base = 0.3 + r[(i + 10) % r.length] * 0.2;
    return Math.max(0.12, Math.min(0.95, base + n1 + n2 + n3));
  }

  // Layout — bars centered with gaps
  const totalWidth = size * 0.82;
  const gap = totalWidth * 0.02;
  const barWidth = (totalWidth - gap * (barCount - 1)) / barCount;
  const startX = (size - totalWidth) / 2;
  const baseY = size * 0.88; // bottom of bars

  // Gradient colors derived from palette
  const gradTop = palette.focal;
  const gradBot = palette.colors[2];

  // Per-bar gradient defs
  const gradDefs = Array.from({ length: barCount }, (_, i) => {
    // Slightly shift hue per bar for rainbow energy feel
    const hueShift = (i / barCount) * 60;
    const topH = (gradTop.h + hueShift) % 360;
    const botH = (gradBot.h + hueShift * 0.5) % 360;
    return `<linearGradient id="va-sg-${uid}-${i}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="hsl(${topH | 0},100%,65%)"/>
      <stop offset="100%" stop-color="hsl(${botH | 0},${gradBot.s}%,${gradBot.l}%)"/>
    </linearGradient>`;
  }).join("\n    ");

  // Bar glow filter
  const barGlowFilter = `<filter id="va-sgf-${uid}" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="${(size * 0.012).toFixed(2)}" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;

  // Generate bars
  const bars = Array.from({ length: barCount }, (_, i) => {
    const height = noiseHeight(i) * size * 0.72;
    const x = startX + i * (barWidth + gap);
    const y = baseY - height;
    const rx = barWidth * 0.25;

    return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}"
      width="${barWidth.toFixed(2)}" height="${height.toFixed(2)}" rx="${rx.toFixed(2)}"
      fill="url(#va-sg-${uid}-${i})"
      class="va-sb-${uid}" id="va-${uid}-spec-bar-${i}"
      data-base-height="${height.toFixed(2)}" data-base-y="${y.toFixed(2)}"/>`;
  }).join("\n    ");

  // Reflection — mirrored, faded bars beneath
  const reflection = Array.from({ length: barCount }, (_, i) => {
    const height = noiseHeight(i) * size * 0.72;
    const x = startX + i * (barWidth + gap);
    const reflH = height * 0.25;
    const reflY = baseY;

    return `<rect x="${x.toFixed(2)}" y="${reflY.toFixed(2)}"
      width="${barWidth.toFixed(2)}" height="${reflH.toFixed(2)}" rx="${(barWidth * 0.25).toFixed(2)}"
      fill="url(#va-sg-${uid}-${i})" opacity="0.15"/>`;
  }).join("\n    ");

  // Horizontal baseline glow
  const baselineGlow = `<line x1="${startX}" y1="${baseY}" x2="${startX + totalWidth}" y2="${baseY}"
    stroke="${cssHsl(palette.focal, 0.15)}" stroke-width="${(size * 0.01).toFixed(2)}"/>`;

  const extraDefs = gradDefs + "\n    " + barGlowFilter;

  const body = `
  <!-- Deep dark background -->
  <rect width="${size}" height="${size}" fill="${bgColor}"/>

  <!-- Baseline glow -->
  ${baselineGlow}

  <!-- Spectrum bars -->
  <g id="va-${uid}-spectrum-bars" filter="url(#va-sgf-${uid})">
    ${bars}
  </g>

  <!-- Reflection -->
  <g id="va-${uid}-spectrum-glow" opacity="0.4">
    ${reflection}
  </g>

  <!-- Grain overlay -->
  <rect width="${size}" height="${size}" fill="transparent" filter="url(#${ids.grain})" opacity="0.25"/>`;

  return { extraDefs, body };
}
