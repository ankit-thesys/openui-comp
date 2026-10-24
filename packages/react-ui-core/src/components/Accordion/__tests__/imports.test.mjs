import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
const consumer = process.env.CORE_CONSUMER
  ? path.resolve(process.env.CORE_CONSUMER)
  : fileURLToPath(new URL("../../../../", import.meta.url));
const names = [
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
for (const format of ["module", "commonjs"])
  test(`native Node ${format} resolves all layout public parts from the installed root`, () => {
    const code =
      (format === "module"
        ? `import * as core from '@openuidev/react-ui-core';`
        : `const core=require('@openuidev/react-ui-core');`) +
      `for(const name of ${JSON.stringify(names)})if(!core[name])throw Error('Missing '+name);console.log('public parts resolved');`;
    const result = spawnSync(process.execPath, ["--input-type=" + format, "-e", code], {
      cwd: consumer,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    assert(result.stdout.includes("public parts resolved"));
  });
