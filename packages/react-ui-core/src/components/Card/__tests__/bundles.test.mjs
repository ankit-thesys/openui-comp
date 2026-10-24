import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
const consumer = process.env.CORE_CONSUMER
  ? path.resolve(process.env.CORE_CONSUMER)
  : fileURLToPath(new URL("../../../../", import.meta.url));
const { build } = createRequire(
  path.resolve(process.env.CORE_BROWSER_TOOLS || consumer, "package.json"),
)("esbuild");
for (const [name, excluded] of Object.entries({
  Card: ["CardHeader", "SectionBlock", "Skeleton", "DotMatrixLoader", "ThemeProvider"],
  CardHeader: ["Card", "Button", "IconButton", "Skeleton", "ThemeProvider"],
  Skeleton: ["TableSkeleton", "PieChartSkeleton", "Card", "DotMatrixLoader", "ThemeProvider"],
  TableSkeleton: ["PieChartSkeleton", "Card", "DotMatrixLoader", "ThemeProvider"],
  PieChartSkeleton: ["TableSkeleton", "Card", "DotMatrixLoader", "ThemeProvider"],
  DotMatrixLoader: ["Skeleton", "Card", "SectionBlock", "ThemeProvider"],
})) {
  test(`${name} root import prunes unrelated layout implementations and styles`, async () => {
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
    const retained = Object.values(result.metafile.outputs).flatMap((output) =>
      Object.entries(output.inputs)
        .filter(([, input]) => input.bytesInOutput > 0)
        .map(([file]) => file),
    );
    assert(
      retained.some((file) =>
        file.includes(
          `/components/${name === "TableSkeleton" || name === "PieChartSkeleton" ? "Skeleton" : name}/${name}.mjs`,
        ),
      ),
      name + " retained",
    );
    for (const other of excluded)
      assert(
        !retained.some(
          (file) =>
            file.includes(`/components/${other}/`) ||
            file.includes(`/components/Skeleton/${other}.mjs`),
        ),
        other + " pruned",
      );
    if (name === "Skeleton")
      assert(
        !result.outputFiles[0].text.includes("openui-skeleton-pie") &&
          !result.outputFiles[0].text.includes("openui-skeleton-table"),
        "unused skeleton variant styles pruned",
      );
  });
}
