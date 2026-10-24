import { build } from "esbuild";
import { JSDOM } from "jsdom";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
function command(file, args, cwd) {
  try {
    return execFileSync(file, args, {
      cwd,
      encoding: "utf8",
      stdio: "pipe",
      env: { ...process.env, npm_config_cache: path.join(tmpdir(), "openui-core-test-cache") },
    });
  } catch (error) {
    throw new Error(
      `${file} ${args.join(" ")} failed:\n${error.stdout || ""}${error.stderr || ""}`,
      { cause: error },
    );
  }
}

test(
  "packed controls and themes retain only used code and style themselves without CSS imports",
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
for(const name of ['Button','Input','TextArea'])assert(core[name],name);
assert.deepEqual(Object.keys(core).sort(),Object.keys(cjs).sort());
assert(Object.isFrozen(core.defaultLightTheme));
assert.throws(()=>createRequire(import.meta.url)('@openuidev/react-ui-core/ThemeProvider'),{code:'ERR_PACKAGE_PATH_NOT_EXPORTED'});`;
      await fs.writeFile(path.join(consumer, "runtime.mjs"), runtime);
      command(process.execPath, ["runtime.mjs"], consumer);
      const types = `import {createElement,createRef} from 'react';
import {Button,Input,TextArea,createTheme,ThemeProvider,useTheme,useSystemThemeMode,useThemeModePreference,swatch,THEME_MODE_ATTRIBUTE} from '@openuidev/react-ui-core';
import type {ButtonProps,InputProps,TextAreaProps,Theme,ThemeMode,ThemeProps,ThemeModePreference,ColorTheme,TypographyTheme,LayoutTheme,EffectTheme,ChartColorPalette,ChartPaletteKey,BrandSwatchName,NeutralSwatchName} from '@openuidev/react-ui-core';
const theme:Theme=createTheme({interactiveAccentDefault:swatch('blue',500),barChartPalette:['#123456']});
const mode:ThemeMode='dark';const props:ThemeProps={mode,lightTheme:theme};
const preference:ThemeModePreference='system';
const button:ButtonProps={variant:'primary',size:'small',buttonType:'destructive',disabled:true};
const input:InputProps={size:'large',styles:{padding:'12px'},hasError:true};
const textarea:TextAreaProps={rows:4,hasError:true};
createElement(Button,{...button,ref:createRef<HTMLButtonElement>()});
createElement(Input,{...input,ref:createRef<HTMLInputElement>()});
createElement(TextArea,{...textarea,ref:createRef<HTMLTextAreaElement>()});
// @ts-expect-error No new sx customization API.
const unsupported:ButtonProps={sx:{color:'red'}};
// @ts-expect-error Input retains named sizes rather than native numeric size.
const numeric:InputProps={size:4};
void [button,input,textarea,unsupported,numeric];
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
        `import {Button,Input,TextArea,ThemeProvider} from '@openuidev/react-ui-core'; console.log(42);`,
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
      await fs.writeFile(
        path.join(consumer, "button.mjs"),
        `import {Button} from '@openuidev/react-ui-core';
import {createElement} from 'react';import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';
window.mountButton=()=>{const root=createRoot(document.getElementById('app'));flushSync(()=>root.render(createElement(Button,null,'Save')));return()=>flushSync(()=>root.unmount());};`,
      );
      const buttonBundle = await build({
        absWorkingDir: consumer,
        entryPoints: ["button.mjs"],
        bundle: true,
        platform: "browser",
        format: "iife",
        minify: true,
        write: false,
        metafile: true,
        define: { "process.env.NODE_ENV": '"production"' },
      });
      const buttonInputs = Object.values(buttonBundle.metafile.outputs).flatMap((output) =>
        Object.entries(output.inputs)
          .filter(([, value]) => value.bytesInOutput > 0)
          .map(([name]) => name),
      );
      assert(
        buttonInputs.some((name) => name.includes("components/Button/")),
        JSON.stringify(buttonInputs),
      );
      assert(
        buttonInputs.every(
          (name) => !/(components\/(Input|TextArea|ThemeProvider)\/|\.(scss|css)$)/.test(name),
        ),
        JSON.stringify(buttonInputs),
      );
      const dom = new JSDOM(
        '<!doctype html><html><head></head><body><div id="app"></div></body></html>',
        { runScripts: "outside-only", pretendToBeVisual: true },
      );
      try {
        dom.window.eval(buttonBundle.outputFiles[0].text);
        const style = dom.window.document.querySelector("style");
        assert(
          style?.textContent.length > 0,
          "Referenced Button registers stock Goober styles on import",
        );
        assert.equal(dom.window.document.querySelectorAll('link[rel="stylesheet"]').length, 0);
        const unmount = dom.window.mountButton();
        const button = dom.window.document.querySelector("button");
        assert.equal(button?.textContent, "Save");
        assert.equal(dom.window.getComputedStyle(button).display, "flex");
        unmount();
        assert.equal(dom.window.document.querySelector("button"), null);
      } finally {
        dom.window.close();
      }
      await fs.writeFile(
        path.join(consumer, "themed-controls.mjs"),
        `import {Button,Input,TextArea,ThemeProvider,useTheme} from '@openuidev/react-ui-core';
import {createElement as h} from 'react';import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';
const root=createRoot(document.getElementById('app'));
function Content(){const {mode}=useTheme();return h('section',{'data-mode':mode},h(Button,null,'Save'),h(Input,{'aria-label':'Name',hasError:true}),h(TextArea,{'aria-label':'Message',rows:4}));}
window.updateTheme=(mode)=>flushSync(()=>root.render(h(ThemeProvider,{mode,lightTheme:{interactiveAccentDefault:'oklch(0.6 0.2 260 / 1)'},darkTheme:{interactiveAccentDefault:'oklch(0.4 0.15 260 / 1)'}},h(Content))));
window.unmountAll=()=>flushSync(()=>root.unmount());`,
      );
      const themedBundle = await build({
        absWorkingDir: consumer,
        entryPoints: ["themed-controls.mjs"],
        bundle: true,
        platform: "browser",
        format: "iife",
        minify: true,
        write: false,
        define: { "process.env.NODE_ENV": '"production"' },
      });
      const themedDOM = new JSDOM(
        '<!doctype html><html><head></head><body><div id="app"></div></body></html>',
        { runScripts: "outside-only", pretendToBeVisual: true },
      );
      try {
        const { window } = themedDOM;
        window.eval(themedBundle.outputFiles[0].text);
        for (const [mode, color] of [
          ["light", "oklch(0.6 0.2 260 / 1)"],
          ["dark", "oklch(0.4 0.15 260 / 1)"],
        ]) {
          window.updateTheme(mode);
          assert.equal(window.document.querySelector("section").dataset.mode, mode);
          assert.equal(
            window
              .getComputedStyle(window.document.body)
              .getPropertyValue("--openui-interactive-accent-default")
              .trim(),
            color,
          );
          assert.equal(window.document.querySelector("button").textContent, "Save");
          assert(window.document.querySelector("input").classList.contains("openui-input-error"));
          assert.equal(window.document.querySelector("textarea").rows, 4);
          assert.equal(window.document.querySelectorAll('link[rel="stylesheet"]').length, 0);
        }
        window.unmountAll();
        assert.equal(window.document.querySelectorAll("style[data-openui-theme]").length, 0);
      } finally {
        themedDOM.window.close();
      }
    } finally {
      await fs.rm(consumer, { recursive: true, force: true });
    }
  },
);
