# void-avatars

**Premium generative SVG avatars.** 12 styles, 6 moods, 3 animations — framework-agnostic, ID-collision-free, tree-shakeable.

> The avatar library that Boring Avatars never became.

[**Live Demo →**](https://void-avatars.dev)

---

## Install

```bash
npm install void-avatars
```

No dependencies. React is optional.

---

## Quick Start

```ts
import { generateAvatar } from 'void-avatars';

const svg = generateAvatar({ seed: 'user-42' });
document.getElementById('avatar').innerHTML = svg;
```

### React

```tsx
import { VoidAvatar } from 'void-avatars/react';

<VoidAvatar seed="user-42" variant="marble" mood="happy" anim="float" size={48} className="rounded-full" />
```

---

## API

```ts
generateAvatar({
  seed:    string,          // required — same seed = same avatar always
  style?:  AvatarStyle,     // default: auto-selected from seed
  mood?:   Mood,            // default: 'none'
  anim?:   AnimationStyle,  // default: 'none'
  size?:   number,          // default: 40 (px)
  colors?: string[],        // 5 hex strings to override the palette
  radius?: number,          // 0 = square, 0.5 = circle (default: 0.22)
  title?:  string,          // accessibility label
})
```

### Styles

| Style | Description |
|---|---|
| `marble` | Concentric gradient rings with liquid displacement |
| `beam` | Intersecting glass-morphism rays |
| `bauhaus` | Geometric shapes — circles, triangles, squares |
| `pixel` | 8×8 symmetric retro sprite |
| `ring` | Concentric arc segments |
| `glitch` | 16×16 neon pixel grid + chromatic aberration |
| `constellation` | Sparse node graph on void-purple |
| `emoticon` | Abstract face with morphable mouth |
| `nebula` | Deep-space particle cloud |
| `wireframe` | 3D mesh projection |
| `halftone` | Risograph dot-grid print |
| `isometric` | Stacked isometric blocks |

### Moods

`none` · `happy` · `sad` · `angry` · `calm` · `chaotic`

Each mood changes filter parameters and adds a style-specific expression overlay.

### Animations

| Value | Effect |
|---|---|
| `float` | CSS sine-wave translateY hover |
| `morph` | SMIL animate on feTurbulence (liquid swirl) |
| `glimmer` | animateTransform gradient sweep (light reflection) |

All animations are self-contained in the SVG — they work when the SVG is copied.

---

## Tree-shaking

Import individual styles to keep your bundle small:

```ts
import { renderMarble } from 'void-avatars/styles/marble';
import { buildPalette } from 'void-avatars'; // shared utils still available
```

Each style entry is ~6–8KB vs ~42KB for the full bundle.

---

## Data URI (for `<img src>`)

```ts
import { generateAvatarDataUri } from 'void-avatars';

const src = generateAvatarDataUri({ seed: 'user-42', style: 'glitch' });
// → "data:image/svg+xml;charset=utf-8,..."
```

---

## Why not Boring Avatars?

- Boring Avatars has a known SVG mask ID collision bug when multiple avatars render on the same page
- Only 5 styles, no moods, no animations
- void-avatars scopes all IDs to a uid derived from `seed + style + mood` — zero collisions guaranteed

---

## Commercial License

The npm package is MIT — free for personal and open-source use.

For **commercial use** (SaaS, client projects, closed-source apps), a one-time commercial license is available.

[**Get a commercial license →**](https://void-avatars.dev#license)

---

## License

MIT © ayotunde obasa
