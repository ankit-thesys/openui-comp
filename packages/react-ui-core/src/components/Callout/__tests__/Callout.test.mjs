import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("callouts preserve content, forwarded attributes, refs and the CSS dismissal duration", async () => {
  assert(core.Callout, "public Callout export");
  const ref = React.createRef();
  const view = await mount(
    h(core.Callout, {
      ref,
      variant: "warning",
      title: h("strong", null, "Review"),
      description: "Check values",
      duration: 1200,
      className: "consumer",
      style: { marginTop: 9 },
      role: "status",
    }),
  );
  try {
    const callout = view.container.querySelector('[role="status"]');
    assert.equal(ref.current, callout);
    assert.equal(callout.textContent, "ReviewCheck values");
    assert.equal(callout.style.getPropertyValue("--callout-duration"), "1200ms");
    assert.equal(callout.style.marginTop, "9px");
    assert(callout.classList.contains("consumer"));
  } finally {
    await view.close();
  }
});
