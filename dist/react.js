import { jsx } from 'react/jsx-runtime';

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
function hslToHex(h, s, l) {
  const sl = s / 100;
  const ll = l / 100;
  const a = sl * Math.min(ll, 1 - ll);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
function makeColor(h, s, l) {
  return { h, s, l, hex: hslToHex(h, s, l) };
}
function buildPalette(seed, custom) {
  if (custom && custom.length >= 5) {
    const colors2 = custom.slice(0, 5).map(hexToHsl);
    return { colors: colors2, focal: colors2[4], base: colors2[0] };
  }
  const rands = seededRands(seed + ":palette", 6);
  const baseHue = rands[0] * 360;
  const hueStep = 60 + rands[1] * 30;
  const baseSat = 58 + rands[2] * 28;
  const baseLit = 30 + rands[3] * 10;
  const colors = Array.from({ length: 5 }, (_, i) => {
    const hue = (baseHue + hueStep * i) % 360;
    const sat = Math.max(40, baseSat - i * 4);
    const lit = Math.min(78, baseLit + i * 10);
    return makeColor(hue, sat, lit);
  });
  return { colors, focal: colors[4], base: colors[0] };
}
function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let s = 0, h = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return makeColor(Math.round(h * 360), Math.round(s * 100), Math.round(l * 100));
}
function cssHsl(c, alpha = 1) {
  return alpha < 1 ? `hsla(${c.h},${c.s}%,${c.l}%,${alpha})` : `hsl(${c.h},${c.s}%,${c.l}%)`;
}

// src/lib/filters.ts
function makeFilterIds(uid) {
  return {
    grain: `va-grf-${uid}`,
    glow: `va-glf-${uid}`,
    shadow: `va-shf-${uid}`,
    displace: `va-dpf-${uid}`,
    blur: `va-blf-${uid}`
  };
}
function renderDefs(ids, size, glowColor, moodFreq = "0.018 0.014", moodScale = 0.12, morphSmil2 = "") {
  const dispScale = size * moodScale;
  const half = size / 2;
  return `
  <!-- Film grain / risograph print texture -->
  <filter id="${ids.grain}" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" result="n"/>
    <feColorMatrix type="saturate" values="0" in="n" result="gn"/>
    <feBlend in="SourceGraphic" in2="gn" mode="soft-light" result="out"/>
    <feComposite in="out" in2="SourceGraphic" operator="in"/>
  </filter>

  <!-- Inner glow \u2014 focal shape depth -->
  <filter id="${ids.glow}" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${size * 0.07}" result="b"/>
    <feFlood flood-color="${glowColor}" flood-opacity="0.52" result="c"/>
    <feComposite in="c" in2="b" operator="in" result="glow"/>
    <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>

  <!-- Soft drop shadow \u2014 depth hierarchy -->
  <filter id="${ids.shadow}" x="-25%" y="-25%" width="150%" height="150%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${size * 0.035}" result="b"/>
    <feOffset dx="${size * 0.02}" dy="${size * 0.03}" result="o"/>
    <feFlood flood-color="#000" flood-opacity="0.22" result="c"/>
    <feComposite in="c" in2="o" operator="in" result="s"/>
    <feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>

  <!-- Liquid displacement \u2014 marble warp; frequency/scale driven by mood -->
  <filter id="${ids.displace}" x="-14%" y="-14%" width="128%" height="128%">
    <feTurbulence type="turbulence" baseFrequency="${moodFreq}" numOctaves="3" seed="${half | 0}" result="t">${morphSmil2}</feTurbulence>
    <feDisplacementMap in="SourceGraphic" in2="t" scale="${dispScale}" xChannelSelector="R" yChannelSelector="G"/>
  </filter>

  <!-- Soft blur \u2014 Beam bloom layer -->
  <filter id="${ids.blur}">
    <feGaussianBlur stdDeviation="${size * 0.028}"/>
  </filter>`;
}

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

// src/styles/pixel.ts
var GRID = 8;
function renderPixel(seed, size, palette, ids) {
  const rands = seededRands(seed + ":pixel", GRID * (GRID / 2) * 2);
  const cell = size / GRID;
  const cells = [];
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID / 2; col++) {
      const idx = row * (GRID / 2) + col;
      const v = rands[idx];
      if (v > 0.35) {
        const colorIdx = Math.floor(v * palette.colors.length);
        const c = palette.colors[colorIdx];
        const isFocal = colorIdx === palette.colors.length - 1;
        const x = col * cell;
        const mirrorX = (GRID - 1 - col) * cell;
        const y = row * cell;
        const pad = cell * 0.06;
        const glowAttr = isFocal ? `filter="url(#${ids.glow})"` : "";
        const strokeCell = `<rect x="${x + pad - 1.5}" y="${y + pad - 1.5}"
          width="${cell - pad * 2}" height="${cell - pad * 2}" rx="${cell * 0.1}"
          fill="none" stroke="${cssHsl(c, 0.5)}" stroke-width="${cell * 0.08}"/>`;
        const fillCell = (sx) => `<rect x="${sx + pad}" y="${y + pad}"
            width="${cell - pad * 2}" height="${cell - pad * 2}" rx="${cell * 0.1}"
            fill="${cssHsl(c)}" ${glowAttr}/>`;
        cells.push(strokeCell);
        cells.push(fillCell(x));
        if (col !== GRID / 2 - 1 || GRID % 2 !== 0) {
          const mStroke = `<rect x="${mirrorX + pad - 1.5}" y="${y + pad - 1.5}"
            width="${cell - pad * 2}" height="${cell - pad * 2}" rx="${cell * 0.1}"
            fill="none" stroke="${cssHsl(c, 0.5)}" stroke-width="${cell * 0.08}"/>`;
          cells.push(mStroke);
          cells.push(fillCell(mirrorX));
        }
      }
    }
  }
  return {
    extraDefs: "",
    body: `
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="${cssHsl(palette.base)}"/>

  <!-- Pixel cells -->
  ${cells.join("\n  ")}

  <!-- Grain overlay -->
  <rect width="${size}" height="${size}" fill="transparent" filter="url(#${ids.grain})" opacity="0.65"/>
  `
  };
}

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

