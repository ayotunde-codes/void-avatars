import { P as Palette } from '../color-Ca3bXkbo.cjs';
import { F as FilterIds } from '../filters-Du9Mwhd8.cjs';

/**
 * PIXEL — An 8×8 grid of colored squares like a retro sprite.
 *
 * Upgrades:
 * - Grain filter gives it a silkscreen/risograph texture
 * - Symmetric left/right so it reads as a "face" or Rorschach blob
 * - Focal color squares have a subtle inner glow
 * - Print-offset stroke on lit cells
 */

interface StyleResult {
    extraDefs: string;
    body: string;
}
declare function renderPixel(seed: string, size: number, palette: Palette, ids: FilterIds): StyleResult;

export { type StyleResult, renderPixel };
