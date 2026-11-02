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

  // react-components' own convention: button.styles.ts exports buttonStyles, not a bare `styles`.
  it("export their rules as <name>Styles, like react-components", () => {
    const problems = styleFiles.filter((path) => {
      const text = read(path);
      const stem = path.split("/").pop()!.replace(/\.styles\.ts$/, "");
      return /^export const styles\b/m.test(text) || (/\bcss`/.test(text) && !new RegExp(`^export const ${stem}Styles\\b`, "m").test(text));
    });
    expect(problems.map(short)).toEqual([]);
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

  it("ships no stylesheet of its own", () => {
    expect(sourceFiles.filter((path) => path.endsWith(".css")).map(short)).toEqual([]);
  });

  it("writes its rules with react-components' css, so they share its style tag and layer", () => {
    expect(offenders(sourceFiles, /from "goober"/)).toEqual([]);
  });

  it("uses !important only in the photo row", () => {
    expect(offenders(styleFiles, /!important/)).toEqual(["components/Row/row.styles.ts"]);
  });
});

// Colours come from react-components' ThemeProvider, as its own components' do.
describe("the theme", () => {
  const tokens = read(join(src, "shared/tokens.ts"));

  it("is ThemeProvider's: the kit sets no global variables of its own", () => {
    expect(offenders(sourceFiles, /\bglob`|:where\(:root|\[data-theme="(light|dark)"\]\s*[,{]/)).toEqual([]);
  });

  it("reads each status colour from ThemeProvider's token for it", () => {
    for (const [kit, rc] of [
      ["success", "text-success-primary"],
      ["successSoft", "success-background"],
      ["warning", "text-alert-primary"],
      ["warningSoft", "alert-background"],
      ["danger", "text-danger-primary"],
      ["dangerSoft", "danger-background"],
      ["purple", "text-purple-primary"],
      ["purpleSoft", "purple-background"],
      ["pink", "text-pink-primary"],
      ["pinkSoft", "pink-background"],
    ]) {
      expect(tokens, kit).toMatch(new RegExp(`\\b${kit}: "var\\(--openui-intelligent-[a-z-]+, var\\(--openui-${rc},`));
    }
  });
});

describe("folders", () => {
  it("a library folder holds only its index and schema, except Svg's shapes and Map's places", () => {
    const problems = readdirSync(lib)
      .filter((name) => statSync(join(lib, name)).isDirectory() && /^[A-Z]/.test(name) && name !== "Svg")
      .flatMap((name) =>
        readdirSync(join(lib, name))
          .filter((file) => !["index.tsx", "index.ts", "schema.ts"].includes(file) && `${name}/${file}` !== "Map/places.ts")
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
    sideEffects: string[] | false;
    dependencies: Record<string, string>;
  };

  it("exports only the kit and its library", () => {
    expect(Object.keys(pkg.exports)).toEqual([".", "./lib"]);
  });

  it("has nothing to keep through tree-shaking", () => {
    expect(pkg.sideEffects).toBe(false);
  });

  it("leaves goober to react-components, whose css it uses", () => {
    expect(pkg.dependencies["goober"]).toBeUndefined();
  });
});
