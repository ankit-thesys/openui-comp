import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { compatDir, repoDir } from "./common.mjs";

const baselines = join(repoDir, "fork/react-components-dev/test/browser/parity/baselines");

/**
 * Every value in shared/default-theme.json must equal its parity baseline record, so the smoke
 * samples follow the component library's reference values rather than a first run's output.
 */
export async function checkTheme() {
  const samples = JSON.parse(await readFile(join(compatDir, "shared/default-theme.json"), "utf8"));
  const problems = [];
  for (const { name, source, styles } of samples) {
    const match = /^([\w-]+\.json): (.+?)(?: \((\w+) part\))?$/.exec(source);
    if (!match) {
      problems.push(`${name}: unreadable source "${source}"`);
      continue;
    }
    const [, file, key, part] = match;
    const record = JSON.parse(await readFile(join(baselines, file), "utf8"))[key];
    if (!record) {
      problems.push(`${name}: ${file} has no "${key}"`);
      continue;
    }
    for (const [property, value] of Object.entries(styles)) {
      const reference = record[part ? `${part}.${property}` : property];
      if (reference !== value)
        problems.push(`${name}: ${property} is ${value}, baseline ${reference}`);
    }
  }
  if (problems.length) {
    throw new Error(
      `shared/default-theme.json differs from the parity baselines:\n${problems.join("\n")}`,
    );
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await checkTheme();
    console.log("shared/default-theme.json matches the parity baselines");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
