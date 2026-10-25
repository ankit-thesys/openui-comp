import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("image text preserves markdown, accessible image labels, imageSize and root customization", async () => {
  assert(core.ImageText, "public ImageText export");
  const ref = React.createRef();
  const view = await mount(
    h(core.ImageText, {
      ref,
      title: "**Place**",
      subtitle: "Description",
      src: "https://example.com/photo.jpg",
      imageSize: 48,
      className: "consumer",
      bold: true,
    }),
  );
  try {
    assert.equal(ref.current, view.container.firstElementChild);
    assert(ref.current.classList.contains("consumer"));
    const image = ref.current.querySelector("img");
    assert.equal(image.alt, "**Place**");
    assert.equal(image.parentElement.style.width, "48px");
    assert.equal(image.parentElement.style.height, "48px");
    assert.equal(ref.current.querySelector("strong").textContent, "Place");
    assert.match(ref.current.textContent, /Description/);
    await view.render(
      h(core.ImageText, {
        ref,
        title: "Updated",
        src: "https://example.com/new.jpg",
        alt: "",
        layout: "vertical",
      }),
    );
    assert.equal(image.getAttribute("src"), "https://example.com/new.jpg");
    assert.equal(image.alt, "");
    assert.equal(ref.current.textContent, "Updated");
  } finally {
    await view.close();
  }
});