// src/styles/glitch.ts
function renderGlitch(seed, size, palette, ids, uid) {
  const r = seededRands(seed + ":gl", 80);
  const GRID2 = 16;
  const cell = size / GRID2;
  const f = palette.focal;
  const neons = [
    `hsl(${f.h | 0},100%,62%)`,
    `hsl(${(f.h + 120) % 360 | 0},100%,58%)`,
    `hsl(${(f.h + 240) % 360 | 0},100%,62%)`,
    "#00ffcc",
    "#ff00aa"
  ];
  let cells = "";
  for (let row = 0; row < GRID2; row++) {
    for (let col = 0; col < GRID2 / 2; col++) {
      const v = r[(row * (GRID2 / 2) + col) % r.length];
      if (v > 0.48) {
        const ci = Math.floor(v * neons.length);
        const clr = neons[Math.min(ci, neons.length - 1)];
        const x = col * cell, mx = (GRID2 - 1 - col) * cell, y = row * cell;
        const pad = cell * 0.04;
        const w = cell - pad * 2, h = cell - pad * 2;
        cells += `<rect x="${x + pad}" y="${y + pad}" width="${w}" height="${h}" fill="${clr}" class="va-pxc-${uid}"/>`;
        if (col !== GRID2 / 2 - 1) {
          cells += `<rect x="${mx + pad}" y="${y + pad}" width="${w}" height="${h}" fill="${clr}" class="va-pxc-${uid}"/>`;
        }
      }
    }
  }
  const sliceCount = 2 + Math.floor(r[70] * 4);
  let sliceDefs = "", sliceEls = "";
  for (let i = 0; i < sliceCount; i++) {
    const sliceRow = Math.floor(r[71 + i] * (GRID2 - 2)) + 1;
    const offset = (r[72 + i] - 0.5) * size * 0.28;
    const sliceH = cell * (0.8 + r[73 + i]);
    const cpId = `va-slcp-${uid}-${i}`;
    sliceDefs += `<clipPath id="${cpId}"><rect x="${-size}" y="${sliceRow * cell}" width="${size * 3}" height="${sliceH}"/></clipPath>`;
    sliceEls += `<g clip-path="url(#${cpId})" transform="translate(${offset},0)" opacity="0.9">${cells}</g>`;
  }
  const caOff = size * 0.022;
  const caFilter = `<filter id="va-caf-${uid}" x="-5%" y="0%" width="110%" height="100%" color-interpolation-filters="sRGB">
    <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>
    <feOffset in="r" dx="-${caOff}" dy="0" result="ro"/>
    <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
    <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/>
    <feOffset in="b" dx="${caOff}" dy="0" result="bo"/>
    <feMerge><feMergeNode in="ro"/><feMergeNode in="g"/><feMergeNode in="bo"/></feMerge>
  </filter>`;
  const extraDefs = caFilter + "\n  " + sliceDefs;
  const body = `
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#000"/>

  <!-- Main pixel grid with chromatic aberration -->
  <g id="va-${uid}-glitch-base" filter="url(#va-caf-${uid})">${cells}</g>

  <!-- Offset slice disruptions -->
  <g id="va-${uid}-glitch-slices" filter="url(#va-caf-${uid})" opacity="0.85">${sliceEls}</g>

  <!-- Grain overlay -->
  <rect width="${size}" height="${size}" fill="transparent" filter="url(#${ids.grain})" opacity="0.38"/>`;
  return { extraDefs, body };
}

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

// src/styles/emoticon.ts
function renderEmoticon(seed, size, palette, ids, uid) {
  const r = seededRands(seed + ":em", 30);
  const h = size / 2;
  const faceType = Math.floor(r[0] * 3);
  const faceRad = size * 0.41;
  const faceFs = cssHsl(palette.colors[1]);
  let faceEl;
  if (faceType === 0) {
    faceEl = `<circle cx="${h}" cy="${h}" r="${faceRad}" fill="${faceFs}"/>`;
  } else if (faceType === 1) {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (i * 60 - 30) * (Math.PI / 180);
      return `${(h + faceRad * Math.cos(a)).toFixed(2)},${(h + faceRad * Math.sin(a)).toFixed(2)}`;
    }).join(" ");
    faceEl = `<polygon points="${pts}" fill="${faceFs}"/>`;
  } else {
    faceEl = `<rect x="${h - faceRad}" y="${h - faceRad}" width="${faceRad * 2}" height="${faceRad * 2}" rx="${faceRad * 0.38}" fill="${faceFs}"/>`;
  }
  const eyeStyle = Math.floor(r[1] * 4);
  const eyeY = h - size * 0.09;
  const eyeSpread = size * 0.14, eyeR = size * 0.065;
  const eyeFs = cssHsl(palette.focal);
  const eyeSW = size * 0.026;
  let eyesEl;
  switch (eyeStyle) {
    case 0:
      eyesEl = `<circle cx="${h - eyeSpread}" cy="${eyeY}" r="${eyeR}" fill="${eyeFs}"/><circle cx="${h + eyeSpread}" cy="${eyeY}" r="${eyeR}" fill="${eyeFs}"/>`;
      break;
    case 1:
      eyesEl = `<path d="M ${h - eyeSpread - eyeR} ${eyeY} A ${eyeR} ${eyeR} 0 0 1 ${h - eyeSpread + eyeR} ${eyeY} Z" fill="${eyeFs}"/><path d="M ${h + eyeSpread - eyeR} ${eyeY} A ${eyeR} ${eyeR} 0 0 1 ${h + eyeSpread + eyeR} ${eyeY} Z" fill="${eyeFs}"/>`;
      break;
    case 2:
      eyesEl = `<line x1="${h - eyeSpread - eyeR}" y1="${eyeY}" x2="${h - eyeSpread + eyeR}" y2="${eyeY}" stroke="${eyeFs}" stroke-width="${eyeSW}" stroke-linecap="round"/><line x1="${h + eyeSpread - eyeR}" y1="${eyeY}" x2="${h + eyeSpread + eyeR}" y2="${eyeY}" stroke="${eyeFs}" stroke-width="${eyeSW}" stroke-linecap="round"/>`;
      break;
    default:
      eyesEl = `<ellipse cx="${h - eyeSpread}" cy="${eyeY}" rx="${eyeR * 1.3}" ry="${eyeR * 0.7}" fill="${eyeFs}"/><ellipse cx="${h + eyeSpread}" cy="${eyeY}" rx="${eyeR * 1.3}" ry="${eyeR * 0.7}" fill="${eyeFs}"/>`;
      break;
  }
  const mouthY = h + size * 0.11;
  const mouthW = size * 0.2;
  const mouthSW = size * 0.03;
  const mouthStroke = cssHsl(palette.colors[3]);
  const smileD = `M ${h - mouthW} ${mouthY} Q ${h} ${(mouthY + mouthW * 0.65).toFixed(2)} ${h + mouthW} ${mouthY}`;
  const body = `
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="${cssHsl(palette.base)}"/>

  <!-- Face -->
  <g id="va-${uid}-face">
    ${faceEl}
    <g id="va-${uid}-eyes">${eyesEl}</g>
    <g id="va-${uid}-mouth">
      <path id="va-${uid}-mouth-path"
        d="${smileD}"
        fill="none"
        stroke="${mouthStroke}"
        stroke-width="${mouthSW}"
        stroke-linecap="round"/>
    </g>
  </g>

  <!-- Grain overlay -->
  <rect width="${size}" height="${size}" fill="transparent" filter="url(#${ids.grain})" opacity="0.5"/>`;
  return { extraDefs: "", body };
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

