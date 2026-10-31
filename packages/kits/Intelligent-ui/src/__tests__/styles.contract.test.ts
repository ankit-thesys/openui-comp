import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "..");
const components = join(src, "components");
const lib = join(src, "lib");

function walk(dir: string, accept: (path: string) => boolean): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return walk(path, accept);
    return accept(path) ? [path] : [];
  });
}

const styleFiles = walk(components, (path) => path.endsWith(".styles.ts"));
const sourceFiles = walk(src, (path) => /\.(tsx?|css)$/.test(path) && !path.includes("__tests__"));
const read = (path: string) => readFileSync(path, "utf8");
const short = (path: string) => relative(src, path);
const offenders = (files: string[], pattern: RegExp) => files.filter((path) => pattern.test(read(path))).map(short);

describe("style files", () => {
  it("each component with styles has one, exporting names", () => {
    expect(styleFiles.length).toBeGreaterThanOrEqual(30);
    expect(styleFiles.filter((path) => !/export const names\b/.test(read(path))).map(short)).toEqual([]);
  });

  it("name every stable class openui-intelligent-*", () => {
    const problems = styleFiles.flatMap((path) => {
      const names = read(path).match(/export const names = \{[\s\S]*?\n\} as const/)?.[0] ?? "";
      return [...names.matchAll(/:\s*"([^"]+)"/g)]
        .filter((match) => !match[1]!.startsWith("openui-intelligent-"))
        .map((match) => `${short(path)}: ${match[1]}`);
    });
    expect(problems).toEqual([]);
  });

  it("have no @layer and no state classes", () => {
    expect(offenders(styleFiles, /@layer/)).toEqual([]);
    expect(offenders(styleFiles, /&\.is-[a-z]/)).toEqual([]);
  });

  it("give every token a fallback", () => {
    const problems = styleFiles.flatMap((path) =>
      read(path)
        .split("\n")
        .filter((line) => /var\(--openui-[a-z0-9-]+\)/.test(line))
        .map((line) => `${short(path)}: ${line.trim()}`),
    );
    expect(problems).toEqual([]);
  });
});

describe("the source", () => {
  it("has none of the source app's old class and token names", () => {
    expect(offenders(sourceFiles, /\biui-|--iui-/)).toEqual([]);
  });

  it("has no selector react-components removed", () => {
    expect(offenders(sourceFiles, /\.openui-button-base/)).toEqual([]);
  });

  it("ships one stylesheet of its own, for the theme", () => {
    const sheets = sourceFiles.filter((path) => path.endsWith(".css")).map(short);
    expect(sheets).toEqual(["shared/theme.css"]);
  });

  it("imports that stylesheet where a single definition still gets it", () => {
    expect(read(join(src, "shared/tokens.ts"))).toContain('import "./theme.css"');
  });

  it("uses !important only in the photo row", () => {
    expect(offenders(styleFiles, /!important/)).toEqual(["components/Row/row.styles.ts"]);
  });
});

describe("the theme", () => {
  const theme = read(join(src, "shared/theme.css"));

  it("sets dark neutrals at zero weight, so a host's rule still wins", () => {
    expect(theme).toMatch(/:where\(\[data-theme="dark"\], :root\[data-openui-theme="dark"\]\)/);
  });

  it("has no @layer", () => {
    expect(theme).not.toContain("@layer");
  });
});

describe("folders", () => {
  it("a library folder holds only its index and schema, except Svg", () => {
    const problems = readdirSync(lib)
      .filter((name) => statSync(join(lib, name)).isDirectory() && /^[A-Z]/.test(name) && name !== "Svg")
      .flatMap((name) =>
        readdirSync(join(lib, name))
          .filter((file) => !["index.tsx", "schema.ts"].includes(file))
          .map((file) => `${name}/${file}`),
      );
    expect(problems).toEqual([]);
  });

  it("a binding draws no markup of its own", () => {
    const bindings = walk(lib, (path) => path.endsWith(".tsx") && !path.includes("/Svg/"));
    expect(offenders(bindings, /<(div|span|button|ul|li|p|img|a|section)[ >]/)).toEqual([]);
  });
});

describe("package.json", () => {
  const pkg = JSON.parse(read(join(src, "../package.json"))) as {
    exports: Record<string, unknown>;
    sideEffects: string[];
    dependencies: Record<string, string>;
  };

  it("exports only the kit and its library", () => {
    expect(Object.keys(pkg.exports)).toEqual([".", "./lib"]);
  });

  it("keeps stylesheet imports through tree-shaking", () => {
    expect(pkg.sideEffects).toEqual(["**/*.css"]);
  });

  it("pins goober, because the styles depend on how it compiles selectors", () => {
    expect(pkg.dependencies["goober"]).toBe("2.1.19");
  });
});
