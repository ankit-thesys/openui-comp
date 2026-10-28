// Every migrated component in components.tsx has its own contract test file, so it is checked in
// a fresh module graph (see defineContract.tsx).
import { existsSync } from "node:fs";
import { expect, it } from "vitest";
import { migratedComponents, sharedStyleContracts } from "./components";

it("gives every migrated component its own contract test file", () => {
  const missing = [...migratedComponents, ...sharedStyleContracts]
    .map(({ folder }) => `${folder}.contract.test.tsx`)
    .filter((file) => !existsSync(new URL(`./${file}`, import.meta.url)));
  expect(missing).toEqual([]);
});
