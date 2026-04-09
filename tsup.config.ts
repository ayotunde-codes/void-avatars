import { defineConfig } from "tsup";

const STYLES = [
  "marble", "beam", "bauhaus", "pixel", "ring",
  "glitch", "constellation", "emoticon",
  "nebula", "wireframe", "halftone", "isometric",
];

// Per-style entry points — enables tree-shaking so bundlers
// only include the styles actually imported
const styleEntries = Object.fromEntries(
  STYLES.map((s) => [`styles/${s}`, `src/styles/${s}.ts`])
);

export default defineConfig([
  // Core — full generateAvatar() API
  {
    entry: { index: "src/index.ts", ...styleEntries },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ["react", "react/jsx-runtime"],
    treeshake: true,
  },
  // React wrapper
  {
    entry: { react: "src/react/index.tsx" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    external: ["react", "react/jsx-runtime"],
    treeshake: true,
  },
]);