// src/styles/spectrum.ts
function renderSpectrum(seed, size, palette, ids, uid) {
  const r = seededRands(seed + ":spectrum", 60);
  const bgColor = "#070710";
  const barCount = 12 + Math.floor(r[0] * 5);
  function noiseHeight(i) {
    const t = i / barCount;
    const n1 = Math.sin(t * Math.PI * 2 * (1.5 + r[1] * 2)) * 0.4;
    const n2 = Math.sin(t * Math.PI * 2 * (3 + r[2] * 3) + r[3] * Math.PI) * 0.25;
    const n3 = Math.sin(t * Math.PI * 2 * (6 + r[4] * 4) + r[5] * Math.PI) * 0.15;
    const base = 0.3 + r[(i + 10) % r.length] * 0.2;
    return Math.max(0.12, Math.min(0.95, base + n1 + n2 + n3));
  }
  const totalWidth = size * 0.82;
  const gap = totalWidth * 0.02;
  const barWidth = (totalWidth - gap * (barCount - 1)) / barCount;
  const startX = (size - totalWidth) / 2;
  const baseY = size * 0.88;
  const gradTop = palette.focal;
  const gradBot = palette.colors[2];
  const gradDefs = Array.from({ length: barCount }, (_, i) => {
    const hueShift = i / barCount * 60;
    const topH = (gradTop.h + hueShift) % 360;
    const botH = (gradBot.h + hueShift * 0.5) % 360;
    return `<linearGradient id="va-sg-${uid}-${i}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="hsl(${topH | 0},100%,65%)"/>
      <stop offset="100%" stop-color="hsl(${botH | 0},${gradBot.s}%,${gradBot.l}%)"/>
    </linearGradient>`;
  }).join("\n    ");
  const barGlowFilter = `<filter id="va-sgf-${uid}" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="${(size * 0.012).toFixed(2)}" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
  const bars = Array.from({ length: barCount }, (_, i) => {
    const height = noiseHeight(i) * size * 0.72;
    const x = startX + i * (barWidth + gap);
    const y = baseY - height;
    const rx = barWidth * 0.25;
    return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}"
      width="${barWidth.toFixed(2)}" height="${height.toFixed(2)}" rx="${rx.toFixed(2)}"
      fill="url(#va-sg-${uid}-${i})"
      class="va-sb-${uid}" id="va-${uid}-spec-bar-${i}"
      data-base-height="${height.toFixed(2)}" data-base-y="${y.toFixed(2)}"/>`;
  }).join("\n    ");
  const reflection = Array.from({ length: barCount }, (_, i) => {
    const height = noiseHeight(i) * size * 0.72;
    const x = startX + i * (barWidth + gap);
    const reflH = height * 0.25;
    const reflY = baseY;
    return `<rect x="${x.toFixed(2)}" y="${reflY.toFixed(2)}"
      width="${barWidth.toFixed(2)}" height="${reflH.toFixed(2)}" rx="${(barWidth * 0.25).toFixed(2)}"
      fill="url(#va-sg-${uid}-${i})" opacity="0.15"/>`;
  }).join("\n    ");
  const baselineGlow = `<line x1="${startX}" y1="${baseY}" x2="${startX + totalWidth}" y2="${baseY}"
    stroke="${cssHsl(palette.focal, 0.15)}" stroke-width="${(size * 0.01).toFixed(2)}"/>`;
  const extraDefs = gradDefs + "\n    " + barGlowFilter;
  const body = `
  <!-- Deep dark background -->
  <rect width="${size}" height="${size}" fill="${bgColor}"/>

  <!-- Baseline glow -->
  ${baselineGlow}

  <!-- Spectrum bars -->
  <g id="va-${uid}-spectrum-bars" filter="url(#va-sgf-${uid})">
    ${bars}
  </g>

  <!-- Reflection -->
  <g id="va-${uid}-spectrum-glow" opacity="0.4">
    ${reflection}
  </g>

  <!-- Grain overlay -->
  <rect width="${size}" height="${size}" fill="transparent" filter="url(#${ids.grain})" opacity="0.25"/>`;
  return { extraDefs, body };
}

