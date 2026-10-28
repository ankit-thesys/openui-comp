// The migrated components of the contract test (test/unit/contract/components.tsx), serialized
// for the `elements` fixture to client-render, with each component's own stable classes. Browser
// benches iterate over these, so a component is covered as soon as it joins the contract list.
// Bundled for Node by build-fixtures.ts, like bench-server.tsx.
import * as packageUnderTest from "openui-under-test";
import { isValidElement, type ReactNode } from "react";
import remarkGfm from "remark-gfm";
import { readStableNames } from "../../../scripts/selector-reference.mjs";
import { namesIn } from "../../unit/contract/collect";
import { migratedComponents } from "../../unit/contract/components";

export type Serialized =
  | string
  | number
  | boolean
  | null
  | Serialized[]
  | { component: string; props: Record<string, Serialized> }
  | { tag: string; props: Record<string, Serialized> }
  | { object: Record<string, Serialized> }
  | { known: keyof typeof knownFunctions }
  | { source: string };

/** Functions elements pass that the client fixture imports itself, by name. */
export const knownFunctions = { remarkGfm };

const exportNames = new Map<unknown, string>(
  Object.entries(packageUnderTest).map(([name, value]) => [value, name]),
);
const knownNames = new Map<unknown, string>(
  Object.entries(knownFunctions).map(([name, value]) => [value, name]),
);

const serializeProps = (props: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(props)
      // Left out, so a component's own default still applies.
      .filter(([, value]) => value !== undefined)
      .map(([name, value]) => [name, serialize(value)]),
  );

function serialize(value: unknown): Serialized {
  if (Array.isArray(value)) return value.map(serialize);
  if (value === undefined) return null;
  if (typeof value === "function") {
    const known = knownNames.get(value);
    // Other functions must be self-contained, such as `(url) => url`: they are revived from source.
    return known ? { known: known as keyof typeof knownFunctions } : { source: String(value) };
  }
  if (typeof value !== "object" || value === null) return value as Serialized;
  if (!isValidElement(value)) {
    if (Object.getPrototypeOf(value) !== Object.prototype)
      throw new Error("Only elements, plain objects, arrays, functions and primitives serialize");
    return { object: serializeProps(value as Record<string, unknown>) };
  }
  const props = serializeProps(value.props as Record<string, unknown>);
  if (typeof value.type === "string") return { tag: value.type, props };
  const component = exportNames.get(value.type);
  if (!component) throw new Error("Elements must use components the package exports");
  return { component, props };
}

// A component's own stable classes: the `names` of its style modules, as the reference reads them.
// Classes of composed components that are not migrated yet (MarkDownRenderer's CodeBlock and
// Table) are left out; they keep their earlier selectors.
const stableNames = await readStableNames();
const ownClasses = (folder: string) => [
  ...namesIn(
    stableNames
      .filter(({ component }) => component === folder || component.startsWith(`${folder}/`))
      .map((entry) => entry.names),
  ),
];

export const migrated = migratedComponents.map(({ folder, elements, clientOnly = [] }) => ({
  folder,
  stableClasses: ownClasses(folder),
  /** Classes that render only after the browser measures, such as Tabs' scroll buttons. */
  clientOnly,
  elements: serialize(elements() as ReactNode),
}));
