import type { Page } from "@playwright/test";

/**
 * No parity capture reaches the network. The source app still has the map and the photo search,
 * so its server routes (`/api/...`), map tiles and every outside request are answered here, the
 * same way for both sides. Ported from #160's parity driver; the library dropped these in f9d86dd5,
 * so the test host uses the smaller ../harness/network.ts.
 */
const PHOTO = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640"><rect width="960" height="640" fill="#7d93a8"/><circle cx="480" cy="320" r="160" fill="#c9d4de"/></svg>`;
const PIXEL =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN4+vjxfwAJFgPjZgoQ0QAAAABJRU5ErkJggg==";
const STUB_PHOTOS = [
  "/stub-photo.svg?a",
  "/stub-photo.svg?b",
  "/stub-photo.svg?c",
  "/stub-photo.svg?d",
];

const json = (body: unknown) => ({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify(body),
});

export async function isolate(page: Page) {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";

    if (local && url.pathname === "/stub-photo.svg") {
      return route.fulfill({ status: 200, contentType: "image/svg+xml", body: PHOTO });
    }
    if (local && url.pathname.startsWith("/api/")) {
      if (url.pathname === "/api/wiki") return route.fulfill(json({ photos: STUB_PHOTOS }));
      if (url.pathname === "/api/image-search") return route.fulfill(json({ images: STUB_PHOTOS }));
      if (url.pathname === "/api/street-route") {
        const points = (url.searchParams.get("coords") ?? "").split(";").map((pair) => {
          const [lng, lat] = pair.split(",").map(Number);
          return [lat, lng];
        });
        return route.fulfill(json({ points }));
      }
      return route.fulfill({ status: 404, body: "" });
    }
    if (local) return route.continue();

    if (route.request().resourceType() === "image") {
      return route.fulfill({ status: 200, contentType: "image/svg+xml", body: PHOTO });
    }
    if (url.hostname === "server.arcgisonline.com") {
      return route.fulfill({
        status: 200,
        contentType: "image/png",
        body: Buffer.from(PIXEL, "base64"),
      });
    }
    if (url.hostname === "tiles.openfreemap.org") {
      // A map with no features: the tile source resolves, and its tiles and glyphs are empty.
      if (url.pathname === "/planet") {
        return route.fulfill(
          json({
            tilejson: "2.2.0",
            minzoom: 0,
            maxzoom: 14,
            tiles: ["https://tiles.openfreemap.org/planet/{z}/{x}/{y}.pbf"],
          }),
        );
      }
      return route.fulfill({ status: 200, contentType: "application/x-protobuf", body: "" });
    }
    return route.abort();
  });
}
