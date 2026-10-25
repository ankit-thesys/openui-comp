import { build } from "esbuild";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const repo = fileURLToPath(new URL("../../..", import.meta.url));
const command = (file, args, cwd) => {
  try {
    return execFileSync(file, args, {
      cwd,
      encoding: "utf8",
      stdio: "pipe",
      env: {
        ...process.env,
        npm_config_cache: path.join(os.tmpdir(), "chat-kit-test-cache"),
        // Pack built artifacts without racing consumers through lifecycle rebuilds.
        npm_config_ignore_scripts: "true",
      },
    });
  } catch (error) {
    throw new Error(`${file} failed:\n${error.stdout ?? ""}${error.stderr ?? ""}`, {
      cause: error,
    });
  }
};

test(
  "normal packed consumer resolves both public entries and prunes unused library and components",
  { timeout: 180000 },
  async () => {
    const consumer =
      process.env.KIT_CONSUMER ?? (await fs.mkdtemp(path.join(os.tmpdir(), "chat-kit-consumer-")));
    try {
      if (!process.env.KIT_CONSUMER) {
        const dependencies = {
          react: "19.2.4",
          "react-dom": "19.2.4",
          zod: "4.4.3",
          zustand: "4.5.7",
        };
        for (const name of [
          "react-ui-core",
          "kits",
          "react-lang",
          "lang-core",
          "observability",
          "devtools",
        ]) {
          command(
            "pnpm",
            ["pack", "--pack-destination", consumer],
            path.join(repo, "packages", name),
          );
          const tar = (await fs.readdir(consumer)).find(
            (f) => f.startsWith(`openuidev-${name}-`) && f.endsWith(".tgz"),
          );
          assert(tar, `${name} tarball`);
          dependencies[`@openuidev/${name}`] = `file:./${tar}`;
        }
        await fs.writeFile(
          path.join(consumer, "package.json"),
          JSON.stringify({
            private: true,
            type: "module",
            dependencies,
            devDependencies: { "@types/react": "19.2.17", "@types/react-dom": "19.2.3" },
          }),
        );
        command("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], consumer);
      }
      const native = `import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import * as kit from '@openuidev/kits/react/chat';
import * as libs from '@openuidev/kits/react/chat/libs';
const require=createRequire(import.meta.url);
assert.deepEqual(Object.keys(kit).sort(),['FollowUpBlock','FollowUpItem','ModelSwitcher']);
assert.deepEqual(Object.keys(kit).sort(),Object.keys(require('@openuidev/kits/react/chat')).sort());
assert.deepEqual(Object.keys(libs).sort(),Object.keys(require('@openuidev/kits/react/chat/libs')).sort());
assert.equal(libs.openuiChatLibrary.root,'Card');
assert.throws(()=>require('@openuidev/kits'),{code:'ERR_PACKAGE_PATH_NOT_EXPORTED'});`;
      await fs.writeFile(path.join(consumer, "native.mjs"), native);
      command(process.execPath, ["native.mjs"], consumer);
      const types = `import {createElement,createRef} from 'react';
import {FollowUpItem,FollowUpBlock,ModelSwitcher,type ModelOption,type ModelSwitcherProps,type FollowUpItemProps} from '@openuidev/kits/react/chat';
import {openuiChatLibrary,openuiChatPromptOptions} from '@openuidev/kits/react/chat/libs';
import {Renderer} from '@openuidev/react-lang';
const models:ModelOption[]=[{id:'a',name:'A',logo:{light:'Sun',dark:'Moon'}}];
const props:ModelSwitcherProps={models,value:'a',onValueChange:console.log};
const item:FollowUpItemProps={text:'Next',disabled:true};
createElement(ModelSwitcher,props);
createElement(FollowUpBlock,null,createElement(FollowUpItem,{...item,ref:createRef<HTMLButtonElement>()}));
createElement(Renderer,{library:openuiChatLibrary,response:'root = Card([])'});
openuiChatLibrary.prompt(openuiChatPromptOptions);
// @ts-expect-error No new sx API.
const invalid:FollowUpItemProps={text:'Next',sx:{color:'red'}};
void invalid;`;
      for (const extension of ["mts", "cts", "ts"]) {
        const file = path.join(consumer, `types.${extension}`);
        await fs.writeFile(file, types);
        command(
          process.execPath,
          [
            require.resolve("typescript/bin/tsc"),
            "--noEmit",
            "--strict",
            "--target",
            "es2022",
            "--module",
            extension === "ts" ? "esnext" : "nodenext",
            "--moduleResolution",
            extension === "ts" ? "bundler" : "nodenext",
            file,
          ],
          consumer,
        );
      }
      for (const [name, source] of Object.entries({
        unused: `import {ModelSwitcher,FollowUpItem} from '@openuidev/kits/react/chat'; console.log(42);`,
        selected: `import {FollowUpItem} from '@openuidev/kits/react/chat'; console.log(FollowUpItem);`,
      })) {
        await fs.writeFile(path.join(consumer, `${name}.mjs`), source);
        const bundle = await build({
          absWorkingDir: consumer,
          entryPoints: [`${name}.mjs`],
          bundle: true,
          platform: "browser",
          format: "esm",
          minify: true,
          write: false,
          metafile: true,
          external: ["*.css"],
        });
        if (name === "unused") assert.equal(bundle.outputFiles[0].text.trim(), "console.log(42);");
        for (const input of Object.keys(bundle.metafile.inputs)) {
          // Inputs may be parsed by the bundler but must contribute no retained bytes.
          if (/react-lang|openuiChatLibrary|ModelSwitcher|Charts\//.test(input)) {
            assert.equal(
              Object.values(bundle.metafile.outputs).reduce(
                (sum, output) => sum + (output.inputs[input]?.bytesInOutput ?? 0),
                0,
              ),
              0,
              input,
            );
          }
        }
        if (name === "selected") assert.match(bundle.outputFiles[0].text, /break-spaces/);
      }
    } finally {
      if (!process.env.KIT_CONSUMER) await fs.rm(consumer, { recursive: true, force: true });
    }
  },
);
