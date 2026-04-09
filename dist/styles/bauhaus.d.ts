import { P as Palette } from '../color-Ca3bXkbo.js';
import { F as FilterIds } from '../filters-Du9Mwhd8.js';

/**
 * BAUHAUS — Geometric shapes (circles, triangles, squares) in a grid.
 *
 * Upgrade over boring-avatars:
 * - Offset printing: fill is shifted 2–3px from stroke (art-gallery misprint feel)
 * - Drop shadows give shapes depth hierarchy
 * - Film grain texture applied to the whole composition
 * - Focal shape always uses the brightest palette color + inner glow
 */

interface StyleResult {
    extraDefs: string;
    body: string;
}
declare function renderBauhaus(seed: string, size: number, palette: Palette, ids: FilterIds): StyleResult;

export { type StyleResult, renderBauhaus };
