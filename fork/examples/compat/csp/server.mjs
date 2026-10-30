import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { mode, render } from "./dist/server/entry-server.js";
import manifest from "./package.json" with { type: "json" };
const args = process.argv.slice(2);
const port = args.length === 0 ? manifest.compat.port : Number(args[1]);
if (args.length && (args[0] !== "--port" || args.length !== 2))
  throw new Error("Usage: start --port N");
if (port !== manifest.compat.port) throw new Error("Port must match compat.port");
const assets = JSON.parse(
  await readFile(new URL("./dist/client/.vite/manifest.json", import.meta.url), "utf8"),
);
const entry = assets["src/entry-client.tsx"];
const staticRoot = resolve("dist/client");
const mime = { ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml" };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1");
    if (url.pathname === "/favicon.ico") {
      res.writeHead(204).end();
      return;
    }
    if (url.pathname !== "/") {
      const file = resolve(staticRoot, `.${url.pathname}`);
      if (!file.startsWith(staticRoot + sep)) {
        res.writeHead(403).end();
        return;
      }
      try {
        const body = await readFile(file);
        res
          .writeHead(200, { "Content-Type": mime[extname(file)] ?? "application/octet-stream" })
          .end(body);
      } catch {
        res.writeHead(404).end();
      }
      return;
    }
    const nonce = randomBytes(18).toString("base64");
    const theme = url.searchParams.get("theme") === "light" ? "light" : "light";
    const { sheet, html } = render(theme);
    const headers = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" };
    headers["Content-Security-Policy"] =
      `style-src 'nonce-${nonce}'; script-src 'self' 'nonce-${nonce}'; object-src 'none'; base-uri 'none'`;

    res.writeHead(200, headers)
      .end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>csp</title>
<script nonce="${nonce}">window.__nonce__=${JSON.stringify(nonce)};
window.__compat={violations:[],recoverable:[],hydrated:false,firstPaint:{},frames:[]};
document.addEventListener("securitypolicyviolation",event=>window.__compat.violations.push(event.effectiveDirective+": "+event.blockedURI));</script>
${mode === "layered" ? `<style nonce="${nonce}">@layer theme, base, openui, components, utilities;</style>` : ""}
<style data-openui-styles nonce="${nonce}">${sheet}</style>
${(entry.css ?? []).map((file) => `<link rel="stylesheet" nonce="${nonce}" href="/${file}">`).join("")}
<link rel="stylesheet" nonce="${nonce}" data-compat-overrides media="not all" href="/overrides.css">
</head><body><div id="root" data-theme="${theme}">${html}</div>
<script nonce="${nonce}">const probe=document.querySelector("[data-theme-probe]")||document.querySelector(".openui-button");
const sample=()=>({background:getComputedStyle(probe).backgroundColor,token:getComputedStyle(probe).getPropertyValue("--openui-text-neutral-primary").trim()});
window.__compat.firstPaint=sample();
function frame(){window.__compat.frames.push(sample().background);if(!window.__compat.hydrated)requestAnimationFrame(frame)}requestAnimationFrame(frame);</script>
<script nonce="${nonce}" type="module" src="/${entry.file}"></script></body></html>`);
  } catch (error) {
    console.error(error);
    res.writeHead(500).end(String(error));
  }
});
server.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
server.listen(port, "127.0.0.1", () => console.log(`csp ${mode}: http://127.0.0.1:${port}`));
