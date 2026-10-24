import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
const packageRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const consumer = path.resolve(process.env.CORE_CONSUMER || packageRoot);
const { build } = createRequire(
  path.resolve(process.env.CORE_BROWSER_TOOLS || packageRoot, "package.json"),
)("esbuild");
for (const [name, excluded] of Object.entries({
  Button: [
    "Table",
    "CodeBlock",
    "MarkDownRenderer",
    "InlineMarkdownRenderer",
    "Sources",
    "Citation",
    "ImageGallery",
  ],
  Table: [
    "CodeBlock",
    "MarkDownRenderer",
    "InlineMarkdownRenderer",
    "Sources",
    "Citation",
    "ImageGallery",
  ],
  ScrollableTable: [
    "CodeBlock",
    "MarkDownRenderer",
    "InlineMarkdownRenderer",
    "Sources",
    "Citation",
    "ImageGallery",
  ],
  CodeBlock: [
    "Table",
    "MarkDownRenderer",
    "InlineMarkdownRenderer",
    "Sources",
    "Citation",
    "ImageGallery",
  ],
  MarkDownRenderer: ["InlineMarkdownRenderer", "Sources", "Citation", "ImageGallery"],
})) {
  test(`${name}-only import excludes unrelated text, table and media code/styles`, async () => {
    const result = await build({
      stdin: {
        contents: `export {${name}} from '@openuidev/react-ui-core';`,
        resolveDir: consumer,
      },
      bundle: true,
      write: false,
      minify: true,
      metafile: true,
      format: "esm",
      platform: "browser",
      external: ["react", "react-dom", "react/jsx-runtime"],
    });
    const inputs = Object.values(result.metafile.outputs).flatMap((o) =>
      Object.entries(o.inputs)
        .filter(([, v]) => v.bytesInOutput > 0)
        .map(([p]) => p),
    );
    assert(
      inputs.some(
        (p) =>
          p.includes(`/components/Table/${name}.mjs`) ||
          p.includes(`/components/${name}/${name}.mjs`),
      ),
      name + " implementation retained",
    );
    for (const other of excluded)
      assert(!inputs.some((p) => p.includes("/components/" + other + "/")), other + " excluded");
    const text = result.outputFiles[0].text;
    for (const marker of [
      "openui-inline-markdown-renderer",
      "openui-citation-tooltip",
      "openui-image-gallery",
    ])
      assert(!text.includes(marker), marker + " styles excluded");
    if (name === "Button" || name === "Table")
      assert(
        !inputs.some((p) => p.includes("react-syntax-highlighter")),
        "unused highlighter and theme data excluded",
      );
    if (name === "Table")
      assert(
        !text.includes("openui-scrollable-table-control"),
        "primitive-only Table excludes scroll control styles",
      );
    assert(!inputs.some((p) => p.includes("packages/react-ui/src/")), "old source excluded");
  });
}
