import { defaultDarkTheme, defaultLightTheme } from "@openuidev/react-components";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it, vi } from "vitest";

/** Every rule the kit passes to goober, with interpolations filled in. */
const kitRules = vi.hoisted(() => [] as string[]);
vi.mock("goober", async (importOriginal) => {
  const goober = await importOriginal<typeof import("goober")>();
  return {
    ...goober,
    css: (strings: TemplateStringsArray, ...values: unknown[]) => {
      kitRules.push(String.raw({ raw: strings }, ...values));
      return "kit-class";
    },
  };
});

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "..");
const components = join(src, "components");

function walk(dir: string, accept: (path: string) => boolean): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return walk(path, accept);
    return accept(path) ? [path] : [];
  });
}

const styleFiles = walk(components, (path) => path.endsWith(".styles.ts"));
const sourceFiles = walk(src, (path) => /\.tsx?$/.test(path) && !path.includes("__tests__"));
const read = (path: string) => readFileSync(path, "utf8");
const short = (path: string) => relative(src, path);
const normalize = (text: string) =>
  text.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/,? \)/g, ")").trim();

/** Lines of CSS, without doc comments or one-line block comments. */
const cssLines = (path: string) =>
  read(path)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((line) => line.trim());

describe("style files", () => {
  const load = (path: string) => import(/* @vite-ignore */ path) as Promise<{ names?: unknown }>;

  beforeAll(async () => {
    await Promise.all(styleFiles.map(load));
  });

  it("all export names, and every stable class starts with openui-dashboard-", async () => {
    expect(styleFiles).toHaveLength(13);
    const flatten = (value: unknown): string[] =>
      typeof value === "string" ? [value] : Object.values(value as object).flatMap(flatten);

    for (const path of styleFiles) {
      const { names } = await load(path);
      expect(names, short(path)).toBeDefined();
      for (const name of flatten(names)) {
        expect(name, short(path)).toMatch(/^openui-dashboard(-|$)/);
      }
    }
  });

  it("have no @layer", () => {
    for (const path of styleFiles) expect(read(path), short(path)).not.toContain("@layer");
  });

  it("only nest a state on the class, or a listed override of react-components", () => {
    const allowed = [
      // A state on the class itself.
      /^&(:hover|:disabled|:checked|:focus-visible|\[data-[a-z-]+(="[^"]*")?\]) \{$/,
      // A wrapper class plus a react-components stable class.
      /^&\.openui-(card|text-block|radial-chart) \{$/,
      /^& \.openui-(metric-indicator-(row|main-value|subtext|trend)|date-picker(-trigger(\[data-placeholder\])?|-text)?|text-block-(primary|secondary)|tag|overview-card-block-card) \{$/,
      // FilterBar's sides hold the caller's filters, which can't take a class from the kit.
      /^& > \* \{$/,
    ];
    const problems = styleFiles.flatMap((path) =>
      cssLines(path)
        .filter((line) => line.startsWith("&") && !allowed.some((rule) => rule.test(line)))
        .map((line) => `${short(path)}: ${line}`),
    );
    expect(problems).toEqual([]);
  });

  it("give every openui token a fallback", () => {
    const problems = styleFiles.flatMap((path) =>
      cssLines(path)
        .filter((line) => /var\(--openui-[a-z0-9-]+\)/.test(line))
        .map((line) => `${short(path)}: ${line}`),
    );
    expect(problems).toEqual([]);
  });

  it("share no rule text with react-components", () => {
    // Goober reuses a class when two rules have the same text. A kit rule registers at import, so
    // it would move the matching react-components rule ahead of the rules it should beat. That
    // once turned TextBlock's green positive tone grey.
    const dist = join(here, "../../node_modules/@openuidev/react-components/dist/components");
    const reactComponentsRules = new Set(
      walk(dist, (path) => path.endsWith(".styles.mjs")).flatMap((path) =>
        [...read(path).matchAll(/css`([^`]*)`/g)].map((match) => normalize(match[1]!)),
      ),
    );
    expect(reactComponentsRules.size).toBeGreaterThan(100);
    expect(kitRules.length).toBeGreaterThan(50);
    expect(kitRules.map(normalize).filter((rule) => reactComponentsRules.has(rule))).toEqual([]);
  });
});

describe("source", () => {
  it("has no trace of the old c1 prefix or class names", () => {
    const old = /\bc1-|C1_CLASS_PREFIX|openui-card-card|renderer-floating|radial-chart-container/;
    const problems = sourceFiles.filter((path) => old.test(read(path))).map(short);
    expect(problems).toEqual([]);
  });

  it("keeps library folders to index and schema", () => {
    const lib = join(src, "lib");
    const exceptions = new Set(["Charts", "prompt-options"]);
    const problems = readdirSync(lib)
      .filter((entry) => statSync(join(lib, entry)).isDirectory() && !exceptions.has(entry))
      .flatMap((folder) =>
        readdirSync(join(lib, folder))
          .filter((file) => !/^(index\.tsx?|schema\.ts)$/.test(file))
          .map((file) => `${folder}/${file}`),
      );
    expect(problems).toEqual([]);
  });
});

describe("dashboard theme", () => {
  it("holds only typography tokens that differ from react-components", async () => {
    const { defaultDashboardDarkTheme, defaultDashboardLightTheme } =
      await import("../components/DashboardThemeProvider");
    expect(defaultDashboardDarkTheme).toEqual(defaultDashboardLightTheme);

    const tokens = Object.entries(defaultDashboardLightTheme);
    expect(tokens.length).toBeGreaterThan(0);
    const light = defaultLightTheme as Record<string, unknown>;
    const dark = defaultDarkTheme as Record<string, unknown>;

    for (const [key, value] of tokens) {
      expect(key).toMatch(/^(font|letterSpacing|text(Body|Heading|Label|Numbers|Code))/);
      expect(light, key).toHaveProperty(key);
      expect(value, key).not.toBe(light[key] === dark[key] ? light[key] : Symbol());
    }
  });
});
