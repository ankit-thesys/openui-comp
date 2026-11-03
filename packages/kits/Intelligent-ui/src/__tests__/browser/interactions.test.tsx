import type { ActionEvent } from "@openuidev/react-lang";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { program, small } from "../helpers/cases";
import { buttonNamed, byText, cleanup, clipboard, one, renderProgram, settle, style } from "../helpers/render";

afterEach(cleanup);

const click = async (element: Element, wait = 200) => {
  await userEvent.click(element);
  await settle(wait);
};

describe("Checkbox", () => {
  it("ticks, unticks and strikes through", async () => {
    const container = await renderProgram(small.checkboxes);
    const label = byText(container, "Not done");
    expect(style(label).textDecorationLine).toBe("none");
    await click(label);
    expect(style(label).textDecorationLine).toBe("line-through");
    await click(label);
    expect(style(label).textDecorationLine).toBe("none");
  });

  it("updates a count across a checklist, and resets", async () => {
    const container = await renderProgram(program("checklist"));
    expect(container.textContent).toContain("2/6 packed");
    await click(byText(container, "Relaxed Oxford shirt"));
    expect(container.textContent).toContain("3/6 packed");
    await click(byText(container, "Clear"));
    expect(container.textContent).toContain("2/6 packed");
  });
});

describe("RadioGroup", () => {
  it("moves the choice in a list", async () => {
    const container = await renderProgram(small.radios);
    await click(byText(container, "Third"));
    const chosen = one(container, '.openui-radio-item[data-state="checked"]');
    expect(chosen.closest(".openui-radio-item-container")?.textContent).toContain("Third");
  });

  it("moves the choice in cards", async () => {
    const container = await renderProgram(small.radioCards);
    await click(byText(container, "Two"));
    expect(one(container, '.openui-option-cards-card[aria-checked="true"]').textContent).toContain("Two");
  });
});

describe("Code", () => {
  it("copies its code and says so", async () => {
    const container = await renderProgram(small.code);
    const copy = one(container, ".openui-intelligent-code-copy");
    await click(copy, 100);
    expect(clipboard).toEqual(["x = 1"]);
    expect(copy.textContent).toContain("Copied");
    await settle(1600);
    expect(copy.textContent).toContain("Copy");
  });
});

describe("SegmentedControl", () => {
  it("switches what's shown", async () => {
    const container = await renderProgram(small.segmented);
    expect(container.textContent).toContain("Showing alpha");
    await click(buttonNamed(container, "Beta"));
    expect(container.textContent).toContain("Showing beta");
  });
});

describe("Slider", () => {
  it("moves with the keyboard and updates what reads it", async () => {
    const container = await renderProgram(small.slider);
    one<HTMLInputElement>(container, "input").focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await settle();
    expect(container.textContent).toContain("Value 7");
  });
});

describe("Select", () => {
  it("opens, picks an option and updates what reads it", async () => {
    const container = await renderProgram(small.select);
    await click(one(container, "[role=combobox]"), 300);
    const option = [...document.querySelectorAll("[role=option]")].find((item) => item.textContent?.includes("Fast"))!;
    await click(option, 300);
    expect(container.textContent).toContain("Picked fast");
  });
});

describe("Input", () => {
  it("updates what reads it as you type", async () => {
    const container = await renderProgram(small.input);
    await userEvent.type(one(container, "input"), "Ada");
    await settle();
    expect(container.textContent).toContain("Hello Ada");
  });
});

describe("Timer", () => {
  it("counts down, pauses and resets", async () => {
    const container = await renderProgram(small.timer);
    expect(container.textContent).toContain("1:30");
    await click(buttonNamed(container, "Start"), 1300);
    expect(container.textContent).not.toContain("1:30");
    await click(buttonNamed(container, "Pause"), 50);
    const paused = one(container, ".openui-intelligent-timer-time").textContent;
    await settle(1200);
    expect(one(container, ".openui-intelligent-timer-time").textContent).toBe(paused);
    await click(buttonNamed(container, "Reset"));
    expect(container.textContent).toContain("1:30");
  });
});

