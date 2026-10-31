import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import manifest from "./package.json" with { type: "json" };

const mode = process.env["OPENUI_COMPAT_MODE"] ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") throw new Error(`Invalid mode: ${mode}`);

export default defineConfig({
  define: { "import.meta.env.VITE_OPENUI_COMPAT_MODE": JSON.stringify(mode) },
  plugins: [reactRouter()],
  server: { host: "127.0.0.1", port: manifest.compat.port, strictPort: true },
});
