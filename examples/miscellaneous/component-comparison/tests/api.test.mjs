import test from "node:test";
import assert from "node:assert/strict";
import { createServer, request } from "node:http";
import { once } from "node:events";
import { createApiHandler } from "../api.mjs";
test("one prompt streams one upstream response and abort closes upstream", async () => {
  let calls = 0,
    aborted = false;
  const handler = createApiHandler({
    generate: async function* ({ signal }) {
      calls++;
      try {
        yield "root = ";
        await new Promise((resolve, reject) => {
          const timer = setTimeout(resolve, 1000);
          signal.addEventListener(
            "abort",
            () => {
              clearTimeout(timer);
              reject(new Error("aborted"));
            },
            { once: true },
          );
        });
        yield "Card([])";
      } finally {
        aborted = signal.aborted;
      }
    },
  });
  const server = createServer(handler);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const abort = new AbortController();
    const response = await fetch(
      `http://127.0.0.1:${server.address().port}/api/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "hello" }],
        }),
        signal: abort.signal,
      },
    );
    const reader = response.body.getReader();
    assert.match(
      new TextDecoder().decode((await reader.read()).value),
      /root = /,
    );
    assert.equal(calls, 1);
    abort.abort();
    for (let i = 0; i < 30 && !aborted; i++)
      await new Promise((r) => setTimeout(r, 10));
    assert.equal(aborted, true);
  } finally {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
});

test("missing live setup never calls upstream", async () => {
  let calls = 0;
  const handler = createApiHandler({
    generate: async function* () {
      calls++;
      throw Error("private-key-do-not-disclose");
    },
    configuration: () => ({
      mode: "live",
      configured: false,
      missing: ["THESYS_MODEL"],
    }),
  });
  const server = createServer(handler);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const response = await fetch(
      `http://127.0.0.1:${server.address().port}/api/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
      },
    );
    assert.equal(response.status, 503);
    assert.match(await response.text(), /Setup needed: THESYS_MODEL/);
    assert.equal(calls, 0);
  } finally {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
});

test("split UTF-8 request bytes preserve Unicode conversation content", async () => {
  const content = "Café 🧭 中文";
  let received;
  let releaseFirstChunk;
  const firstChunk = new Promise((resolve) => {
    releaseFirstChunk = resolve;
  });
  const handler = createApiHandler({
    generate: async function* ({ messages }) {
      received = messages;
      yield "root = Card([])";
    },
  });
  const server = createServer((req, res) => {
    req.once("data", releaseFirstChunk);
    handler(req, res);
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const messages = [{ role: "user", content }];
    const body = Buffer.from(JSON.stringify({ messages }));
    const split = body.indexOf(Buffer.from("🧭")) + 1;
    const response = new Promise((resolve, reject) => {
      const req = request(
        {
          hostname: "127.0.0.1",
          port: server.address().port,
          path: "/api/generate",
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
        (res) => {
          res.resume();
          res.once("end", () => resolve(res.statusCode));
          res.once("error", reject);
        },
      );
      req.once("error", reject);
      req.write(body.subarray(0, split));
      firstChunk.then(() => req.end(body.subarray(split)));
    });
    assert.equal(await response, 200);
    assert.deepEqual(received, messages);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
