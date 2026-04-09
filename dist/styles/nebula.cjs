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

// src/styles/nebula.ts
function renderNebula(seed, size, palette, ids, uid) {
  const r = seededRands(seed + ":nebula", 40);
  const bgColor = "#0A0A0A";
  const blobCount = 4 + Math.floor(r[0] * 2);
  const blobs = Array.from({ length: blobCount }, (_, i) => {
    const ci = i % palette.colors.length;
    const c = palette.colors[ci];
    const cx = size * (0.15 + r[i * 4 % r.length] * 0.7);
    const cy = size * (0.15 + r[(i * 4 + 1) % r.length] * 0.7);
    const rx = size * (0.18 + r[(i * 4 + 2) % r.length] * 0.22);
    const ry = size * (0.15 + r[(i * 4 + 3) % r.length] * 0.25);
    const opacity = 0.3 + r[(i * 3 + 20) % r.length] * 0.3;
    const blur = size * (0.06 + r[(i * 2 + 25) % r.length] * 0.08);
    return { cx, cy, rx, ry, color: cssHsl(c), opacity, blur };
  });
  const blobFilters = blobs.map(
    (b, i) => `<filter id="va-nbf-${uid}-${i}" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="${b.blur.toFixed(1)}"/>
    </filter>`
  ).join("\n  ");
  const colorBleedFilter = `<filter id="va-ncb-${uid}" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
    <feColorMatrix type="matrix" values="
      1.2  0.15 0.0  0 0
      0.0  1.1  0.2  0 0
      0.15 0.0  1.3  0 0
      0    0    0    1 0
    "/>
  </filter>`;
  const blobEls = blobs.map(
    (b, i) => `<ellipse
      cx="${b.cx.toFixed(2)}" cy="${b.cy.toFixed(2)}"
      rx="${b.rx.toFixed(2)}" ry="${b.ry.toFixed(2)}"
      fill="${b.color}" opacity="${b.opacity.toFixed(2)}"
      filter="url(#va-nbf-${uid}-${i})"
      class="va-nb-${uid}" id="va-${uid}-nebula-blob-${i}"/>`
  ).join("\n    ");
  const starCount = 6 + Math.floor(r[35] * 8);
  const starEls = Array.from({ length: starCount }, (_, i) => {
    const sx = size * (0.05 + r[(i * 2 + 30) % r.length] * 0.9);
    const sy = size * (0.05 + r[(i * 2 + 31) % r.length] * 0.9);
    const sr = size * (3e-3 + r[(i + 36) % r.length] * 6e-3);
    const brightness = 70 + Math.floor(r[(i + 38) % r.length] * 30);
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

exports.renderNebula = renderNebula;
//# sourceMappingURL=nebula.cjs.map
//# sourceMappingURL=nebula.cjs.map