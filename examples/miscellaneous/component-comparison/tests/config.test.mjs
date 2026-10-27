import test from "node:test";
import assert from "node:assert/strict";
import { configuration } from "../server.mjs";
test("live requires explicit key, full API base and model, with no guessed endpoint", () => {
  const missing = configuration({ COMPARISON_MODE: "live" });
  assert.equal(missing.configured, false);
  assert.deepEqual(missing.missing, [
    "THESYS_API_KEY",
    "THESYS_BASE_URL",
    "THESYS_MODEL",
  ]);
  assert.equal(
    configuration({
      COMPARISON_MODE: "live",
      THESYS_API_KEY: "test",
      THESYS_BASE_URL: "https://dev.thesys.dev",
      THESYS_MODEL: "test",
    }).configured,
    false,
  );
  assert.equal(configuration({ COMPARISON_MODE: "mock" }).configured, true);
  assert(
    !JSON.stringify(
      configuration({
        COMPARISON_MODE: "live",
        THESYS_API_KEY: "secret",
        THESYS_BASE_URL: "http://localhost/v1",
        THESYS_MODEL: "test",
      }),
    ).includes("secret"),
  );
});
