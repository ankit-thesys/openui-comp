import { intelligentComponents, library, promptOptions } from "@openuidev/intelligent-ui-library";
import { createParser } from "@openuidev/react-lang";
import { expect, test } from "@playwright/test";
import { examplesIn, generate, warnings, type Generated } from "./cli";

let generated: Generated | undefined;
const cli = () => (generated ??= generate());

test.describe("the CLI's system prompt", () => {
  test("is generated from the README's one-line re-export", () => {
    const { status, output, prompt } = cli();
    expect(status, output).toBe(0);
    // The CLI ends the file with a newline.
    expect(prompt.trimEnd()).toBe(library.prompt(promptOptions).trimEnd());
  });

  test("prints no warning beyond MapLibre's import.meta one", () => {
    // The Map resolves maplibre-gl's worker with import.meta.url, which esbuild empties in the CLI's cjs bundle.
    const known = (warning: string) =>
      /import\.meta/.test(warning) && /maplibre-gl-worker/.test(warning);
    const { output } = cli();
    expect(warnings(output).filter((warning) => !known(warning))).toEqual([]);
    expect(output).not.toMatch(/\[ERROR\]/);
  });

  test("names every component with its signature", () => {
    const { prompt } = cli();
    const names = Object.keys(library.components);
    expect(names).toHaveLength(intelligentComponents.length);
    expect(names.filter((name) => !prompt.includes(`\n${name}(`))).toEqual([]);
  });

  test("names every @function and the library's action", () => {
    const { prompt } = cli();
    const functions = Object.keys(library.functions ?? {});
    expect(functions.length).toBeGreaterThan(0);
    expect(functions.filter((name) => !prompt.includes(`\n@${name}(`))).toEqual([]);
    const actions = Object.keys(library.actions ?? {});
    expect(actions.filter((name) => !prompt.includes(`@${name}(`))).toEqual([]);
  });

  test("only changes on purpose", () => {
    // After a deliberate prompt change: pnpm test:prompt --update-snapshots, and review the diff.
    expect(cli().prompt).toMatchSnapshot("prompt.txt");
  });
});

test.describe("the prompt's examples", () => {
  const parser = createParser(library.toJSONSchema(), library.root);

  test("are the library's examples, all of them", () => {
    const found = examplesIn(cli().prompt);
    expect(found.length).toBeGreaterThan(0);
    const exported = promptOptions.examples ?? [];
    expect(found).toHaveLength(exported.length);
    // Each exported example is its "Example N: ..." heading followed by the code.
    found.forEach((code, index) => expect(exported[index]).toContain(code));
  });

  test("each parse with a Col root, and no errors, unresolved or orphaned nodes", () => {
    const results = examplesIn(cli().prompt).map((code, index) => {
      const { root, meta } = parser.parse(code);
      return {
        example: index + 1,
        root: root?.typeName ?? null,
        incomplete: meta.incomplete,
        errors: meta.errors,
        unresolved: meta.unresolved,
        orphaned: meta.orphaned,
      };
    });
    expect(results).toEqual(
      results.map(({ example }) => ({
        example,
        root: "Col",
        incomplete: false,
        errors: [],
        unresolved: [],
        orphaned: [],
      })),
    );
  });
});

test.describe("the checks themselves", () => {
  // A parser that stops finding things would let every check above pass, so feed it known input.
  test("find every warning block, and keep only the known one out", () => {
    const output = [
      "Written System Prompt to out.txt",
      '▲ [WARNING] "import.meta" is not available with the "cjs" output format and will be empty [empty-import-meta]',
      '    dist/components/Map/parts/basemap.mjs:8:70: new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url)',
      '▲ [WARNING] Ignoring this import because "x.mjs" was marked as having no side effects [ignored-bare-import]',
      "    dist/lib/library.mjs:2:7:",
    ].join("\n");
    const found = warnings(output);
    expect(found).toHaveLength(2);
    expect(found[1]).toContain("ignored-bare-import");
  });

  test("split the prompt's examples and flag an orphaned or unresolved one", () => {
    const prompt = [
      "## Examples",
      "",
      "Example 1: one:",
      "",
      'root = Col([Text("a")])',
      'extra = Text("b")',
      "",
      "Example 2: two:",
      "",
      "root = Card([missing])",
      "",
      "## Important Rules",
    ].join("\n");
    const found = examplesIn(prompt);
    expect(found).toHaveLength(2);
    const parser = createParser(library.toJSONSchema(), library.root);
    expect(parser.parse(found[0]!).meta.orphaned).toEqual(["extra"]);
    const second = parser.parse(found[1]!);
    expect(second.meta.unresolved).toEqual(["missing"]);
    expect(second.root?.typeName).toBe("Card");
  });
});
