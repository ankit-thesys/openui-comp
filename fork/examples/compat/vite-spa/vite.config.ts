import { defineConfig } from "vite";
import manifest from "./package.json" with { type: "json" };

const mode = process.env["OPENUI_COMPAT_MODE"] ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") {
  throw new Error(`Invalid OPENUI_COMPAT_MODE: ${mode}`);
}

export default defineConfig({
  preview: { host: "127.0.0.1", port: manifest.compat.port, strictPort: true },
  define: { __COMPAT_MODE__: JSON.stringify(mode) },
  plugins: [
    {
      name: "compat-head-order",
      transformIndexHtml: {
        order: "pre",
        handler: (html) =>
          html.replace(
            "<!-- compat-head -->",
            `${mode === "layered" ? "<style>@layer theme, base, openui, components, utilities;</style>" : ""}\n    <style id="openui-styles"></style>`,
          ),
      },
    },
  ],
});
