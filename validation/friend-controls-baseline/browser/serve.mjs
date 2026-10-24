/** Tiny zero-dependency static server for the built fixture. */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { extname, join, normalize } from "node:path";

/**
 * Find a free TCP port starting at `start`.
 *
 * Back-to-back runs otherwise collide: a previous run's listener (or a leaked
 * Chrome holding its debugging port) makes a fixed port fail, and the second
 * invocation of a "repeatable command" must not fall over for that reason.
 */
export const freePort = async (start, attempts = 40) => {
  for (let port = start; port < start + attempts; port++) {
    const ok = await new Promise((resolve) => {
      const probe = createNetServer();
      probe.once("error", () => resolve(false));
      probe.once("listening", () => probe.close(() => resolve(true)));
      probe.listen(port, "127.0.0.1");
    });
    if (ok) return port;
  }
  throw new Error(`no free port in range ${start}-${start + attempts}`);
};

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

export const serve = (rootDir, port = 4321) =>
  new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
      let file = join(rootDir, normalize(urlPath));
      if (!file.startsWith(rootDir)) {
        res.writeHead(403).end("forbidden");
        return;
      }
      if (!existsSync(file) || statSync(file).isDirectory()) file = join(rootDir, "index.html");
      if (!existsSync(file)) {
        res.writeHead(404).end("not found");
        return;
      }
      res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
      createReadStream(file).pipe(res);
    });
    server.on("error", reject);
    server.listen(port, "127.0.0.1", () =>
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((r) => server.close(r)),
      }),
    );
  });
