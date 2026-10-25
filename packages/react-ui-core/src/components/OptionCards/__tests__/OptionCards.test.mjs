import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;

test("option cards preserve controlled selection, native roots, markdown and callback values", async () => {
  assert(core.OptionCards, "public OptionCards export");
  const ref = React.createRef();
  const calls = [];
  const items = [
    { value: "a", title: "**First**", subtitle: "[Details](https://example.com)" },
    { value: "b", title: "Second" },
  ];
  const props = {
    ref,
    items,
    selected: ["b"],
    onToggle: (...args) => calls.push(args),
    className: "custom",
    style: { opacity: 0.7 },
    "aria-label": "Choices",
  };
  const view = await mount(h(core.OptionCards, props));
  try {
    assert.equal(ref.current, view.container.firstElementChild);
    assert(ref.current.classList.contains("custom"));
    assert.equal(ref.current.style.opacity, "0.7");
    assert.equal(ref.current.getAttribute("role"), "radiogroup");
    assert.equal(ref.current.getAttribute("aria-label"), "Choices");
    const buttons = ref.current.querySelectorAll("button");
    assert.equal(buttons[0].type, "button");
    assert.equal(buttons[0].getAttribute("role"), "radio");
    assert.equal(buttons[0].getAttribute("aria-checked"), "false");
    assert.equal(buttons[1].getAttribute("aria-checked"), "true");
    assert.equal(ref.current.querySelector("strong").textContent, "First");
    assert.equal(ref.current.querySelector("a").getAttribute("href"), "https://example.com");
    await React.act(async () => buttons[0].click());
    assert.deepEqual(calls, [["a"]]);
    assert.equal(
      buttons[0].getAttribute("aria-checked"),
      "false",
      "selection remains controlled by the parent",
    );
    await view.render(h(core.OptionCards, { ...props, type: "multiple", selected: ["a", "b"] }));
    assert.equal(ref.current.getAttribute("role"), "group");
    assert.deepEqual(
      [...ref.current.querySelectorAll("button")].map((n) => [
        n.getAttribute("role"),
        n.getAttribute("aria-checked"),
      ]),
      [
        ["checkbox", "true"],
        ["checkbox", "true"],
      ],
    );
    await view.render(h(core.OptionCards, { ...props, items: [], selected: [] }));
    assert.equal(ref.current.querySelector("button"), null);
  } finally {
    await view.close();
  }
  assert.equal(ref.current, null);
});

test("option cards filter missing identities and preserve native disabled actions and top slots", async () => {
  const calls = [];
  let bubbled = 0;
  const items = [
    null,
    undefined,
    { value: "", title: "Skip" },
    { value: "a", title: "Allowed", topContent: 0 },
    {
      value: "b",
      title: "Blocked",
      disabled: true,
      topContent: h("img", { src: "/image.svg", alt: "Preview" }),
      topContentVariant: "image",
    },
  ];
  const props = {
    items,
    onToggle: (value) => calls.push(value),
    onClick: () => bubbled++,
    "data-consumer": "forwarded",
  };
  const view = await mount(h(core.OptionCards, props));
  try {
    const root = view.container.firstElementChild;
    assert.equal(root.dataset.consumer, "forwarded");
    assert.equal(root.querySelectorAll("button").length, 2);
    assert.equal(root.querySelector(".openui-option-card__top--icon").textContent, "0");
    assert.equal(
      root.querySelector(".openui-option-card__top--image img").getAttribute("alt"),
      "Preview",
    );
    const [enabled, disabled] = root.querySelectorAll("button");
    assert.equal(enabled.disabled, false);
    assert.equal(disabled.disabled, true);
    await React.act(async () => {
      enabled.click();
      disabled.click();
    });
    assert.deepEqual(calls, ["a"]);
    assert.equal(bubbled, 1);
    await view.render(h(core.OptionCards, { ...props, disabled: true }));
    assert([...root.querySelectorAll("button")].every((n) => n.disabled));
    await React.act(async () => root.querySelector("button").click());
    assert.deepEqual(calls, ["a"]);
    assert.equal(bubbled, 1);
    await view.render(
      h(core.OptionCards, {
        ...props,
        disabled: false,
        items: [{ value: "c", title: "New" }],
        selected: ["missing", "c"],
      }),
    );
    assert.equal(root.querySelector("button").getAttribute("aria-checked"), "true");
    assert.equal(root.querySelector(".openui-option-card__top"), null);
    assert.equal(root.querySelector(".openui-option-card__subtitle"), null);
    await view.render(h(core.OptionCards, { items: null }));
    assert.equal(root.querySelector("button"), null);
  } finally {
    await view.close();
  }
});
