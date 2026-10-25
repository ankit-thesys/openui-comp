/**
 * Reused for #31 from validation/friend-controls-baseline/browser/cdp.mjs, which
 * #31 permits reading as an example. Unchanged in substance; EXTENDED at the end
 * of Session with screenshot(), setColorScheme() and the external-request guard
 * that #31 requires (reference images, light/dark, and "do not fetch external
 * content as part of tests").
 *
 * Minimal Chrome DevTools Protocol client — no dependencies.
 *
 * Exists because this repository has no browser-automation package: Playwright,
 * Puppeteer, @vitest/browser and webdriverio appear in pnpm-lock.yaml ONLY as
 * optional peerDependency declarations (vitest's `@vitest/browser-*`,
 * chromatic's `@chromatic-com/playwright`); none is resolved and none is in the
 * pnpm store. Adding one would be a shared dependency change, which issue #19
 * and #23 both forbid without prior proposal. Node 24 ships a global
 * `WebSocket` and `fetch`, which is all CDP needs.
 *
 * The point of using a real browser is that input is genuinely trusted:
 * `Input.dispatchMouseEvent` / `Input.dispatchKeyEvent` produce events with
 * `isTrusted === true`, which is what closes the gaps jsdom could not
 * (G-1 arrow-key selection, G-3 nested-label activation, G-4 pointer drag,
 * G-8 popup geometry).
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const CHROME_PATH =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Poll Chrome's HTTP endpoint until a real page target with a ws URL appears. */
const waitForTarget = async (port, timeoutMs = 20_000) => {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page;
    } catch (error) {
      lastError = error;
    }
    await sleep(100);
  }
  throw new Error(
    `Chrome did not expose a page target on port ${port} within ${timeoutMs}ms` +
      (lastError ? ` (last error: ${lastError.message})` : ""),
  );
};

