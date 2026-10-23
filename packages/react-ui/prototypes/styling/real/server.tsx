import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { monitorEventLoopDelay } from "node:perf_hooks";
import React, { Suspense } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { BenchContent, makeResponse } from "./workloads";

const port = Number(process.env.PORT || 4180);
const root = process.cwd();
const counters = { requests: 0, active: 0, completed: 0, aborted: 0, renderErrors: 0, replayActive: 0 };
const lag = monitorEventLoopDelay({ resolution: 20 });
lag.enable();
const number = (params: URLSearchParams, key: string, fallback: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.floor(Number(params.get(key)) || fallback)));
const themes = { blue: "oklch(0.55 0.2 260 / 1)", red: "oklch(0.55 0.2 25 / 1)" };

http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  const p = url.searchParams;
  const scenario = p.get("scenario") === "dashboard" ? "dashboard" : "chat";
  const size = number(p, "size", 2, 1, 20);
  if (url.pathname === "/stats") {
    res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
    res.end(JSON.stringify({ ...counters, rss: process.memoryUsage().rss, cpu: process.cpuUsage(), uptime: process.uptime(), eventLoop: { meanMs: Number.isFinite(lag.mean) ? lag.mean / 1e6 : null, p95Ms: lag.percentile(95) / 1e6, maxMs: lag.max / 1e6 } }));
    return;
  }
  if (url.pathname === "/api/replay") {
    const source = makeResponse(scenario, size);
    const rate = number(p, "rate", 60, 1, 120);
    const bytes = number(p, "chunkBytes", 256, 32, 1024);
    const hash = createHash("sha256").update(source).digest("hex");
    const messageId = "deterministic-openui-replay";
    res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache, no-transform", connection: "keep-alive", "x-source-chars": String(source.length), "x-source-sha256": hash });
    res.flushHeaders();
    const send = (event: object) => res.write(`data: ${JSON.stringify(event)}\n\n`);
    counters.replayActive++;
    send({ type: "TEXT_MESSAGE_START", messageId, role: "assistant" });
    let cursor = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let closed = false;
    const cleanup = () => { if (closed) return; closed = true; clearTimeout(timer); counters.replayActive--; };
    res.once("close", cleanup);
    const tick = () => {
      if (closed) return;
      const delta = source.slice(cursor, cursor + bytes);
      cursor += delta.length;
      const canContinue = send({ type: "TEXT_MESSAGE_CONTENT", messageId, delta });
      if (cursor >= source.length) {
        send({ type: "TEXT_MESSAGE_END", messageId });
        send({ type: "RUN_FINISHED", threadId: "replay", runId: "deterministic" });
        cleanup(); res.end(); return;
      }
      const schedule = () => { if (!closed) timer = setTimeout(tick, 1000 / rate); };
      if (canContinue) schedule(); else res.once("drain", schedule);
    };
    timer = setTimeout(tick, 1000 / rate);
    return;
  }
  if (url.pathname === "/ssr") {
    counters.requests++; counters.active++;
    const arm = p.get("arm") === "generated" ? "generated" : "baseline";
    const theme = p.get("theme") === "red" ? "red" : "blue";
    const delay = number(p, "delay", 25, 1, 5000);
    let ready = false;
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pending: Promise<void> | undefined;
    function Delayed() {
      if (!ready) {
        pending ||= new Promise<void>((resolve) => { timer = setTimeout(() => { ready = true; resolve(); }, delay); });
        throw pending;
      }
      return <section data-delayed="true" data-request-theme={theme}><BenchContent scenario={scenario} response={makeResponse(scenario, size)} isStreaming={false} accent={themes[theme]} /></section>;
    }
    const finish = (aborted: boolean) => {
      if (settled) return; settled = true; clearTimeout(timer);
      counters.active--; if (aborted) counters.aborted++; else counters.completed++;
    };
    const stream = renderToPipeableStream(
      <html><head><meta charSet="utf-8" /><title>Standalone React SSR diagnostic</title><link rel="stylesheet" href={`/${arm}.css`} /></head><body data-request-theme={theme}><header data-shell="true">Standalone Node React streaming SSR</header><Suspense fallback={<p data-pending="true">Loading OpenUI response</p>}><Delayed /></Suspense></body></html>,
      {
        onShellReady() { res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }); stream.pipe(res); },
        onShellError(error) { counters.renderErrors++; finish(true); res.writeHead(500); res.end(String(error)); },
        onError() { counters.renderErrors++; },
      },
    );
    res.once("finish", () => finish(false));
    res.once("close", () => { if (!res.writableFinished) { finish(true); stream.abort(); } });
    return;
  }
  const assets: Record<string, [string, string]> = {
    "/": ["real/index.html", "text/html"], "/replay": ["real/index.html", "text/html"],
    "/client.js": [".real-dist/client.js", "text/javascript"],
    "/baseline.css": [".real-dist/baseline.css", "text/css"],
    "/generated.css": [".real-dist/generated.css", "text/css"],
  };
  try {
    const asset = assets[url.pathname]; if (!asset) throw new Error("Unknown route");
    const body = await fs.readFile(path.join(root, asset[0]));
    res.writeHead(200, { "content-type": asset[1], "cache-control": "no-store" }); res.end(body);
  } catch { res.writeHead(404); res.end("Not found"); }
}).listen(port, "127.0.0.1", () => console.log(`Real OpenUI lab: http://127.0.0.1:${port}`));
