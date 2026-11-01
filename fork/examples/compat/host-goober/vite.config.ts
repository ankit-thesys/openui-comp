import { defineConfig } from "vite";
import manifest from "./package.json" with { type: "json" };
const mode = process.env["OPENUI_COMPAT_MODE"] ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") throw new Error(`Invalid mode: ${mode}`);
export default defineConfig({
  build: { outDir: "dist/client" },
  define: { __COMPAT_MODE__: JSON.stringify(mode) },
  preview: { host: "127.0.0.1", port: manifest.compat.port, strictPort: true },
});
