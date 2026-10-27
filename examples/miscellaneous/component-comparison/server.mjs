import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createApiHandler } from "./api.mjs";
import { mockResponse } from "./mock.mjs";
import { createBenchApi } from "./bench/api.mjs";
export function configuration(env = process.env, registry = true) {
  const mode = env.COMPARISON_MODE ?? "mock";
  const missing = [];
  if (!["mock", "live"].includes(mode))
    missing.push("COMPARISON_MODE must be mock or live");
  if (!registry)
    missing.push(
      "Run npm run generate to verify matching chat-library schemas",
    );
  if (mode === "live") {
    for (const name of ["THESYS_API_KEY", "THESYS_BASE_URL", "THESYS_MODEL"])
      if (!env[name]?.trim()) missing.push(name);
    if (env.THESYS_BASE_URL) {
      try {
        const u = new URL(env.THESYS_BASE_URL);
        if (
          !["http:", "https:"].includes(u.protocol) ||
          u.pathname === "/" ||
          u.username ||
          u.password ||
          u.search ||
          u.hash
        )
          throw Error();
      } catch {
        missing.push(
          "THESYS_BASE_URL must be the confirmed full API base with its path",
        );
      }
    }
  }
  return { mode, configured: missing.length === 0, missing };
}
export async function createApp({ env = process.env, generate, distRoot } = {}) {
  const root = import.meta.dirname;
  let spec;
  try {
    const legacy = JSON.parse(
      await fs.readFile(path.join(root, ".generated/legacy.json")),
    );
    const migrated = JSON.parse(
      await fs.readFile(path.join(root, ".generated/migrated.json")),
    );
    for (const key of [
      "root",
      "components",
      "schema",
      "functions",
      "actions",
    ]) {
      const { isDeepStrictEqual } = await import("node:util");
      if (!isDeepStrictEqual(legacy[key], migrated[key]))
        throw Error("Registry mismatch");
    }
    spec = migrated;
  } catch {}
  const config = () => configuration(env, Boolean(spec));
  const upstream =
    generate ??
    async function* ({ messages, signal }) {
      if (config().mode === "mock") {
        yield* mockResponse({ messages, signal });
        return;
      }
      const { createOpenAI } = await import("@ai-sdk/openai");
      const { streamText } = await import("ai");
      const { generateSystemPrompt } = await import("@openuidev/lang-core");
      const { promptOptions, ...library } = spec;
      const provider = createOpenAI({
        apiKey: env.THESYS_API_KEY,
        baseURL: env.THESYS_BASE_URL,
      });
      const result = streamText({
        model: provider.chat(env.THESYS_MODEL),
        system: generateSystemPrompt({ cloud: true, library, promptOptions }),
        messages,
        maxRetries: 0,
        abortSignal: signal,
        onError: () => {},
      });
      for await (const part of result.fullStream) {
        if (part.type === "text-delta") yield part.text;
        else if (part.type === "error")
          throw Error("Upstream generation failed");
      }
    };
  const api = createApiHandler({ generate: upstream, configuration: config });
  const dev =
    env.NODE_ENV !== "production"
      ? await (
          await import("vite")
        ).createServer({
          root,
          server: { middlewareMode: true },
          appType: "mpa",
        })
      : null;
  const bench = createBenchApi();
  const server = http.createServer(async (req, res) => {
    if (await bench(req,res)) return;
    if (req.url?.startsWith("/api/")) {
      await api(req, res);
      return;
    }
    if (dev) {
      dev.middlewares(req, res, () => {
        res.writeHead(404);
        res.end();
      });
      return;
    }
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      const dist = distRoot ?? path.join(root, "dist");
      const file = path.resolve(
        dist,
        "." + (pathname === "/" ? "/index.html" : pathname),
      );
      if (!file.startsWith(dist + path.sep)) throw Error("Invalid path");
      let bytes = await fs.readFile(file);
      if (pathname === "/" || pathname === "/index.html") {
        const publicConfig = JSON.stringify(config()).replace(/</g, "\\u003c");
        bytes = Buffer.from(bytes.toString("utf8").replace("</head>", `<script type="application/json" id="comparison-config">${publicConfig}</script></head>`));
      }
      const type =
        {
          ".html": "text/html; charset=utf-8",
          ".js": "text/javascript",
          ".css": "text/css",
          ".woff2": "font/woff2",
          ".woff": "font/woff",
          ".ttf": "font/ttf",
          ".svg": "image/svg+xml",
        }[path.extname(file)] ?? "application/octet-stream";
      res.setHeader("Content-Type", type);
      res.end(bytes);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  return {
    server,
    close: async () => {
      server.closeAllConnections();
      if (server.listening) await new Promise((r) => server.close(r));
      await dev?.close();
    },
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const app = await createApp();
  const port = Number(process.env.PORT ?? 4188);
  app.server.listen(port, "127.0.0.1", () =>
    console.log(
      `Comparison: http://127.0.0.1:${port} (${configuration().mode})`,
    ),
  );
  for (const signal of ["SIGINT", "SIGTERM"])
    process.once(signal, () => void app.close());
}