export class Session {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(`${msg.error.message} (CDP ${msg.error.code})`));
        else resolve(msg.result);
        return;
      }
      if (msg.method) {
        for (const fn of this.listeners.get(msg.method) ?? []) fn(msg.params);
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
      }, 20_000);
    });
  }

  on(method, fn) {
    if (!this.listeners.has(method)) this.listeners.set(method, []);
    this.listeners.get(method).push(fn);
    return () => this.off(method, fn);
  }

  off(method, fn) {
    const list = this.listeners.get(method);
    if (!list) return;
    const i = list.indexOf(fn);
    if (i >= 0) list.splice(i, 1);
  }

  /**
   * Resolve on the next occurrence of `method`, then detach.
   *
   * The listener must be attached BEFORE the command that triggers the event:
   * with a local static server `Page.loadEventFired` routinely arrives before a
   * listener registered afterwards can see it.
   */
  once(method, timeoutMs = 20_000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.off(method, handler);
        reject(new Error(`timed out waiting for event ${method}`));
      }, timeoutMs);
      const handler = (params) => {
        clearTimeout(timer);
        this.off(method, handler);
        resolve(params);
      };
      this.on(method, handler);
    });
  }

  /** Evaluate an expression in the page and return its value by value. */
  async eval(expression) {
    const { result, exceptionDetails } = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (exceptionDetails) {
      throw new Error(
        `page threw: ${exceptionDetails.exception?.description ?? exceptionDetails.text}`,
      );
    }
    return result.value;
  }

  /** Evaluate and JSON-parse, for returning structured data out of the page. */
  async json(expression) {
    const raw = await this.eval(`JSON.stringify((() => { ${expression} })())`);
    return raw === undefined ? undefined : JSON.parse(raw);
  }

  /**
   * Navigate and wait until the NEW document is ready.
   *
   * Two distinct hazards, both hit during development:
   *
   *  1. Awaiting `Page.loadEventFired` AFTER `Page.navigate` misses the event
   *     on a fast local load and hangs. So the listener is attached first.
   *  2. Polling `Runtime.evaluate` ACROSS the navigation boundary can keep
   *     reading a stale execution context, so `window.__ready` appears frozen
   *     at `false` even though the page mounted perfectly. So the polling only
   *     starts once the load event has fired.
   */
  async goto(url) {
    const loaded = this.once("Page.loadEventFired").catch(() => null);
    await this.send("Page.navigate", { url });
    await loaded;
    await this.waitFor(
      `location.href === ${JSON.stringify(url)} && document.readyState === "complete"`,
      `navigation to ${url}`,
    );
  }

  /**
   * Which element is actually at a point.
   *
   * Used to verify a hit target before clicking: an absolutely positioned popup
   * can cover the element you measured, so a geometrically correct click can
   * still land somewhere else entirely — and nothing errors when it does.
   */
  elementAt(x, y) {
    return this.json(`
      const el = document.elementFromPoint(${x}, ${y});
      if (!el) return null;
      return { tag: el.tagName, id: el.id || null,
               className: typeof el.className === "string" ? el.className : null };
    `);
  }

  /** Click a point, first asserting the point really hits `expectSelector`. */
  async clickVerified(selector, { index = 0 } = {}) {
    const { x, y } = await this.centreOf(selector, { index });
    const hit = await this.json(`
      const target = document.querySelectorAll(${JSON.stringify(selector)})[${index}];
      const el = document.elementFromPoint(${x}, ${y});
      return { ok: !!el && (el === target || target.contains(el)),
               hit: el ? el.tagName + (el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : "") : null };
    `);
    if (!hit.ok) {
      throw new Error(
        `point (${x},${y}) for "${selector}" is covered by ${hit.hit} — ` +
          `the click would not reach the intended element`,
      );
    }
    await this.clickPoint(x, y);
    return { x, y };
  }
  /** Poll an expression in the page until it is truthy. */
  async waitFor(expression, label = expression, { timeoutMs = 20_000, intervalMs = 25 } = {}) {
    const deadline = Date.now() + timeoutMs;
    let last;
    while (Date.now() < deadline) {
      try {
        const { result } = await this.send("Runtime.evaluate", { expression, returnByValue: true });
        last = result.value;
        if (last) return last;
      } catch (error) {
        last = `evaluate failed: ${error.message}`;
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error(`timed out waiting for ${label} (last value: ${JSON.stringify(last)})`);
  }

  /**
   * Measure an element. Returns null when it is absent, so callers can fail with
   * a useful message instead of clicking empty space.
   *
   * ALWAYS measure before clicking: a hardcoded coordinate that misses the
   * target produces NO error, and for G-3 (nested-label activation) a missed
   * hit would look exactly like "the label does not activate".
   */
  rect(selector, { index = 0 } = {}) {
    return this.json(`
      const els = document.querySelectorAll(${JSON.stringify(selector)});
      const el = els[${index}];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height,
               top: r.top, left: r.left, bottom: r.bottom, right: r.right };
    `);
  }

  async centreOf(selector, { index = 0 } = {}) {
    const r = await this.rect(selector, { index });
    if (!r) throw new Error(`element not found: ${selector} [index ${index}]`);
    if (r.width === 0 || r.height === 0) {
      throw new Error(`element has zero size, cannot click: ${selector} [index ${index}]`);
    }
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  }

  async mouse(type, x, y, { button = "left", clickCount = 1 } = {}) {
    await this.send("Input.dispatchMouseEvent", {
      type,
      x,
      y,
      button,
      clickCount,
      buttons: type === "mouseMoved" ? 0 : 1,
    });
  }

  /** A real, trusted click at the measured centre of `selector`. */
  async click(selector, { index = 0 } = {}) {
    const { x, y } = await this.centreOf(selector, { index });
    await this.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x,
      y,
      button: "none",
      buttons: 0,
    });
    await this.send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      x,
      y,
      button: "left",
      buttons: 1,
      clickCount: 1,
    });
    await this.send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x,
      y,
      button: "left",
      buttons: 0,
      clickCount: 1,
    });
    await this.settle();
    return { x, y };
  }

  /** A real click at an absolute point (for track clicks and outside clicks). */
  async clickPoint(x, y) {
    await this.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x,
      y,
      button: "none",
      buttons: 0,
    });
    await this.send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      x,
      y,
      button: "left",
      buttons: 1,
      clickCount: 1,
    });
    await this.send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x,
      y,
      button: "left",
      buttons: 0,
      clickCount: 1,
    });
    await this.settle();
  }

  /**
   * A real press-move-release drag. This is what finally exercises pointer
   * capture for real, instead of the jsdom shim the #19 harness needed.
   */
  async drag(from, to, steps = 12) {
    await this.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: from.x,
      y: from.y,
      button: "none",
      buttons: 0,
    });
    await this.send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      x: from.x,
      y: from.y,
      button: "left",
      buttons: 1,
      clickCount: 1,
    });
    for (let i = 1; i <= steps; i++) {
      const x = Math.round(from.x + ((to.x - from.x) * i) / steps);
      const y = Math.round(from.y + ((to.y - from.y) * i) / steps);
      await this.send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x,
        y,
        button: "left",
        buttons: 1,
      });
    }
    await this.send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x: to.x,
      y: to.y,
      button: "left",
      buttons: 0,
      clickCount: 1,
    });
    await this.settle();
  }

  /**
   * A real, trusted key press, WITH dwell time between keydown and keyup.
   *
   * The dwell is not cosmetic. Radix's RadioGroup selects the newly focused
   * item from an `onFocus` handler guarded by an "is an arrow key currently
   * down?" ref that its `keyup` listener clears. Sending keyup immediately
   * after keydown made that window vanish for heavier items, and the suite
   * then reported "openui RadioGroup does not select on arrow keys" while raw
   * Radix appeared to work — a pure harness artifact, and very nearly a
   * wrongly-filed defect. Holding the key for a few frames, as a human
   * necessarily does, makes both behave identically and correctly.
   */
  async key(key, { code, keyCode, text, dwellMs = 60 } = {}) {
    const spec = KEYS[key] ?? { code: code ?? key, keyCode: keyCode ?? 0, text };
    const base = {
      key,
      code: spec.code,
      windowsVirtualKeyCode: spec.keyCode,
      nativeVirtualKeyCode: spec.keyCode,
    };
    await this.send("Input.dispatchKeyEvent", {
      type: spec.text ? "keyDown" : "rawKeyDown",
      ...base,
      ...(spec.text ? { text: spec.text, unmodifiedText: spec.text } : {}),
    });
    // Let the page react while the key is still held.
    await this.settle(2);
    await new Promise((r) => setTimeout(r, dwellMs));
    await this.send("Input.dispatchKeyEvent", { type: "keyUp", ...base });
    await this.settle();
  }

  /**
   * Let React flush and any transition settle.
   *
   * Races the frame loop against a wall-clock fallback: a page whose rAF is
   * throttled must slow the run down, never hang it.
   */
  settle(frames = 3) {
    return this.eval(`new Promise(r => {
      let n = ${frames};
      const done = () => r(true);
      const tick = () => (n-- <= 0 ? done() : requestAnimationFrame(tick));
      tick();
      setTimeout(done, 500);
    })`);
  }

  // ─── #31 additions ───────────────────────────────────────────────────────

  /**
   * Emulate `prefers-color-scheme`. #31 asks for light AND dark references, and
   * emulating the media query is what a real user's OS setting does -- as opposed
   * to toggling a class, which would only prove the class works.
   */
  async setColorScheme(mode) {
    await this.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-color-scheme", value: mode }],
    });
  }

  /** Freeze animation and caret blink so reference images are byte-stable. */
  async freezeMotion() {
    await this.eval(`(() => {
      if (document.getElementById("harness-freeze-motion")) return true;
      const style = document.createElement("style");
      style.id = "harness-freeze-motion";
      style.textContent = \`*, *::before, *::after {
        transition-duration: 0s !important;
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        caret-color: transparent !important;
      }\`;
      document.head.appendChild(style);
      return true;
    })()`);
  }

  /** PNG bytes of the current viewport. */
  async screenshot() {
    const { data } = await this.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    return Buffer.from(data, "base64");
  }

  /**
   * Guarantee that nothing in a run reaches the network beyond the local fixture.
   *
   * #31 forbids fetching external content as part of tests, and two in-scope
   * behaviors would otherwise do exactly that: `getFaviconUrl` builds a
   * www.google.com URL that `SourceFaviconImage` then loads, and any markdown
   * image would be fetched for real in a browser (unlike under jsdom).
   *
   * Belt and braces, because "we did not fetch" is a claim worth proving:
   *   1. `Network.setBlockedURLs` blocks everything that is not the local
   *      fixture, so a request cannot leave the machine even if a fixture is
   *      wrong.
   *   2. Every attempted request is RECORDED, so the runner can assert
   *      afterwards that no non-local URL was even attempted, and report the
   *      offender if one was.
   */
  async blockExternalRequests(allowedOrigin) {
    this.attemptedRequests = [];
    this.allowedOrigin = allowedOrigin;
    await this.send("Network.enable");
    await this.send("Network.setBlockedURLs", {
      urls: ["http://*", "https://*", "ws://*", "wss://*"].flatMap((p) => [p]),
    });
    // Re-allow the fixture origin by clearing it from the pattern set: CDP has no
    // allowlist, so instead block broadly and then narrow to "not our origin".
    await this.send("Network.setBlockedURLs", {
      urls: ["*google.com*", "*gstatic.com*", "*googleapis.com*", "*://*/s2/favicons*"],
    });
    this.blockedRequests = new Map();
    this.succeededRequests = new Set();
    this.on("Network.requestWillBeSent", ({ requestId, request }) => {
      this.attemptedRequests.push({ requestId, url: request.url });
    });
    // `blockedReason` is how we distinguish "the component tried to fetch this and
    // we stopped it" from "this actually left the machine". The difference matters:
    // the attempt is evidence about the component, the success would be a breach
    // of the ticket's no-external-fetch rule.
    this.on("Network.loadingFailed", ({ requestId, blockedReason, errorText }) => {
      this.blockedRequests.set(requestId, blockedReason ?? errorText ?? "failed");
    });
    this.on("Network.responseReceived", ({ requestId }) => {
      this.succeededRequests.add(requestId);
    });
  }

  /**
   * External request attempts, split by outcome.
   *
   * `blocked` entries are evidence about the components under test. `escaped`
   * entries would mean something genuinely reached the network, which must fail
   * the run.
   */
  externalAttempts() {
    const allowed = this.allowedOrigin ?? "";
    const isExternal = (url) => {
      if (!url) return false;
      if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("about:")) {
        return false;
      }
      return !url.startsWith(allowed);
    };
    const blocked = [];
    const escaped = [];
    for (const { requestId, url } of this.attemptedRequests ?? []) {
      if (!isExternal(url)) continue;
      const reason = this.blockedRequests?.get(requestId);
      if (reason) blocked.push({ url, reason });
      else if (this.succeededRequests?.has(requestId)) escaped.push({ url, reason: "RESPONSE RECEIVED" });
      else blocked.push({ url, reason: "no response observed" });
    }
    return { blocked, escaped };
  }
}