// src/lib/mood.ts
var MOOD_FILTER = {
  none: { freq: "0.018 0.014", scale: 0.12 },
  happy: { freq: "0.013 0.010", scale: 0.08 },
  sad: { freq: "0.022 0.018", scale: 0.15 },
  angry: { freq: "0.032 0.025", scale: 0.22 },
  calm: { freq: "0.008 0.006", scale: 0.05 },
  chaotic: { freq: "0.044 0.036", scale: 0.28 }
};
function moodFilterParams(mood) {
  return MOOD_FILTER[mood] ?? MOOD_FILTER.none;
}
function hslStr(c, a = 1) {
  return cssHsl(c, a);
}
function moodElMarble(mood, size, pal) {
  if (mood === "none") return "";
  const h = size / 2;
  const c = pal.colors[2];
  const op = 0.32, sw = size * 0.026, lc = "round";
  const paths = {
    happy: `M ${size * 0.28} ${size * 0.62} Q ${h} ${size * 0.72} ${size * 0.72} ${size * 0.62}`,
    sad: `M ${size * 0.28} ${size * 0.64} Q ${h} ${size * 0.55} ${size * 0.72} ${size * 0.64}`,
    angry: `M ${size * 0.25} ${size * 0.6} L ${size * 0.4} ${size * 0.65} M ${size * 0.75} ${size * 0.6} L ${size * 0.6} ${size * 0.65}`,
    calm: `M ${size * 0.3} ${size * 0.62} L ${size * 0.7} ${size * 0.62}`,
    chaotic: `M ${size * 0.22} ${size * 0.6} Q ${size * 0.36} ${size * 0.52} ${size * 0.5} ${size * 0.62} Q ${size * 0.64} ${size * 0.72} ${size * 0.78} ${size * 0.6}`
  };
  return `<path d="${paths[mood] ?? ""}" fill="none" stroke="${hslStr(c, op)}" stroke-width="${sw}" stroke-linecap="${lc}"/>`;
}
function moodElBeam(mood, size, pal) {
  if (mood === "none") return "";
  const h = size / 2, bh = size * 0.07, rx = size * 0.018;
  const configs = {
    happy: { x: -size * 0.1, y: size * 0.22, w: size * 1.2, rot: -18, ci: 4, op: 0.72 },
    sad: { x: -size * 0.1, y: size * 0.7, w: size * 1.2, rot: 18, ci: 1, op: 0.55 },
    angry: { x: size * 0.15, y: size * 0.18, w: size * 0.7, rot: -42, ci: 3, op: 0.8 },
    calm: { x: -size * 0.05, y: size * 0.45, w: size * 1.1, rot: 0, ci: 2, op: 0.38 },
    chaotic: { x: size * 0.25, y: size * 0.35, w: size * 0.5, rot: -62, ci: 4, op: 0.85 }
  };
  const b = configs[mood];
  if (!b) return "";
  const c = pal.colors[Math.min(b.ci, pal.colors.length - 1)];
  return `<g transform="rotate(${b.rot} ${h} ${h})">
    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${bh}" rx="${rx}" fill="${hslStr(c, b.op)}"/>
  </g>`;
}
function moodElBauhaus(mood, size, pal) {
  if (mood === "none") return "";
  const h = size / 2;
  const fc = hslStr(pal.focal, 0.88);
  const ac = hslStr(pal.colors[2], 0.88);
  const er = size * 0.046, ey = size * 0.365, lx = size * 0.335, rx2 = size * 0.665;
  const sw = size * 0.022;
  let eyes = "";
  if (mood === "calm") {
    eyes = `<rect x="${lx - er * 1.1}" y="${ey - er * 0.25}" width="${er * 2.2}" height="${er * 0.5}" rx="${er * 0.25}" fill="${fc}"/>
            <rect x="${rx2 - er * 1.1}" y="${ey - er * 0.25}" width="${er * 2.2}" height="${er * 0.5}" rx="${er * 0.25}" fill="${fc}"/>`;
  } else if (mood === "angry") {
    eyes = `<circle cx="${lx}" cy="${ey}" r="${er}" fill="${fc}"/>
            <circle cx="${rx2}" cy="${ey}" r="${er}" fill="${fc}"/>
            <polygon points="${lx - er * 1.4},${ey - er * 1.4} ${lx + er * 0.6},${ey - er * 2.4} ${lx + er * 1.4},${ey - er * 1.1}" fill="${ac}"/>
            <polygon points="${rx2 - er * 1.4},${ey - er * 1.1} ${rx2 - er * 0.6},${ey - er * 2.4} ${rx2 + er * 1.4},${ey - er * 1.4}" fill="${ac}"/>`;
  } else if (mood === "chaotic") {
    eyes = `<circle cx="${lx}" cy="${ey}" r="${er}" fill="none" stroke="${fc}" stroke-width="${sw * 0.8}"/>
            <circle cx="${rx2}" cy="${ey}" r="${er}" fill="none" stroke="${fc}" stroke-width="${sw * 0.8}"/>
            <circle cx="${lx}" cy="${ey}" r="${er * 0.4}" fill="${fc}"/>
            <circle cx="${rx2}" cy="${ey}" r="${er * 0.4}" fill="${fc}"/>`;
  } else {
    eyes = `<circle cx="${lx}" cy="${ey}" r="${er}" fill="${fc}"/>
            <circle cx="${rx2}" cy="${ey}" r="${er}" fill="${fc}"/>`;
  }
  const my = size * 0.63, mw = size * 0.28;
  let mouth = "";
  switch (mood) {
    case "happy":
      mouth = `<path d="M ${h - mw / 2} ${my} A ${mw / 2} ${mw / 2} 0 0 1 ${h + mw / 2} ${my} Z" fill="${ac}"/>`;
      break;
    case "sad":
      mouth = `<path d="M ${h - mw / 2} ${my} A ${mw / 2} ${mw / 2} 0 0 0 ${h + mw / 2} ${my}" fill="none" stroke="${ac}" stroke-width="${sw}" stroke-linecap="round"/>`;
      break;
    case "angry": {
      const jStep = mw / 4;
      mouth = `<path d="M ${h - mw / 2} ${my + size * 0.01} L ${h - mw / 2 + jStep} ${my - size * 0.025} L ${h} ${my + size * 0.01} L ${h + jStep} ${my - size * 0.025} L ${h + mw / 2} ${my + size * 0.01}" fill="none" stroke="${ac}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
      break;
    }
    case "calm":
      mouth = `<line x1="${h - mw / 2}" y1="${my}" x2="${h + mw / 2}" y2="${my}" stroke="${ac}" stroke-width="${sw}" stroke-linecap="round"/>`;
      break;
    case "chaotic": {
      const zs = mw / 5;
      mouth = `<path d="M ${h - mw / 2} ${my} L ${h - mw / 2 + zs} ${my - size * 0.03} L ${h - mw / 2 + zs * 2} ${my + size * 0.03} L ${h - mw / 2 + zs * 3} ${my - size * 0.028} L ${h - mw / 2 + zs * 4} ${my + size * 0.028} L ${h + mw / 2} ${my}" fill="none" stroke="${ac}" stroke-width="${sw * 0.8}" stroke-linejoin="round" stroke-linecap="round"/>`;
      break;
    }
  }
  return eyes + mouth;
}
function moodElPixel(mood, size, pal) {
  if (mood === "none") return "";
  const cell = size / 8;
  const fc = hslStr(pal.focal, 0.92);
  const mc = hslStr(pal.colors[3], 0.92);
  const eyeW = cell * 1.6, eyeH = cell * 1.6, eyeY = cell * 2.1;
  const lEx = cell * 1.4, rEx = cell * 5, rx = cell * 0.12;
  let eyes = "";
  if (mood === "calm") {
    eyes = `<rect x="${lEx}" y="${eyeY + eyeH * 0.4}" width="${eyeW}" height="${cell * 0.4}" rx="${cell * 0.2}" fill="${fc}"/>
            <rect x="${rEx}" y="${eyeY + eyeH * 0.4}" width="${eyeW}" height="${cell * 0.4}" rx="${cell * 0.2}" fill="${fc}"/>`;
  } else if (mood === "angry") {
    eyes = `<rect x="${lEx}" y="${eyeY}" width="${eyeW}" height="${eyeH}" rx="${rx}" fill="${fc}"/>
            <rect x="${rEx}" y="${eyeY}" width="${eyeW}" height="${eyeH}" rx="${rx}" fill="${fc}"/>
            <rect x="${lEx - 0.3 * cell}" y="${eyeY - 0.9 * cell}" width="${eyeW + 0.3 * cell}" height="${cell * 0.4}" rx="${cell * 0.08}" fill="${mc}" transform="rotate(-14 ${lEx + eyeW / 2} ${eyeY - 0.7 * cell})"/>
            <rect x="${rEx}" y="${eyeY - 0.9 * cell}" width="${eyeW + 0.3 * cell}" height="${cell * 0.4}" rx="${cell * 0.08}" fill="${mc}" transform="rotate(14 ${rEx + eyeW / 2} ${eyeY - 0.7 * cell})"/>`;
  } else {
    eyes = `<rect x="${lEx}" y="${eyeY}" width="${eyeW}" height="${eyeH}" rx="${rx}" fill="${fc}"/>
            <rect x="${rEx}" y="${eyeY}" width="${eyeW}" height="${eyeH}" rx="${rx}" fill="${fc}"/>`;
  }
  const mY = cell * 5.3, ch = cell * 0.42, mRx = cell * 0.1;
  const mouths = {
    happy: [[lEx, mY + cell * 0.5, cell, ch], [rEx, mY + cell * 0.5, cell, ch], [lEx + cell, mY + cell, cell * 3.6, ch]],
    sad: [[lEx, mY + cell, cell, ch], [rEx, mY + cell, cell, ch], [lEx + cell, mY + cell * 0.5, cell * 3.6, ch]],
    angry: [[lEx, mY + cell * 0.6, cell * 0.8, ch], [lEx + cell * 0.8, mY + cell * 0.9, cell * 4, ch], [rEx + cell * 0.2, mY + cell * 0.6, cell * 0.8, ch]],
    calm: [[size * 0.32, mY + cell * 0.7, size * 0.36, ch]],
    chaotic: [[lEx, mY + cell * 0.4, cell, ch], [lEx + cell * 1.4, mY + cell * 1.1, cell, ch], [lEx + cell * 2.8, mY + cell * 0.3, cell, ch], [rEx, mY + cell, cell, ch], [rEx - cell * 1.4, mY + cell * 0.6, cell, ch]]
  };
  const mouthEls = (mouths[mood] ?? mouths.calm).map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${mRx}" fill="${mc}"/>`).join("");
  return eyes + mouthEls;
}
function moodElRing(mood, size, pal) {
  if (mood === "none") return "";
  const h = size / 2;
  const fc = hslStr(pal.focal, 0.82);
  const ac = hslStr(pal.colors[2], 0.82);
  const r = size * 0.065, sw = size * 0.022;
  const exprs = {
    happy: `<path d="M ${h - r * 2.2} ${h + r * 0.6} Q ${h} ${h + r * 2.8} ${h + r * 2.2} ${h + r * 0.6}" fill="none" stroke="${fc}" stroke-width="${sw}" stroke-linecap="round"/>`,
    sad: `<path d="M ${h - r * 2.2} ${h + r * 2} Q ${h} ${h - r * 0.4} ${h + r * 2.2} ${h + r * 2}" fill="none" stroke="${fc}" stroke-width="${sw}" stroke-linecap="round"/>`,
    angry: `<path d="M ${h - r * 2.2} ${h - r * 0.6} L ${h - r * 0.4} ${h + r * 0.8} M ${h + r * 2.2} ${h - r * 0.6} L ${h + r * 0.4} ${h + r * 0.8}" stroke="${fc}" stroke-width="${sw}" stroke-linecap="round"/>`,
    calm: `<line x1="${h - r * 2}" y1="${h + r}" x2="${h + r * 2}" y2="${h + r}" stroke="${fc}" stroke-width="${sw}" stroke-linecap="round"/>`,
    chaotic: `<circle cx="${h - r * 2}" cy="${h + r}" r="${r * 0.55}" fill="${fc}"/><circle cx="${h}" cy="${h + r * 2}" r="${r * 0.55}" fill="${ac}"/><circle cx="${h + r * 2}" cy="${h + r * 0.3}" r="${r * 0.55}" fill="${fc}"/><circle cx="${h - r * 0.8}" cy="${h - r * 1.8}" r="${r * 0.4}" fill="${ac}"/>`
  };
  return exprs[mood] ?? "";
}
function moodElGlitch(mood, size) {
  if (mood === "none") return "";
  const neonColors = {
    happy: "#00ff88",
    sad: "#4488ff",
    angry: "#ff2244",
    calm: "#88ffff",
    chaotic: "#ff00ff"
  };
  const neon = neonColors[mood] ?? "#ccff00";
  const sliceY = { happy: size * 0.25, sad: size * 0.65, angry: size * 0.35, calm: size * 0.5, chaotic: size * 0.15 }[mood] ?? size * 0.4;
  const sliceH = size * 0.08;
  const offset = { happy: size * 0.04, sad: -size * 0.06, angry: size * 0.1, calm: size * 0.01, chaotic: -size * 0.12 }[mood] ?? size * 0.05;
  return `<rect x="0" y="${sliceY}" width="${size}" height="${sliceH}" fill="${neon}" opacity="0.18"/>
    <rect x="${offset}" y="${sliceY + sliceH}" width="${size}" height="${sliceH * 0.6}" fill="${neon}" opacity="0.10"/>`;
}
function moodElConstellation(mood, size) {
  if (mood === "none") return "";
  const h = size / 2;
  const glows = {
    happy: { color: "#ccff00", r: size * 0.18, op: 0.12 },
    sad: { color: "#4488ff", r: size * 0.14, op: 0.08 },
    angry: { color: "#ff2244", r: size * 0.22, op: 0.16 },
    calm: { color: "#88ffff", r: size * 0.1, op: 0.06 },
    chaotic: { color: "#ff00ff", r: size * 0.28, op: 0.2 }
  };
  const g = glows[mood] ?? glows.calm;
  return `<circle cx="${h}" cy="${h}" r="${g.r}" fill="${g.color}" opacity="${g.op}"/>`;
}
function moodElNebula(mood, size, pal) {
  if (mood === "none") return "";
  const h = size / 2;
  const fc = hslStr(pal.focal, 0.92);
  const ac = hslStr(pal.colors[3], 0.85);
  const eyeR = size * 0.028;
  const eyeY = size * 0.38;
  const lx = size * 0.34, rx = size * 0.66;
  const glowR = eyeR * 3;
  let eyes = `<circle cx="${lx}" cy="${eyeY}" r="${glowR}" fill="${fc}" opacity="0.15"/>
    <circle cx="${rx}" cy="${eyeY}" r="${glowR}" fill="${fc}" opacity="0.15"/>
    <circle cx="${lx}" cy="${eyeY}" r="${eyeR}" fill="white" opacity="0.9"/>
    <circle cx="${rx}" cy="${eyeY}" r="${eyeR}" fill="white" opacity="0.9"/>`;
  const mouthY = size * 0.58;
  const tints = {
    happy: `<path d="M ${h - size * 0.08} ${mouthY} Q ${h} ${mouthY + size * 0.06} ${h + size * 0.08} ${mouthY}" fill="none" stroke="${ac}" stroke-width="${size * 0.015}" stroke-linecap="round" opacity="0.6"/>`,
    sad: `<path d="M ${h - size * 0.08} ${mouthY + size * 0.03} Q ${h} ${mouthY - size * 0.04} ${h + size * 0.08} ${mouthY + size * 0.03}" fill="none" stroke="${ac}" stroke-width="${size * 0.015}" stroke-linecap="round" opacity="0.5"/>`,
    angry: `<line x1="${lx - eyeR}" y1="${eyeY - eyeR * 2.5}" x2="${lx + eyeR * 2}" y2="${eyeY - eyeR * 1.2}" stroke="${ac}" stroke-width="${size * 0.012}" stroke-linecap="round" opacity="0.7"/>
    <line x1="${rx + eyeR}" y1="${eyeY - eyeR * 2.5}" x2="${rx - eyeR * 2}" y2="${eyeY - eyeR * 1.2}" stroke="${ac}" stroke-width="${size * 0.012}" stroke-linecap="round" opacity="0.7"/>`,
    calm: `<line x1="${h - size * 0.06}" y1="${mouthY}" x2="${h + size * 0.06}" y2="${mouthY}" stroke="${ac}" stroke-width="${size * 0.012}" stroke-linecap="round" opacity="0.4"/>`,
    chaotic: `<path d="M ${h - size * 0.1} ${mouthY} L ${h - size * 0.04} ${mouthY - size * 0.03} L ${h + size * 0.04} ${mouthY + size * 0.03} L ${h + size * 0.1} ${mouthY}" fill="none" stroke="${ac}" stroke-width="${size * 0.012}" stroke-linecap="round" opacity="0.6"/>`
  };
  return eyes + (tints[mood] ?? "");
}
function moodElWireframe(mood, size, pal) {
  if (mood === "none") return "";
  const h = size / 2;
  const neonColors = {
    happy: "#00ff88",
    sad: "#4488ff",
    angry: "#ff2244",
    calm: "#88ffff",
    chaotic: "#ff00ff"
  };
  const neon = neonColors[mood] ?? "#ccff00";
  const sw = size * 0.018;
  const exprs = {
    happy: `<path d="M ${size * 0.28} ${size * 0.55} Q ${h} ${size * 0.65} ${size * 0.72} ${size * 0.55}" fill="none" stroke="${neon}" stroke-width="${sw}" stroke-linecap="round" opacity="0.8"/>`,
    sad: `<path d="M ${size * 0.3} ${size * 0.62} Q ${h} ${size * 0.52} ${size * 0.7} ${size * 0.62}" fill="none" stroke="${neon}" stroke-width="${sw}" stroke-linecap="round" opacity="0.7"/>`,
    angry: `<path d="M ${size * 0.25} ${size * 0.45} L ${size * 0.4} ${size * 0.52} M ${size * 0.75} ${size * 0.45} L ${size * 0.6} ${size * 0.52}" fill="none" stroke="${neon}" stroke-width="${sw}" stroke-linecap="round" opacity="0.85"/>
    <line x1="${size * 0.35}" y1="${size * 0.6}" x2="${size * 0.65}" y2="${size * 0.6}" stroke="${neon}" stroke-width="${sw * 0.7}" stroke-linecap="round" opacity="0.7"/>`,
    calm: `<line x1="${size * 0.32}" y1="${size * 0.56}" x2="${size * 0.68}" y2="${size * 0.56}" stroke="${neon}" stroke-width="${sw * 0.8}" stroke-linecap="round" opacity="0.5"/>`,
    chaotic: `<path d="M ${size * 0.22} ${size * 0.5} Q ${size * 0.36} ${size * 0.42} ${h} ${size * 0.55} Q ${size * 0.64} ${size * 0.68} ${size * 0.78} ${size * 0.48}" fill="none" stroke="${neon}" stroke-width="${sw}" stroke-linecap="round" opacity="0.75"/>`
  };
  return exprs[mood] ?? "";
}
function moodElHalftone(mood, size, pal) {
  if (mood === "none") return "";
  const h = size / 2;
  const tints = {
    happy: { color: cssHsl(pal.focal, 1), r: size * 0.22, op: 0.1 },
    sad: { color: cssHsl(pal.colors[1], 1), r: size * 0.18, op: 0.08 },
    angry: { color: "#ff2244", r: size * 0.26, op: 0.12 },
    calm: { color: cssHsl(pal.colors[2], 1), r: size * 0.14, op: 0.06 },
    chaotic: { color: "#ff00ff", r: size * 0.3, op: 0.14 }
  };
  const t = tints[mood];
  if (!t) return "";
  return `<circle cx="${h}" cy="${h}" r="${t.r}" fill="${t.color}" opacity="${t.op}"/>`;
}
function moodElIsometric(mood, size, pal) {
  if (mood === "none") return "";
  const h = size / 2;
  const tints = {
    happy: { color: "#ccff00", op: 0.12, scale: 0.25 },
    sad: { color: "#4488ff", op: 0.1, scale: 0.2 },
    angry: { color: "#ff2244", op: 0.16, scale: 0.28 },
    calm: { color: "#88ffff", op: 0.07, scale: 0.16 },
    chaotic: { color: "#ff00ff", op: 0.18, scale: 0.32 }
  };
  const t = tints[mood];
  if (!t) return "";
  return `<circle cx="${h}" cy="${h * 0.85}" r="${size * t.scale}" fill="${t.color}" opacity="${t.op}"/>`;
}
function moodElSpectrum(mood, size, pal) {
  if (mood === "none") return "";
  const h = size / 2;
  const tints = {
    happy: { color: "#ccff00", r: size * 0.28, op: 0.1 },
    sad: { color: "#4488ff", r: size * 0.22, op: 0.07 },
    angry: { color: "#ff2244", r: size * 0.3, op: 0.14 },
    calm: { color: "#88ffff", r: size * 0.18, op: 0.05 },
    chaotic: { color: "#ff00ff", r: size * 0.34, op: 0.16 }
  };
  const t = tints[mood];
  if (!t) return "";
  return `<circle cx="${h}" cy="${size * 0.75}" r="${t.r}" fill="${t.color}" opacity="${t.op}"/>`;
}
function getMoodEl(mood, style, size, pal) {
  if (mood === "none") return "";
  switch (style) {
    case "marble":
      return moodElMarble(mood, size, pal);
    case "beam":
      return moodElBeam(mood, size, pal);
    case "bauhaus":
      return moodElBauhaus(mood, size, pal);
    case "pixel":
      return moodElPixel(mood, size, pal);
    case "ring":
      return moodElRing(mood, size, pal);
    case "glitch":
      return moodElGlitch(mood, size);
    case "constellation":
      return moodElConstellation(mood, size);
    case "emoticon":
      return "";
    // emoticon mood is integrated via mouth shape
    case "nebula":
      return moodElNebula(mood, size, pal);
    case "wireframe":
      return moodElWireframe(mood, size);
    case "halftone":
      return moodElHalftone(mood, size, pal);
    case "isometric":
      return moodElIsometric(mood, size);
    case "spectrum":
      return moodElSpectrum(mood, size);
    default:
      return "";
  }
}

// src/lib/animation.ts
var NONE = { styleDef: "", wrapOpen: "", wrapClose: "", extraDefs: "", overlay: "" };
function buildFloat(uid, size) {
  const dist = (size * 0.042).toFixed(1);
  const dur = (3.2 + hashStr(uid) % 18 / 10).toFixed(1);
  const kf = `va-flt-${uid}`;
  const cls = `va-fg-${uid}`;
  const styleDef = `@keyframes ${kf}{0%,100%{transform:translateY(0)}50%{transform:translateY(-${dist}px)}}.${cls}{animation:${kf} ${dur}s ease-in-out infinite;transform-box:fill-box;transform-origin:center}`;
  return {
    styleDef,
    wrapOpen: `<g class="${cls}">`,
    wrapClose: `</g>`,
    extraDefs: "",
    overlay: ""
  };
}
function morphSmil(baseFreq) {
  const [fx, fy] = baseFreq.split(" ").map(Number);
  const v1 = `${fx} ${fy}`;
  const v2 = `${(fx * 1.7).toFixed(4)} ${(fy * 1.4).toFixed(4)}`;
  const v3 = `${(fx * 0.6).toFixed(4)} ${(fy * 1.6).toFixed(4)}`;
  return `<animate attributeName="baseFrequency"
    values="${v1};${v2};${v3};${v1}"
    dur="11s" repeatCount="indefinite" calcMode="spline"
    keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>
  <animate attributeName="seed" values="1;50;99;1" dur="11s" repeatCount="indefinite" calcMode="linear"/>`;
}
function buildGlimmer(uid, size) {
  const extraDefs = `<linearGradient id="shim-${uid}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${(size * 0.55).toFixed(1)}" y2="${size}">
    <stop offset="0%"   stop-color="white" stop-opacity="0"/>
    <stop offset="28%"  stop-color="white" stop-opacity="0"/>
    <stop offset="50%"  stop-color="white" stop-opacity="0.24"/>
    <stop offset="72%"  stop-color="white" stop-opacity="0"/>
    <stop offset="100%" stop-color="white" stop-opacity="0"/>
    <animateTransform attributeName="gradientTransform" type="translate"
      from="-${(size * 1.1).toFixed(1)} 0" to="${(size * 1.8).toFixed(1)} 0"
      dur="2.9s" repeatCount="indefinite" calcMode="spline" keySplines="0.25 0.1 0.25 1"/>
  </linearGradient>`;
  return {
    styleDef: "",
    wrapOpen: "",
    wrapClose: "",
    extraDefs,
    overlay: `<rect width="${size}" height="${size}" fill="url(#shim-${uid})"/>`
  };
}
function buildAnimation(anim, uid, size) {
  switch (anim) {
    case "float":
      return buildFloat(uid, size);
    case "glimmer":
      return buildGlimmer(uid, size);
    case "morph":
      return NONE;
    // morph is injected into the filter via morphSmil()
    default:
      return NONE;
  }
}

// src/index.ts
var STYLES = [
  "marble",
  "beam",
  "bauhaus",
  "pixel",
  "ring",
  "glitch",
  "constellation",
  "emoticon",
  "nebula",
  "wireframe",
  "halftone",
  "isometric",
  "spectrum"
];
function generateAvatar(opts) {
  const {
    seed,
    size = 40,
    colors,
    radius = 0.22,
    title,
    mood = "none",
    anim = "none"
  } = opts;
  const style = opts.style ?? STYLES[hashStr(seed) % STYLES.length];
  const uid = (hashStr(`${seed}:${style}:${mood}`) >>> 0).toString(36);
  const palette = buildPalette(seed, colors);
  const mfp = moodFilterParams(mood);
  const doMorph = anim === "morph";
  const ids = makeFilterIds(uid);
  const filterDefsStr = renderDefs(
    ids,
    size,
    palette.focal.hex ?? "#ccff00",
    mfp.freq,
    mfp.scale,
    doMorph ? morphSmil(mfp.freq) : ""
  );
  let result;
  switch (style) {
    case "marble":
      result = renderMarble(seed, size, palette, ids, uid);
      break;
    case "beam":
      result = renderBeam(seed, size, palette, ids);
      break;
    case "bauhaus":
      result = renderBauhaus(seed, size, palette, ids);
      break;
    case "pixel":
      result = renderPixel(seed, size, palette, ids);
      break;
    case "ring":
      result = renderRing(seed, size, palette, ids);
      break;
    case "glitch":
      result = renderGlitch(seed, size, palette, ids, uid);
      break;
    case "constellation":
      result = renderConstellation(seed, size, palette, ids, uid);
      break;
    case "emoticon":
      result = renderEmoticon(seed, size, palette, ids, uid);
      break;
    case "nebula":
      result = renderNebula(seed, size, palette, ids, uid);
      break;
    case "wireframe":
      result = renderWireframe(seed, size, palette, ids, uid);
      break;
    case "halftone":
      result = renderHalftone(seed, size, palette, ids, uid);
      break;
    case "isometric":
      result = renderIsometric(seed, size, palette, ids, uid);
      break;
    case "spectrum":
      result = renderSpectrum(seed, size, palette, ids, uid);
      break;
    default:
      result = renderBauhaus(seed, size, palette, ids);
  }
  const moodEl = getMoodEl(mood, style, size, palette);
  const animData = buildAnimation(anim, uid, size);
  const rx = size * Math.max(0, Math.min(0.5, radius));
  const clip = `<clipPath id="va-clip-${uid}"><rect width="${size}" height="${size}" rx="${rx}"/></clipPath>`;
  const titleTag = title ? `<title>${escapeXml(title)}</title>` : "";
  const styleTag = animData.styleDef ? `<style>${animData.styleDef}</style>` : "";
  const voidEdgeFilter = `<filter id="va-vedge-${uid}" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">
    <feGaussianBlur stdDeviation="${(size * 4e-3).toFixed(3)}" result="softened"/>
    <feComponentTransfer in="softened" result="vibrant">
      <feFuncR type="linear" slope="1.10" intercept="-0.02"/>
      <feFuncG type="linear" slope="1.10" intercept="-0.02"/>
      <feFuncB type="linear" slope="1.10" intercept="-0.02"/>
    </feComponentTransfer>
  </filter>`;
  const seedHash = hashStr(seed + ":sig");
  const sigInTopRight = (seedHash & 1) === 0;
  const sigX = sigInTopRight ? size * 0.86 : size * 0.14;
  const sigY = sigInTopRight ? size * 0.14 : size * 0.86;
  const sigR = Math.max(1, size * 0.022);
  const goldenSeedFilter = `<filter id="va-gseed-${uid}" x="-200%" y="-200%" width="500%" height="500%">
    <feGaussianBlur stdDeviation="${(sigR * 0.9).toFixed(2)}" result="g"/>
    <feFlood flood-color="#ffffff" flood-opacity="0.7" result="w"/>
    <feComposite in="w" in2="g" operator="in" result="wg"/>
    <feMerge><feMergeNode in="wg"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
  const goldenSeedEl = `<circle cx="${sigX}" cy="${sigY}" r="${sigR}" fill="#FFD700" filter="url(#va-gseed-${uid})" opacity="0.85"/>`;
  const allDefs = [
    clip,
    styleTag,
    filterDefsStr,
    result.extraDefs,
    animData.extraDefs,
    voidEdgeFilter,
    goldenSeedFilter
  ].filter(Boolean).join("\n  ");
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"
  role="img" aria-label="${escapeXml(title ?? seed)}">
  ${titleTag}
  <defs>${allDefs}</defs>
  <g clip-path="url(#va-clip-${uid})" filter="url(#va-vedge-${uid})">
    ${animData.wrapOpen}
    ${result.body}
    ${moodEl}
    ${animData.overlay}
    ${animData.wrapClose}
    ${goldenSeedEl}
  </g>
</svg>`;
}
function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function VoidAvatar({ className, style, variant, seed, size, colors, radius, title, mood, anim }) {
  const svg = generateAvatar({ seed, size, colors, radius, title, mood, anim, style: variant });
  return /* @__PURE__ */ jsx(
    "div",
    {
      className,
      style: { display: "inline-flex", flexShrink: 0, ...style },
      dangerouslySetInnerHTML: { __html: svg }
    }
  );
}

export { VoidAvatar };
//# sourceMappingURL=react.js.map
//# sourceMappingURL=react.js.map