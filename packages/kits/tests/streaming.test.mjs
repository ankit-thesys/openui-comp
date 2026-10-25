import assert from "node:assert/strict";
import test from "node:test";
import {
  mount,
  React,
  require,
} from "../src/react/chat/components/FollowUpItem/__tests__/consumer.mjs";

const { Renderer, createStreamingParser } = require("@openuidev/react-lang");
const { openuiChatLibrary: library } = require("@openuidev/kits/react/chat/libs");
const { createElement: h, act } = React;

const program = `root = Card([title, form, followups])
title = Text("text", "Contact us")
form = Form("contact", buttons, [field])
field = FormControl("Name", Input("name", "Your name", "text", { required: true }))
buttons = Buttons([Button("Send", @ToAssistant("Send details"), "primary")])
followups = FollowUpBlock([FollowUpItem("What happens next?")])`;

test("chat parser preserves positional form, chart and table contracts across arbitrary chunks", () => {
  const text = `root = Card([table, chart])
table = Table([Col("Month", ["Jan", "Feb"]), Col("Sales", [10, 20])])
chart = BarChart(["Jan", "Feb"], [Series("Sales", [10, 20])], "grouped")\n`;
  const parser = createStreamingParser(library.toJSONSchema(), library.root);
  let result;
  for (let i = 0; i < text.length; i += 7) result = parser.push(text.slice(i, i + 7));
  assert.deepEqual(result.meta.errors, []);
  assert.equal(result.root.typeName, "Card");
  assert.equal(result.root.props.children[0].typeName, "Table");
  assert.equal(result.root.props.children[1].typeName, "BarChart");
  assert.deepEqual(result.root.props.children[1].props.labels, ["Jan", "Feb"]);
  assert.deepEqual(result.root.props.children[1].props.series[0].props.values, [10, 20]);
});

test("streaming renderer disables forms, restores history, validates and emits existing actions", async () => {
  const actions = [];
  const errors = [];
  const render = (response, isStreaming = false, initialState) =>
    h(Renderer, {
      library,
      response,
      isStreaming,
      initialState,
      onAction: (event) => actions.push(event),
      onError: (next) => errors.push(...next.filter((e) => e.severity === "error")),
    });
  const view = await mount(render('root = Card([Text("text", "Contact', true));
  try {
    assert.match(view.container.textContent, /Contact/);
    await view.render(render(program, true));
    assert.equal(view.container.querySelector("input").disabled, true);
    const send = () =>
      [...view.container.querySelectorAll("button")].find((b) => b.textContent === "Send");
    assert.equal(send().disabled, true);
    await view.render(render(program));
    assert.equal(view.container.querySelector("input").disabled, false);
    await act(async () => send().click());
    assert.equal(actions.length, 0, "required empty field prevents submission");
    const input = view.container.querySelector("input");
    await act(async () => {
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(
        input,
        "Ada",
      );
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => send().click());
    assert.equal(actions.length, 1);
    assert.equal(actions[0].type, "continue_conversation");
    assert.equal(actions[0].humanFriendlyMessage, "Send details");
    const followup = [...view.container.querySelectorAll("button")].find((b) =>
      b.textContent.includes("What happens next?"),
    );
    await act(async () => followup.click());
    assert.equal(actions.length, 2);
    assert.equal(actions[1].humanFriendlyMessage, "What happens next?");
    await view.render(render(null));
    assert.equal(view.container.querySelector("input"), null);
  } finally {
    await view.close();
  }
  const history = await mount(
    render(program, false, { contact: { name: { value: "Grace", componentType: "input" } } }),
  );
  try {
    assert.equal(history.container.querySelector("input").value, "Grace");
    assert.deepEqual(errors, []);
  } finally {
    await history.close();
  }
});
