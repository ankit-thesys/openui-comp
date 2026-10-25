import test from "node:test";
import assert from "node:assert/strict";
import { ComparisonSession } from "../src/session.mjs";
test("an upstream error is visible without inventing a completed response", async () => {
  const session = new ComparisonSession({
    fetcher: async () =>
      new Response(
        '{"type":"chunk","sequence":0,"text":"partial"}\n{"type":"error","message":"Generation failed"}\n',
      ),
  });
  await session.send("hello");
  assert.equal(session.getSnapshot().error, "Generation failed");
  assert.equal(session.getSnapshot().allowActions, false);
  assert.equal(session.getSnapshot().messages.at(-1).content, "partial");
});
