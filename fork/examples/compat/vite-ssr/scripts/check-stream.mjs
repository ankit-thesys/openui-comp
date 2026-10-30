import assert from "node:assert/strict";
import { get } from "node:http";
import { pathToFileURL } from "node:url";
import manifest from "../package.json" with { type: "json" };

export async function checkStream(mode) {
  const chunks = await new Promise((resolve, reject) => {
    const request = get(`http://127.0.0.1:${manifest.compat.port}/`, (response) => {
      assert.equal(response.statusCode, 200);
      assert.match(response.headers["content-type"], /text\/html; charset=utf-8/);
      const received = [];
      response.setEncoding("utf8");
      response.on("data", (chunk) => received.push(chunk));
      response.on("end", () => resolve(received));
      response.on("error", reject);
    });
    request.on("error", reject);
    request.setTimeout(10_000, () => request.destroy(new Error("Stream timed out")));
  });
  const html = chunks.join("");
  const sheet = /<style data-openui-styles>([\s\S]*?)<\/style>/.exec(html);
  assert.ok(sheet, "one full server sheet");
  assert.equal((html.match(/<style data-openui-styles>/g) ?? []).length, 1);
  assert.ok(sheet[1].length > 100_000, "full collector, including unused component styles");
  assert.ok(html.indexOf(sheet[0]) < html.indexOf("</head>"));
  assert.ok(html.indexOf(sheet[0]) < html.indexOf('<link rel="stylesheet"'));
  assert.equal(sheet[1].startsWith("@layer openui{"), mode === "layered");
  if (mode === "layered") {
    assert.ok(html.indexOf("@layer theme, base, openui") < html.indexOf(sheet[0]));
  } else {
    assert.doesNotMatch(sheet[1], /@layer\s/);
  }
  const fallbackChunk = chunks.findIndex((chunk) => chunk.includes("data-stream-fallback"));
  const resolvedChunk = chunks.findIndex((chunk) => chunk.includes("data-streamed"));
  assert.ok(fallbackChunk >= 0, "shell contains Suspense fallback");
  assert.ok(resolvedChunk > fallbackChunk, "resolved samples arrive in a later network chunk");
  assert.ok(
    chunks
      .slice(0, fallbackChunk + 1)
      .join("")
      .includes(sheet[0]),
    "full sheet before fallback",
  );
  assert.match(html, /data-compat-mode="(?:unlayered|layered)"/);
  assert.ok(html.includes(`data-compat-mode="${mode}"`));
  return {
    mode,
    chunks: chunks.length,
    sheetBytes: Buffer.byteLength(sheet[1]),
    fallbackChunk,
    resolvedChunk,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(await checkStream(process.env.OPENUI_COMPAT_MODE ?? "unlayered"));
}
