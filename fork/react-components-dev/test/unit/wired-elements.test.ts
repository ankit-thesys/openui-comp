// Every element whose class comes from a style module passes it to styleRules (#178). The wiring
// codemod's check reports any that do not, so a new unwired element fails here.
import { library } from "#paths";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

it("leaves no element unwired", () => {
  const codemod = fileURLToPath(new URL("../../scripts/wire-style-rules.mjs", import.meta.url));
  const result = spawnSync(process.execPath, [codemod, "--check", library("src/components")], {
    encoding: "utf8",
  });
  expect(result.stdout, result.stderr).toMatch(/would wire 0 element\(s\)/);
  expect(result.status).toBe(0);
});
