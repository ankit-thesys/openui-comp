// Static server for the browser tests: the fixture page plus bundles from build-fixtures.ts.
import { reactUiRoot } from "#paths";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 5370);
const fixtures = new URL("./.fixtures/", import.meta.url);
const stylesheets = new URL("./fixtures/", import.meta.url);
// The stylesheet the react-ui benches load, from the workspace's built @openuidev/react-ui.
const reactUiCss = new URL("dist/components/index.css", reactUiRoot);
const text = (value) => value.replaceAll("<", "");
// Query parameters build the static <head>, all loaded before the fixture's script:
// `?recipe=<layer order>` starts it with the layer-mode recipe, a layer statement then an empty
// library sheet; `?css=<text>` adds a consumer stylesheet; `?sheet=<name>` then links
// `fixtures/<name>.css`.
const page = (name, params) => {
  const recipe = params.get("recipe");
  const css = params.get("css");
  const sheet = params.get("sheet");
  return (
    `<!doctype html><html><head><meta charset="utf-8">` +
    (recipe
      ? `<style id="recipe">@layer ${text(recipe)};</style><style id="openui-styles"> </style>`
      : "") +
    `<title>${name}</title>` +
    (css ? `<style id="consumer">${text(css)}</style>` : "") +
    (sheet?.match(/^[\w-]+$/) ? `<link rel="stylesheet" href="/${sheet}.css">` : "") +
    `</head><body><div id="root"></div><script type="module" src="/${name}.js"></script></body></html>`
  );
};

const serve = async (res, directory, file, type) => {
  try {
    const body = await readFile(new URL(file, directory));
    res.writeHead(200, { "content-type": type }).end(body);
  } catch {
    res.writeHead(404).end();
  }
};

createServer(async (req, res) => {
  const { pathname, searchParams } = new URL(req.url, "http://localhost");
  // Only bare names are served, so requests cannot reach outside the fixture directories.
  const html = pathname.match(/^\/([\w-]+)\.html$/);
  if (html)
    return res.writeHead(200, { "content-type": "text/html" }).end(page(html[1], searchParams));
  const bundle = pathname.match(/^\/([\w-]+\.js)$/);
  if (bundle) return serve(res, fixtures, bundle[1], "text/javascript");
  if (pathname === "/react-ui.css") return serve(res, reactUiCss, "", "text/css");
  // #100: background image URLs pass through safeUrl, which rejects data: URLs.
  if (pathname === "/card-blocks-image.svg")
    return serve(res, stylesheets, "card-blocks-image.svg", "image/svg+xml");
  const stylesheet = pathname.match(/^\/([\w-]+\.css)$/);
  if (stylesheet) return serve(res, stylesheets, stylesheet[1], "text/css");
  res.writeHead(404).end();
}).listen(port, () => console.log(`fixtures on http://localhost:${port}`));
