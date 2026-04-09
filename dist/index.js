import { renderEmoticon } from './chunk-HM5F6EEI.js';
import { renderNebula } from './chunk-AESHGM7U.js';
import { renderWireframe } from './chunk-EFBBO6TA.js';
import { renderHalftone } from './chunk-QP7G7ZLC.js';
import { renderIsometric } from './chunk-E6ZKFFFP.js';
import { renderMarble } from './chunk-4M3GP757.js';
import { renderBeam } from './chunk-DCGISSZZ.js';
import { renderBauhaus } from './chunk-MG6KEKER.js';
import { renderPixel } from './chunk-Z62ETPU4.js';
import { renderRing } from './chunk-6MDCL3KF.js';
import { renderGlitch } from './chunk-FMYKADQV.js';
import { renderConstellation } from './chunk-BWMVJOZ2.js';
import { buildPalette, cssHsl } from './chunk-TTNWV7EZ.js';
import { hashStr, seededRands } from './chunk-5QPN6A5Y.js';

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
function generateAvatarDataUri(opts) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(generateAvatar(opts))}`;
}
function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export { generateAvatar, generateAvatarDataUri };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map