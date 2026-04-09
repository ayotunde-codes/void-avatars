import { hashStr } from "./hash";

export type AnimationStyle = "none" | "float" | "morph" | "glimmer";

export interface AnimationData {
  /** Inline <style> content (scoped keyframes + class) */
  styleDef: string;
  /** Opening wrapper element (empty string if no wrap needed) */
  wrapOpen: string;
  /** Closing wrapper element */
  wrapClose: string;
  /** Extra <defs> content (gradients for glimmer) */
  extraDefs: string;
  /** Overlay element placed after the body content */
  overlay: string;
}

const NONE: AnimationData = { styleDef: "", wrapOpen: "", wrapClose: "", extraDefs: "", overlay: "" };

/**
 * Float — subtle sine-wave translateY hover effect.
 * Implemented as CSS @keyframes so the SVG is fully self-contained when copied.
 * Each uid gets its own keyframe name → zero collisions on a page with many avatars.
 */
export function buildFloat(uid: string, size: number): AnimationData {
  const dist = (size * 0.042).toFixed(1);
  // Vary duration slightly so multiple avatars don't drift in sync
  const dur = (3.2 + (hashStr(uid) % 18) / 10).toFixed(1);
  const kf = `va-flt-${uid}`;
  const cls = `va-fg-${uid}`;
  const styleDef =
    `@keyframes ${kf}{0%,100%{transform:translateY(0)}50%{transform:translateY(-${dist}px)}}` +
    `.${cls}{animation:${kf} ${dur}s ease-in-out infinite;transform-box:fill-box;transform-origin:center}`;
  return {
    styleDef,
    wrapOpen:  `<g class="${cls}">`,
    wrapClose: `</g>`,
    extraDefs: "",
    overlay:   "",
  };
}

/**
 * Morph — SMIL animate on feTurbulence.
 * The SMIL is injected inside the displacement filter element, not here.
 * This function just returns the SMIL string for filterDefs() to embed.
 */
export function morphSmil(baseFreq: string): string {
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

/**
 * Glimmer — diagonal shimmer sweep via animateTransform on a linearGradient.
 * The gradient moves from off-left to off-right, creating a light-reflection effect.
 * Fully self-contained in the SVG defs — works when the SVG is copied.
 */
export function buildGlimmer(uid: string, size: number): AnimationData {
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
    styleDef:  "",
    wrapOpen:  "",
    wrapClose: "",
    extraDefs,
    overlay:   `<rect width="${size}" height="${size}" fill="url(#shim-${uid})"/>`,
  };
}

export function buildAnimation(anim: AnimationStyle, uid: string, size: number): AnimationData {
  switch (anim) {
    case "float":   return buildFloat(uid, size);
    case "glimmer": return buildGlimmer(uid, size);
    case "morph":   return NONE; // morph is injected into the filter via morphSmil()
    default:        return NONE;
  }
}
