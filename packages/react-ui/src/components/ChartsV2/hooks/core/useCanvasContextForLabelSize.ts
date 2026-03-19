import { useMemo } from "react";
import { useTheme } from "../../../ThemeProvider";

export const useCanvasContextForLabelSize = () => {
  const { theme: userTheme } = useTheme();

  return useMemo(() => {
    const font = userTheme.textLabelXs ?? "400 12px/1.25 Inter";

    if (typeof document === "undefined") {
      // SSR stub: returns zero-width measurements but preserves font string
      // so parseLineHeight can derive correct line-height even on the server.
      // Note: only measureText and font are implemented — other CanvasRenderingContext2D
      // methods are not available on this stub.
      return { measureText: () => ({ width: 0 }), font } as unknown as CanvasRenderingContext2D;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    context.font = font;
    return context;
  }, [userTheme.textLabelXs]);
};
