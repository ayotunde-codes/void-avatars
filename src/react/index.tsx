import { generateAvatar, AvatarOptions, AvatarStyle, Mood, AnimationStyle } from "../index";

export interface VoidAvatarProps extends Omit<AvatarOptions, "style"> {
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
export function VoidAvatar({ className, style, variant, seed, size, colors, radius, title, mood, anim }: VoidAvatarProps) {
  const svg = generateAvatar({ seed, size, colors, radius, title, mood, anim, style: variant });
  return (
    <div
      className={className}
      style={{ display: "inline-flex", flexShrink: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export type { AvatarStyle, Mood, AnimationStyle };
