import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
const consumer = process.env.CORE_CONSUMER
  ? path.resolve(process.env.CORE_CONSUMER)
  : fileURLToPath(new URL("../../../../", import.meta.url));
test("layout root imports expose all public parts in native ESM and CommonJS", () => {
  const names = [
    "Card",
    "CardHeader",
    "Separator",
    "SectionV2",
    "FoldableSectionRoot",
    "FoldableSectionItem",
    "FoldableSectionTrigger",
    "FoldableSectionContent",
    "Skeleton",
    "PieChartSkeleton",
    "TableSkeleton",
    "DotMatrixLoader",
    "Accordion",
    "AccordionItem",
    "AccordionTrigger",
    "AccordionContent",
    "Carousel",
    "CarouselContent",
    "CarouselItem",
    "CarouselPrevious",
    "CarouselNext",
    "Steps",
    "StepsItem",
    "Tabs",
    "TabsList",
    "TabsTrigger",
    "TabsContent",
  ];
  for (const mode of ["module", "commonjs"]) {
    const load =
      mode === "module"
        ? `import * as core from '@openuidev/react-ui-core';`
        : `const core=require('@openuidev/react-ui-core');`;
    assert.equal(
      execFileSync(
        process.execPath,
        [
          "--input-type=" + mode,
          "-e",
          load +
            `for(const name of ${JSON.stringify(names)})if(!core[name])throw new Error('Missing '+name);console.log('passed');`,
        ],
        { cwd: consumer, encoding: "utf8" },
      ).trim(),
      "passed",
    );
  }
});
