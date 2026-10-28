// Client-renders elements serialized by `migrated-server.tsx`: components by their export name in
// the package under test, host elements by tag, known functions by name and other functions from
// their source. The JSON sits in `<script id="elements" type="application/json">`, so specs can
// render any public component tree the way a client-only app would, with its styles registering
// at render.
import * as m from "openui-under-test";
import { createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import remarkGfm from "remark-gfm";
import type { knownFunctions, Serialized } from "./migrated-server";

const known: typeof knownFunctions = { remarkGfm };

const reviveProps = (props: Record<string, Serialized>) =>
  Object.fromEntries(Object.entries(props).map(([name, value]) => [name, revive(value)]));

function revive(node: Serialized, key?: number): unknown {
  if (Array.isArray(node)) return node.map(revive);
  if (node === null || typeof node !== "object") return node;
  if ("known" in node) return known[node.known];
  if ("source" in node) return new Function(`return (${node.source})`)();
  if ("object" in node) return reviveProps(node.object);
  const type = "component" in node ? (m as Record<string, unknown>)[node.component] : node.tag;
  if (!type)
    throw new Error(`openui-under-test exports no ${"component" in node && node.component}`);
  return createElement(type as string, { ...reviveProps(node.props), key });
}

const serialized = JSON.parse(document.getElementById("elements")!.textContent!) as Serialized[];
createRoot(document.getElementById("root")!).render(serialized.map(revive) as ReactNode);
