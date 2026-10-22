// Adapts ExcaliDash v0.6.x's frontend to @excalidraw/excalidraw `next`:
//   - the `excalidrawAPI` prop became `onExcalidrawAPI`
//   - exportToSvg() was replaced by exportScene(); calls go through exportToSvgCompat.ts
//
// Run from ExcaliDash's frontend/ directory. Every edit must match exactly once,
// so an upstream change fails the build instead of shipping a half-patched app.
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";

const EDITS = [
  [
    "src/pages/editor/EditorView.tsx",
    "excalidrawAPI={onSetExcalidrawAPI}",
    "onExcalidrawAPI={onSetExcalidrawAPI}",
  ],
  [
    "src/pages/editor/useEditorPersistence.ts",
    'import { exportToSvg } from "@excalidraw/excalidraw";',
    'import { exportToSvg } from "../../utils/exportToSvgCompat";',
  ],
  [
    "src/utils/importHelpers.ts",
    'import { exportToSvg } from "@excalidraw/excalidraw";',
    'import { exportToSvg } from "./exportToSvgCompat";',
  ],
  [
    "src/components/drawing-card/useDrawingPreview.ts",
    'const { exportToSvg } = await import("@excalidraw/excalidraw");',
    'const { exportToSvg } = await import("../../utils/exportToSvgCompat");',
  ],
];

for (const [file, from, to] of EDITS) {
  const source = readFileSync(file, "utf8");
  const matches = source.split(from).length - 1;
  if (matches !== 1) {
    throw new Error(
      `${file}: expected 1 match for ${JSON.stringify(from)}, found ${matches}`,
    );
  }
  writeFileSync(file, source.replace(from, to));
  console.log(`[adapt] ${file}`);
}

copyFileSync(
  new URL("./exportToSvgCompat.ts", import.meta.url),
  "src/utils/exportToSvgCompat.ts",
);
console.log("[adapt] src/utils/exportToSvgCompat.ts");
