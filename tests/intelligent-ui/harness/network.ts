import type { Page } from "@playwright/test";

/**
 * No test reaches the network: every outside request is answered here, the same way on every run.
 * The library calls no server of its own since f9d86dd5, so only what a program links to is left.
 *
 * - An image on a reserved `.invalid` host fails, as an unreachable URL would, so the tests see the
 *   library's placeholder for a broken image.
 * - Any other image gets a stand-in photo.
 * - Everything else outside the host page is refused.
 */
const PHOTO = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640"><rect width="960" height="640" fill="#7d93a8"/><circle cx="480" cy="320" r="160" fill="#c9d4de"/></svg>`;

export async function isolate(page: Page) {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return route.continue();
    if (url.hostname.endsWith(".invalid")) return route.abort("namenotresolved");
    if (route.request().resourceType() === "image") {
      return route.fulfill({ status: 200, contentType: "image/svg+xml", body: PHOTO });
    }
    return route.abort();
  });
}
