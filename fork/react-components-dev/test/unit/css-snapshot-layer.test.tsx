// Layer half of the server check: the same contracts in the `openui` cascade layer, declarations
// per rule and that every rule sits in the layer. Its own file, so it has its own module graph.
import type { ReactNode } from "react";
import { vi } from "vitest";
import { compareServerSnapshots } from "../css-snapshot/server";

vi.mock("react-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-dom")>()),
  createPortal: (children: ReactNode) => children,
}));

await compareServerSnapshots("./server-layer.json", "openui");
