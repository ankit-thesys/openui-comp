import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("favicons retain image attributes, fall back on failure and retry when their URL changes", async () => {
  assert(core.SourceFaviconImage, "public SourceFaviconImage export");
  const render = (url) =>
    h(core.SourceFaviconImage, { url, alt: "Documentation", width: 20, height: 24 });
  const view = await mount(render("https://example.com/icon.png"));
  try {
    const image = view.container.querySelector("img");
    assert.equal(image.alt, "Documentation");
    assert.equal(image.width, 20);
    assert.equal(image.height, 24);
    await act(async () => image.dispatchEvent(new Event("error")));
    assert.equal(view.container.querySelector("img"), null);
    await view.render(render("https://example.com/new.png"));
    assert.equal(
      view.container.querySelector("img").getAttribute("src"),
      "https://example.com/new.png",
    );
    assert(
      document.querySelector("#_goober")?.textContent.includes("object-fit:cover"),
      "automatic favicon styling",
    );
  } finally {
    await view.close();
  }
});
