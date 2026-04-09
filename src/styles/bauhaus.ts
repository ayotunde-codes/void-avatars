/**
 * BAUHAUS — Geometric shapes (circles, triangles, squares) in a grid.
 *
 * Upgrade over boring-avatars:
 * - Offset printing: fill is shifted 2–3px from stroke (art-gallery misprint feel)
 * - Drop shadows give shapes depth hierarchy
 * - Film grain texture applied to the whole composition
 * - Focal shape always uses the brightest palette color + inner glow
 */

import { Palette, cssHsl } from "../lib/color";
import { FilterIds } from "../lib/filters";
import { seededRands } from "../lib/hash";

type ShapeType = "circle" | "square" | "triangle" | "ring" | "half";

const SHAPE_TYPES: ShapeType[] = ["circle", "square", "triangle", "ring", "half"];

function renderShape(
  type: ShapeType,
  cx: number,
  cy: number,
  r: number,
  fillColor: string,
  strokeColor: string,
  rotate: number,
  isFocal: boolean,
  ids: FilterIds,
  shadowId: string,
  glowId: string,
  printOffsetX: number,
  printOffsetY: number,
): string {
  const glowAttr = isFocal ? `filter="url(#${glowId})"` : `filter="url(#${shadowId})"`;

  switch (type) {
    case "circle":
      return `<g>
        <!-- Offset stroke (print misalignment) -->
        <circle cx="${cx - printOffsetX}" cy="${cy - printOffsetY}" r="${r}"
          fill="none" stroke="${strokeColor}" stroke-width="${r * 0.12}"/>
        <!-- Fill -->
        <circle cx="${cx}" cy="${cy}" r="${r * 0.9}"
          fill="${fillColor}" ${glowAttr}/>
      </g>`;

    case "ring":
      return `<g>
        <circle cx="${cx - printOffsetX}" cy="${cy - printOffsetY}" r="${r}"
          fill="none" stroke="${strokeColor}" stroke-width="${r * 0.28}"/>
        <circle cx="${cx}" cy="${cy}" r="${r}"
          fill="none" stroke="${fillColor}" stroke-width="${r * 0.22}" ${glowAttr}/>
      </g>`;

    case "square": {
      const s = r * 1.4;
      return `<g transform="rotate(${rotate}, ${cx}, ${cy})">
        <rect x="${cx - s / 2 - printOffsetX}" y="${cy - s / 2 - printOffsetY}" width="${s}" height="${s}" rx="${r * 0.15}"
          fill="none" stroke="${strokeColor}" stroke-width="${r * 0.1}"/>
        <rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" rx="${r * 0.15}"
          fill="${fillColor}" ${glowAttr}/>
      </g>`;
    }

    case "triangle": {
      const h3 = r * 1.5;
      const pts = [
        `${cx},${cy - h3}`,
        `${cx + r * 1.1},${cy + h3 * 0.5}`,
        `${cx - r * 1.1},${cy + h3 * 0.5}`,
      ].join(" ");
      const ptsOff = [
        `${cx - printOffsetX},${cy - h3 - printOffsetY}`,
        `${cx + r * 1.1 - printOffsetX},${cy + h3 * 0.5 - printOffsetY}`,
        `${cx - r * 1.1 - printOffsetX},${cy + h3 * 0.5 - printOffsetY}`,
      ].join(" ");
      return `<g transform="rotate(${rotate}, ${cx}, ${cy})">
        <polygon points="${ptsOff}" fill="none" stroke="${strokeColor}" stroke-width="${r * 0.1}"/>
        <polygon points="${pts}" fill="${fillColor}" ${glowAttr}/>
      </g>`;
    }

    case "half": {
      // Semicircle via arc path
      const arcFill = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`;
      const arcStroke = `M ${cx - r - printOffsetX} ${cy - printOffsetY} A ${r} ${r} 0 0 1 ${cx + r - printOffsetX} ${cy - printOffsetY} Z`;
      return `<g transform="rotate(${rotate}, ${cx}, ${cy})">
        <path d="${arcStroke}" fill="none" stroke="${strokeColor}" stroke-width="${r * 0.1}"/>
        <path d="${arcFill}" fill="${fillColor}" ${glowAttr}/>
      </g>`;
    }
  }
}

export interface StyleResult { extraDefs: string; body: string }

export function renderBauhaus(
  seed: string,
  size: number,
  palette: Palette,
  ids: FilterIds,
): StyleResult {
  const rands = seededRands(seed + ":bauhaus", 50);
  const cell = size / 3; // 3×3 grid

  // Place 5–7 shapes across the grid cells (some cells overlap)
  const count = 5 + Math.floor(rands[0] * 3);

  const shapes = Array.from({ length: count }, (_, i) => {
    const r = (n: number) => rands[(i * 8 + n) % rands.length];

    const col = i % 3;
    const row = Math.floor(i / 3) % 3;
    const cx = cell * col + cell * (0.25 + r(0) * 0.5);
    const cy = cell * row + cell * (0.25 + r(1) * 0.5);
    const radius = cell * (0.18 + r(2) * 0.22);
    const colorIdx = i % palette.colors.length;
    const isFocal = i === Math.floor(count / 2); // middle shape is focal
    const type = SHAPE_TYPES[Math.floor(r(3) * SHAPE_TYPES.length)];
    const rotate = r(4) * 45;

    // Print offset — small random 2–3px shift
    const px = (r(5) - 0.5) * size * 0.04;
    const py = (r(6) - 0.5) * size * 0.04;

    const fill = isFocal ? palette.focal : palette.colors[colorIdx];
    const strokeC = palette.colors[(colorIdx + 1) % palette.colors.length];

    return renderShape(
      type, cx, cy, radius,
      cssHsl(fill), cssHsl(strokeC, 0.7),
      rotate, isFocal, ids, ids.shadow, ids.glow,
      px, py,
    );
  });

  return {
    extraDefs: "",
    body: `
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="${cssHsl(palette.base)}"/>

  <!-- Shapes -->
  ${shapes.join("\n  ")}

  <!-- Grain overlay -->
  <rect width="${size}" height="${size}" fill="transparent" filter="url(#${ids.grain})" opacity="0.6"/>
  `,
  };
}
