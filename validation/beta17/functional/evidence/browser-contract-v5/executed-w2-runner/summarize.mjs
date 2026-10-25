import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import { cancellationErrors, summarizeBenchmark, summarizeSoak } from "./analysis.mjs";

try {
  const manifestText = await fs.readFile(process.argv[2], "utf8");
  const manifest = JSON.parse(manifestText);
  const report = JSON.parse(await fs.readFile(process.argv[3], "utf8"));
  let result;
  if (report.kind === "cancellation") {
    const run = report.observation;
    const errors = cancellationErrors(
      run,
      manifest.cells[`${run.workload}/${run.load}`].expectedText,
    );
    result = {
      kind: "cancellation",
      valid: errors.length === 0,
      pass: errors.length === 0,
      errors,
    };
  } else if (report.kind === "soak")
    result = summarizeSoak(
      manifest,
      report,
      createHash("sha256").update(manifestText).digest("hex"),
    );
  else if (report.kind === "benchmark")
    result = summarizeBenchmark(
      manifest,
      report,
      createHash("sha256").update(manifestText).digest("hex"),
    );
  else throw new Error(`Unknown report kind: ${report.kind}`);
  console.log(JSON.stringify(result));
  if (!result.pass) process.exitCode = 1;
} catch (error) {
  console.log(JSON.stringify({ valid: false, pass: false, errors: [error.message] }));
  process.exitCode = 1;
}
