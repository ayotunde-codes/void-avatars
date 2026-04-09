'use strict';

// src/lib/hash.ts
function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h ^ s.charCodeAt(i)) >>> 0;
  }
  return h;
}
function seededRands(seed, count) {
  const h = hashStr(seed);
  return Array.from({ length: count }, (_, i) => {
    let v = (h ^ h >>> i * 3 + 1) >>> 0;
    v = (v ^ v << 13) >>> 0;
    v = (v ^ v >>> 17) >>> 0;
    v = (v ^ v << 5) >>> 0;
    return v / 4294967295;
  });
}

// src/lib/color.ts
function cssHsl(c, alpha = 1) {
  return alpha < 1 ? `hsla(${c.h},${c.s}%,${c.l}%,${alpha})` : `hsl(${c.h},${c.s}%,${c.l}%)`;
}

// src/styles/isometric.ts
function shadeColor(c, dl) {
  const l = Math.max(5, Math.min(95, c.l + dl));
  return { h: c.h, s: c.s, l, hex: "" };
}
function renderIsometric(seed, size, palette, ids, uid) {
  const r = seededRands(seed + ":iso", 60);
  const bgColor = "#0E0E12";
  const half = size / 2;
  const cubeSize = size * 0.14;
  const cubeCount = 3 + Math.floor(r[0] * 5);
  const ISO_COS = Math.cos(Math.PI / 6);
  const ISO_SIN = Math.sin(Math.PI / 6);
  function isoProject(gx, gy, gz) {
    return {
      x: half + (gx - gz) * ISO_COS * cubeSize,
      y: half + (gx + gz) * ISO_SIN * cubeSize - gy * cubeSize
    };
  }
  function buildCube(gx, gy, gz, baseColor, opacity, idx) {
    const origin = isoProject(gx, gy, gz);
    const w = cubeSize * ISO_COS;
    const h = cubeSize * ISO_SIN;
    const ch = cubeSize;
    const topColor = cssHsl(shadeColor(baseColor, 18), opacity);
    const leftColor = cssHsl(shadeColor(baseColor, -8), opacity);
    const rightColor = cssHsl(shadeColor(baseColor, -16), opacity);
    const ox = origin.x;
    const oy = origin.y;
    const topPath = `M ${ox},${oy - ch} L ${ox + w},${oy - ch + h} L ${ox},${oy} L ${ox - w},${oy - ch + h} Z`;
    const leftPath = `M ${ox - w},${oy - ch + h} L ${ox},${oy} L ${ox},${oy + ch} L ${ox - w},${oy + h} Z`;
    const rightPath = `M ${ox},${oy} L ${ox + w},${oy - ch + h} L ${ox + w},${oy + h} L ${ox},${oy + ch} Z`;
    return `<g class="va-ic-${uid}" id="va-${uid}-iso-cube-${idx}" data-gx="${gx}" data-gy="${gy}" data-gz="${gz}">
      <path d="${topPath}" fill="${topColor}"/>
      <path d="${leftPath}" fill="${leftColor}"/>
      <path d="${rightPath}" fill="${rightColor}"/>
      <path d="${topPath}" fill="none" stroke="${cssHsl(baseColor, 0.15)}" stroke-width="0.5"/>
      <path d="${leftPath}" fill="none" stroke="${cssHsl(baseColor, 0.1)}" stroke-width="0.5"/>
      <path d="${rightPath}" fill="none" stroke="${cssHsl(baseColor, 0.1)}" stroke-width="0.5"/>
    </g>`;
  }
  const cubes = [];
  for (let i = 0; i < cubeCount; i++) {
    const gx = Math.floor(r[(i * 3 + 5) % r.length] * 3) - 1;
    const gz = Math.floor(r[(i * 3 + 6) % r.length] * 3) - 1;
    const below = cubes.filter((c) => c.gx === gx && c.gz === gz).length;
    const gy = below;
    const ci = i % palette.colors.length;
    const ghost = r[(i * 3 + 7) % r.length] > 0.75;
    cubes.push({ gx, gy, gz, ci, ghost });
  }
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
  const shadowEls = cubes.filter((c) => c.gy === 0).map((c) => {
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

exports.renderIsometric = renderIsometric;
//# sourceMappingURL=isometric.cjs.map
//# sourceMappingURL=isometric.cjs.map