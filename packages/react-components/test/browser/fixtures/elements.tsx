// Client-renders elements serialized by `migrated-server.tsx`: components by their export
// name in the package under test, host elements by tag. The JSON sits in
// `<script id="elements" type="application/json">`, so specs can render any public component tree
// the way a client-only app would, with its styles registering at render.
import * as m from "openui-under-test";
import { createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Serialized } from "./migrated-server";

const revive = (node: Serialized, key?: number): ReactNode => {
  if (Array.isArray(node)) return node.map(revive);
  if (node === null || typeof node !== "object") return node;
  const props = Object.fromEntries(
    Object.entries(node.props).map(([name, value]) => [name, revive(value)]),
  );
  const type = "component" in node ? (m as Record<string, unknown>)[node.component] : node.tag;
  if (!type)
    throw new Error(`openui-under-test exports no ${"component" in node && node.component}`);
  return createElement(type as string, { ...props, key });
};

const serialized = JSON.parse(document.getElementById("elements")!.textContent!) as Serialized[];
createRoot(document.getElementById("root")!).render(serialized.map(revive));