describe("Flashcard", () => {
  it("flips when tapped", async () => {
    const container = await renderProgram(small.flashcard);
    const inner = one(container, ".openui-intelligent-flashcard-inner");
    const before = style(inner).transform;
    await click(one(container, ".openui-intelligent-flashcard"), 800);
    expect(style(inner).transform).not.toBe(before);
  });
});

describe("Popover", () => {
  it("opens on click and closes on Escape", async () => {
    const container = await renderProgram(small.popover);
    expect(document.body.textContent).not.toContain("Hidden content");
    await click(byText(container, "the details"), 300);
    expect(document.body.textContent).toContain("Hidden content");
    await userEvent.keyboard("{Escape}");
    await settle(300);
    expect(document.body.textContent).not.toContain("Hidden content");
  });
});

describe("Pressable", () => {
  it("runs its action", async () => {
    const container = await renderProgram(small.pressable);
    expect(container.textContent).toContain("It is off");
    await click(byText(container, "Tap me"));
    expect(container.textContent).toContain("It is on");
  });
});

describe("Carousel", () => {
  it("scrolls with its arrow", async () => {
    const container = await renderProgram(program("primitives"));
    const next = buttonNamed(container, "Next");
    const scroller = [...container.querySelectorAll<HTMLElement>("*")].find(
      (element) => element.scrollWidth > element.clientWidth + 20 && style(element).overflowX !== "visible",
    )!;
    expect(scroller.scrollLeft).toBe(0);
    await click(next, 800);
    expect(scroller.scrollLeft).toBeGreaterThan(0);
  });
});

describe("Form", () => {
  const render = () => {
    const onAction = vi.fn<(event: ActionEvent) => void>();
    return renderProgram(small.form, { onAction }).then((container) => ({ container, onAction }));
  };

  it("holds back an empty required field and shows why", async () => {
    const { container, onAction } = await render();
    await click(byText(container, "Send"));
    expect(onAction).not.toHaveBeenCalled();
    expect(container.textContent).toContain("required");
  });

  it("holds back a value that fails its rule", async () => {
    const { container, onAction } = await render();
    await userEvent.type(one(container, "input"), "not-an-email");
    await click(byText(container, "Send"));
    expect(onAction).not.toHaveBeenCalled();
    expect(container.textContent?.toLowerCase()).toContain("email");
  });

  it("sends the values once they pass, and clears the error", async () => {
    const { container, onAction } = await render();
    await click(byText(container, "Send"));
    await userEvent.type(one(container, "input"), "ada@example.com");
    await settle();
    expect(container.textContent).not.toContain("required");
    await click(byText(container, "Send"));
    expect(onAction).toHaveBeenCalledOnce();
    expect(JSON.stringify(onAction.mock.calls[0]![0])).toContain("ada@example.com");
  });
});

describe("the CopyToClipboard action", () => {
  it("copies from a Button", async () => {
    const container = await renderProgram(small.copy);
    await click(byText(container, "Copy"));
    expect(clipboard).toEqual(["copied text"]);
  });
});

describe("Map", () => {
  it("selects a place when its pin is tapped, and expands", async () => {
    const container = await renderProgram(program("map"));
    await settle(1500);
    const pins = [...container.querySelectorAll<HTMLElement>(".maplibregl-marker")];
    expect(pins.length).toBeGreaterThan(1);
    const pin = pins.find((marker) => marker.getAttribute("aria-pressed") !== "true")!;
    await click(pin, 400);
    expect(pin.getAttribute("aria-pressed")).toBe("true");
    const expand = [...container.querySelectorAll("button")].find((button) => button.textContent?.includes("Expand"))!;
    await click(expand, 400);
    expect(document.querySelector("dialog[open], [role=dialog]")).not.toBeNull();
  });
});
