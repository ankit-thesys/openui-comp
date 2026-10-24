import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("DotMatrixLoader preserves accessible loading, animated dots, compact grid and custom size", async () => {
  assert(core.DotMatrixLoader, "DotMatrixLoader must be exported");
  const view = await mount(h(core.DotMatrixLoader, { className: "custom" }));
  try {
    const loader = view.container.firstElementChild;
    assert.equal(loader.getAttribute("role"), "status");
    assert.equal(loader.getAttribute("aria-live"), "polite");
    assert.equal(loader.getAttribute("aria-label"), "Loading");
    assert(loader.classList.contains("custom"));
    assert.equal(loader.children.length, 25);
    assert.equal(loader.style.getPropertyValue("--openui-dot-matrix-loader-size"), "36px");
    await act(() => new Promise((r) => setTimeout(r, 60)));
    const opacities = [...loader.children].map((n) => Number(n.style.opacity));
    assert(opacities.every((n) => n >= 0.14 && n <= 1));
    assert(new Set(opacities).size > 1, "Visible ring animates");
    await view.render(h(core.DotMatrixLoader, { variant: "compact" }));
    assert.equal(loader.children.length, 16);
    assert.equal(loader.style.getPropertyValue("--openui-dot-matrix-loader-size"), "24px");
    await view.render(h(core.DotMatrixLoader, { variant: "compact", size: 48 }));
    assert.equal(loader.style.getPropertyValue("--openui-dot-matrix-loader-size"), "48px");
  } finally {
    await view.close();
  }
  assert.equal(document.querySelector('[role="status"]'), null);
});
