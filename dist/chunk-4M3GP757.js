import { cssHsl } from './chunk-TTNWV7EZ.js';
import { seededRands } from './chunk-5QPN6A5Y.js';

// src/styles/marble.ts
function renderMarble(seed, size, palette, ids, uid) {
  const rands = seededRands(seed + ":marble", 12);
  const half = size / 2;
  const rings = [
    { r: size * 0.5, color: palette.colors[0] },
    { r: size * 0.38, color: palette.colors[1] },
    { r: size * 0.26, color: palette.colors[2] },
    { r: size * 0.15, color: palette.colors[3] }
  ];
  const gradientDefs = rings.map((ring, i) => {
    const next = rings[i + 1];
    const cx = (0.3 + rands[i * 2] * 0.4).toFixed(3);
    const cy = (0.3 + rands[i * 2 + 1] * 0.4).toFixed(3);
    const id = `va-mg-${uid}-${i}`;
    return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="0.6" gradientUnits="objectBoundingBox">
        <stop offset="0%" stop-color="${cssHsl(ring.color)}"/>
        <stop offset="100%" stop-color="${next ? cssHsl(next.color) : cssHsl(palette.focal)}"/>
      </radialGradient>`;
  }).join("\n  ");
  const inkRings = rings.map((ring, i) => {
    const sw = size * (0.012 + rands[8 + i] * 0.014);
    return `<circle
        cx="${half}" cy="${half}" r="${ring.r - sw / 2}"
        fill="none"
        stroke="${cssHsl(ring.color, 0.45)}"
        stroke-width="${sw}"
        stroke-dasharray="${ring.r * 0.6} ${ring.r * 0.15} ${ring.r * 0.3} ${ring.r * 0.2}"
        stroke-dashoffset="${rands[i] * ring.r}"
      />`;
  }).join("\n    ");
  const filledRings = rings.slice().reverse().map((_, revIdx) => {
    const origIdx = rings.length - 1 - revIdx;
    const ring = rings[origIdx];
    return `<circle cx="${half}" cy="${half}" r="${ring.r}" fill="url(#va-mg-${uid}-${origIdx})"/>`;
  }).join("\n    ");
  return {
    extraDefs: gradientDefs,
    body: `
  <!-- Base background -->
  <rect width="${size}" height="${size}" fill="${cssHsl(palette.base)}"/>

  <!-- Marble rings with displacement (liquid marble effect) -->
  <g id="va-${uid}-marble-core" filter="url(#${ids.displace})">
    ${filledRings}
  </g>

  <!-- Ink-on-paper variable stroke rings (no displacement \u2014 stays sharp) -->
  ${inkRings}

  <!-- Focal glow center -->
  <circle
    cx="${half}" cy="${half}" r="${size * 0.1}"
    fill="${cssHsl(palette.focal)}"
    filter="url(#${ids.glow})"
  />

  <!-- Film grain overlay -->
  <rect width="${size}" height="${size}" fill="transparent" filter="url(#${ids.grain})" opacity="0.55"/>
  `
  };
}

export { renderMarble };
//# sourceMappingURL=chunk-4M3GP757.js.map
//# sourceMappingURL=chunk-4M3GP757.js.map