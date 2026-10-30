import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/styles.ts"],
  unbundle: true,
  root: "src",
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  target: "es2022",
  outDir: "dist",
  clean: true,
  deps: {
    // Theme data is bundled so typed extensionless entries need no Node directory resolution.
    alwaysBundle: [/^react-syntax-highlighter\/dist\/cjs\/styles\/prism(?:\/|$)/],
  },
});
