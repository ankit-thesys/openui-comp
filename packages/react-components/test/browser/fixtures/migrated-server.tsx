// The migrated components of the contract test (test/unit/contract/components.tsx), with each
// component's own stable classes, for browser benches to iterate over: a component is covered as
// soon as it joins the contract list. The `elements` fixture renders the same list client-side.
// Bundled for Node by build-fixtures.ts, like bench-server.tsx.
import { namesIn } from "../../unit/contract/collect";
import { migratedComponents } from "../../unit/contract/components";

// A component's own stable classes: the `names` of its style modules, as the reference reads them.
// Name groups made only of `dependency*` keys belong to composed components, which have contract
// entries of their own, so they are left out.
// Use the contract's exact names rather than every nested style module: Charts/shared and
// individual cartesian families share a parent folder but render different public compositions.
const ownClasses = (folder: string) => [
  ...namesIn(
    migratedComponents
      .find((entry) => entry.folder === folder)!
      .names.filter((names) => !Object.keys(names).every((key) => key.startsWith("dependency"))),
  ),
];

export const migrated = migratedComponents.map(({ folder, clientOnly = [] }) => ({
  folder,
  stableClasses: ownClasses(folder),
  /** Classes that render only after the browser measures, such as Tabs' scroll buttons. */
  clientOnly,
}));
