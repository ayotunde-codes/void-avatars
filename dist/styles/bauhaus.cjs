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

// src/styles/bauhaus.ts
var SHAPE_TYPES = ["circle", "square", "triangle", "ring", "half"];
function renderShape(type, cx, cy, r, fillColor, strokeColor, rotate, isFocal, ids, shadowId, glowId, printOffsetX, printOffsetY) {
  const glowAttr = isFocal ? `filter="url(#${glowId})"` : `filter="url(#${shadowId})"`;
  switch (type) {
    case "circle":
      return `<g>
        <!-- Offset stroke (print misalignment) -->
        <circle cx="${cx - printOffsetX}" cy="${cy - printOffsetY}" r="${r}"
          fill="none" stroke="${strokeColor}" stroke-width="${r * 0.12}"/>
        <!-- Fill -->
        <circle cx="${cx}" cy="${cy}" r="${r * 0.9}"
          fill="${fillColor}" ${glowAttr}/>
      </g>`;
    case "ring":
      return `<g>
        <circle cx="${cx - printOffsetX}" cy="${cy - printOffsetY}" r="${r}"
          fill="none" stroke="${strokeColor}" stroke-width="${r * 0.28}"/>
        <circle cx="${cx}" cy="${cy}" r="${r}"
          fill="none" stroke="${fillColor}" stroke-width="${r * 0.22}" ${glowAttr}/>
      </g>`;
    case "square": {
      const s = r * 1.4;
      return `<g transform="rotate(${rotate}, ${cx}, ${cy})">
        <rect x="${cx - s / 2 - printOffsetX}" y="${cy - s / 2 - printOffsetY}" width="${s}" height="${s}" rx="${r * 0.15}"
          fill="none" stroke="${strokeColor}" stroke-width="${r * 0.1}"/>
        <rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" rx="${r * 0.15}"
          fill="${fillColor}" ${glowAttr}/>
      </g>`;
    }
    case "triangle": {
      const h3 = r * 1.5;
      const pts = [
        `${cx},${cy - h3}`,
        `${cx + r * 1.1},${cy + h3 * 0.5}`,
        `${cx - r * 1.1},${cy + h3 * 0.5}`
      ].join(" ");
      const ptsOff = [
        `${cx - printOffsetX},${cy - h3 - printOffsetY}`,
        `${cx + r * 1.1 - printOffsetX},${cy + h3 * 0.5 - printOffsetY}`,
        `${cx - r * 1.1 - printOffsetX},${cy + h3 * 0.5 - printOffsetY}`
      ].join(" ");
      return `<g transform="rotate(${rotate}, ${cx}, ${cy})">
        <polygon points="${ptsOff}" fill="none" stroke="${strokeColor}" stroke-width="${r * 0.1}"/>
        <polygon points="${pts}" fill="${fillColor}" ${glowAttr}/>
      </g>`;
    }
    case "half": {
      const arcFill = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`;
      const arcStroke = `M ${cx - r - printOffsetX} ${cy - printOffsetY} A ${r} ${r} 0 0 1 ${cx + r - printOffsetX} ${cy - printOffsetY} Z`;
      return `<g transform="rotate(${rotate}, ${cx}, ${cy})">
        <path d="${arcStroke}" fill="none" stroke="${strokeColor}" stroke-width="${r * 0.1}"/>
        <path d="${arcFill}" fill="${fillColor}" ${glowAttr}/>
      </g>`;
    }
  }
}
function renderBauhaus(seed, size, palette, ids) {
  const rands = seededRands(seed + ":bauhaus", 50);
  const cell = size / 3;
  const count = 5 + Math.floor(rands[0] * 3);
  const shapes = Array.from({ length: count }, (_, i) => {
    const r = (n) => rands[(i * 8 + n) % rands.length];
    const col = i % 3;
    const row = Math.floor(i / 3) % 3;
    const cx = cell * col + cell * (0.25 + r(0) * 0.5);
    const cy = cell * row + cell * (0.25 + r(1) * 0.5);
    const radius = cell * (0.18 + r(2) * 0.22);
    const colorIdx = i % palette.colors.length;
    const isFocal = i === Math.floor(count / 2);
    const type = SHAPE_TYPES[Math.floor(r(3) * SHAPE_TYPES.length)];
    const rotate = r(4) * 45;
    const px = (r(5) - 0.5) * size * 0.04;
    const py = (r(6) - 0.5) * size * 0.04;
    const fill = isFocal ? palette.focal : palette.colors[colorIdx];
    const strokeC = palette.colors[(colorIdx + 1) % palette.colors.length];
    return renderShape(
      type,
      cx,
      cy,
      radius,
      cssHsl(fill),
      cssHsl(strokeC, 0.7),
      rotate,
      isFocal,
      ids,
      ids.shadow,
      ids.glow,
      px,
      py
    );
  });
  return {
    extraDefs: "",
    body: `
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="${cssHsl(palette.base)}"/>

  <!-- Shapes -->
  ${shapes.join("\n  ")}

  <!-- Grain overlay -->
  <rect width="${size}" height="${size}" fill="transparent" filter="url(#${ids.grain})" opacity="0.6"/>
  `
  };
}

exports.renderBauhaus = renderBauhaus;
//# sourceMappingURL=bauhaus.cjs.map
//# sourceMappingURL=bauhaus.cjs.map