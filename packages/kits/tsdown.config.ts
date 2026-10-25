import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/react/chat/index.ts", "src/react/chat/libs/index.ts"],
  unbundle: true,
  root: "src",
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  target: "es2022",
  outDir: "dist",
  clean: true,
});
