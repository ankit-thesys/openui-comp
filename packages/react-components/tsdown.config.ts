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
    alwaysBundle: [
      // Theme data is bundled so typed extensionless entries need no Node directory resolution.
      /^react-syntax-highlighter\/dist\/cjs\/styles\/prism(?:\/|$)/,
      // Goober keeps its prefixer (`setup`) and compiled-rule cache in module scope. A private
      // copy keeps a host app's Goober, whatever it sets up, away from component rules.
      /^goober$/,
    ],
  },
});
