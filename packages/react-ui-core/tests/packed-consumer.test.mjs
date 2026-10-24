import { build } from "esbuild";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const command = (file, args, cwd) =>
  execFileSync(file, args, {
    cwd,
    encoding: "utf8",
    stdio: "pipe",
    env: { ...process.env, npm_config_cache: path.join(tmpdir(), "openui-core-test-cache") },
  });

test(
  "packed root works outside the workspace and unused theme imports retain no runtime",
  { timeout: 120000 },
  async () => {
    const consumer = await fs.mkdtemp(path.join(tmpdir(), "openui-core-consumer-"));
    try {
      command("pnpm", ["pack", "--pack-destination", consumer], packageRoot);
      const tarball = (await fs.readdir(consumer)).find((name) => name.endsWith(".tgz"));
      assert(tarball, "Package tarball must exist");
      await fs.writeFile(
        path.join(consumer, "package.json"),
        JSON.stringify({
          private: true,
          type: "module",
          dependencies: {
            "@openuidev/react-ui-core": `file:./${tarball}`,
            react: "19.2.4",
            "react-dom": "19.2.4",
          },
          devDependencies: { "@types/react": "19.2.17", "@types/react-dom": "19.2.3" },
        }),
      );
      command("pnpm", ["install", "--offline", "--ignore-scripts", "--reporter=silent"], consumer);
      const runtime = `import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import * as core from '@openuidev/react-ui-core';
const cjs=createRequire(import.meta.url)('@openuidev/react-ui-core');
assert.equal(typeof core.ThemeProvider,'function');
assert.deepEqual(Object.keys(core).sort(),Object.keys(cjs).sort());
assert(Object.isFrozen(core.defaultLightTheme));
assert.throws(()=>createRequire(import.meta.url)('@openuidev/react-ui-core/ThemeProvider'),{code:'ERR_PACKAGE_PATH_NOT_EXPORTED'});`;
      await fs.writeFile(path.join(consumer, "runtime.mjs"), runtime);
      command(process.execPath, ["runtime.mjs"], consumer);
      const types = `import {createTheme,ThemeProvider,useTheme,useSystemThemeMode,useThemeModePreference,swatch,THEME_MODE_ATTRIBUTE} from '@openuidev/react-ui-core';
import type {Theme,ThemeMode,ThemeProps,ThemeModePreference,ColorTheme,TypographyTheme,LayoutTheme,EffectTheme,ChartColorPalette,ChartPaletteKey,BrandSwatchName,NeutralSwatchName} from '@openuidev/react-ui-core';
const theme:Theme=createTheme({interactiveAccentDefault:swatch('blue',500),barChartPalette:['#123456']});
const mode:ThemeMode='dark';const props:ThemeProps={mode,lightTheme:theme};
const preference:ThemeModePreference='system';
void [ThemeProvider,useTheme,useSystemThemeMode,useThemeModePreference,THEME_MODE_ATTRIBUTE,props,preference];`;
      for (const extension of ["mts", "cts", "ts"]) {
        await fs.writeFile(path.join(consumer, `consumer.${extension}`), types);
        command(
          "pnpm",
          [
            "exec",
            "tsc",
            "--noEmit",
            "--strict",
            "--target",
            "es2022",
            "--module",
            extension === "ts" ? "esnext" : "nodenext",
            "--moduleResolution",
            extension === "ts" ? "bundler" : "nodenext",
            path.join(consumer, `consumer.${extension}`),
          ],
          packageRoot,
        );
      }
      await fs.writeFile(
        path.join(consumer, "unused.mjs"),
        `import {ThemeProvider} from '@openuidev/react-ui-core'; console.log(42);`,
      );
      const bundle = await build({
        absWorkingDir: consumer,
        entryPoints: ["unused.mjs"],
        bundle: true,
        platform: "browser",
        format: "esm",
        minify: true,
        write: false,
        metafile: true,
      });
      assert.equal(bundle.outputFiles[0].text.trim(), "console.log(42);");
      const retained = Object.values(bundle.metafile.outputs).flatMap((output) =>
        Object.entries(output.inputs)
          .filter(([, value]) => value.bytesInOutput > 0)
          .map(([name]) => name),
      );
      assert(
        retained.every((name) => !name.includes("react-ui-core")),
        JSON.stringify(retained),
      );
    } finally {
      await fs.rm(consumer, { recursive: true, force: true });
    }
  },
);
