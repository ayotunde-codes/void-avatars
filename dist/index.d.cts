export { H as HSLColor, P as Palette } from './color-Ca3bXkbo.cjs';

type Mood = "none" | "happy" | "sad" | "angry" | "calm" | "chaotic";

type AnimationStyle = "none" | "float" | "morph" | "glimmer";

type AvatarStyle = "marble" | "beam" | "bauhaus" | "pixel" | "ring" | "glitch" | "constellation" | "emoticon" | "nebula" | "wireframe" | "halftone" | "isometric" | "spectrum";

interface AvatarOptions {
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
/**
 * Generate a premium SVG avatar string from a seed.
 * Returns a complete `<svg>…</svg>` — framework-agnostic.
 *
 * @example
 * const svg = generateAvatar({ seed: "user-42", style: "constellation", mood: "calm", anim: "float", size: 80 });
 * document.getElementById("avatar").innerHTML = svg;
 */
declare function generateAvatar(opts: AvatarOptions): string;
/**
 * Generate a data URI that can be used directly as an `<img src="…">` value.
 */
declare function generateAvatarDataUri(opts: AvatarOptions): string;

export { type AnimationStyle, type AvatarOptions, type AvatarStyle, type Mood, generateAvatar, generateAvatarDataUri };
