import { P as Palette } from '../color-Ca3bXkbo.cjs';
import { F as FilterIds } from '../filters-Du9Mwhd8.cjs';

/**
 * NEBULA — Layered, blurry elliptical blobs that look like deep-space photography.
 *
 * Design:
 * - 4–5 overlapping, highly blurred ellipse elements with varying opacities (30–60%)
 * - Off-center drift using seeded randomness (never center-aligned)
 * - feColorMatrix "color bleed" effect where blobs overlap, creating vibrant new hues
 * - Deep void charcoal background (#0A0A0A)
 *
 * GSAP-targetable IDs / classes:
 *   id="va-${uid}-nebula-blobs"    — blobs container group ("The Drift" animation)
 *   class="va-nb-${uid}"           — individual blob ellipses (cx/cy float targets)
 *   id="va-${uid}-nebula-blob-N"   — individual blob by index
 *   id="va-${uid}-nebula-stars"    — star dots group (mood eyes target)
 */

declare function renderNebula(seed: string, size: number, palette: Palette, ids: FilterIds, uid: string): {
    extraDefs: string;
    body: string;
};

export { renderNebula };
