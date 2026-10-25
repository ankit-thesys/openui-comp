import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("images preserve native attributes and refs, and load/error transitions stay consumer-overridable", async () => {
  assert(core.Image, "public Image export");
  const ref = React.createRef();
  const render = (extra = {}) =>
    h(core.Image, {
      ref,
      src: "https://example.com/photo.jpg",
      alt: "Photo",
      aspectRatio: "16:9",
      scale: "fit",
      styles: { opacity: 0.7 },
      loading: "lazy",
      ...extra,
    });
  const view = await mount(render());
  try {
    const image = view.container.querySelector("img");
    assert.equal(ref.current, image);
    assert.equal(image.alt, "Photo");
    assert.equal(image.getAttribute("loading"), "lazy");
    assert.equal(image.style.opacity, "0.7");
    await act(async () => image.dispatchEvent(new Event("error")));
    assert(image.classList.contains("openui-image--error"));
    await act(async () => image.dispatchEvent(new Event("load")));
    assert(!image.classList.contains("openui-image--error"));
    let failures = 0;
    await view.render(render({ onError: () => failures++ }));
    await act(async () => image.dispatchEvent(new Event("error")));
    assert.equal(failures, 1);
    assert(
      !image.classList.contains("openui-image--error"),
      "legacy consumer handler replaces internal handler",
    );
  } finally {
    await view.close();
  }
});
