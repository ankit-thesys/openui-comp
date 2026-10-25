import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { inspectFixture } from "../scripts/offline-inventory.mjs";

test("actual parser validates all 84 entries in both unchanged registries", async () => {
  const inventory = JSON.parse(
    await fs.readFile("offline-inventory.json", "utf8"),
  );
  for (const name of ["legacy", "migrated"]) {
    const spec = JSON.parse(
      await fs.readFile(`.generated/${name}.json`, "utf8"),
    );
    const { entries, results } = inspectFixture(spec);
    for (const result of results) {
      assert.deepEqual(result.errors, [], result.example);
      assert.deepEqual(result.unresolved, [], result.example);
      assert.deepEqual(result.orphaned, [], result.example);
      assert.equal(result.incomplete, false, result.example);
    }
    assert.deepEqual(
      entries.map((e) => e.name).sort(),
      Object.keys(spec.components).sort(),
    );
    assert.equal(entries.filter((e) => e.delivery !== "direct").length, 80);
    assert.deepEqual(entries, inventory);
    const reachable = new Set();
    function visit(component) {
      if (reachable.has(component)) return;
      reachable.add(component);
      const parameters = spec.components[component].signature.replace(
        /^[^(]+/,
        "",
      );
      for (const token of parameters.match(/\b[A-Z]\w*/g) ?? [])
        if (spec.components[token]) visit(token);
    }
    visit(spec.root);
    assert.equal(reachable.size, 80);
    assert.deepEqual(
      Object.keys(spec.components)
        .filter((n) => !reachable.has(n))
        .sort(),
      ["Label", "Slice", "SwitchGroup", "SwitchItem"],
    );
  }
});
