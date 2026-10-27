import test from "node:test";
import assert from "node:assert/strict";
import { ComparisonSession } from "../src/session.mjs";
const encoder = new TextEncoder();
function response() {
  return new Response(
    new ReadableStream({
      start(c) {
        for (const [sequence, text] of ["first", "second", "third"].entries())
          c.enqueue(
            encoder.encode(
              JSON.stringify({ type: "chunk", sequence, text }) + "\n",
            ),
          );
        c.enqueue(encoder.encode('{"type":"done","sequence":3}\n'));
        c.close();
      },
    }),
  );
}
test("stopping a replay preserves the original chunks for the next replay", async () => {
  const session = new ComparisonSession({
    fetcher: async () => response(),
    replayDelay: 10,
  });
  await session.send("hi");
  const replay = session.replay();
  await new Promise((r) => setTimeout(r, 15));
  session.stop();
  await replay;
  await session.replay();
  assert.equal(
    session.getSnapshot().messages.at(-1).content,
    "firstsecondthird",
  );
});
test("invalid sequence aborts the upstream body and reports the error", async () => {
  let cancelled = false;
  const session = new ComparisonSession({
    fetcher: async (_url, { signal }) => {
      signal.addEventListener("abort", () => {
        cancelled = true;
      });
      return new Response(
        new ReadableStream({
          start(c) {
            c.enqueue(
              encoder.encode('{"type":"chunk","sequence":4,"text":"bad"}\n'),
            );
          },
        }),
      );
    },
  });
  await session.send("hi");
  assert.equal(cancelled, true);
  assert.match(session.getSnapshot().error, /out of order/);
});

test("stopping replay before the first displayed chunk retains the prior assistant in the next model request", async () => {
  const calls = [];
  const session = new ComparisonSession({
    fetcher: async (_url, options) => {
      calls.push(JSON.parse(options.body));
      return response();
    },
    replayDelay: 15,
  });
  await session.send("first prompt");
  const replay = session.replay();
  session.stop();
  await replay;
  await session.send("next prompt");
  assert.deepEqual(calls[1].messages, [
    { role: "user", content: "first prompt" },
    { role: "assistant", content: "firstsecondthird" },
    { role: "user", content: "next prompt" },
  ]);
});
