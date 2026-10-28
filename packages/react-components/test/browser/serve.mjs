// Static server for the browser tests: the fixture page plus bundles from build-fixtures.ts.
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 5370);
const fixtures = new URL("./.fixtures/", import.meta.url);
// `?css=<text>` adds a consumer stylesheet to the static <head>, loaded before the fixture's script.
const page = (name, css) =>
  `<!doctype html><html><head><meta charset="utf-8"><title>${name}</title>` +
  (css ? `<style id="consumer">${css.replaceAll("<", "")}</style>` : "") +
  `</head><body><div id="root"></div><script type="module" src="/${name}.js"></script></body></html>`;

createServer(async (req, res) => {
  const { pathname, searchParams } = new URL(req.url, "http://localhost");
  const html = pathname.match(/^\/([\w-]+)\.html$/);
  if (html)
    return res
      .writeHead(200, { "content-type": "text/html" })
      .end(page(html[1], searchParams.get("css")));
  // Only bundle names are served, so requests cannot reach outside the fixtures directory.
  const bundle = pathname.match(/^\/([\w-]+\.js)$/);
  if (!bundle) return res.writeHead(404).end();
  try {
    const body = await readFile(new URL(bundle[1], fixtures));
    res.writeHead(200, { "content-type": "text/javascript" }).end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(port, () => console.log(`fixtures on http://localhost:${port}`));
