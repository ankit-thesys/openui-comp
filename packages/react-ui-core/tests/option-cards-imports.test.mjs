// Public JavaScript/Goober pruning; vendor math CSS delivery has separate Vite coverage.
import { build } from "esbuild";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { fileURLToPath } from "node:url";
const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const core = createRequire(new URL("../package.json", import.meta.url))("@openuidev/react-ui-core");
test("OptionCards root import retains its markdown and row helper without unrelated card implementations", async () => {
  assert(core.OptionCards, "OptionCards public root export");
  for (const name of ["Button", "OptionCards"]) {
    const result = await build({
      stdin: {
        contents: `import {${name}} from '@openuidev/react-ui-core'; console.log(${name});`,
        resolveDir: packageRoot,
      },
      bundle: true,
      external: ["*.css"],
      platform: "browser",
      format: "esm",
      minify: true,
      write: false,
      metafile: true,
      define: { "process.env.NODE_ENV": '"production"' },
    });
    const retained = Object.values(result.metafile.outputs).flatMap((out) =>
      Object.entries(out.inputs)
        .filter(([, v]) => v.bytesInOutput > 0)
        .map(([name]) => name),
    );
    assert(retained.some((file) => file.includes(`/components/${name}/`)));
    assert(
      retained.every(
        (file) =>
          !/(packages\/react-ui\/src|\/components\/(Charts|EditableTable|CompositeCardBlock|ContextCardBlock|OverviewCardBlock|SnippetCardBlock|VisualCardBlock)\/|\/cards\/CardBlockLayout)/.test(
            file,
          ),
      ),
      JSON.stringify(retained),
    );
    if (name === "Button")
      assert(retained.every((file) => !file.includes("/components/OptionCards/")));
    else {
      assert(retained.some((file) => file.includes("/InlineMarkdownRenderer/")));
      assert(retained.some((file) => file.includes("/cards/smallCardBlockUtils.")));
    }
  }
});
