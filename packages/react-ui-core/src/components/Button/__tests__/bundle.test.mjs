import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const consumer = process.env.CORE_CONSUMER
  ? path.resolve(process.env.CORE_CONSUMER)
  : fileURLToPath(new URL("../../../../", import.meta.url));
const requireTools = createRequire(
  path.resolve(process.env.CORE_BROWSER_TOOLS || consumer, "package.json"),
);
const { build } = requireTools("esbuild");
const bundle = (contents) =>
  build({
    stdin: { contents, resolveDir: consumer },
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    minify: true,
    metafile: true,
    external: ["react", "react-dom", "react/jsx-runtime"],
  });
const retained = (output) =>
  Object.values(output.metafile.outputs).flatMap((entry) =>
    Object.entries(entry.inputs)
      .filter(([, value]) => value.bytesInOutput > 0)
      .map(([name]) => name),
  );

test("a retained Button excludes theme tables and unrelated controls from an ESM consumer bundle", async () => {
  const result = await bundle('export {Button} from "@openuidev/react-ui-core"');
  const inputs = retained(result);
  assert(inputs.some((name) => name.includes("components/Button/Button")));
  for (const unrelated of ["defaultTheme", "swatches", "components/Input/", "components/TextArea/"])
    assert(!inputs.some((name) => name.includes(unrelated)), unrelated);
});

test("unused root imports do not retain components or the styling runtime", async () => {
  const result = await bundle(
    'import {Button, Input, TextArea, ThemeProvider} from "@openuidev/react-ui-core"; console.log("unused");',
  );
  const inputs = retained(result);
  assert(!inputs.some((name) => name.includes("react-ui-core") || name.includes("goober")));
});
