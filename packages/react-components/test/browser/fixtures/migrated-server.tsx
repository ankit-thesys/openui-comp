// The migrated components of the contract test (test/unit/contract/components.tsx), with each
// component's own stable classes, for browser benches to iterate over: a component is covered as
// soon as it joins the contract list. The `elements` fixture renders the same list client-side.
// Bundled for Node by build-fixtures.ts, like bench-server.tsx.
import { readStableNames } from "../../../scripts/selector-reference.mjs";
import { namesIn } from "../../unit/contract/collect";
import { migratedComponents } from "../../unit/contract/components";

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

export const migrated = migratedComponents.map(({ folder, clientOnly = [] }) => ({
  folder,
  stableClasses: ownClasses(folder),
  /** Classes that render only after the browser measures, such as Tabs' scroll buttons. */
  clientOnly,
}));
