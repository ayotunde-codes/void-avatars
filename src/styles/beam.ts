/**
 * BEAM — Intersecting rectangular rays with glassmorphism finish.
 *
 * Upgrade over boring-avatars:
 * - Beams are semi-transparent, layered so overlaps create new blended colors
 * - A blurred "glow bloom" sits behind each beam (depth without 3D)
 * - Grain filter gives the risograph/print texture
 * - Film-strip offset printing effect: fill shape is shifted 2px from stroke
 */

import { Palette, cssHsl } from "../lib/color";
import { FilterIds } from "../lib/filters";
import { seededRands } from "../lib/hash";

interface Beam {
  x: number;
  y: number;
  w: number;
  h: number;
  rx: number;
  rotate: number;
  colorIdx: number;
  opacity: number;
}

export interface StyleResult { extraDefs: string; body: string }

export function renderBeam(
  seed: string,
  size: number,
  palette: Palette,
  ids: FilterIds,
): StyleResult {
  const rands = seededRands(seed + ":beam", 40);
  const half = size / 2;

  // Generate 5–7 beams
  const count = 5 + Math.floor(rands[0] * 3);

  const beams: Beam[] = Array.from({ length: count }, (_, i) => {
    const r = (n: number) => rands[i * 6 + n] ?? rands[n];
    const isLandscape = r(0) > 0.5;
    const w = isLandscape ? size * (0.5 + r(1) * 0.6) : size * (0.12 + r(1) * 0.2);
    const h = isLandscape ? size * (0.12 + r(2) * 0.2) : size * (0.5 + r(2) * 0.6);

    return {
      x: r(3) * size - w * 0.2,
      y: r(4) * size - h * 0.2,
      w,
      h,
      rx: size * (0.02 + r(5) * 0.06),
      rotate: (r(0) - 0.5) * 30, // subtle rotation ±15°
      colorIdx: i % palette.colors.length,
      opacity: 0.55 + r(1) * 0.3,
    };
  });

  // Bloom: blurred copy of each beam placed behind for depth
  const blooms = beams
    .map((b, i) => {
      const c = palette.colors[b.colorIdx];
      return `<rect
        x="${b.x + 2}" y="${b.y + 2}" width="${b.w}" height="${b.h}" rx="${b.rx}"
        fill="${cssHsl(c, 0.4)}"
        transform="rotate(${b.rotate}, ${half}, ${half})"
        filter="url(#${ids.blur})"
      />`;
    })
    .join("\n    ");

  // Main beams — "fill" sits 2px offset from the stroke (offset print effect)
  const mainBeams = beams
    .map((b) => {
      const c = palette.colors[b.colorIdx];
      const isFocal = b.colorIdx === palette.colors.length - 1;
      return `<g transform="rotate(${b.rotate}, ${half}, ${half})">
        <!-- Offset print stroke (misaligned 2px) -->
        <rect
          x="${b.x - 1.5}" y="${b.y - 2}" width="${b.w}" height="${b.h}" rx="${b.rx}"
          fill="none"
          stroke="${cssHsl(c, 0.6)}"
          stroke-width="${size * 0.012}"
        />
        <!-- Glassmorphism fill -->
        <rect
          x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.rx}"
          fill="${cssHsl(c, b.opacity)}"
          ${isFocal ? `filter="url(#${ids.glow})"` : ""}
        />
      </g>`;
    })
    .join("\n    ");

  return {
    extraDefs: "",
    body: `
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="${cssHsl(palette.base)}"/>

  <!-- Bloom layer (blurred, behind beams) -->
  ${blooms}

  <!-- Main beams -->
  ${mainBeams}

  <!-- Grain overlay -->
  <rect width="${size}" height="${size}" fill="transparent" filter="url(#${ids.grain})" opacity="0.55"/>
  `,
  };
}
