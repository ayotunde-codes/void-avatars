import { P as Palette } from '../color-Ca3bXkbo.cjs';
import { F as FilterIds } from '../filters-Du9Mwhd8.cjs';

/**
 * CHROMATIC HALFTONE — CMY dot layers with chromatic aberration and organic clumping.
 *
 * Design:
 * - Absolute black background (#000000) for extreme contrast
 * - Three overlapping dot layers: Cyan, Magenta, Yellow (CMY printing)
 * - 1px seed-based offset per layer creates chromatic aberration
 * - Dots follow a clumped noise pattern (not a perfect grid) for organic feel
 * - feColorMatrix glow filter makes dots "burn through a dark lens"
 *
 * GSAP-targetable IDs / classes:
 *   id="va-${uid}-ht-dots"         — all halftone dots container ("The Pulse" r animation)
 *   id="va-${uid}-ht-cyan"         — cyan layer group
 *   id="va-${uid}-ht-magenta"      — magenta layer group
 *   id="va-${uid}-ht-yellow"       — yellow layer group
 *   class="va-hd-${uid}"           — individual dot circles (radius sine-wave target)
 *   id="va-${uid}-ht-dot-N"        — individual dot by index
 */

declare function renderHalftone(seed: string, size: number, palette: Palette, ids: FilterIds, uid: string): {
    extraDefs: string;
    body: string;
};

export { renderHalftone };
