import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { vi } from "vitest";

export function withPortalTarget<T>(run: () => T): T {
  vi.stubGlobal("document", { body: {} });
  // This server boundary supplies a portal destination, not a browser sheet or event loop.
  vi.stubGlobal("queueMicrotask", () => {});
  try {
    return run();
  } finally {
    vi.unstubAllGlobals();
  }
}

// The provider's private portal-theme marker is outside the component's stable-class contract.
export const renderWithPortals = (element: ReactNode) =>
  withPortalTarget(() => renderToString(element)).replace(/\sopenui-theme-portal-[^"\s]+/g, "");
