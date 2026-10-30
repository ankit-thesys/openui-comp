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
const rootCss = mode === "layered" ? "./styles/layered.css" : "./styles/noop.mjs";
const nestedCss = mode === "unlayered" ? "./styles/unlayered.css" : "./styles/noop.mjs";
export default {
  agentRules: false,
  distDir,
  typescript: { tsconfigPath },
  env: { NEXT_PUBLIC_OPENUI_COMPAT_MODE: mode },
  outputFileTracingRoot: root,
  turbopack: { root, resolveAlias: { "compat-root.css": rootCss, "compat-nested.css": nestedCss } },
  webpack(config) {
    config.resolve.alias["compat-root.css"] = fileURLToPath(new URL(rootCss, import.meta.url));
    config.resolve.alias["compat-nested.css"] = fileURLToPath(new URL(nestedCss, import.meta.url));
    return config;
  },
  experimental: { cpus: 2 },
};
