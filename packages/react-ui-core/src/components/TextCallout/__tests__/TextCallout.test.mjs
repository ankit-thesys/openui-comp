import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("text callouts preserve rich text, refs, consumer styles and DOM callbacks", async () => {
  assert(core.TextCallout, "public TextCallout export");
  const ref = React.createRef();
  let clicked = 0;
  const view = await mount(
    h(core.TextCallout, {
      ref,
      variant: "danger",
      title: h("strong", null, "Warning"),
      description: "Try again",
      className: "consumer",
      style: { marginTop: 7 },
      onClick: () => clicked++,
    }),
  );
  try {
    assert.equal(ref.current.textContent, "WarningTry again");
    assert(ref.current.classList.contains("consumer"));
    assert.equal(ref.current.style.marginTop, "7px");
    await act(async () => ref.current.click());
    assert.equal(clicked, 1);
  } finally {
    await view.close();
  }
});
