/**
 * WIREFRAME — 3D-simulated terrain/sphere using 1px stroke lines.
 *
 * Design:
 * - Wireframe sphere built from latitude + longitude lines
 * - Seed determines rotation angle of the sphere
 * - "Glitch Nodes" — small 2px solid squares at line intersections
 * - High-contrast Void palette: Neon Green, Electric Cyan, Stark White on dark bg
 *
 * GSAP-targetable IDs / classes:
 *   id="va-${uid}-wire-frame"       — wireframe group ("The Scan" dashoffset animation)
 *   class="va-wl-${uid}"            — individual wire lines (stagger dashoffset target)
 *   class="va-wn-${uid}"            — glitch node squares
 *   id="va-${uid}-wire-nodes"       — nodes container group
 *   id="va-${uid}-wire-line-N"      — individual line by index
 */

import { Palette } from "../lib/color";
import { FilterIds } from "../lib/filters";
import { seededRands } from "../lib/hash";

export function renderWireframe(
  seed: string,
  size: number,
  palette: Palette,
  ids: FilterIds,
  uid: string,
): { extraDefs: string; body: string } {
  const r = seededRands(seed + ":wire", 60);

  const bgColor = "#0A0A0A";
  const half = size / 2;
  const radius = size * 0.38;

  // Wire colors — neon green, electric cyan, stark white
  const focalHue = palette.focal.h;
  const wireColors = [
    `hsl(${focalHue},100%,60%)`,          // neon primary
    `hsl(${(focalHue + 160) % 360},100%,62%)`, // electric secondary
    "#e8e8e8",                             // stark white
  ];

  // Seed-driven rotation (tilt angle)
  const tiltX = (r[0] - 0.5) * 0.6; // -0.3 to 0.3 radians
  const tiltY = r[1] * Math.PI * 2;  // full rotation

  const lines: string[] = [];
  let lineIdx = 0;

  // Latitude lines (horizontal rings)
  const latCount = 6 + Math.floor(r[2] * 4); // 6–9
  for (let i = 1; i < latCount; i++) {
    const phi = (Math.PI * i) / latCount;
    const ringR = radius * Math.sin(phi);
    const ringY = half + radius * Math.cos(phi) * Math.cos(tiltX);
    const squash = 0.25 + Math.abs(Math.sin(phi + tiltY)) * 0.35;

    if (ringR < 2) continue;

    const ci = lineIdx % wireColors.length;
    const opacity = 0.4 + Math.sin(phi) * 0.5;
    const pathLen = (2 * Math.PI * ringR * squash).toFixed(1);

    lines.push(
      `<ellipse cx="${half}" cy="${ringY.toFixed(2)}"
        rx="${ringR.toFixed(2)}" ry="${(ringR * squash).toFixed(2)}"
        fill="none" stroke="${wireColors[ci]}" stroke-width="1" opacity="${opacity.toFixed(2)}"
        stroke-dasharray="${pathLen}" stroke-dashoffset="0"
        data-len="${pathLen}"
        class="va-wl-${uid}" id="va-${uid}-wire-line-${lineIdx}"/>`,
    );
    lineIdx++;
  }

  // Longitude lines (vertical meridians)
  const lonCount = 8 + Math.floor(r[3] * 4); // 8–11
  for (let i = 0; i < lonCount; i++) {
    const theta = (Math.PI * 2 * i) / lonCount + tiltY;
    const points: string[] = [];
    const segments = 24;

    for (let j = 0; j <= segments; j++) {
      const phi = (Math.PI * j) / segments;
      // 3D sphere point
      const x3d = radius * Math.sin(phi) * Math.cos(theta);
      const y3d = radius * Math.cos(phi);
      const z3d = radius * Math.sin(phi) * Math.sin(theta);

      // Simple rotation + projection
      const rotY = y3d * Math.cos(tiltX) - z3d * Math.sin(tiltX);
      const px = half + x3d;
      const py = half + rotY;

      points.push(`${px.toFixed(2)},${py.toFixed(2)}`);
    }

    const ci = lineIdx % wireColors.length;
    const d = `M ${points.join(" L ")}`;
    // Approximate path length for stroke-dasharray animation
    const approxLen = (Math.PI * radius).toFixed(1);

    lines.push(
      `<path d="${d}"
        fill="none" stroke="${wireColors[ci]}" stroke-width="1" opacity="0.55"
        stroke-dasharray="${approxLen}" stroke-dashoffset="0"
        data-len="${approxLen}"
        class="va-wl-${uid}" id="va-${uid}-wire-line-${lineIdx}"/>`,
    );
    lineIdx++;
  }

  // Glitch Nodes — small 2px squares at intersection points
  const nodeCount = 8 + Math.floor(r[4] * 10); // 8–17
  const nodeEls = Array.from({ length: nodeCount }, (_, i) => {
    // Place nodes on the sphere surface
    const phi = r[(i * 3 + 10) % r.length] * Math.PI;
    const theta = r[(i * 3 + 11) % r.length] * Math.PI * 2 + tiltY;
    const x3d = radius * Math.sin(phi) * Math.cos(theta);
    const y3d = radius * Math.cos(phi);
    const z3d = radius * Math.sin(phi) * Math.sin(theta);
    const rotY = y3d * Math.cos(tiltX) - z3d * Math.sin(tiltX);
    const nx = half + x3d;
    const ny = half + rotY;

    // Only show nodes on the "front" half
    const zRot = y3d * Math.sin(tiltX) + z3d * Math.cos(tiltX);
    if (zRot < 0) return "";

    const nodeSize = size * 0.02;
    const ci = i % wireColors.length;
    return `<rect x="${(nx - nodeSize / 2).toFixed(2)}" y="${(ny - nodeSize / 2).toFixed(2)}"
      width="${nodeSize.toFixed(2)}" height="${nodeSize.toFixed(2)}"
      fill="${wireColors[ci]}" class="va-wn-${uid}"/>`;
  }).filter(Boolean).join("\n    ");

  // Subtle scan line glow filter
  const scanFilter = `<filter id="va-wsf-${uid}" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="${(size * 0.012).toFixed(2)}" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;

  const extraDefs = scanFilter;

  const body = `
  <!-- Dark background -->
  <rect width="${size}" height="${size}" fill="${bgColor}"/>

  <!-- Wireframe sphere -->
  <g id="va-${uid}-wire-frame" filter="url(#va-wsf-${uid})">
    ${lines.join("\n    ")}
  </g>

  <!-- Glitch nodes -->
  <g id="va-${uid}-wire-nodes">
    ${nodeEls}
  </g>

  <!-- Grain overlay -->
  <rect width="${size}" height="${size}" fill="transparent" filter="url(#${ids.grain})" opacity="0.30"/>`;

  return { extraDefs, body };
}
