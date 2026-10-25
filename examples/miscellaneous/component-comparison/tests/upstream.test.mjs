import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { createApp } from "../server.mjs";
test("the configured AI SDK makes one local upstream call and streams text without exposing credentials", async () => {
  let calls = 0;
  let fail = false;
  const upstream = http.createServer(async (req, res) => {
    assert.equal(req.url, "/v1/chat/completions");
    calls++;
    let text = "";
    for await (const chunk of req) text += chunk;
    const input = JSON.parse(text);
    assert.equal(input.model, "mock-ui");
    if (fail) {
      res.writeHead(503);
      res.end("private upstream details");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/event-stream" });
    res.end(
      "data: " +
        JSON.stringify({
          id: "test",
          object: "chat.completion.chunk",
          created: 1,
          model: "mock-ui",
          choices: [
            {
              index: 0,
              delta: { content: "root = Card([])" },
              finish_reason: null,
            },
          ],
        }) +
        "\n\ndata: " +
        JSON.stringify({
          id: "test",
          object: "chat.completion.chunk",
          created: 1,
          model: "mock-ui",
          choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
        }) +
        "\n\ndata: [DONE]\n\n",
    );
  });
  upstream.listen(0, "127.0.0.1");
  await once(upstream, "listening");
  const app = await createApp({
    env: {
      NODE_ENV: "production",
      COMPARISON_MODE: "live",
      THESYS_API_KEY: "test-only-secret",
      THESYS_BASE_URL: `http://127.0.0.1:${upstream.address().port}/v1`,
      THESYS_MODEL: "mock-ui",
    },
  });
  app.server.listen(0, "127.0.0.1");
  await once(app.server, "listening");
  try {
    const origin = `http://127.0.0.1:${app.server.address().port}`;
    const config = await (await fetch(origin + "/api/config")).json();
    assert.equal(config.configured, true);
    assert(!JSON.stringify(config).includes("secret"));
    const response = await fetch(origin + "/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
    });
    const result = await response.text();
    assert.equal(calls, 1);
    assert.match(result, /root = Card\(\[\]\)/);
    assert.match(result, /"type":"done"/);
    assert(!result.includes("secret"));
    fail = true;
    const failed = await fetch(origin + "/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
    });
    const failedText = await failed.text();
    assert.equal(
      calls,
      2,
      "One upstream attempt per prompt, including failures",
    );
    assert.match(failedText, /Generation failed/);
    assert(!failedText.includes("private upstream details"));
    assert(!failedText.includes("test-only-secret"));
  } finally {
    await app.close();
    upstream.closeAllConnections();
    await new Promise((r) => upstream.close(r));
  }
});
