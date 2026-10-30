import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
const mode = process.env["OPENUI_COMPAT_MODE"] ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") throw new Error(`Invalid mode: ${mode}`);
const config: NextConfig = {
  env: { NEXT_PUBLIC_COMPAT_MODE: mode },
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  experimental: { cpus: 2 },
};
export default config;
