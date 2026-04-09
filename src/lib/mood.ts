import { Palette, cssHsl } from "./color";

export type Mood = "none" | "happy" | "sad" | "angry" | "calm" | "chaotic";

/** Turbulence filter parameters that vary per mood — mainly affects Marble style */
export interface MoodFilterParams {
  freq: string;
  scale: number; // fraction of size
}

const MOOD_FILTER: Record<Mood, MoodFilterParams> = {
  none:    { freq: "0.018 0.014", scale: 0.12 },
  happy:   { freq: "0.013 0.010", scale: 0.08 },
  sad:     { freq: "0.022 0.018", scale: 0.15 },
  angry:   { freq: "0.032 0.025", scale: 0.22 },
  calm:    { freq: "0.008 0.006", scale: 0.05 },
  chaotic: { freq: "0.044 0.036", scale: 0.28 },
};

export function moodFilterParams(mood: Mood): MoodFilterParams {
  return MOOD_FILTER[mood] ?? MOOD_FILTER.none;
}

function hslStr(c: { h: number; s: number; l: number }, a = 1) {
  return cssHsl(c as any, a);
}

// ── Per-style mood overlay elements ──────────────────────────────────────────

/** Marble: very subtle arc overlay — main mood lives in the filter params */
export function moodElMarble(mood: Mood, size: number, pal: Palette): string {
  if (mood === "none") return "";
  const h = size / 2;
  const c = pal.colors[2];
  const op = 0.32, sw = size * 0.026, lc = "round";
  const paths: Record<string, string> = {
    happy:   `M ${size*.28} ${size*.62} Q ${h} ${size*.72} ${size*.72} ${size*.62}`,
    sad:     `M ${size*.28} ${size*.64} Q ${h} ${size*.55} ${size*.72} ${size*.64}`,
    angry:   `M ${size*.25} ${size*.60} L ${size*.40} ${size*.65} M ${size*.75} ${size*.60} L ${size*.60} ${size*.65}`,
    calm:    `M ${size*.30} ${size*.62} L ${size*.70} ${size*.62}`,
    chaotic: `M ${size*.22} ${size*.60} Q ${size*.36} ${size*.52} ${size*.5} ${size*.62} Q ${size*.64} ${size*.72} ${size*.78} ${size*.60}`,
  };
  return `<path d="${paths[mood] ?? ""}" fill="none" stroke="${hslStr(c, op)}" stroke-width="${sw}" stroke-linecap="${lc}"/>`;
}

/** Beam: one directional mood beam integrated into the composition */
export function moodElBeam(mood: Mood, size: number, pal: Palette): string {
  if (mood === "none") return "";
  const h = size / 2, bh = size * 0.07, rx = size * 0.018;
  const configs: Record<string, { x: number; y: number; w: number; rot: number; ci: number; op: number }> = {
    happy:   { x: -size*.1,  y: size*.22, w: size*1.2, rot: -18, ci: 4, op: 0.72 },
    sad:     { x: -size*.1,  y: size*.70, w: size*1.2, rot:  18, ci: 1, op: 0.55 },
    angry:   { x:  size*.15, y: size*.18, w: size*.7,  rot: -42, ci: 3, op: 0.80 },
    calm:    { x: -size*.05, y: size*.45, w: size*1.1, rot:   0, ci: 2, op: 0.38 },
    chaotic: { x:  size*.25, y: size*.35, w: size*.5,  rot: -62, ci: 4, op: 0.85 },
  };
  const b = configs[mood];
  if (!b) return "";
  const c = pal.colors[Math.min(b.ci, pal.colors.length - 1)];
  return `<g transform="rotate(${b.rot} ${h} ${h})">
    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${bh}" rx="${rx}" fill="${hslStr(c, b.op)}"/>
  </g>`;
}

