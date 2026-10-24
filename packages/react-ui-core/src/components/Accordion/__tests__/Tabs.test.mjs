import assert from "node:assert/strict";
import test from "node:test";
import { core, React, require } from "../../Button/__tests__/consumer.mjs";
const { renderToStaticMarkup } = require("react-dom/server");
const { createElement: h } = React;
test("Tabs exposes its selected panel, disabled trigger and original rich trigger content", () => {
  assert.equal(typeof core.Tabs, "object", "public Tabs export");
  const tree = (value) =>
    h(
      core.Tabs,
      { value, className: "consumer", "aria-label": "Sections" },
      h(
        core.TabsList,
        { "aria-label": "Choices", variant: "imageTitleSubtext" },
        h(core.TabsTrigger, {
          value: "a",
          text: "Alpha",
          subtext: "First",
          image: "data:image/svg+xml,%3Csvg/%3E",
        }),
        h(core.TabsTrigger, { value: "b", text: "Beta", disabled: true }),
      ),
      h(core.TabsContent, { value: "a" }, "Alpha panel"),
      h(core.TabsContent, { value: "b" }, "Beta panel"),
    );
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(tree("a"));
  assert(container.firstElementChild.classList.contains("consumer"));
  assert.equal(container.firstElementChild.getAttribute("aria-label"), "Sections");
  const triggers = [...container.querySelectorAll('[role="tab"]')];
  assert.equal(triggers[0].getAttribute("aria-selected"), "true");
  assert.equal(triggers[1].disabled, true);
  assert.equal(triggers[0].textContent, "AlphaFirst");
  assert.equal(triggers[0].querySelector("img").alt, "");
  assert.equal(
    container.querySelector('[role="tabpanel"][data-state="active"]').textContent,
    "Alpha panel",
  );
  container.innerHTML = renderToStaticMarkup(tree("b"));
  assert.equal(
    container.querySelector('[role="tabpanel"][data-state="active"]').textContent,
    "Beta panel",
  );
});
