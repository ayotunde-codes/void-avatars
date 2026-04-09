import { cssHsl } from './chunk-TTNWV7EZ.js';
import { seededRands } from './chunk-5QPN6A5Y.js';

// src/styles/ring.ts
function polarToCart(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function arcPath(cx, cy, r, startDeg, endDeg) {
  const s = polarToCart(cx, cy, r, startDeg);
  const e = polarToCart(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}
function renderRing(seed, size, palette, ids) {
  const rands = seededRands(seed + ":ring", 60);
  const half = size / 2;
  const ringRadii = [size * 0.46, size * 0.35, size * 0.24, size * 0.14];
  const ringWidths = ringRadii.map((r) => r * (0.18 + rands[ringRadii.indexOf(r)] * 0.14));
  const arcs = [];
  ringRadii.forEach((outerR, ringIdx) => {
    const innerR = outerR - ringWidths[ringIdx];
    const colorBase = palette.colors[ringIdx];
    const colorAlt = palette.colors[(ringIdx + 2) % palette.colors.length];
    const segCount = 3 + Math.floor(rands[ringIdx * 4] * 4);
    let angle = rands[ringIdx * 4 + 1] * 360;
    for (let s = 0; s < segCount; s++) {
      const span = 360 / segCount * (0.6 + rands[ringIdx * 10 + s] * 0.4);
      const endAngle = angle + span;
      const c = s % 2 === 0 ? colorBase : colorAlt;
      const isFocal = ringIdx === ringRadii.length - 1;
      arcs.push(`
        <path d="${arcPath(half - 1.5, half - 1.5, outerR, angle, endAngle)}
              L ${polarToCart(half - 1.5, half - 1.5, innerR, endAngle).x} ${polarToCart(half - 1.5, half - 1.5, innerR, endAngle).y}
              ${arcPath(half - 1.5, half - 1.5, innerR, endAngle, angle).replace("M", "A").replace(/M\s[\d.]+\s[\d.]+/, "")}"
          fill="none" stroke="${cssHsl(c, 0.35)}" stroke-width="${size * 8e-3}"/>`);
      const outerStart = polarToCart(half, half, outerR, angle);
      const outerEnd = polarToCart(half, half, outerR, endAngle);
      const innerEnd = polarToCart(half, half, innerR, endAngle);
      const innerStart = polarToCart(half, half, innerR, angle);
      const large = span > 180 ? 1 : 0;
      const fillPath = [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${outerR} ${outerR} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerEnd.x} ${innerEnd.y}`,
        `A ${innerR} ${innerR} 0 ${large} 0 ${innerStart.x} ${innerStart.y}`,
        `Z`
      ].join(" ");
      arcs.push(`<path d="${fillPath}"
        fill="${cssHsl(c)}"
        ${isFocal ? `filter="url(#${ids.glow})"` : `filter="url(#${ids.shadow})"`}
      />`);
      angle = endAngle + (360 / segCount - span);
    }
  });
  arcs.push(`<circle cx="${half}" cy="${half}" r="${size * 0.07}"
    fill="${cssHsl(palette.focal)}"
    filter="url(#${ids.glow})"/>`);
  return {
    extraDefs: "",
    body: `
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="${cssHsl(palette.base)}"/>

  <!-- Ring segments -->
  ${arcs.join("\n  ")}

  <!-- Grain overlay -->
  <rect width="${size}" height="${size}" fill="transparent" filter="url(#${ids.grain})" opacity="0.55"/>
  `
  };
}

export { renderRing };
//# sourceMappingURL=chunk-6MDCL3KF.js.map
//# sourceMappingURL=chunk-6MDCL3KF.js.map