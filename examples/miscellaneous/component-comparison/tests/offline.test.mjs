import test from "node:test";
import assert from "node:assert/strict";
import { OfflineSession } from "../src/offline-session.mjs";
import { demoSource } from "../src/offline-fixture.mjs";

test("offline instant, stop and replay retain identical source without fetch", async () => {
  const session = new OfflineSession({
    replayDelay: 0,
    fetcher: () => {
      throw Error("Offline must never fetch");
    },
  });
  session.instant();
  assert.equal(session.state.messages[0].content, demoSource);
  const playback = session.stream();
  session.stop();
  assert.equal(await playback, false);
  assert.equal(session.state.messages[0].chunks.join(""), demoSource);
  assert.equal(await session.replay(), true);
  assert.equal(session.state.messages[0].content, demoSource);
});
test("offline actions log exact pane and values, stale actions and clear are fenced", async () => {
  const session = new OfflineSession();
  session.instant();
  const { viewId, messages } = session.state;
  const event = {
    type: "continue_conversation",
    humanFriendlyMessage: "Submitted",
    form: { name: "Ada" },
  };
  assert.equal(
    await session.action(viewId, messages[0].id, event, "legacy"),
    true,
  );
  assert.deepEqual(session.state.activity, [{ pane: "legacy", event }]);
  session.clear();
  assert.equal(
    await session.action(viewId, messages[0].id, event, "legacy"),
    false,
  );
  assert.deepEqual(session.state.activity, []);
});
