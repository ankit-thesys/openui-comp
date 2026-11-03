import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { libraryDir, testsDir } from "./cli";

/**
 * #199 stories 6–9. The frozen install and the build are CI steps before this run; these check the
 * built package the way a registry and an app see it.
 */
const run = (command: string, args: string[], cwd: string) => {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  return {
    status: result.status,
    stdout: result.stdout.trim(),
    output: `${result.stdout}${result.stderr}`.trim(),
  };
};

test.describe("the built package", () => {
  test("imports in plain Node", () => {
    const script = `const m = await import("@openuidev/intelligent-ui-library"); console.log(m.library.toSpec().root, typeof m.ThemeProvider);`;
    expect(run(process.execPath, ["--input-type=module", "-e", script], testsDir)).toMatchObject({
      status: 0,
      output: "Col function",
    });
  });

  test("requires in plain Node", () => {
    const script = `const m = require("@openuidev/intelligent-ui-library"); console.log(m.library.toSpec().root, typeof m.ThemeProvider);`;
    expect(run(process.execPath, ["-e", script], testsDir)).toMatchObject({
      status: 0,
      output: "Col function",
    });
  });

  test("passes publint", () => {
    const result = run("pnpm", ["run", "check:publint"], libraryDir);
    expect(result.status, result.output).toBe(0);
  });

  test("passes attw in every module system", () => {
    const result = run("pnpm", ["run", "check:attw"], libraryDir);
    expect(result.status, result.output).toBe(0);
    expect(result.output).toContain("No problems found");
  });

  test("packs only dist and the README, under its name", () => {
    // npm runs the package's prepare (a build) even for a dry run, and prints it before the JSON.
    const result = run("npm", ["pack", "--dry-run", "--json"], libraryDir);
    expect(result.status, result.output).toBe(0);
    const [pack] = JSON.parse(result.stdout.slice(result.stdout.search(/^\[/m))) as {
      name: string;
      files: { path: string }[];
    }[];
    const paths = pack!.files.map((file) => file.path);
    expect(pack!.name).toBe("@openuidev/intelligent-ui-library");
    expect(
      paths.filter(
        (path) => !path.startsWith("dist/") && path !== "README.md" && path !== "package.json",
      ),
    ).toEqual([]);
    expect(paths).toEqual(
      expect.arrayContaining([
        "README.md",
        "dist/index.mjs",
        "dist/index.cjs",
        "dist/index.d.mts",
        "dist/index.d.cts",
      ]),
    );
  });

  test("documents the street route's format and what each route answers", () => {
    // The README ships in the tarball, so it is part of what an app reads.
    const readme = readFileSync(join(libraryDir, "README.md"), "utf8");
    expect(readme).toContain("lng,lat;lng,lat");
    expect(readme).toContain("{ points: [[lat, lng], ...] }");
    expect(readme).toContain("{ photos: [url, ...] }");
    expect(readme).toContain("{ images: [url, ...] }");
  });
});

test.describe("an app's TypeScript", () => {
  const readme = () => readFileSync(join(libraryDir, "README.md"), "utf8");
  // The README's code blocks that import the library: what an app copies first.
  const samples = () =>
    [...readme().matchAll(/^```(tsx?)\n([\s\S]*?)^```$/gm)]
      .filter((match) => match[2]!.includes('"@openuidev/intelligent-ui-library"'))
      .map((match) => ({ ext: match[1]!, code: match[2]! }));
  const tsc = createRequire(join(testsDir, "package.json")).resolve("typescript/bin/tsc");

  test("finds the README's samples", () => {
    // The re-export for the CLI and the Renderer usage come first; later ones (configuration) follow.
    expect(
      samples()
        .map((sample) => sample.ext)
        .slice(0, 2),
    ).toEqual(["ts", "tsx"]);
  });

  for (const resolution of ["Bundler", "NodeNext"]) {
    test(`compiles the README's samples against the published types (${resolution})`, () => {
      // Inside the test package, so the library resolves through its package.json to dist.
      const dir = test.info().outputPath("consumer");
      mkdirSync(dir, { recursive: true });
      samples().forEach((sample, index) =>
        writeFileSync(join(dir, `readme-${index + 1}.${sample.ext}`), sample.code),
      );
      writeFileSync(
        join(dir, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: {
            strict: true,
            noEmit: true,
            jsx: "react-jsx",
            target: "ES2022",
            module: resolution === "Bundler" ? "ESNext" : "NodeNext",
            moduleResolution: resolution,
            // A syntax error in a published .d.ts is still reported; this skips type errors
            // inside dependencies' own declarations (react-components' goober has one).
            skipLibCheck: true,
            types: [],
          },
          include: ["*.ts", "*.tsx"],
        }),
      );
      const result = run(process.execPath, [tsc, "-p", dir], testsDir);
      expect(result.status, result.output).toBe(0);
    });
  }
});
