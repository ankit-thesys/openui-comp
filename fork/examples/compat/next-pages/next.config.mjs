import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL(".", import.meta.url));
const mode = process.env.OPENUI_COMPAT_MODE ?? "unlayered";
if (!["layered", "unlayered"].includes(mode)) throw new Error(`Invalid mode: ${mode}`);
const server = process.env.OPENUI_COMPAT_SERVER ?? "turbopack-production";
const distDir = `.next/${server}-${mode}`;
// Each server has its own generated validator types. Combining Next's generated validators
// from different builds in one tsconfig causes duplicate global declarations (Pages Router).
const tsconfigPath = `.next-tsconfig-${server}-${mode}.json`;
writeFileSync(
  new URL(tsconfigPath, import.meta.url),
  JSON.stringify({
    extends: "./tsconfig.json",
    include: [
      "next-env.d.ts",
      "*.ts",
      "app/**/*.ts",
      "app/**/*.tsx",
      "pages/**/*.ts",
      "pages/**/*.tsx",
      "components/**/*.tsx",
      "tests/**/*.ts",
      "../shared/*.ts",
      `${distDir}/types/**/*.ts`,
      `${distDir}/dev/types/**/*.ts`,
    ],
  }),
);
const css = `./styles/${mode}.css`;
export default {
  agentRules: false,
  distDir,
  typescript: { tsconfigPath },
  env: { NEXT_PUBLIC_OPENUI_COMPAT_MODE: mode },
  outputFileTracingRoot: root,
  turbopack: { root, resolveAlias: { "compat-global.css": css } },
  webpack(config) {
    config.resolve.alias["compat-global.css"] = fileURLToPath(new URL(css, import.meta.url));
    return config;
  },
  experimental: { cpus: 2 },
};
