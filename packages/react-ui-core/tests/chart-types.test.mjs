import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import test from "node:test";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
function compilePublicTypes(fixture) {
  try {
    execFileSync(
      process.execPath,
      [
        require.resolve("typescript/bin/tsc"),
        "--noEmit",
        "--strict",
        "--skipLibCheck",
        "false",
        "--target",
        "es2022",
        "--module",
        "nodenext",
        "--moduleResolution",
        "nodenext",
        fileURLToPath(new URL(`./fixtures/${fixture}`, import.meta.url)),
      ],
      { stdio: "pipe" },
    );
  } catch (error) {
    throw new Error(`${error.stdout || ""}${error.stderr || ""}`, { cause: error });
  }
}

test(
  "public shared chart types preserve data, axis, legend and export contracts",
  { timeout: 30000 },
  () => compilePublicTypes("chart-types.mts"),
);
test(
  "public chart family props preserve callbacks, variants and existing styling boundaries",
  { timeout: 30000 },
  () => compilePublicTypes("chart-families.mts"),
);
