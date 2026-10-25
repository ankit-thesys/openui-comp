import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("large image text preserves image alt fallback, markdown content, updates and root refs", async () => {
  assert(core.ImageTextLarge, "public ImageTextLarge export");
  const ref = React.createRef();
  const view = await mount(
    h(core.ImageTextLarge, {
      ref,
      title: "**Landscape**",
      subtitle: "A description",
      src: "https://example.com/landscape.jpg",
      className: "consumer",
    }),
  );
  try {
    assert.equal(ref.current, view.container.firstElementChild);
    assert(ref.current.classList.contains("consumer"));
    assert.equal(ref.current.querySelector("img").alt, "**Landscape**");
    assert.equal(ref.current.querySelector("strong").textContent, "Landscape");
    assert.match(ref.current.textContent, /A description/);
    await view.render(
      h(core.ImageTextLarge, {
        ref,
        title: "Updated",
        src: "https://example.com/new.jpg",
        alt: "Photo",
      }),
    );
    assert.equal(ref.current.querySelector("img").alt, "Photo");
    assert.equal(
      ref.current.querySelector("img").getAttribute("src"),
      "https://example.com/new.jpg",
    );
    assert.equal(ref.current.textContent, "Updated");
  } finally {
    await view.close();
  }
});
