import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import manifest from "../package.json" with { type: "json" };

/** Verify a shell arrives before the deferred component markup, without a browser. */
export async function inspectStream(url, mode) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    },
  });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/i);
  let html = "";
  let shellAt;
  let lateAt;
  const started = performance.now();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  for await (const chunk of response.body) {
    html += decoder.decode(chunk, { stream: true });
    if (shellAt === undefined && html.includes("data-compat-pending")) {
      shellAt = performance.now() - started;
      assert.ok(html.includes("</head>"), "the initial shell contains the complete head");
      assert.ok(!html.includes("data-compat-ready"), "samples are deferred beyond the shell");
    }
    if (lateAt === undefined && html.includes("data-compat-ready")) {
      lateAt = performance.now() - started;
    }
  }
  assert.notEqual(shellAt, undefined, "a Suspense fallback was streamed");
  assert.notEqual(lateAt, undefined, "deferred components were server rendered");
  assert.ok(
    lateAt - shellAt > 300,
    `shell and deferred content arrived separately (${lateAt - shellAt} ms)`,
  );
  const head = html.slice(html.indexOf("<head>"), html.indexOf("</head>"));
  assert.match(head, /<meta charSet="utf-8"/i, "the document declares UTF-8");
  const sheets = [...html.matchAll(/<style data-openui-styles="[^"]*">([\s\S]*?)<\/style>/g)];
  assert.equal(sheets.length, 1, "exactly one full server sheet");
  const css = sheets[0][1];
  assert.ok(css.length > 100000, "the server sends the complete component sheet");
  const sheetIndex = head.indexOf("<style data-openui-styles");
  assert.ok(sheetIndex >= 0, "the server sheet belongs to head");
  for (const name of ["data-compat-app-css", "data-compat-overrides"]) {
    const link = head.match(new RegExp(`<link[^>]*${name}[^>]*>`))?.[0];
    assert.ok(link, `${name} is in head`);
    assert.ok(head.indexOf(link) > sheetIndex, `${name} follows the component sheet`);
  }
  if (mode === "layered") {
    assert.ok(css.startsWith("@layer openui{"), "the full sheet is layered");
    const order = head.indexOf("@layer theme, base, openui, components, utilities;");
    assert.ok(order >= 0 && order < sheetIndex, "layer order precedes the sheet");
  } else {
    assert.ok(!css.includes("@layer"), "component rules are unlayered");
  }
  console.log(
    `${manifest.name} ${mode}: head sheet ${Buffer.byteLength(css)} bytes; shell ${Math.round(shellAt)} ms; deferred ${Math.round(lateAt)} ms`,
  );
  return html;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await inspectStream(
    `http://127.0.0.1:${manifest.compat.port}`,
    process.env.OPENUI_COMPAT_MODE ?? "unlayered",
  );
}
