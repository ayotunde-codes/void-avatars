import { cssHsl } from './chunk-TTNWV7EZ.js';
import { seededRands } from './chunk-5QPN6A5Y.js';

// src/styles/constellation.ts
function renderConstellation(seed, size, palette, ids, uid) {
  const r = seededRands(seed + ":con", 90);
  const bgColor = "hsl(260,55%,7%)";
  const nodeCount = 8 + Math.floor(r[0] * 7);
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    x: size * (0.07 + r[i * 3 % r.length] * 0.86),
    y: size * (0.07 + r[(i * 3 + 1) % r.length] * 0.86),
    r: size * (0.018 + r[(i * 3 + 2) % r.length] * 0.026),
    ci: i % palette.colors.length,
    isCenter: i === Math.floor(nodeCount / 2)
  }));
  const lines = [];
  nodes.forEach((a, i) => nodes.forEach((b, j) => {
    if (i >= j) return;
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    if (dist < size * 0.42 && r[(i * nodeCount + j) % r.length] > 0.28) {
      lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, len: dist.toFixed(2) });
    }
  }));
  const lineColor = cssHsl({ ...palette.focal, s: 85, l: 68 }, 0.55);
  const linesEl = lines.map(
    (l, idx) => `<line x1="${l.x1.toFixed(2)}" y1="${l.y1.toFixed(2)}" x2="${l.x2.toFixed(2)}" y2="${l.y2.toFixed(2)}"
      stroke="${lineColor}" stroke-width="0.5"
      stroke-dasharray="${l.len}" stroke-dashoffset="0"
      data-len="${l.len}"
      class="va-cl-${uid}" id="va-${uid}-line-${idx}"/>`
  ).join("\n    ");
  const nodesEl = nodes.map((n, i) => {
    const c = palette.colors[n.ci];
    return `<g class="va-cn-${uid}" id="va-${uid}-node-${i}">
      <circle cx="${n.x.toFixed(2)}" cy="${n.y.toFixed(2)}" r="${(n.r * 3.5).toFixed(2)}" fill="${cssHsl(c, 0.1)}"/>
      <circle cx="${n.x.toFixed(2)}" cy="${n.y.toFixed(2)}" r="${(n.r * 1.9).toFixed(2)}" fill="${cssHsl(c, 0.18)}"/>
      ${n.isCenter ? `<circle cx="${n.x.toFixed(2)}" cy="${n.y.toFixed(2)}" r="${(n.r * 1.4).toFixed(2)}" fill="${cssHsl(palette.focal)}" filter="url(#${ids.glow})"/>` : `<circle cx="${n.x.toFixed(2)}" cy="${n.y.toFixed(2)}" r="${n.r.toFixed(2)}" fill="${cssHsl(c)}"/>`}
    </g>`;
  }).join("\n    ");
  const body = `
  <!-- Deep void-purple background -->
  <rect width="${size}" height="${size}" fill="${bgColor}"/>

  <!-- Connecting lines -->
  <g id="va-${uid}-const-lines">${linesEl}</g>

  <!-- Node halos + cores -->
  <g id="va-${uid}-const-nodes">${nodesEl}</g>

  <!-- Grain overlay -->
  <rect width="${size}" height="${size}" fill="transparent" filter="url(#${ids.grain})" opacity="0.4"/>`;
  return { extraDefs: "", body };
}

export { renderConstellation };
//# sourceMappingURL=chunk-BWMVJOZ2.js.map
//# sourceMappingURL=chunk-BWMVJOZ2.js.map