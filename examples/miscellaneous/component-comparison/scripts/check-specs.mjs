import fs from "node:fs/promises";
import assert from "node:assert/strict";
const legacy = JSON.parse(await fs.readFile(".generated/legacy.json", "utf8"));
const migrated = JSON.parse(
  await fs.readFile(".generated/migrated.json", "utf8"),
);
for (const key of ["root", "components", "schema", "functions", "actions"])
  assert.deepEqual(
    migrated[key],
    legacy[key],
    `The two chat libraries differ in ${key}; do not send unmatched schemas to the model`,
  );
console.log("Both chat-library registries match.");
