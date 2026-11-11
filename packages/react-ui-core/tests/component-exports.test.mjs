import * as core from "@openuidev/react-ui-core";
import assert from "node:assert/strict";
import test from "node:test";

test("the first slice exposes its three controls only through the public root", () => {
  for (const name of ["Button", "Input", "TextArea"])
    assert(core[name], `Missing root component: ${name}`);
  assert.equal("FormControlProvider" in core, false);
  assert.equal("useFormControlContext" in core, false);
});
