import type { ReactNode } from "react";
import { vi } from "vitest";
import { migratedComponents } from "./components";
import { describeContract } from "./defineContract";
import { renderWithPortals, withPortalTarget } from "./portal";

// Hoisted in this test file so the DOM boundary is replaced before the library imports it.
vi.mock("react-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-dom")>()),
  createPortal: (children: ReactNode) => children,
}));

const modal = migratedComponents.find(({ folder }) => folder === "Modal")!;
describeContract(
  "Modal",
  {
    ...modal,
    clientOnly: [],
    elements: () => withPortalTarget(() => modal.elements()),
  },
  renderWithPortals,
);
