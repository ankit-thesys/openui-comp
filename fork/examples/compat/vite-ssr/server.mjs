import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { render } from "./dist/server/entry-server.js";
import manifest from "./package.json" with { type: "json" };

const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== "--port")) {
  throw new Error("Usage: node server.mjs [--port <manifest port>]");
}
const port = args.length ? Number(args[1]) : manifest.compat.port;
if (port !== manifest.compat.port)
  throw new Error(`Expected reserved port ${manifest.compat.port}`);
const root = resolve("dist/client");
const built = JSON.parse(await readFile(resolve(root, ".vite/manifest.json"), "utf8"));
const entry = built["index.html"];
const types = { ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
const overrides = "/overrides.css";
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://127.0.0.1").pathname;
    if (pathname === "/") {
      render(response, {
        script: `/${entry.file}`,
        css: entry.css.map((file) => `/${file}`),
        overrides,
      });
      return;
    }
    const file = resolve(root, `.${pathname}`);
    if (!file.startsWith(root + sep)) {
      response.writeHead(404).end();
      return;
    }
    const body = await readFile(file);
    response.writeHead(200, {
      "Content-Type": `${types[extname(file)] ?? "application/octet-stream"}; charset=utf-8`,
    });
    response.end(body);
  } catch (error) {
    if (error.code !== "ENOENT") console.error(error);
    response.writeHead(error.code === "ENOENT" ? 404 : 500).end();
  }
});
server.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => console.log(`SSR production: http://127.0.0.1:${port}`));
