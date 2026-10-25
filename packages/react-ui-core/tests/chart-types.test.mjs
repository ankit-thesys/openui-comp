import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import test from "node:test";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
test(
  "public shared chart types preserve data, axis, legend and export contracts",
  { timeout: 30000 },
  () => {
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
          fileURLToPath(new URL("./fixtures/chart-types.mts", import.meta.url)),
        ],
        { stdio: "pipe" },
      );
    } catch (error) {
      throw new Error(`${error.stdout || ""}${error.stderr || ""}`, { cause: error });
    }
  },
);
