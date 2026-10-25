import assert from "node:assert/strict";
import test from "node:test";
import { core, kit, mount, React } from "../../FollowUpItem/__tests__/consumer.mjs";

const { createElement: h } = React;

test("ModelSwitcher uses the selected model, controlled updates and core theme logos through the chat import", async () => {
  const models = [
    {
      id: "fast",
      name: "Fast model",
      recommended: true,
      logo: { light: h("span", null, "Sun"), dark: h("span", null, "Moon") },
    },
    { id: "deep", name: "Deep model", badge: "Pro" },
  ];
  const render = (value, mode = "light", options = models) =>
    h(
      core.ThemeProvider,
      { mode },
      h(kit.ModelSwitcher, { models: options, value, onValueChange: () => {} }),
    );
  const view = await mount(render("fast"));
  try {
    const trigger = () => view.container.querySelector('[role="combobox"]');
    assert.equal(trigger().getAttribute("aria-label"), "Select model");
    assert.equal(trigger().title, "fast");
    assert(trigger().textContent.includes("Fast model"));
    assert(trigger().textContent.includes("Sun"));
    assert(trigger().textContent.includes("Recommended"));
    await view.render(render("fast", "dark"));
    assert(trigger().textContent.includes("Moon"));
    assert(!trigger().textContent.includes("Sun"));
    await view.render(render("deep"));
    assert.equal(trigger().title, "deep");
    assert(trigger().textContent.includes("Deep model"));
    assert(trigger().textContent.includes("Pro"));
    await view.render(render("unknown"));
    assert.equal(trigger().title, "fast");
    assert(trigger().textContent.includes("Fast model"));
    await view.render(render("unknown", "light", []));
    assert.equal(trigger().title, "unknown");
    assert(trigger().textContent.includes("unknown"));
  } finally {
    await view.close();
  }
});
