import * as react_jsx_runtime from 'react/jsx-runtime';

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

interface VoidAvatarProps extends Omit<AvatarOptions, "style"> {
    className?: string;
    style?: React.CSSProperties;
    /** Avatar visual style — renamed to avoid clash with React's style prop */
    variant?: AvatarStyle;
}
/**
 * React component — renders a void-avatar SVG inline.
 * No ID collisions, no external requests, no flash of default avatar.
 *
 * @example
 * <VoidAvatar seed="user-42" variant="bauhaus" mood="happy" anim="float" size={48} className="rounded-full" />
 */
declare function VoidAvatar({ className, style, variant, seed, size, colors, radius, title, mood, anim }: VoidAvatarProps): react_jsx_runtime.JSX.Element;

export { type AnimationStyle, type AvatarStyle, type Mood, VoidAvatar, type VoidAvatarProps };
