import { P as Palette } from '../color-Ca3bXkbo.cjs';
import { F as FilterIds } from '../filters-Du9Mwhd8.cjs';

/**
 * RING — Concentric rings, each split into arcs of varying width.
 *
 * Upgrades:
 * - Arc widths vary per segment (hand-drawn feel)
 * - Segments have offset strokes (print misalignment)
 * - Inner glow on the center circle
 * - Grain overlay for tactile texture
 */

interface StyleResult {
    extraDefs: string;
    body: string;
}
declare function renderRing(seed: string, size: number, palette: Palette, ids: FilterIds): StyleResult;

export { type StyleResult, renderRing };
