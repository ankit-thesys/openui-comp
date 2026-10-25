import { once } from "node:events";
export function createApiHandler({
  generate,
  configuration = () => ({ mode: "mock", configured: true, missing: [] }),
}) {
  return async (req, res) => {
    if (req.url === "/api/config" && req.method === "GET") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(configuration()));
      return;
    }
    if (req.url !== "/api/generate" || req.method !== "POST") {
      res.writeHead(404);
      res.end();
      return;
    }
    if (
      req.headers.origin &&
      req.headers.origin !== `http://${req.headers.host}` &&
      req.headers.origin !== `https://${req.headers.host}`
    ) {
      res.writeHead(403);
      res.end();
      return;
    }
    const controller = new AbortController();
    let started = false;
    res.once("close", () => {
      if (!res.writableEnded) controller.abort();
    });
    req.once("aborted", () => controller.abort());
    try {
      const config = configuration();
      if (!config.configured) {
        res.writeHead(503, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: `Setup needed: ${config.missing.join(", ")}`,
          }),
        );
        return;
      }
      let body = "";
      for await (const chunk of req) {
        body += chunk;
        if (Buffer.byteLength(body) > 256_000) throw Error("Request too large");
      }
      const parsed = JSON.parse(body);
      if (
        !Array.isArray(parsed.messages) ||
        !parsed.messages.length ||
        parsed.messages.length > 64 ||
        parsed.messages.some(
          (m) =>
            !m ||
            !["user", "assistant"].includes(m.role) ||
            typeof m.content !== "string" ||
            m.content.length > 64_000,
        )
      )
        throw Error("Invalid conversation");
      res.writeHead(200, {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      });
      res.flushHeaders();
      started = true;
      let sequence = 0;
      for await (const text of generate({
        messages: parsed.messages,
        signal: controller.signal,
      })) {
        if (controller.signal.aborted) break;
        if (typeof text !== "string") throw Error("Invalid upstream response");
        if (
          !res.write(
            JSON.stringify({ type: "chunk", sequence: sequence++, text }) +
              "\n",
          )
        )
          await once(res, "drain", { signal: controller.signal });
      }
      if (!controller.signal.aborted)
        res.end(JSON.stringify({ type: "done", sequence }) + "\n");
    } catch {
      if (controller.signal.aborted) return;
      if (started)
        res.end(
          JSON.stringify({
            type: "error",
            message:
              "Generation failed. Check the server configuration and try again.",
          }) + "\n",
        );
      else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid conversation request." }));
      }
    }
  };
}
