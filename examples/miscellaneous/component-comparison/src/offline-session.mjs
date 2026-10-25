import { ComparisonSession } from "./session.mjs";
import { demoChunks, demoSource } from "./offline-fixture.mjs";

export class OfflineSession extends ComparisonSession {
  constructor(options = {}) {
    super(options);
    this.state = { ...this.state, offline: true, activity: [] };
  }
  clear() {
    super.clear();
    this.update({ activity: [] });
  }
  instant() {
    this.stop();
    const id = crypto.randomUUID();
    this.update({
      messages: [
        {
          id,
          role: "assistant",
          content: demoSource,
          chunks: [...demoChunks],
          complete: true,
        },
      ],
      allowActions: true,
      error: "",
    });
  }
  async stream() {
    this.stop();
    const id = crypto.randomUUID();
    this.update({
      messages: [
        {
          id,
          role: "assistant",
          content: "",
          chunks: [...demoChunks],
          complete: false,
        },
      ],
    });
    return this.replay();
  }
  async replay() {
    const completed = await super.replay();
    if (completed) this.update({ allowActions: true });
    return completed;
  }
  async action(viewId, responseId, event, pane) {
    if (
      viewId !== this.state.viewId ||
      !this.state.allowActions ||
      this.state.status !== "idle" ||
      this.state.messages.at(-1)?.id !== responseId ||
      !["legacy", "migrated"].includes(pane) ||
      event?.type !== "continue_conversation"
    )
      return false;
    this.update({ activity: [...this.state.activity, { pane, event }] });
    return true;
  }
}
