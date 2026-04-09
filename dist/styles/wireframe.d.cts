import { P as Palette } from '../color-Ca3bXkbo.cjs';
import { F as FilterIds } from '../filters-Du9Mwhd8.cjs';

/**
 * WIREFRAME — 3D-simulated terrain/sphere using 1px stroke lines.
 *
 * Design:
 * - Wireframe sphere built from latitude + longitude lines
 * - Seed determines rotation angle of the sphere
 * - "Glitch Nodes" — small 2px solid squares at line intersections
 * - High-contrast Void palette: Neon Green, Electric Cyan, Stark White on dark bg
 *
 * GSAP-targetable IDs / classes:
 *   id="va-${uid}-wire-frame"       — wireframe group ("The Scan" dashoffset animation)
 *   class="va-wl-${uid}"            — individual wire lines (stagger dashoffset target)
 *   class="va-wn-${uid}"            — glitch node squares
 *   id="va-${uid}-wire-nodes"       — nodes container group
 *   id="va-${uid}-wire-line-N"      — individual line by index
 */

declare function renderWireframe(seed: string, size: number, palette: Palette, ids: FilterIds, uid: string): {
    extraDefs: string;
    body: string;
};

export { renderWireframe };
