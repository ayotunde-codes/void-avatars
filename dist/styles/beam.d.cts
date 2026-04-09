import { P as Palette } from '../color-Ca3bXkbo.cjs';
import { F as FilterIds } from '../filters-Du9Mwhd8.cjs';

/**
 * BEAM — Intersecting rectangular rays with glassmorphism finish.
 *
 * Upgrade over boring-avatars:
 * - Beams are semi-transparent, layered so overlaps create new blended colors
 * - A blurred "glow bloom" sits behind each beam (depth without 3D)
 * - Grain filter gives the risograph/print texture
 * - Film-strip offset printing effect: fill shape is shifted 2px from stroke
 */

interface StyleResult {
    extraDefs: string;
    body: string;
}
declare function renderBeam(seed: string, size: number, palette: Palette, ids: FilterIds): StyleResult;

export { type StyleResult, renderBeam };
