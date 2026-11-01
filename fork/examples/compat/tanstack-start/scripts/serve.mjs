import express from "express";
import { createMiddleware } from "@hattip/adapter-node";
import manifest from "../package.json" with { type: "json" };

process.env.NODE_ENV = "production";
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== "--port")) {
  throw new Error("Usage: pnpm start [--port <manifest port>]");
}
const port = args.length ? Number(args[1]) : manifest.compat.port;
if (port !== manifest.compat.port) throw new Error(`Expected port ${manifest.compat.port}`);
const { default: handler } = await import("../dist/server/server.js");
const app = express();
app.disable("x-powered-by");
app.use(express.static("dist/client", { index: false }));
app.use(createMiddleware(({ request }) => handler.fetch(request)));
const server = app.listen(port, "127.0.0.1", () => {
  console.log(`TanStack Start production: http://127.0.0.1:${port}`);
});
server.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
