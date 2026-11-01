import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "..");
const kit = join(src, "..");
const built = existsSync(join(kit, "dist/lib/index.mjs"));

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return entry === "__tests__" ? [] : walk(path);
    return /\.tsx?$/.test(path) ? [path] : [];
  });
}

const run = (args: string[]) => execFileSync("node", args, { cwd: kit, encoding: "utf8", stdio: "pipe" }).trim();

describe("loading without a bundler", () => {
  it("has no static stylesheet import, which plain Node can't load", () => {
    const offenders = walk(src)
      .filter((path) => /^\s*import\s+(?:[^;]*\s+from\s+)?["'][^"']+\.css["']/m.test(readFileSync(path, "utf8")))
      .map((path) => relative(src, path));
    expect(offenders).toEqual([]);
  });

  // These read the build, so they only run once `pnpm build` has made one.
  it.skipIf(!built)("imports the built library in plain Node, and reads its spec", () => {
    const script = `const { library } = await import("./dist/lib/index.mjs"); console.log(library.toSpec().root);`;
    expect(run(["--input-type=module", "-e", script])).toBe("Col");
  });

  it.skipIf(!built)("requires the built library in plain Node, and reads its spec", () => {
    const script = `console.log(require("./dist/lib/index.cjs").library.toSpec().root);`;
    expect(run(["-e", script])).toBe("Col");
  });

  it.skipIf(!built)("imports the built root entry in plain Node", () => {
    const script = `const kit = await import("./dist/index.mjs"); console.log(typeof kit.MapView);`;
    expect(run(["--input-type=module", "-e", script])).toBe("function");
  });
});

describe("the street route's documented format", () => {
  const config = readFileSync(join(src, "shared/config.ts"), "utf8");
  const readme = readFileSync(join(kit, "README.md"), "utf8");
  const view = readFileSync(join(src, "components/Map/MapView.tsx"), "utf8");

  it("is what the Map actually sends: longitude first", () => {
    expect(view).toContain("`${p.lng},${p.lat}`");
    expect(config).toContain('"lng,lat;lng,lat"');
    expect(config).not.toContain('"lat,lng;lat,lng"');
  });

  it("is in the README, with what each route must answer", () => {
    expect(readme).toContain("lng,lat;lng,lat");
    expect(readme).toContain("{ points: [[lat, lng], ...] }");
    expect(readme).toContain("{ photos: [url, ...] }");
    expect(readme).toContain("{ images: [url, ...] }");
  });
});
