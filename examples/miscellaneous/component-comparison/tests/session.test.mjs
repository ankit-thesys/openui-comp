import test from "node:test";
import assert from "node:assert/strict";
import { ComparisonSession } from "../src/session.mjs";
const response = () =>
  new Response(
    new ReadableStream({
      start(c) {
        c.enqueue(
          new TextEncoder().encode(
            '{"type":"chunk","sequence":0,"text":"root = "}\n{"type":"chunk","sequence":1,"text":"Card([])"}\n{"type":"done","sequence":2}\n',
          ),
        );
        c.close();
      },
    }),
  );
test("two panes observe one ordered response; replay calls no upstream and stale actions are rejected", async () => {
  let calls = 0;
  const session = new ComparisonSession({
    fetcher: async () => {
      calls++;
      return response();
    },
    replayDelay: 0,
  });
  const left = [],
    right = [];
  session.subscribe(() => left.push(session.getSnapshot()));
  session.subscribe(() => right.push(session.getSnapshot()));
  await session.send("Hello");
  assert.equal(calls, 1);
  assert.deepEqual(left, right);
  assert.equal(
    session.getSnapshot().messages.at(-1).content,
    "root = Card([])",
  );
  const old = session.getSnapshot();
  await session.replay();
  assert.equal(calls, 1);
  assert.equal(
    session.getSnapshot().messages.at(-1).content,
    "root = Card([])",
  );
  assert.equal(
    await session.action(old.viewId, old.messages.at(-1).id, {
      type: "continue_conversation",
      humanFriendlyMessage: "Next",
      formState: { name: "Ada" },
    }),
    false,
  );
  assert.equal(calls, 1);
});
