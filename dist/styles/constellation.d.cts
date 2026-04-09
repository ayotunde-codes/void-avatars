import { P as Palette } from '../color-Ca3bXkbo.cjs';
import { F as FilterIds } from '../filters-Du9Mwhd8.cjs';

/**
 * CONSTELLATION — Sparse node graph on deep void-purple background.
 *
 * Design:
 * - 8–15 nodes placed with seeded randomness
 * - Nodes within 42% of size connected by 0.5px lime lines
 * - Radial halo glow on each node (3 circles: outer glow, mid-glow, core)
 * - Center node uses focal color with inner-glow filter
 *
 * GSAP-targetable IDs / classes:
 *   class="va-cl-${uid}"          — connecting lines (dashoffset animation)
 *   class="va-cn-${uid}"          — node groups (opacity pulse)
 *   id="va-${uid}-line-N"         — individual lines
 *   id="va-${uid}-node-N"         — individual node groups
 *   id="va-${uid}-const-lines"    — lines container group
 *   id="va-${uid}-const-nodes"    — nodes container group
 */

declare function renderConstellation(seed: string, size: number, palette: Palette, ids: FilterIds, uid: string): {
    extraDefs: string;
    body: string;
};

export { renderConstellation };
