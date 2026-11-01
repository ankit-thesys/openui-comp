// Server half of the hook-free CSS before/after check (#129): unlayered markup, declarations and
// per-module rule order. See test/css-snapshot/README.md.
import type { ReactNode } from "react";
import { vi } from "vitest";
import { compareServerSnapshots } from "../css-snapshot/server";

vi.mock("react-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-dom")>()),
  createPortal: (children: ReactNode) => children,
}));

await compareServerSnapshots("./server.json");
