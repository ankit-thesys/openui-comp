import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import manifest from "./package.json" with { type: "json" };

const mode = process.env["OPENUI_COMPAT_MODE"] ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") throw new Error(`Invalid mode: ${mode}`);

export default defineConfig({
  define: { "import.meta.env.VITE_OPENUI_COMPAT_MODE": JSON.stringify(mode) },
  plugins: [tanstackStart({ router: { quoteStyle: "double", semicolons: true } }), react()],
  server: { host: "127.0.0.1", port: manifest.compat.port, strictPort: true },
});
