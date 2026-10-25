export class ComparisonSession {
  constructor({
    fetcher = (input, options) => fetch(input, options),
    replayDelay = 25,
  } = {}) {
    this.fetcher = fetcher;
    this.replayDelay = replayDelay;
    this.listeners = new Set();
    this.controller = null;
    /** @type {import('./protocol').Snapshot} */
    this.state = {
      messages: [],
      status: "idle",
      error: "",
      theme: "light",
      viewId: crypto.randomUUID(),
      revision: 0,
      allowActions: false,
    };
  }
  getSnapshot = () => this.state;
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  update(patch) {
    this.state = { ...this.state, ...patch, revision: this.state.revision + 1 };
    for (const listener of this.listeners) listener();
  }
  theme(theme) {
    if (["light", "dark"].includes(theme)) this.update({ theme });
  }
  stop() {
    this.controller?.abort();
    this.controller = null;
    this.update({
      status: "idle",
      viewId: crypto.randomUUID(),
      allowActions: false,
    });
  }
  clear() {
    this.stop();
    this.update({ messages: [], error: "" });
  }
  async send(content, display = content) {
    if (
      ["streaming", "replaying"].includes(this.state.status) ||
      !content.trim()
    )
      return false;
    const id = crypto.randomUUID(),
      controller = new AbortController();
    this.controller = controller;
    const messages = [
      ...this.state.messages,
      { id: crypto.randomUUID(), role: "user", content, display },
      { id, role: "assistant", content: "", chunks: [], complete: false },
    ];
    this.update({
      messages,
      status: "streaming",
      error: "",
      viewId: id,
      allowActions: false,
    });
    const current = () =>
      this.controller === controller && !controller.signal.aborted;
    try {
      const result = await this.fetcher("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages
            .slice(0, -1)
            .map((m) => ({
              role: m.role,
              content: m.role === "assistant" ? m.chunks.join("") : m.content,
            }))
            .filter((m) => m.content),
        }),
        signal: controller.signal,
      });
      if (!result.ok) {
        let message = "Request failed.";
        try {
          message = (await result.json()).error ?? message;
        } catch {}
        throw Error(message);
      }
      if (!result.body) throw Error("Missing response stream.");
      const reader = result.body
        .pipeThrough(new TextDecoderStream())
        .getReader();
      let buffer = "",
        sequence = 0,
        done = false;
      const event = (line) => {
        if (!current()) return;
        if (done) throw Error("Unexpected event after completion.");
        const packet = JSON.parse(line);
        if (packet.type === "error") throw Error(packet.message);
        if (packet.sequence !== sequence)
          throw Error("Response chunks arrived out of order.");
        if (packet.type === "chunk" && typeof packet.text === "string") {
          sequence++;
          this.append(id, packet.text);
        } else if (packet.type === "done") {
          done = true;
        } else throw Error("Invalid stream event.");
      };
      while (true) {
        const next = await reader.read();
        if (!current()) {
          await reader.cancel();
          break;
        }
        if (next.done) break;
        buffer += next.value;
        let end;
        while ((end = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, end);
          buffer = buffer.slice(end + 1);
          if (line) event(line);
        }
      }
      if (current()) {
        if (buffer.trim()) event(buffer);
        if (!done) throw Error("The response ended before completion.");
        this.update({
          messages: this.state.messages.map((m) =>
            m.id === id ? { ...m, complete: true } : m,
          ),
          status: "idle",
          allowActions: true,
        });
      }
    } catch (error) {
      if (current()) {
        this.update({
          status: "idle",
          error: error.message ?? "Generation failed.",
          allowActions: false,
        });
        controller.abort();
      }
    } finally {
      if (this.controller === controller) this.controller = null;
    }
    return true;
  }
  append(id, text, retain = true) {
    this.update({
      messages: this.state.messages.map((m) =>
        m.id === id
          ? {
              ...m,
              content: m.content + text,
              chunks: retain ? [...m.chunks, text] : m.chunks,
            }
          : m,
      ),
    });
  }
  async replay() {
    if (["streaming", "replaying"].includes(this.state.status)) return false;
    const last = this.state.messages.findLast(
      (m) => m.role === "assistant" && m.chunks?.length,
    );
    if (!last) return false;
    const chunks = [...last.chunks],
      controller = new AbortController();
    this.controller = controller;
    this.update({
      messages: this.state.messages.map((m) =>
        m.id === last.id ? { ...m, content: "" } : m,
      ),
      status: "replaying",
      viewId: crypto.randomUUID(),
      allowActions: false,
      error: "",
    });
    for (const text of chunks) {
      await new Promise((resolve) => setTimeout(resolve, this.replayDelay));
      if (this.controller !== controller || controller.signal.aborted)
        return false;
      this.append(last.id, text, false);
    }
    if (this.controller === controller) {
      this.controller = null;
      this.update({ status: "idle" });
    }
    return true;
  }
  async action(viewId, responseId, event) {
    if (
      viewId !== this.state.viewId ||
      !this.state.allowActions ||
      this.state.status !== "idle" ||
      this.state.messages.at(-1)?.id !== responseId ||
      event?.type !== "continue_conversation" ||
      typeof event.humanFriendlyMessage !== "string"
    )
      return false;
    return this.send(
      JSON.stringify({ submittedAction: event }),
      event.humanFriendlyMessage,
    );
  }
}
