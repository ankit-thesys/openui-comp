import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        legacy: resolve(import.meta.dirname, "legacy.html"),
        migrated: resolve(import.meta.dirname, "migrated.html"),
      },
    },
  },
});