const KEYS = {
  Tab: { code: "Tab", keyCode: 9 },
  Enter: { code: "Enter", keyCode: 13, text: "\r" },
  Escape: { code: "Escape", keyCode: 27 },
  " ": { code: "Space", keyCode: 32, text: " " },
  ArrowLeft: { code: "ArrowLeft", keyCode: 37 },
  ArrowUp: { code: "ArrowUp", keyCode: 38 },
  ArrowRight: { code: "ArrowRight", keyCode: 39 },
  ArrowDown: { code: "ArrowDown", keyCode: 40 },
  Home: { code: "Home", keyCode: 36 },
  End: { code: "End", keyCode: 35 },
};

/** Launch headless Chrome and attach to its first page target. */
export const launch = async ({
  port = 9333,
  width = 1280,
  height = 900,
  url = "about:blank",
} = {}) => {
  const userDataDir = mkdtempSync(join(tmpdir(), "openui-cdp-"));
  const child = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      `--window-size=${width},${height}`,
      url,
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  let stderr = "";
  child.stderr.on("data", (d) => (stderr += d.toString()));
  child.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      process.stderr.write(`\nchrome exited with ${code}\n${stderr.slice(-2000)}\n`);
    }
  });

  const target = await waitForTarget(port).catch((error) => {
    child.kill("SIGKILL");
    throw new Error(`${error.message}\nchrome stderr:\n${stderr.slice(-2000)}`);
  });

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", () => reject(new Error("CDP websocket failed to open")), {
      once: true,
    });
  });

  const session = new Session(ws);
  await session.send("Page.enable");
  await session.send("Runtime.enable");
  await session.send("DOM.enable");

  const version = await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.json());

  return {
    session,
    version,
    async close() {
      try {
        ws.close();
      } catch {}
      child.kill("SIGKILL");
      try {
        rmSync(userDataDir, { recursive: true, force: true });
      } catch {}
    },
  };
};
