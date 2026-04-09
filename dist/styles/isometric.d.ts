import { P as Palette } from '../color-Ca3bXkbo.js';
import { F as FilterIds } from '../filters-Du9Mwhd8.js';

/**
 * ISOMETRIC — 3D-looking voxel cubes stacked in a 120-degree isometric view.
 *
 * Design:
 * - 3–7 isometric cubes in a central cluster based on seed
 * - Each cube has three distinct shade values (top, left, right) from a single seed-color
 * - Some cubes are semi-transparent "Ghost Blocks" revealing cubes behind them
 * - Void transparency effect with depth
 *
 * GSAP-targetable IDs / classes:
 *   id="va-${uid}-iso-stack"        — cube stack group ("The Assembler" fly-in animation)
 *   class="va-ic-${uid}"            — individual cube groups (snap-in targets)
 *   id="va-${uid}-iso-cube-N"       — individual cube by index
 *   id="va-${uid}-iso-shadow"       — shadow/reflection group
 */

declare function renderIsometric(seed: string, size: number, palette: Palette, ids: FilterIds, uid: string): {
    extraDefs: string;
    body: string;
};

export { renderIsometric };
