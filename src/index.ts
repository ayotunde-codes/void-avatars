import { hashStr } from "./lib/hash";
import { buildPalette } from "./lib/color";
import { makeFilterIds, renderDefs } from "./lib/filters";
import { renderMarble } from "./styles/marble";
import { renderBeam } from "./styles/beam";
import { renderBauhaus } from "./styles/bauhaus";
import { renderPixel } from "./styles/pixel";
import { renderRing } from "./styles/ring";
import { renderGlitch } from "./styles/glitch";
import { renderConstellation } from "./styles/constellation";
import { renderEmoticon } from "./styles/emoticon";
import { renderNebula } from "./styles/nebula";
import { renderWireframe } from "./styles/wireframe";
import { renderHalftone } from "./styles/halftone";
import { renderIsometric } from "./styles/isometric";
import { renderSpectrum } from "./styles/spectrum";
import { type Mood, moodFilterParams, getMoodEl } from "./lib/mood";
import { type AnimationStyle, buildAnimation, morphSmil } from "./lib/animation";

export type AvatarStyle =
  | "marble"
  | "beam"
  | "bauhaus"
  | "pixel"
  | "ring"
  | "glitch"
  | "constellation"
  | "emoticon"
  | "nebula"
  | "wireframe"
  | "halftone"
  | "isometric"
  | "spectrum";

export type { Mood, AnimationStyle };

export interface AvatarOptions {
  /** Any string — same seed always produces the same avatar */
  seed: string;
  /** Visual style */
  style?: AvatarStyle;
  /**
   * Mood overlay — abstract expressionist emotion layer.
   * Marble/Beam: integrated through filter params + subtle overlay.
   * Bauhaus: geometric face (circles, arcs, triangles).
   * Pixel: 2×2 block eyes + 1-unit mouth.
   * Ring: inner arc expressions.
   * Glitch: neon RGB brightness slice overlay.
   * Constellation: radial glow intensity shift.
   * Emoticon: mood is integrated via the mouth shape (no external overlay).
   * Nebula: glowing "star eyes" that blink + expression nebula tints.
   * Wireframe: highlighted path in the mesh for expression.
   * Halftone: dot density shift + tonal mood tint.
   * Isometric: ghost block highlight + mood-tinted top faces.
   * Spectrum: neon bar intensity shift + energy glow.
   */
  mood?: Mood;
  /**
   * Animation state — all CSS/SMIL, self-contained in the copied SVG.
   * float   → sine-wave translateY hover
   * morph   → feTurbulence baseFrequency SMIL (Marble liquid swirl)
   * glimmer → linear-gradient sweep (Beam light reflection)
   */
  anim?: AnimationStyle;
  /** Pixel dimensions of the square avatar */
  size?: number;
  /** Override the 5-color palette (5 hex strings) */
  colors?: string[];
  /** Border radius as a fraction of size (0 = square, 0.5 = circle) */
  radius?: number;
  /** Title for accessibility */
  title?: string;
}

const STYLES: AvatarStyle[] = [
  "marble", "beam", "bauhaus", "pixel", "ring",
  "glitch", "constellation", "emoticon",
  "nebula", "wireframe", "halftone", "isometric", "spectrum",
];

/**
 * Generate a premium SVG avatar string from a seed.
 * Returns a complete `<svg>…</svg>` — framework-agnostic.
 *
 * @example
 * const svg = generateAvatar({ seed: "user-42", style: "constellation", mood: "calm", anim: "float", size: 80 });
 * document.getElementById("avatar").innerHTML = svg;
 */
export function generateAvatar(opts: AvatarOptions): string {
  const {
    seed,
    size = 40,
    colors,
    radius = 0.22,
    title,
    mood = "none",
    anim = "none",
  } = opts;

  const style = opts.style ?? STYLES[hashStr(seed) % STYLES.length];
  // Include mood in uid so filter params are unique per mood+style combo
  const uid = (hashStr(`${seed}:${style}:${mood}`) >>> 0).toString(36);

  const palette = buildPalette(seed, colors);
  const mfp = moodFilterParams(mood);
  const doMorph = anim === "morph";

  // Build filter IDs — uid-scoped, zero collision guarantee
  const ids = makeFilterIds(uid);
  const filterDefsStr = renderDefs(
    ids, size, palette.focal.hex ?? "#ccff00",
    mfp.freq, mfp.scale,
    doMorph ? morphSmil(mfp.freq) : "",
  );

  // Style body — all renderers now return { extraDefs, body }
  let result: { extraDefs: string; body: string };
  switch (style) {
    case "marble":        result = renderMarble(seed, size, palette, ids, uid);        break;
    case "beam":          result = renderBeam(seed, size, palette, ids);               break;
    case "bauhaus":       result = renderBauhaus(seed, size, palette, ids);            break;
    case "pixel":         result = renderPixel(seed, size, palette, ids);              break;
    case "ring":          result = renderRing(seed, size, palette, ids);               break;
    case "glitch":        result = renderGlitch(seed, size, palette, ids, uid);        break;
    case "constellation": result = renderConstellation(seed, size, palette, ids, uid); break;
    case "emoticon":      result = renderEmoticon(seed, size, palette, ids, uid);      break;
    case "nebula":        result = renderNebula(seed, size, palette, ids, uid);       break;
    case "wireframe":     result = renderWireframe(seed, size, palette, ids, uid);    break;
    case "halftone":      result = renderHalftone(seed, size, palette, ids, uid);     break;
    case "isometric":     result = renderIsometric(seed, size, palette, ids, uid);    break;
    case "spectrum":      result = renderSpectrum(seed, size, palette, ids, uid);     break;
    default:              result = renderBauhaus(seed, size, palette, ids);
  }

  // Mood overlay
  const moodEl = getMoodEl(mood, style, size, palette);

  // Animation
  const animData = buildAnimation(anim, uid, size);

  const rx = size * Math.max(0, Math.min(0.5, radius));
  const clip = `<clipPath id="va-clip-${uid}"><rect width="${size}" height="${size}" rx="${rx}"/></clipPath>`;
  const titleTag = title ? `<title>${escapeXml(title)}</title>` : "";
  const styleTag = animData.styleDef ? `<style>${animData.styleDef}</style>` : "";

  // ── Void Edge — subtle post-processing: slight blur + vibrance boost ──
  const voidEdgeFilter = `<filter id="va-vedge-${uid}" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">
    <feGaussianBlur stdDeviation="${(size * 0.004).toFixed(3)}" result="softened"/>
    <feComponentTransfer in="softened" result="vibrant">
      <feFuncR type="linear" slope="1.10" intercept="-0.02"/>
      <feFuncG type="linear" slope="1.10" intercept="-0.02"/>
      <feFuncB type="linear" slope="1.10" intercept="-0.02"/>
    </feComponentTransfer>
  </filter>`;

  // ── Golden Seed — the Void hallmark, a single gold dot with white glow ──
  const seedHash = hashStr(seed + ":sig");
  // Place in top-right or bottom-left quadrant based on seed
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
    goldenSeedFilter,
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

/**
 * Generate a data URI that can be used directly as an `<img src="…">` value.
 */
export function generateAvatarDataUri(opts: AvatarOptions): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(generateAvatar(opts))}`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export type { Palette, HSLColor } from "./lib/color";