/** Bauhaus: Bauhaus-geometry face (circles, arcs, triangles) */
export function moodElBauhaus(mood: Mood, size: number, pal: Palette): string {
  if (mood === "none") return "";
  const h = size / 2;
  const fc = hslStr(pal.focal, 0.88);
  const ac = hslStr(pal.colors[2], 0.88);
  const er = size * 0.046, ey = size * 0.365, lx = size * 0.335, rx2 = size * 0.665;
  const sw = size * 0.022;

  let eyes = "";
  if (mood === "calm") {
    eyes = `<rect x="${lx-er*1.1}" y="${ey-er*.25}" width="${er*2.2}" height="${er*.5}" rx="${er*.25}" fill="${fc}"/>
            <rect x="${rx2-er*1.1}" y="${ey-er*.25}" width="${er*2.2}" height="${er*.5}" rx="${er*.25}" fill="${fc}"/>`;
  } else if (mood === "angry") {
    eyes = `<circle cx="${lx}" cy="${ey}" r="${er}" fill="${fc}"/>
            <circle cx="${rx2}" cy="${ey}" r="${er}" fill="${fc}"/>
            <polygon points="${lx-er*1.4},${ey-er*1.4} ${lx+er*.6},${ey-er*2.4} ${lx+er*1.4},${ey-er*1.1}" fill="${ac}"/>
            <polygon points="${rx2-er*1.4},${ey-er*1.1} ${rx2-er*.6},${ey-er*2.4} ${rx2+er*1.4},${ey-er*1.4}" fill="${ac}"/>`;
  } else if (mood === "chaotic") {
    eyes = `<circle cx="${lx}" cy="${ey}" r="${er}" fill="none" stroke="${fc}" stroke-width="${sw*.8}"/>
            <circle cx="${rx2}" cy="${ey}" r="${er}" fill="none" stroke="${fc}" stroke-width="${sw*.8}"/>
            <circle cx="${lx}" cy="${ey}" r="${er*.4}" fill="${fc}"/>
            <circle cx="${rx2}" cy="${ey}" r="${er*.4}" fill="${fc}"/>`;
  } else {
    eyes = `<circle cx="${lx}" cy="${ey}" r="${er}" fill="${fc}"/>
            <circle cx="${rx2}" cy="${ey}" r="${er}" fill="${fc}"/>`;
  }

  const my = size * 0.63, mw = size * 0.28;
  let mouth = "";
  switch (mood) {
    case "happy":
      mouth = `<path d="M ${h-mw/2} ${my} A ${mw/2} ${mw/2} 0 0 1 ${h+mw/2} ${my} Z" fill="${ac}"/>`;
      break;
    case "sad":
      mouth = `<path d="M ${h-mw/2} ${my} A ${mw/2} ${mw/2} 0 0 0 ${h+mw/2} ${my}" fill="none" stroke="${ac}" stroke-width="${sw}" stroke-linecap="round"/>`;
      break;
    case "angry": {
      const jStep = mw / 4;
      mouth = `<path d="M ${h-mw/2} ${my+size*.01} L ${h-mw/2+jStep} ${my-size*.025} L ${h} ${my+size*.01} L ${h+jStep} ${my-size*.025} L ${h+mw/2} ${my+size*.01}" fill="none" stroke="${ac}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
      break;
    }
    case "calm":
      mouth = `<line x1="${h-mw/2}" y1="${my}" x2="${h+mw/2}" y2="${my}" stroke="${ac}" stroke-width="${sw}" stroke-linecap="round"/>`;
      break;
    case "chaotic": {
      const zs = mw / 5;
      mouth = `<path d="M ${h-mw/2} ${my} L ${h-mw/2+zs} ${my-size*.03} L ${h-mw/2+zs*2} ${my+size*.03} L ${h-mw/2+zs*3} ${my-size*.028} L ${h-mw/2+zs*4} ${my+size*.028} L ${h+mw/2} ${my}" fill="none" stroke="${ac}" stroke-width="${sw*.8}" stroke-linejoin="round" stroke-linecap="round"/>`;
      break;
    }
  }
  return eyes + mouth;
}

/** Pixel: 2×2 block eyes + 1-unit-thick pixel mouth */
export function moodElPixel(mood: Mood, size: number, pal: Palette): string {
  if (mood === "none") return "";
  const cell = size / 8;
  const fc = hslStr(pal.focal, 0.92);
  const mc = hslStr(pal.colors[3], 0.92);
  const eyeW = cell * 1.6, eyeH = cell * 1.6, eyeY = cell * 2.1;
  const lEx = cell * 1.4, rEx = cell * 5.0, rx = cell * 0.12;

  let eyes = "";
  if (mood === "calm") {
    eyes = `<rect x="${lEx}" y="${eyeY+eyeH*.4}" width="${eyeW}" height="${cell*.4}" rx="${cell*.2}" fill="${fc}"/>
            <rect x="${rEx}" y="${eyeY+eyeH*.4}" width="${eyeW}" height="${cell*.4}" rx="${cell*.2}" fill="${fc}"/>`;
  } else if (mood === "angry") {
    eyes = `<rect x="${lEx}" y="${eyeY}" width="${eyeW}" height="${eyeH}" rx="${rx}" fill="${fc}"/>
            <rect x="${rEx}" y="${eyeY}" width="${eyeW}" height="${eyeH}" rx="${rx}" fill="${fc}"/>
            <rect x="${lEx-.3*cell}" y="${eyeY-.9*cell}" width="${eyeW+.3*cell}" height="${cell*.4}" rx="${cell*.08}" fill="${mc}" transform="rotate(-14 ${lEx+eyeW/2} ${eyeY-.7*cell})"/>
            <rect x="${rEx}" y="${eyeY-.9*cell}" width="${eyeW+.3*cell}" height="${cell*.4}" rx="${cell*.08}" fill="${mc}" transform="rotate(14 ${rEx+eyeW/2} ${eyeY-.7*cell})"/>`;
  } else {
    eyes = `<rect x="${lEx}" y="${eyeY}" width="${eyeW}" height="${eyeH}" rx="${rx}" fill="${fc}"/>
            <rect x="${rEx}" y="${eyeY}" width="${eyeW}" height="${eyeH}" rx="${rx}" fill="${fc}"/>`;
  }

  const mY = cell * 5.3, ch = cell * 0.42, mRx = cell * 0.1;
  type CellDef = [number, number, number, number];
  const mouths: Record<string, CellDef[]> = {
    happy:   [ [lEx, mY+cell*.5, cell, ch], [rEx, mY+cell*.5, cell, ch], [lEx+cell, mY+cell, cell*3.6, ch] ],
    sad:     [ [lEx, mY+cell, cell, ch], [rEx, mY+cell, cell, ch], [lEx+cell, mY+cell*.5, cell*3.6, ch] ],
    angry:   [ [lEx, mY+cell*.6, cell*.8, ch], [lEx+cell*.8, mY+cell*.9, cell*4, ch], [rEx+cell*.2, mY+cell*.6, cell*.8, ch] ],
    calm:    [ [size*.32, mY+cell*.7, size*.36, ch] ],
    chaotic: [ [lEx, mY+cell*.4, cell, ch], [lEx+cell*1.4, mY+cell*1.1, cell, ch], [lEx+cell*2.8, mY+cell*.3, cell, ch], [rEx, mY+cell, cell, ch], [rEx-cell*1.4, mY+cell*.6, cell, ch] ],
  };

  const mouthEls = (mouths[mood] ?? mouths.calm)
    .map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${mRx}" fill="${mc}"/>`)
    .join("");

  return eyes + mouthEls;
}

/** Ring: inner arc expressions around the center dot */
export function moodElRing(mood: Mood, size: number, pal: Palette): string {
  if (mood === "none") return "";
  const h = size / 2;
  const fc = hslStr(pal.focal, 0.82);
  const ac = hslStr(pal.colors[2], 0.82);
  const r = size * 0.065, sw = size * 0.022;
  const exprs: Record<string, string> = {
    happy:   `<path d="M ${h-r*2.2} ${h+r*.6} Q ${h} ${h+r*2.8} ${h+r*2.2} ${h+r*.6}" fill="none" stroke="${fc}" stroke-width="${sw}" stroke-linecap="round"/>`,
    sad:     `<path d="M ${h-r*2.2} ${h+r*2} Q ${h} ${h-r*.4} ${h+r*2.2} ${h+r*2}" fill="none" stroke="${fc}" stroke-width="${sw}" stroke-linecap="round"/>`,
    angry:   `<path d="M ${h-r*2.2} ${h-r*.6} L ${h-r*.4} ${h+r*.8} M ${h+r*2.2} ${h-r*.6} L ${h+r*.4} ${h+r*.8}" stroke="${fc}" stroke-width="${sw}" stroke-linecap="round"/>`,
    calm:    `<line x1="${h-r*2}" y1="${h+r}" x2="${h+r*2}" y2="${h+r}" stroke="${fc}" stroke-width="${sw}" stroke-linecap="round"/>`,
    chaotic: `<circle cx="${h-r*2}" cy="${h+r}" r="${r*.55}" fill="${fc}"/><circle cx="${h}" cy="${h+r*2}" r="${r*.55}" fill="${ac}"/><circle cx="${h+r*2}" cy="${h+r*.3}" r="${r*.55}" fill="${fc}"/><circle cx="${h-r*.8}" cy="${h-r*1.8}" r="${r*.4}" fill="${ac}"/>`,
  };
  return exprs[mood] ?? "";
}

/** Glitch: neon brightness slice overlay shifted per mood channel */
export function moodElGlitch(mood: Mood, size: number): string {
  if (mood === "none") return "";
  const neonColors: Record<string, string> = {
    happy: "#00ff88", sad: "#4488ff", angry: "#ff2244",
    calm: "#88ffff", chaotic: "#ff00ff",
  };
  const neon = neonColors[mood] ?? "#ccff00";
  const sliceY = ({ happy: size*.25, sad: size*.65, angry: size*.35, calm: size*.50, chaotic: size*.15 } as Record<string, number>)[mood] ?? size*.4;
  const sliceH = size * 0.08;
  const offset = ({ happy: size*.04, sad: -size*.06, angry: size*.10, calm: size*.01, chaotic: -size*.12 } as Record<string, number>)[mood] ?? size*.05;
  return `<rect x="0" y="${sliceY}" width="${size}" height="${sliceH}" fill="${neon}" opacity="0.18"/>
    <rect x="${offset}" y="${sliceY + sliceH}" width="${size}" height="${sliceH * 0.6}" fill="${neon}" opacity="0.10"/>`;
}

/** Constellation: radial glow overlay with mood-driven color + intensity */
export function moodElConstellation(mood: Mood, size: number): string {
  if (mood === "none") return "";
  const h = size / 2;
  const glows: Record<string, { color: string; r: number; op: number }> = {
    happy:   { color: "#ccff00", r: size*.18, op: 0.12 },
    sad:     { color: "#4488ff", r: size*.14, op: 0.08 },
    angry:   { color: "#ff2244", r: size*.22, op: 0.16 },
    calm:    { color: "#88ffff", r: size*.10, op: 0.06 },
    chaotic: { color: "#ff00ff", r: size*.28, op: 0.20 },
  };
  const g = glows[mood] ?? glows.calm;
  return `<circle cx="${h}" cy="${h}" r="${g.r}" fill="${g.color}" opacity="${g.op}"/>`;
}

/** Nebula: glowing "star eyes" + expression tint — eyes are two bright high-intensity glow circles */
export function moodElNebula(mood: Mood, size: number, pal: Palette): string {
  if (mood === "none") return "";
  const h = size / 2;
  const fc = hslStr(pal.focal, 0.92);
  const ac = hslStr(pal.colors[3], 0.85);

  // Star eyes — two bright glow circles
  const eyeR = size * 0.028;
  const eyeY = size * 0.38;
  const lx = size * 0.34, rx = size * 0.66;
  const glowR = eyeR * 3;

  let eyes = `<circle cx="${lx}" cy="${eyeY}" r="${glowR}" fill="${fc}" opacity="0.15"/>
    <circle cx="${rx}" cy="${eyeY}" r="${glowR}" fill="${fc}" opacity="0.15"/>
    <circle cx="${lx}" cy="${eyeY}" r="${eyeR}" fill="white" opacity="0.9"/>
    <circle cx="${rx}" cy="${eyeY}" r="${eyeR}" fill="white" opacity="0.9"/>`;

  // Mood-specific tint / expression
  const mouthY = size * 0.58;
  const tints: Record<string, string> = {
    happy:   `<path d="M ${h-size*.08} ${mouthY} Q ${h} ${mouthY+size*.06} ${h+size*.08} ${mouthY}" fill="none" stroke="${ac}" stroke-width="${size*.015}" stroke-linecap="round" opacity="0.6"/>`,
    sad:     `<path d="M ${h-size*.08} ${mouthY+size*.03} Q ${h} ${mouthY-size*.04} ${h+size*.08} ${mouthY+size*.03}" fill="none" stroke="${ac}" stroke-width="${size*.015}" stroke-linecap="round" opacity="0.5"/>`,
    angry:   `<line x1="${lx-eyeR}" y1="${eyeY-eyeR*2.5}" x2="${lx+eyeR*2}" y2="${eyeY-eyeR*1.2}" stroke="${ac}" stroke-width="${size*.012}" stroke-linecap="round" opacity="0.7"/>
    <line x1="${rx+eyeR}" y1="${eyeY-eyeR*2.5}" x2="${rx-eyeR*2}" y2="${eyeY-eyeR*1.2}" stroke="${ac}" stroke-width="${size*.012}" stroke-linecap="round" opacity="0.7"/>`,
    calm:    `<line x1="${h-size*.06}" y1="${mouthY}" x2="${h+size*.06}" y2="${mouthY}" stroke="${ac}" stroke-width="${size*.012}" stroke-linecap="round" opacity="0.4"/>`,
    chaotic: `<path d="M ${h-size*.1} ${mouthY} L ${h-size*.04} ${mouthY-size*.03} L ${h+size*.04} ${mouthY+size*.03} L ${h+size*.1} ${mouthY}" fill="none" stroke="${ac}" stroke-width="${size*.012}" stroke-linecap="round" opacity="0.6"/>`,
  };

  return eyes + (tints[mood] ?? "");
}

/** Wireframe: highlighted path in the mesh — a specific glowing wire path for expression */
export function moodElWireframe(mood: Mood, size: number, pal: Palette): string {
  if (mood === "none") return "";
  const h = size / 2;
  const neonColors: Record<string, string> = {
    happy: "#00ff88", sad: "#4488ff", angry: "#ff2244",
    calm: "#88ffff", chaotic: "#ff00ff",
  };
  const neon = neonColors[mood] ?? "#ccff00";
  const sw = size * 0.018;

  // Expression as highlighted wireframe paths
  const exprs: Record<string, string> = {
    happy:   `<path d="M ${size*.28} ${size*.55} Q ${h} ${size*.65} ${size*.72} ${size*.55}" fill="none" stroke="${neon}" stroke-width="${sw}" stroke-linecap="round" opacity="0.8"/>`,
    sad:     `<path d="M ${size*.30} ${size*.62} Q ${h} ${size*.52} ${size*.70} ${size*.62}" fill="none" stroke="${neon}" stroke-width="${sw}" stroke-linecap="round" opacity="0.7"/>`,
    angry:   `<path d="M ${size*.25} ${size*.45} L ${size*.40} ${size*.52} M ${size*.75} ${size*.45} L ${size*.60} ${size*.52}" fill="none" stroke="${neon}" stroke-width="${sw}" stroke-linecap="round" opacity="0.85"/>
    <line x1="${size*.35}" y1="${size*.60}" x2="${size*.65}" y2="${size*.60}" stroke="${neon}" stroke-width="${sw*.7}" stroke-linecap="round" opacity="0.7"/>`,
    calm:    `<line x1="${size*.32}" y1="${size*.56}" x2="${size*.68}" y2="${size*.56}" stroke="${neon}" stroke-width="${sw*.8}" stroke-linecap="round" opacity="0.5"/>`,
    chaotic: `<path d="M ${size*.22} ${size*.50} Q ${size*.36} ${size*.42} ${h} ${size*.55} Q ${size*.64} ${size*.68} ${size*.78} ${size*.48}" fill="none" stroke="${neon}" stroke-width="${sw}" stroke-linecap="round" opacity="0.75"/>`,
  };

  return exprs[mood] ?? "";
}

/** Halftone: mood-driven tint overlay + dot density accent */
export function moodElHalftone(mood: Mood, size: number, pal: Palette): string {
  if (mood === "none") return "";
  const h = size / 2;
  const tints: Record<string, { color: string; r: number; op: number }> = {
    happy:   { color: cssHsl(pal.focal, 1), r: size * 0.22, op: 0.10 },
    sad:     { color: cssHsl(pal.colors[1], 1), r: size * 0.18, op: 0.08 },
    angry:   { color: "#ff2244", r: size * 0.26, op: 0.12 },
    calm:    { color: cssHsl(pal.colors[2], 1), r: size * 0.14, op: 0.06 },
    chaotic: { color: "#ff00ff", r: size * 0.30, op: 0.14 },
  };
  const t = tints[mood];
  if (!t) return "";
  return `<circle cx="${h}" cy="${h}" r="${t.r}" fill="${t.color}" opacity="${t.op}"/>`;
}

/** Isometric: mood-tinted ghost highlight on top faces */
export function moodElIsometric(mood: Mood, size: number, pal: Palette): string {
  if (mood === "none") return "";
  const h = size / 2;
  const tints: Record<string, { color: string; op: number; scale: number }> = {
    happy:   { color: "#ccff00", op: 0.12, scale: 0.25 },
    sad:     { color: "#4488ff", op: 0.10, scale: 0.20 },
    angry:   { color: "#ff2244", op: 0.16, scale: 0.28 },
    calm:    { color: "#88ffff", op: 0.07, scale: 0.16 },
    chaotic: { color: "#ff00ff", op: 0.18, scale: 0.32 },
  };
  const t = tints[mood];
  if (!t) return "";
  // Mood glow centered on the stack
  return `<circle cx="${h}" cy="${h * 0.85}" r="${size * t.scale}" fill="${t.color}" opacity="${t.op}"/>`;
}

/** Spectrum: energy glow tint + bar intensity hint */
export function moodElSpectrum(mood: Mood, size: number, pal: Palette): string {
  if (mood === "none") return "";
  const h = size / 2;
  const tints: Record<string, { color: string; r: number; op: number }> = {
    happy:   { color: "#ccff00", r: size * 0.28, op: 0.10 },
    sad:     { color: "#4488ff", r: size * 0.22, op: 0.07 },
    angry:   { color: "#ff2244", r: size * 0.30, op: 0.14 },
    calm:    { color: "#88ffff", r: size * 0.18, op: 0.05 },
    chaotic: { color: "#ff00ff", r: size * 0.34, op: 0.16 },
  };
  const t = tints[mood];
  if (!t) return "";
  return `<circle cx="${h}" cy="${size * 0.75}" r="${t.r}" fill="${t.color}" opacity="${t.op}"/>`;
}

export function getMoodEl(mood: Mood, style: string, size: number, pal: Palette): string {
  if (mood === "none") return "";
  switch (style) {
    case "marble":        return moodElMarble(mood, size, pal);
    case "beam":          return moodElBeam(mood, size, pal);
    case "bauhaus":       return moodElBauhaus(mood, size, pal);
    case "pixel":         return moodElPixel(mood, size, pal);
    case "ring":          return moodElRing(mood, size, pal);
    case "glitch":        return moodElGlitch(mood, size);
    case "constellation": return moodElConstellation(mood, size);
    case "emoticon":      return ""; // emoticon mood is integrated via mouth shape
    case "nebula":        return moodElNebula(mood, size, pal);
    case "wireframe":     return moodElWireframe(mood, size, pal);
    case "halftone":      return moodElHalftone(mood, size, pal);
    case "isometric":     return moodElIsometric(mood, size, pal);
    case "spectrum":      return moodElSpectrum(mood, size, pal);
    default:              return "";
  }
}
