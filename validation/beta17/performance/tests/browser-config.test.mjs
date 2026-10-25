import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { browserLaunchOptions } from "../browser-config.mjs";

async function withPinnedBinary(check) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "beta17-browser-config-"));
  try {
    const bundlePath = path.join(root, "Synthetic.app");
    await fs.mkdir(path.join(bundlePath, "Contents", "MacOS"), { recursive: true });
    await fs.mkdir(path.join(bundlePath, "Contents", "Frameworks"), { recursive: true });
    const executablePath = path.join(bundlePath, "Contents", "MacOS", "synthetic-browser");
    const enginePath = path.join(bundlePath, "Contents", "Frameworks", "engine");
    await fs.writeFile(enginePath, "synthetic engine");
    await fs.symlink("engine", path.join(bundlePath, "Contents", "Frameworks", "current"));
    const bytes = "synthetic browser metadata test only";
    const executableSha256 = createHash("sha256").update(bytes).digest("hex");
    await fs.writeFile(executablePath, bytes);
    const manifest = {
      browser: {
        name: "chrome-for-testing",
        bundlePath,
        bundleSymlinks: { "Contents/Frameworks/current": "engine" },
        version: "156.0.8078.47",
        platform: "mac-arm64",
        source:
          "https://storage.googleapis.com/chrome-for-testing-public/156.0.8078.47/mac-arm64/chrome-mac-arm64.zip",
        executablePath,
        executableSha256,
      },
      inputs: {
        [executablePath]: executableSha256,
        [enginePath]: createHash("sha256").update("synthetic engine").digest("hex"),
      },
    };
    await check(manifest);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

test("a tampered browser executable is rejected before launch", async () => {
  await withPinnedBinary(async (manifest) => {
    await fs.appendFile(manifest.browser.executablePath, " changed");
    await assert.rejects(browserLaunchOptions(manifest), /hash|changed|identity/i);
  });
});

test("a browser hash outside the frozen input inventory is rejected", async () => {
  await withPinnedBinary(async (manifest) => {
    manifest.inputs = {};
    await assert.rejects(browserLaunchOptions(manifest), /inventory|frozen/i);
  });
});

test("complete official pinned metadata supplies ordinary Playwright launch options", async () => {
  await withPinnedBinary(async (manifest) => {
    assert.deepEqual(await browserLaunchOptions(manifest), {
      executablePath: manifest.browser.executablePath,
      headless: true,
    });
  });
});

test("missing browser metadata cannot fall back to mutable installed Chrome", async () => {
  await assert.rejects(browserLaunchOptions({ inputs: {} }), /pinned|browser/i);
});

test("browser provenance cannot point to an unrelated distribution", async () => {
  await withPinnedBinary(async (manifest) => {
    manifest.browser.source = "https://example.invalid/unverified.zip";
    await assert.rejects(browserLaunchOptions(manifest), /official|distribution/i);
  });
});

test("changing an engine resource invalidates an unchanged launcher executable", async () => {
  await withPinnedBinary(async (manifest) => {
    await fs.appendFile(
      path.join(manifest.browser.bundlePath, "Contents", "Frameworks", "engine"),
      " changed",
    );
    await assert.rejects(browserLaunchOptions(manifest), /bundle|hash|changed/i);
  });
});

test("unfrozen bundle files and changed symlink targets cannot be ignored", async () => {
  await withPinnedBinary(async (manifest) => {
    const extra = path.join(manifest.browser.bundlePath, "Contents", "unexpected-resource");
    await fs.writeFile(extra, "not frozen");
    await assert.rejects(browserLaunchOptions(manifest), /bundle|inventory|frozen/i);
    await fs.unlink(extra);
    const link = path.join(manifest.browser.bundlePath, "Contents", "Frameworks", "current");
    await fs.unlink(link);
    await fs.symlink("../MacOS/synthetic-browser", link);
    await assert.rejects(browserLaunchOptions(manifest), /symlink|bundle/i);
  });
});
