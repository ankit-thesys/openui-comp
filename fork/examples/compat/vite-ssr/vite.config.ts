import { defineConfig } from "vite";
import manifest from "./package.json" with { type: "json" };

const mode = process.env["OPENUI_COMPAT_MODE"] ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") throw new Error(`Invalid mode: ${mode}`);

export default defineConfig({
  server: { host: "127.0.0.1", port: manifest.compat.port, strictPort: true },
  define: { __COMPAT_MODE__: JSON.stringify(mode) },
  build: { outDir: "dist/client", manifest: true },
  // Keep the collector and components in one bundled store, while Node resolves third parties.
  ssr: { noExternal: ["@openuidev/react-components"] },
});
