import { seededRands } from './chunk-5QPN6A5Y.js';

// src/styles/halftone.ts
function renderHalftone(seed, size, palette, ids, uid) {
  const r = seededRands(seed + ":halftone", 120);
  const cyan = "#00e5ff";
  const magenta = "#ff00aa";
  const yellow = "#ffe600";
  const cOff = { x: (r[0] - 0.5) * size * 0.025, y: (r[1] - 0.5) * size * 0.025 };
  const mOff = { x: (r[2] - 0.5) * size * 0.025, y: (r[3] - 0.5) * size * 0.025 };
  const yOff = { x: (r[4] - 0.5) * size * 0.025, y: (r[5] - 0.5) * size * 0.025 };
  function noiseAt(x, y, octave) {
    const idx = Math.floor(x * 7 + y * 13 + octave * 37) % r.length;
    return r[Math.abs(idx) % r.length];
  }
  function clumpedNoise(nx, ny) {
    const n1 = noiseAt(nx, ny, 0);
    const n2 = noiseAt(nx * 2.3, ny * 2.3, 1);
    return n1 * 0.65 + n2 * 0.35;
  }
  const baseStep = Math.max(3, Math.floor(size / 16));
  const cols = Math.ceil(size / baseStep) + 1;
  const rows = Math.ceil(size / baseStep) + 1;
  const gcx = size * (0.3 + r[6] * 0.4);
  const gcy = size * (0.3 + r[7] * 0.4);
  const maxDist = size * 0.72;
  function generateLayer(color, offset, layerIdx) {
    const dots = [];
    let di = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const jitterScale = baseStep * 0.25;
        const ri = (layerIdx * 400 + row * cols + col) % r.length;
        const cx = col * baseStep + (r[ri] - 0.5) * jitterScale;
        const cy = row * baseStep + (r[(ri + 1) % r.length] - 0.5) * jitterScale;
        const noise = clumpedNoise(col / cols, row / rows);
        const dist = Math.hypot(cx - gcx, cy - gcy);
        const normalDist = Math.min(1, dist / maxDist);
        const threshold = 0.25 + normalDist * 0.35;
        if (noise < threshold) continue;
        const minR = baseStep * 0.06;
        const maxR = baseStep * 0.42;
        const densityR = maxR - normalDist * (maxR - minR);
        const dotR = densityR * (0.6 + noise * 0.5);
        if (dotR < 0.3) continue;
        dots.push(
          `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}"
            r="${dotR.toFixed(2)}" fill="${color}" opacity="${(0.55 + noise * 0.4).toFixed(2)}"
            class="va-hd-${uid}" id="va-${uid}-ht-dot-${layerIdx * 1e3 + di}"/>`
        );
        di++;
      }
    }
    return dots.join("\n      ");
  }
  const cyanDots = generateLayer(cyan, cOff, 0);
  const magentaDots = generateLayer(magenta, mOff, 1);
  const yellowDots = generateLayer(yellow, yOff, 2);
  const glowFilter = `<filter id="va-htglow-${uid}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
    <feGaussianBlur stdDeviation="${(size * 8e-3).toFixed(2)}" result="b"/>
    <feColorMatrix type="matrix" in="b" values="
      1.6 0.1 0.0 0 0.05
      0.0 1.5 0.1 0 0.03
      0.1 0.0 1.7 0 0.05
      0   0   0   1 0
    " result="glow"/>
    <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
  const extraDefs = glowFilter;
  const body = `
  <!-- Absolute black background -->
  <rect width="${size}" height="${size}" fill="#000000"/>

  <!-- CMY dot layers with chromatic aberration offsets -->
  <g id="va-${uid}-ht-dots" filter="url(#va-htglow-${uid})">
    <g id="va-${uid}-ht-cyan" transform="translate(${cOff.x.toFixed(2)},${cOff.y.toFixed(2)})" style="mix-blend-mode:screen">
      ${cyanDots}
    </g>
    <g id="va-${uid}-ht-magenta" transform="translate(${mOff.x.toFixed(2)},${mOff.y.toFixed(2)})" style="mix-blend-mode:screen">
      ${magentaDots}
    </g>
    <g id="va-${uid}-ht-yellow" transform="translate(${yOff.x.toFixed(2)},${yOff.y.toFixed(2)})" style="mix-blend-mode:screen">
      ${yellowDots}
    </g>
  </g>

  <!-- Grain overlay -->
  <rect width="${size}" height="${size}" fill="transparent" filter="url(#${ids.grain})" opacity="0.25"/>`;
  return { extraDefs, body };
}

export { renderHalftone };
//# sourceMappingURL=chunk-QP7G7ZLC.js.map
//# sourceMappingURL=chunk-QP7G7ZLC.js.map