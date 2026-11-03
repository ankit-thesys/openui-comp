import path from "node:path";
import { defineConfig } from "vite";

const PHOTO = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640"><rect width="960" height="640" fill="#7d93a8"/><circle cx="480" cy="320" r="160" fill="#c9d4de"/></svg>`;
const PHOTOS = ["a", "b", "c", "d"].map((name) => `/stub-photo.svg?${name}`);

/** A look at the kit in a browser: `vite --config src/__tests__/parity/gallery/vite.config.ts`. */
export default defineConfig({
  root: __dirname,
  publicDir: path.join(__dirname, "../harness/public"),
  define: { "process.env": "{}" },
  esbuild: { jsx: "automatic" },
  plugins: [
    {
      // The kit asks the host for photos. A gallery has no such routes, so it answers with a placeholder.
      name: "parity-gallery-routes",
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          const url = request.url ?? "";
          if (url.startsWith("/stub-photo.svg")) {
            response.setHeader("content-type", "image/svg+xml");
            response.end(PHOTO);
          } else if (url.startsWith("/api/wiki")) {
            response.setHeader("content-type", "application/json");
            response.end(JSON.stringify({ photos: PHOTOS }));
          } else if (url.startsWith("/api/image-search")) {
            response.setHeader("content-type", "application/json");
            response.end(JSON.stringify({ images: PHOTOS }));
          } else next();
        });
      },
    },
  ],
});
