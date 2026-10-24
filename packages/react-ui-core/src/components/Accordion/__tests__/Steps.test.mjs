import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("Steps numbers children by position, honors explicit integers and follows prop updates", async () => {
  assert.equal(typeof core.Steps, "function", "public Steps export");
  const items = (firstNumber) =>
    h(
      core.Steps,
      null,
      h(core.StepsItem, { title: "First", details: "One", number: firstNumber }),
      h(core.StepsItem, { title: "Second", details: h("button", { type: "button" }, "Action") }),
      h(core.StepsItem, { title: "Third", details: "Three", number: 2.5 }),
    );
  const view = await mount(items(7));
  try {
    const numbers = () =>
      [...view.container.querySelectorAll(".openui-step-number-inner")].map((n) => n.textContent);
    assert.deepEqual(numbers(), ["7", "2", "3"]);
    assert.equal(view.container.querySelectorAll(".openui-step-title")[1].textContent, "Second");
    assert.equal(view.container.querySelector("button").textContent, "Action");
    await view.render(items(0));
    assert.deepEqual(numbers(), ["0", "2", "3"]);
    assert(
      document.querySelector("#_goober")?.textContent.includes("openui-step-number-inner"),
      "styles arrive automatically",
    );
  } finally {
    await view.close();
  }
});

test("a standalone StepsItem retains its default number and own layout styles", async () => {
  const view = await mount(h(core.StepsItem, { title: "Standalone", details: "Details" }));
  try {
    assert.equal(view.container.querySelector(".openui-step-number-inner").textContent, "0");
    assert.equal(window.getComputedStyle(view.container.firstElementChild).display, "flex");
  } finally {
    await view.close();
  }
});
