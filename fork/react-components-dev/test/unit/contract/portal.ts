import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { vi } from "vitest";

export function withPortalTarget<T>(run: () => T): T {
  vi.stubGlobal("document", { body: {} });
  try {
    return run();
  } finally {
    vi.unstubAllGlobals();
  }
}

// The provider's private portal-theme marker is outside the component's stable-class contract.
export const renderWithPortals = (element: ReactNode) =>
  withPortalTarget(() => renderToString(element)).replace(/\sopenui-theme-portal-[^"\s]+/g, "");
