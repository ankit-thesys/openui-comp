import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import manifest from "./package.json" with { type: "json" };
import { render } from "./dist/server/entry-server.js";
const args = process.argv.slice(2);
if (
  args.length &&
  (args.length !== 2 || args[0] !== "--port" || Number(args[1]) !== manifest.compat.port)
) {
  throw new Error(`Use --port ${manifest.compat.port}`);
}
const root = resolve("dist/client");
const template = await readFile(resolve(root, "index.html"), "utf8");
const mime = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};
createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname === "/") {
      const { html, componentCss, hostCss, mode } = render();
      const head = `${mode === "layered" ? "<style>@layer theme, base, openui, components, utilities;</style>" : ""}<style id="openui-styles" data-openui-styles>${componentCss}</style><style id="_goober">${hostCss}</style>`;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(template.replace("<!-- compat-head -->", head).replace("<!-- compat-app -->", html));
    } else {
      const file = resolve(root, `.${decodeURIComponent(pathname)}`);
      if (!file.startsWith(root + sep)) {
        res.writeHead(403).end();
        return;
      }
      const data = await readFile(file);
      res.setHeader("Content-Type", mime[extname(file)] ?? "application/octet-stream");
      res.end(data);
    }
  } catch (error) {
    if (error.code === "ENOENT") res.writeHead(404).end();
    else {
      console.error(error);
      res.writeHead(500).end("SSR failed");
    }
  }
}).listen(manifest.compat.port, "127.0.0.1");
