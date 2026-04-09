import { P as Palette } from '../color-Ca3bXkbo.js';
import { F as FilterIds } from '../filters-Du9Mwhd8.js';

/**
 * EMOTICON — Abstract minimalist face with morphable Q-bezier mouth.
 *
 * Design:
 * - Face shape: circle / hexagon / rounded-rect (seed-determined)
 * - Eyes: 4 variants — circles, semicircle squint, line, oval
 * - Mouth: single Q-bezier — smile by default, morphable via GSAP control point proxy
 *
 * GSAP-targetable IDs:
 *   id="va-${uid}-face"          — entire face group
 *   id="va-${uid}-eyes"          — eyes group (blink via scaleY)
 *   id="va-${uid}-mouth"         — mouth container
 *   id="va-${uid}-mouth-path"    — the Q-bezier path (cx/cy proxy morphing)
 */

declare function renderEmoticon(seed: string, size: number, palette: Palette, ids: FilterIds, uid: string): {
    extraDefs: string;
    body: string;
};

export { renderEmoticon };
