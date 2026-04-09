import { P as Palette } from '../color-Ca3bXkbo.cjs';
import { F as FilterIds } from '../filters-Du9Mwhd8.cjs';

/**
 * MARBLE — Concentric gradient rings with liquid displacement.
 *
 * Upgrade over boring-avatars:
 * - Displacement map makes gradients look like oil-in-water marble
 * - Film grain layer gives a heavy-stock print texture
 * - Focal ring is 20%+ brighter than the outer rings (luminance hierarchy)
 * - Inner glow around the center creates depth without 3D rendering
 *
 * GSAP-targetable IDs:
 *   id="va-${uid}-marble-core" — displaced rings group (scale + displace animation)
 */

interface StyleResult {
    extraDefs: string;
    body: string;
}
declare function renderMarble(seed: string, size: number, palette: Palette, ids: FilterIds, uid: string): StyleResult;

export { type StyleResult, renderMarble };
