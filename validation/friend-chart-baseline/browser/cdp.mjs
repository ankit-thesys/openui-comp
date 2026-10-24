/**
 * A minimal Chrome DevTools Protocol client — no dependencies.
 *
 * Why hand-rolled: there is no Playwright, Puppeteer, @vitest/browser or
 * webdriverio anywhere in this workspace's lockfile, and this ticket forbids
 * unproposed dependency changes. Node 24 ships a global `WebSocket`, and CDP
 * is plain JSON-RPC over it, so the whole client is about a hundred lines.
 *
 * What this buys over dispatching synthetic events from inside the page:
 * `Input.dispatchMouseEvent` / `Input.dispatchKeyEvent` produce input at the
 * BROWSER level, so the page sees `event.isTrusted === true` and the real hit
 * target is exercised. A synthetic `new MouseEvent(...)` dispatched on an
 * element Claude picked cannot miss, which means it also cannot DETECT a
 * mis-targeted or overlapped control — exactly the failure mode that matters
 * for legend toggles.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Poll a function until it returns a truthy value, or throw after `timeout`. */
export async function waitFor(fn, { timeout = 15000, interval = 100, what = "condition" } = {}) {
  const deadline = Date.now() + timeout;
  let lastErr;
  while (Date.now() < deadline) {
    try {
      const v = await fn();
      if (v) return v;
    } catch (e) {
      lastErr = e;
    }
    await sleep(interval);
  }
  throw new Error(`Timed out after ${timeout}ms waiting for ${what}${lastErr ? `: ${lastErr.message}` : ""}`);
}

export class Browser {
  constructor(proc, ws, userDataDir) {
    this.proc = proc;
    this.ws = ws;
    this.userDataDir = userDataDir;
    this.nextId = 1;
    this.pending = new Map();
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(`${msg.error.message} (${JSON.stringify(msg.error.data ?? null)})`));
        else resolve(msg.result);
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 30000);
    });
  }

  /** Evaluate an expression in the page and return its value by value. */
  async evaluate(expression) {
    const { result, exceptionDetails } = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (exceptionDetails) {
      const text = exceptionDetails.exception?.description ?? exceptionDetails.text;
      throw new Error(`Page evaluation threw: ${text}`);
    }
    return result.value;
  }

  /** Evaluate a function body that returns a JSON-serializable value. */
  async run(fnSource, ...args) {
    const call = `(${fnSource})(${args.map((a) => JSON.stringify(a)).join(",")})`;
    return this.evaluate(call);
  }

  async goto(url) {
    await this.send("Page.navigate", { url });
    // Page.navigate resolves on commit, not on load; wait for the document to
    // finish and for React to have mounted something.
    await waitFor(async () => (await this.evaluate("document.readyState")) === "complete", {
      what: `${url} to finish loading`,
    });
  }

  /** The viewport-space centre of an element, or null when it is not there. */
  async centreOf(selector) {
    return this.run(
      `(sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return null;
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, width: r.width, height: r.height };
      }`,
      selector,
    );
  }

  /**
   * A REAL left click at viewport coordinates.
   *
   * Coordinates must be measured, never hardcoded: a click at a guessed point
   * lands on whatever is actually there and silently does nothing if that is
   * not the control — which for a legend toggle is indistinguishable from
   * "this family does not support toggling".
   */
  async click(x, y) {
    const base = { x: Math.round(x), y: Math.round(y), button: "left", clickCount: 1 };
    await this.send("Input.dispatchMouseEvent", { type: "mouseMoved", ...base, button: "none" });
    await this.send("Input.dispatchMouseEvent", { type: "mousePressed", ...base });
    await this.send("Input.dispatchMouseEvent", { type: "mouseReleased", ...base });
  }

  async clickSelector(selector) {
    const box = await this.centreOf(selector);
    if (!box) throw new Error(`Cannot click: no visible element matches ${selector}`);
    await this.click(box.x, box.y);
    return box;
  }

  async mouseMove(x, y) {
    await this.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: Math.round(x),
      y: Math.round(y),
      button: "none",
    });
  }

  /** A REAL key press. */
  async pressKey(key, code, windowsVirtualKeyCode) {
    const base = { key, code, windowsVirtualKeyCode, nativeVirtualKeyCode: windowsVirtualKeyCode };
    await this.send("Input.dispatchKeyEvent", { type: "keyDown", ...base });
    await this.send("Input.dispatchKeyEvent", { type: "keyUp", ...base });
  }

  async setColorScheme(value) {
    await this.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-color-scheme", value }],
    });
  }

  async setViewport(width, height) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
  }

  async screenshot() {
    const { data } = await this.send("Page.captureScreenshot", { format: "png" });
    return Buffer.from(data, "base64");
  }

  async close() {
    try {
      this.ws.close();
    } catch {
      /* already gone */
    }
    this.proc.kill("SIGTERM");
    await sleep(200);
    try {
      rmSync(this.userDataDir, { recursive: true, force: true });
    } catch {
      /* best effort */
    }
  }
}

/**
 * An OS-assigned free port.
 *
 * A fixed debug port is a real hazard: `launch` finds Chrome by polling
 * `/json/list` on that port, so a STALE Chrome left listening there is
 * indistinguishable from the one just spawned. The run then drives a browser
 * whose page target is gone and dies on an unrelated CDP call several minutes
 * in — which is exactly how this surfaced.
 */
async function freePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.once("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

/** Launch headless Chrome and attach to its first page target. */
export async function launch({ port, width = 1280, height = 900, url = "about:blank" } = {}) {
  port ??= await freePort();
  const userDataDir = mkdtempSync(join(tmpdir(), "chart-baseline-chrome-"));
  const proc = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-timer-throttling",
      "--force-device-scale-factor=1",
      `--window-size=${width},${height}`,
      url,
    ],
    { stdio: "ignore" },
  );

  const wsUrl = await waitFor(
    async () => {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      return page?.webSocketDebuggerUrl;
    },
    { what: "Chrome's debugging endpoint", timeout: 20000 },
  );

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", () => reject(new Error("WebSocket to Chrome failed")), { once: true });
  });

  const browser = new Browser(proc, ws, userDataDir);
  await browser.send("Page.enable");
  await browser.send("Runtime.enable");
  return browser;
}

export async function chromeVersion() {
  return new Promise((resolve) => {
    const p = spawn(CHROME, ["--version"], { stdio: ["ignore", "pipe", "ignore"] });
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.on("close", () => resolve(out.trim() || "unknown"));
  });
}
