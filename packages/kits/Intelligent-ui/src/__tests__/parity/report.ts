/**
 * Writes a side-by-side page from two sets of screenshots and two captures, for a person to look at.
 *
 *   PARITY_KIT=/kit.json PARITY_SHOTS=/shots PARITY_REPORT=/out node src/__tests__/parity/report.ts
 *
 * PARITY_SHOTS holds source/ and kit/ folders of PNGs, from the two capture scripts.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { compareFlow, compareFunctional, compareVisual, type Difference } from "./compare.ts";
import { FIXTURES, launch, MODES, programs } from "./driver.ts";

const kitFile = process.env.PARITY_KIT;
const shots = process.env.PARITY_SHOTS;
const out = process.env.PARITY_REPORT;
if (!kitFile || !shots || !out) throw new Error("Set PARITY_KIT, PARITY_SHOTS and PARITY_REPORT");

type Capture = {
  visual: Record<string, Record<string, Parameters<typeof compareVisual>[2]>>;
  functional: Record<string, Parameters<typeof compareFunctional>[1]>;
  flows: Record<string, Parameters<typeof compareFlow>[1]>;
};
const source = JSON.parse(readFileSync(path.join(FIXTURES, "source-baseline.json"), "utf8")) as Capture;
const kit = JSON.parse(readFileSync(kitFile, "utf8")) as Capture;

const differences: Difference[] = [];
for (const program of programs) {
  for (const mode of MODES) {
    differences.push(
      ...compareVisual(program.id, mode.id, source.visual[program.id]![mode.baseline]!, kit.visual[program.id]![mode.id]!),
    );
  }
  differences.push(...compareFunctional(program.id, source.functional[program.id]!, kit.functional[program.id]!));
}

for (const id of Object.keys(source.flows)) differences.push(...compareFlow(id, source.flows[id]!, kit.flows[id]!));

mkdirSync(path.join(out, "shots"), { recursive: true });

/** The share of pixels that differ, measured in the browser so no image library is needed. */
const browser = await launch();
const page = await browser.newPage();
const dataUrl = (file: string) => `data:image/png;base64,${readFileSync(file).toString("base64")}`;
const pixels: Record<string, number> = {};
for (const file of readdirSync(path.join(shots, "source"))) {
  const a = path.join(shots, "source", file);
  const b = path.join(shots, "kit", file);
  if (!existsSync(b)) continue;
  pixels[file] = (await page.evaluate(
    async ([left, right]) => {
      const load = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = src;
        });
      const [one, two] = await Promise.all([load(left!), load(right!)]);
      const width = Math.max(one.width, two.width);
      const height = Math.max(one.height, two.height);
      const read = (image: HTMLImageElement) => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d")!;
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, width, height).data;
      };
      const [p, q] = [read(one), read(two)];
      let differing = 0;
      for (let i = 0; i < p.length; i += 4) {
        const gap = Math.max(
          Math.abs(p[i]! - q[i]!),
          Math.abs(p[i + 1]! - q[i + 1]!),
          Math.abs(p[i + 2]! - q[i + 2]!),
          Math.abs(p[i + 3]! - q[i + 3]!),
        );
        if (gap > 32) differing++;
      }
      return differing / (p.length / 4);
    },
    [dataUrl(a), dataUrl(b)],
  )) as number;
  copyFileSync(a, path.join(out, "shots", `source--${file}`));
  copyFileSync(b, path.join(out, "shots", `kit--${file}`));
}
await browser.close();

writeFileSync(path.join(out, "differences.json"), JSON.stringify(differences, null, 1));
writeFileSync(path.join(out, "pixels.json"), JSON.stringify(pixels, null, 1));
console.log(`${differences.length} differences; screenshots compared: ${Object.keys(pixels).length}`);
process.exit(0);
