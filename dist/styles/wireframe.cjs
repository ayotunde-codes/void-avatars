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

// src/styles/wireframe.ts
function renderWireframe(seed, size, palette, ids, uid) {
  const r = seededRands(seed + ":wire", 60);
  const bgColor = "#0A0A0A";
  const half = size / 2;
  const radius = size * 0.38;
  const focalHue = palette.focal.h;
  const wireColors = [
    `hsl(${focalHue},100%,60%)`,
    // neon primary
    `hsl(${(focalHue + 160) % 360},100%,62%)`,
    // electric secondary
    "#e8e8e8"
    // stark white
  ];
  const tiltX = (r[0] - 0.5) * 0.6;
  const tiltY = r[1] * Math.PI * 2;
  const lines = [];
  let lineIdx = 0;
  const latCount = 6 + Math.floor(r[2] * 4);
  for (let i = 1; i < latCount; i++) {
    const phi = Math.PI * i / latCount;
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
        class="va-wl-${uid}" id="va-${uid}-wire-line-${lineIdx}"/>`
    );
    lineIdx++;
  }
  const lonCount = 8 + Math.floor(r[3] * 4);
  for (let i = 0; i < lonCount; i++) {
    const theta = Math.PI * 2 * i / lonCount + tiltY;
    const points = [];
    const segments = 24;
    for (let j = 0; j <= segments; j++) {
      const phi = Math.PI * j / segments;
      const x3d = radius * Math.sin(phi) * Math.cos(theta);
      const y3d = radius * Math.cos(phi);
      const z3d = radius * Math.sin(phi) * Math.sin(theta);
      const rotY = y3d * Math.cos(tiltX) - z3d * Math.sin(tiltX);
      const px = half + x3d;
      const py = half + rotY;
      points.push(`${px.toFixed(2)},${py.toFixed(2)}`);
    }
    const ci = lineIdx % wireColors.length;
    const d = `M ${points.join(" L ")}`;
    const approxLen = (Math.PI * radius).toFixed(1);
    lines.push(
      `<path d="${d}"
        fill="none" stroke="${wireColors[ci]}" stroke-width="1" opacity="0.55"
        stroke-dasharray="${approxLen}" stroke-dashoffset="0"
        data-len="${approxLen}"
        class="va-wl-${uid}" id="va-${uid}-wire-line-${lineIdx}"/>`
    );
    lineIdx++;
  }
  const nodeCount = 8 + Math.floor(r[4] * 10);
  const nodeEls = Array.from({ length: nodeCount }, (_, i) => {
    const phi = r[(i * 3 + 10) % r.length] * Math.PI;
    const theta = r[(i * 3 + 11) % r.length] * Math.PI * 2 + tiltY;
    const x3d = radius * Math.sin(phi) * Math.cos(theta);
    const y3d = radius * Math.cos(phi);
    const z3d = radius * Math.sin(phi) * Math.sin(theta);
    const rotY = y3d * Math.cos(tiltX) - z3d * Math.sin(tiltX);
    const nx = half + x3d;
    const ny = half + rotY;
    const zRot = y3d * Math.sin(tiltX) + z3d * Math.cos(tiltX);
    if (zRot < 0) return "";
    const nodeSize = size * 0.02;
    const ci = i % wireColors.length;
    return `<rect x="${(nx - nodeSize / 2).toFixed(2)}" y="${(ny - nodeSize / 2).toFixed(2)}"
      width="${nodeSize.toFixed(2)}" height="${nodeSize.toFixed(2)}"
      fill="${wireColors[ci]}" class="va-wn-${uid}"/>`;
  }).filter(Boolean).join("\n    ");
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

exports.renderWireframe = renderWireframe;
//# sourceMappingURL=wireframe.cjs.map
//# sourceMappingURL=wireframe.cjs.map