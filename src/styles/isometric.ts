/**
 * ISOMETRIC — 3D-looking voxel cubes stacked in a 120-degree isometric view.
 *
 * Design:
 * - 3–7 isometric cubes in a central cluster based on seed
 * - Each cube has three distinct shade values (top, left, right) from a single seed-color
 * - Some cubes are semi-transparent "Ghost Blocks" revealing cubes behind them
 * - Void transparency effect with depth
 *
 * GSAP-targetable IDs / classes:
 *   id="va-${uid}-iso-stack"        — cube stack group ("The Assembler" fly-in animation)
 *   class="va-ic-${uid}"            — individual cube groups (snap-in targets)
 *   id="va-${uid}-iso-cube-N"       — individual cube by index
 *   id="va-${uid}-iso-shadow"       — shadow/reflection group
 */

import { Palette, HSLColor, cssHsl } from "../lib/color";
import { FilterIds } from "../lib/filters";
import { seededRands } from "../lib/hash";

function shadeColor(c: HSLColor, dl: number): HSLColor {
  const l = Math.max(5, Math.min(95, c.l + dl));
  return { h: c.h, s: c.s, l, hex: "" };
}

export function renderIsometric(
  seed: string,
  size: number,
  palette: Palette,
  ids: FilterIds,
  uid: string,
): { extraDefs: string; body: string } {
  const r = seededRands(seed + ":iso", 60);

  const bgColor = "#0E0E12";
  const half = size / 2;

  // Cube dimensions in isometric space
  const cubeSize = size * 0.14;
  const cubeCount = 3 + Math.floor(r[0] * 5); // 3–7 cubes

  // Isometric projection helpers (120° axes)
  const ISO_COS = Math.cos(Math.PI / 6); // cos(30°) ≈ 0.866
  const ISO_SIN = Math.sin(Math.PI / 6); // sin(30°) ≈ 0.5

  function isoProject(gx: number, gy: number, gz: number): { x: number; y: number } {
    return {
      x: half + (gx - gz) * ISO_COS * cubeSize,
      y: half + (gx + gz) * ISO_SIN * cubeSize - gy * cubeSize,
    };
  }

  // Build isometric cube SVG (top, left, right faces)
  function buildCube(
    gx: number, gy: number, gz: number,
    baseColor: HSLColor,
    opacity: number,
    idx: number,
  ): string {
    const origin = isoProject(gx, gy, gz);
    const w = cubeSize * ISO_COS;
    const h = cubeSize * ISO_SIN;
    const ch = cubeSize;

    // Three shade values from the same hue
    const topColor = cssHsl(shadeColor(baseColor, 18), opacity);
    const leftColor = cssHsl(shadeColor(baseColor, -8), opacity);
    const rightColor = cssHsl(shadeColor(baseColor, -16), opacity);

    // Isometric cube vertices relative to the origin (bottom-center of top face)
    const ox = origin.x;
    const oy = origin.y;

    // Top face (brightest)
    const topPath = `M ${ox},${oy - ch} L ${ox + w},${oy - ch + h} L ${ox},${oy} L ${ox - w},${oy - ch + h} Z`;
    // Left face (mid)
    const leftPath = `M ${ox - w},${oy - ch + h} L ${ox},${oy} L ${ox},${oy + ch} L ${ox - w},${oy + h} Z`;
    // Right face (darkest)
    const rightPath = `M ${ox},${oy} L ${ox + w},${oy - ch + h} L ${ox + w},${oy + h} L ${ox},${oy + ch} Z`;

    return `<g class="va-ic-${uid}" id="va-${uid}-iso-cube-${idx}" data-gx="${gx}" data-gy="${gy}" data-gz="${gz}">
      <path d="${topPath}" fill="${topColor}"/>
      <path d="${leftPath}" fill="${leftColor}"/>
      <path d="${rightPath}" fill="${rightColor}"/>
      <path d="${topPath}" fill="none" stroke="${cssHsl(baseColor, 0.15)}" stroke-width="0.5"/>
      <path d="${leftPath}" fill="none" stroke="${cssHsl(baseColor, 0.10)}" stroke-width="0.5"/>
      <path d="${rightPath}" fill="none" stroke="${cssHsl(baseColor, 0.10)}" stroke-width="0.5"/>
    </g>`;
  }

  // Generate cube positions — stacked in a central cluster
  interface CubePos { gx: number; gy: number; gz: number; ci: number; ghost: boolean }
  const cubes: CubePos[] = [];

  // Start with a base platform and stack up
  for (let i = 0; i < cubeCount; i++) {
    const gx = Math.floor(r[(i * 3 + 5) % r.length] * 3) - 1; // -1 to 1
    const gz = Math.floor(r[(i * 3 + 6) % r.length] * 3) - 1; // -1 to 1
    // Stack y based on existing cubes below this position
    const below = cubes.filter(c => c.gx === gx && c.gz === gz).length;
    const gy = below;

    const ci = i % palette.colors.length;
    // ~25% chance of ghost block
    const ghost = r[(i * 3 + 7) % r.length] > 0.75;

    cubes.push({ gx, gy, gz, ci, ghost });
  }

  // Sort by depth (back to front: higher gz first, then lower gy)
  cubes.sort((a, b) => {
    const depthA = a.gx + a.gz - a.gy;
    const depthB = b.gx + b.gz - b.gy;
    return depthA - depthB;
  });

  const cubeEls = cubes.map((c, i) => {
    const color = palette.colors[c.ci];
    const opacity = c.ghost ? 0.38 : 0.92;
    return buildCube(c.gx, c.gy, c.gz, color, opacity, i);
  }).join("\n    ");

  // Subtle floor shadow
  const shadowEls = cubes
    .filter(c => c.gy === 0)
    .map(c => {
      const pos = isoProject(c.gx, -0.1, c.gz);
      const w = cubeSize * ISO_COS * 1.2;
      const h = cubeSize * ISO_SIN * 0.4;
      return `<ellipse cx="${pos.x.toFixed(2)}" cy="${(pos.y + cubeSize).toFixed(2)}"
        rx="${w.toFixed(2)}" ry="${h.toFixed(2)}" fill="#000" opacity="0.18"/>`;
    }).join("\n    ");

  const body = `
  <!-- Dark background -->
  <rect width="${size}" height="${size}" fill="${bgColor}"/>

  <!-- Floor shadows -->
  <g id="va-${uid}-iso-shadow">
    ${shadowEls}
  </g>

  <!-- Isometric cube stack -->
  <g id="va-${uid}-iso-stack">
    ${cubeEls}
  </g>

  <!-- Grain overlay -->
  <rect width="${size}" height="${size}" fill="transparent" filter="url(#${ids.grain})" opacity="0.30"/>`;

  return { extraDefs: "", body };
}
