import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
const consumer = process.env.CORE_CONSUMER
  ? path.resolve(process.env.CORE_CONSUMER)
  : fileURLToPath(new URL("../../../../", import.meta.url));
test("control root imports work in native Node ESM and CommonJS", () => {
  const names = [
    "Chips",
    "Select",
    "SelectContent",
    "Slider",
    "SliderBlock",
    "Calendar",
    "DatePicker",
  ];
  for (const mode of ["module", "commonjs"]) {
    const load =
      mode === "module"
        ? 'import * as core from "@openuidev/react-ui-core";'
        : 'const core=require("@openuidev/react-ui-core");';
    const script =
      load +
      `for (const name of ${JSON.stringify(names)}) if(!core[name]) throw new Error(name); console.log("passed");`;
    assert.equal(
      execFileSync(process.execPath, ["--input-type=" + mode, "-e", script], {
        cwd: consumer,
        encoding: "utf8",
      }).trim(),
      "passed",
    );
  }
});
