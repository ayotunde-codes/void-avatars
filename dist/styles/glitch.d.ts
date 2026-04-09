import { P as Palette } from '../color-Ca3bXkbo.js';
import { F as FilterIds } from '../filters-Du9Mwhd8.js';

/**
 * GLITCH — 16×16 neon pixel grid + chromatic aberration + horizontal slice disruptions.
 *
 * GSAP-targetable IDs / classes:
 *   id="va-${uid}-glitch-base"   — main pixel grid group
 *   id="va-${uid}-glitch-slices" — offset slice disruption group
 *   class="va-pxc-${uid}"        — individual pixel rects (Binary Rain target)
 */

declare function renderGlitch(seed: string, size: number, palette: Palette, ids: FilterIds, uid: string): {
    extraDefs: string;
    body: string;
};

export { renderGlitch };
