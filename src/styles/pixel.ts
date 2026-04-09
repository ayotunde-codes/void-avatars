/**
 * PIXEL — An 8×8 grid of colored squares like a retro sprite.
 *
 * Upgrades:
 * - Grain filter gives it a silkscreen/risograph texture
 * - Symmetric left/right so it reads as a "face" or Rorschach blob
 * - Focal color squares have a subtle inner glow
 * - Print-offset stroke on lit cells
 */

import { Palette, cssHsl } from "../lib/color";
import { FilterIds } from "../lib/filters";
import { seededRands } from "../lib/hash";

const GRID = 8;

export interface StyleResult { extraDefs: string; body: string }

export function renderPixel(
  seed: string,
  size: number,
  palette: Palette,
  ids: FilterIds,
): StyleResult {
  const rands = seededRands(seed + ":pixel", GRID * (GRID / 2) * 2);
  const cell = size / GRID;

  const cells: string[] = [];

  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID / 2; col++) {
      const idx = row * (GRID / 2) + col;
      const v = rands[idx];
      // ~65% chance a cell is lit
      if (v > 0.35) {
        const colorIdx = Math.floor(v * palette.colors.length);
        const c = palette.colors[colorIdx];
        const isFocal = colorIdx === palette.colors.length - 1;
        const x = col * cell;
        const mirrorX = (GRID - 1 - col) * cell;
        const y = row * cell;
        const pad = cell * 0.06;
        const glowAttr = isFocal ? `filter="url(#${ids.glow})"` : "";

        // Offset print stroke
        const strokeCell = `<rect x="${x + pad - 1.5}" y="${y + pad - 1.5}"
          width="${cell - pad * 2}" height="${cell - pad * 2}" rx="${cell * 0.1}"
          fill="none" stroke="${cssHsl(c, 0.5)}" stroke-width="${cell * 0.08}"/>`;
        const fillCell = (sx: number) =>
          `<rect x="${sx + pad}" y="${y + pad}"
            width="${cell - pad * 2}" height="${cell - pad * 2}" rx="${cell * 0.1}"
            fill="${cssHsl(c)}" ${glowAttr}/>`;

        // Left half
        cells.push(strokeCell);
        cells.push(fillCell(x));

        // Mirror right half (symmetric)
        if (col !== GRID / 2 - 1 || GRID % 2 !== 0) {
          const mStroke = `<rect x="${mirrorX + pad - 1.5}" y="${y + pad - 1.5}"
            width="${cell - pad * 2}" height="${cell - pad * 2}" rx="${cell * 0.1}"
            fill="none" stroke="${cssHsl(c, 0.5)}" stroke-width="${cell * 0.08}"/>`;
          cells.push(mStroke);
          cells.push(fillCell(mirrorX));
        }
      }
    }
  }

  return {
    extraDefs: "",
    body: `
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="${cssHsl(palette.base)}"/>

  <!-- Pixel cells -->
  ${cells.join("\n  ")}

  <!-- Grain overlay -->
  <rect width="${size}" height="${size}" fill="transparent" filter="url(#${ids.grain})" opacity="0.65"/>
  `,
  };
}
