import test from "node:test";
import assert from "node:assert/strict";
import { ComparisonSession } from "../src/session.mjs";
const response = () =>
  new Response(
    '{"type":"chunk","sequence":0,"text":"root = Card([])"}\n{"type":"done","sequence":1}\n',
  );
test("two near-simultaneous pane actions produce one next turn preserving the full action event", async () => {
  const calls = [];
  const session = new ComparisonSession({
    fetcher: async (_url, options) => {
      calls.push(JSON.parse(options.body));
      return response();
    },
  });
  await session.send("hello");
  const state = session.getSnapshot();
  const event = {
    type: "continue_conversation",
    humanFriendlyMessage: "Send",
    params: {
      message: "Summarize these details",
      context: { purpose: "comparison" },
    },
    formState: { name: "Ada" },
    formName: "contact",
  };
  await Promise.all([
    session.action(state.viewId, state.messages.at(-1).id, event),
    session.action(state.viewId, state.messages.at(-1).id, event),
  ]);
  assert.equal(calls.length, 2);
  assert.deepEqual(JSON.parse(calls[1].messages.at(-1).content), {
    submittedAction: event,
  });
});
test("Clear fences a late response without restoring conversation history", async () => {
  let release;
  const responseWait = new Promise((resolve) => (release = resolve));
  const session = new ComparisonSession({ fetcher: () => responseWait });
  const sending = session.send("hello");
  session.clear();
  release(response());
  await sending;
  assert.deepEqual(session.getSnapshot().messages, []);
  assert.equal(session.getSnapshot().status, "idle");
});
