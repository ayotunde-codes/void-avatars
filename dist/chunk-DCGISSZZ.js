import { cssHsl } from './chunk-TTNWV7EZ.js';
import { seededRands } from './chunk-5QPN6A5Y.js';

// src/styles/beam.ts
function renderBeam(seed, size, palette, ids) {
  const rands = seededRands(seed + ":beam", 40);
  const half = size / 2;
  const count = 5 + Math.floor(rands[0] * 3);
  const beams = Array.from({ length: count }, (_, i) => {
    const r = (n) => rands[i * 6 + n] ?? rands[n];
    const isLandscape = r(0) > 0.5;
    const w = isLandscape ? size * (0.5 + r(1) * 0.6) : size * (0.12 + r(1) * 0.2);
    const h = isLandscape ? size * (0.12 + r(2) * 0.2) : size * (0.5 + r(2) * 0.6);
    return {
      x: r(3) * size - w * 0.2,
      y: r(4) * size - h * 0.2,
      w,
      h,
      rx: size * (0.02 + r(5) * 0.06),
      rotate: (r(0) - 0.5) * 30,
      // subtle rotation ±15°
      colorIdx: i % palette.colors.length,
      opacity: 0.55 + r(1) * 0.3
    };
  });
  const blooms = beams.map((b, i) => {
    const c = palette.colors[b.colorIdx];
    return `<rect
        x="${b.x + 2}" y="${b.y + 2}" width="${b.w}" height="${b.h}" rx="${b.rx}"
        fill="${cssHsl(c, 0.4)}"
        transform="rotate(${b.rotate}, ${half}, ${half})"
        filter="url(#${ids.blur})"
      />`;
  }).join("\n    ");
  const mainBeams = beams.map((b) => {
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
  }).join("\n    ");
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
  `
  };
}

export { renderBeam };
//# sourceMappingURL=chunk-DCGISSZZ.js.map
//# sourceMappingURL=chunk-DCGISSZZ.js.map