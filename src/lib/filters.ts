/**
 * SVG filter definitions — all scoped by uid prefix, zero cross-avatar collision.
 */

export interface FilterIds {
  grain:    string;
  glow:     string;
  shadow:   string;
  displace: string;
  blur:     string;
}

export function makeFilterIds(uid: string): FilterIds {
  return {
    grain:    `va-grf-${uid}`,
    glow:     `va-glf-${uid}`,
    shadow:   `va-shf-${uid}`,
    displace: `va-dpf-${uid}`,
    blur:     `va-blf-${uid}`,
  };
}

/**
 * Render all `<filter>` elements into a string for embedding in `<defs>`.
 *
 * @param ids        - uid-scoped filter IDs
 * @param size       - avatar pixel dimension
 * @param glowColor  - hex color for the focal glow
 * @param moodFreq   - feTurbulence baseFrequency (mood-adjusted, default "0.018 0.014")
 * @param moodScale  - feDisplacementMap scale as fraction of size (mood-adjusted, default 0.12)
 * @param morphSmil  - optional SMIL <animate> string to embed inside feTurbulence for morph animation
 */
export function renderDefs(
  ids: FilterIds,
  size: number,
  glowColor: string,
  moodFreq  = "0.018 0.014",
  moodScale = 0.12,
  morphSmil = "",
): string {
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

  <!-- Inner glow — focal shape depth -->
  <filter id="${ids.glow}" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${size * 0.07}" result="b"/>
    <feFlood flood-color="${glowColor}" flood-opacity="0.52" result="c"/>
    <feComposite in="c" in2="b" operator="in" result="glow"/>
    <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>

  <!-- Soft drop shadow — depth hierarchy -->
  <filter id="${ids.shadow}" x="-25%" y="-25%" width="150%" height="150%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${size * 0.035}" result="b"/>
    <feOffset dx="${size * 0.02}" dy="${size * 0.03}" result="o"/>
    <feFlood flood-color="#000" flood-opacity="0.22" result="c"/>
    <feComposite in="c" in2="o" operator="in" result="s"/>
    <feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>

  <!-- Liquid displacement — marble warp; frequency/scale driven by mood -->
  <filter id="${ids.displace}" x="-14%" y="-14%" width="128%" height="128%">
    <feTurbulence type="turbulence" baseFrequency="${moodFreq}" numOctaves="3" seed="${half | 0}" result="t">${morphSmil}</feTurbulence>
    <feDisplacementMap in="SourceGraphic" in2="t" scale="${dispScale}" xChannelSelector="R" yChannelSelector="G"/>
  </filter>

  <!-- Soft blur — Beam bloom layer -->
  <filter id="${ids.blur}">
    <feGaussianBlur stdDeviation="${size * 0.028}"/>
  </filter>`;
}
