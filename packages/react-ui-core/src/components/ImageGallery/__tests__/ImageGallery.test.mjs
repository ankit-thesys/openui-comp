import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("image galleries retain input order, accessible image labels and a five-image preview limit", async () => {
  assert(core.ImageGallery, "public ImageGallery export");
  assert.equal(typeof core.GalleryModal, "function", "public GalleryModal export");
  const images = Array.from({ length: 6 }, (_, i) => ({
    src: `https://example.com/${i}.jpg`,
    ...(i === 0 ? { alt: "Cover" } : {}),
  }));
  const view = await mount(h(core.ImageGallery, { images }));
  try {
    assert.deepEqual(
      [...view.container.querySelectorAll("img")].map((image) => image.getAttribute("src")),
      images.slice(0, 5).map((image) => image.src),
    );
    assert.equal(view.container.querySelector("img").alt, "Cover");
    assert.equal(view.container.querySelectorAll("img")[1].alt, "Gallery image 2");
    assert.equal(view.container.querySelector("button").textContent, "Show All");
    await view.render(h(core.ImageGallery, { images: images.slice(0, 2) }));
    assert.equal(view.container.querySelectorAll("img").length, 2);
    assert.equal(view.container.querySelector("button"), null);
    assert.equal(document.querySelector('[role="dialog"]'), null);
  } finally {
    await view.close();
  }
});
