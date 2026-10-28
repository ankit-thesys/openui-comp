// The migrated components of the contract test (test/unit/contract/components.tsx), serialized
// for the `elements` fixture to client-render, with each component's stable classes. Browser
// benches iterate over these, so a component is covered as soon as it joins the contract list.
// Bundled for Node by build-fixtures.ts, like bench-server.tsx.
import * as packageUnderTest from "openui-under-test";
import { isValidElement, type ReactNode } from "react";
import { namesIn } from "../../unit/contract/collect";
import { migratedComponents } from "../../unit/contract/components";

export type Serialized =
  | string
  | number
  | boolean
  | null
  | Serialized[]
  | { component: string; props: Record<string, Serialized> }
  | { tag: string; props: Record<string, Serialized> };

const exportNames = new Map<unknown, string>(
  Object.entries(packageUnderTest).map(([name, value]) => [value, name]),
);

const serialize = (node: ReactNode): Serialized => {
  if (Array.isArray(node)) return node.map(serialize);
  if (node === undefined) return null;
  if (!isValidElement(node)) {
    if (typeof node === "object" && node !== null)
      throw new Error("Only elements, arrays and primitives serialize");
    return node as Serialized;
  }
  // An undefined prop is left out, so the component's own default still applies.
  const props = Object.fromEntries(
    Object.entries(node.props as Record<string, unknown>)
      .filter(([, value]) => value !== undefined)
      .map(([name, value]) => {
        if (typeof value === "function") throw new Error(`Prop ${name} is a function`);
        return [name, serialize(value as ReactNode)];
      }),
  );
  if (typeof node.type === "string") return { tag: node.type, props };
  const component = exportNames.get(node.type);
  if (!component) throw new Error("Elements must use components the package exports");
  return { component, props };
};

export const migrated = migratedComponents.map(({ folder, names, elements }) => ({
  folder,
  stableClasses: [...namesIn(names)],
  elements: serialize(elements()),
}));
