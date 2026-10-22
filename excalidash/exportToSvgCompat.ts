// Copied into ExcaliDash's frontend at build time (see adapt-to-excalidraw-next.mjs).
//
// @excalidraw/excalidraw `next` replaced exportToSvg() with
// exportScene({ type: "svg" }), which takes rendering options as `config`
// instead of reading them from appState. This keeps ExcaliDash's three call
// sites unchanged by mapping the legacy appState export flags onto that config.
import { exportScene } from "@excalidraw/excalidraw";

type LegacyExportToSvgOptions = {
  elements: readonly any[];
  appState?: Record<string, any>;
  files?: Record<string, any> | null;
  exportPadding?: number;
};

export const exportToSvg = ({
  elements,
  appState = {},
  files,
  exportPadding,
}: LegacyExportToSvgOptions): Promise<SVGSVGElement> =>
  exportScene({
    type: "svg",
    data: {
      elements: elements as any,
      appState: appState as any,
      files: (files ?? null) as any,
    },
    config: {
      theme: appState.exportWithDarkMode ? "dark" : "light",
      canvasBackgroundColor:
        appState.exportBackground === false
          ? false
          : appState.viewBackgroundColor,
      padding: exportPadding,
    },
  });
