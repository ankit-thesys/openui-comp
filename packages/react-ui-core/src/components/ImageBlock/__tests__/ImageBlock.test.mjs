import assert from "node:assert/strict";
import test from "node:test";
import { core, React, require } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
const { renderToStaticMarkup } = require("react-dom/server");
test("image blocks preserve initial loading choices, image attributes and empty-source behavior", () => {
  assert(core.ImageBlock, "public ImageBlock export");
  const markup = renderToStaticMarkup(
    h(core.ImageBlock, {
      src: "https://example.com/photo.jpg",
      alt: "Photo",
      className: "consumer",
      title: "Preview",
    }),
  );
  const host = document.createElement("div");
  host.innerHTML = markup;
  assert.equal(host.querySelector("img").alt, "Photo");
  assert.equal(host.querySelector("img").getAttribute("src"), "https://example.com/photo.jpg");
  assert(host.querySelector('[title="Preview"]').classList.contains("consumer"));
  assert(host.querySelector(".openui-image-block-loader"));
  const noLoading = renderToStaticMarkup(
    h(core.ImageBlock, { src: "https://example.com/photo.jpg", imageLoading: false }),
  );
  assert(!noLoading.includes("openui-image-block-loader"));
  assert.equal(renderToStaticMarkup(h(core.ImageBlock, { src: "" })), "");
});
