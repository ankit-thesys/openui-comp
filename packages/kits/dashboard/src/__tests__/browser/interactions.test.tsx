import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { box, byText, cleanup, one, renderCase, settle, style } from "../helpers/render";

afterEach(cleanup);

const POPOVER = ".openui-dashboard-filter-select-popover";

describe("FilterSelect", () => {
  it("opens, marks the selection, updates the trigger and closes", async () => {
    const container = await renderCase("filters");
    const trigger = one(container, ".openui-dashboard-filter-select-trigger--single");
    const chevron = one(trigger, ".openui-dashboard-filter-select-chevron");
    expect(style(chevron).transform).toBe("none");

    await userEvent.click(trigger);
    await settle(300);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(style(chevron).transform).not.toBe("none");

    const radios = [
      ...container.querySelectorAll<HTMLInputElement>(`${POPOVER} input[type=radio]`),
    ];
    expect(radios).toHaveLength(2);
    expect(style(radios[0]!).appearance).toBe("none");
    await userEvent.click(radios[1]!);
    await settle();
    expect(container.querySelector(POPOVER)).toBeNull();
    expect(trigger.textContent).toContain("AMER");

    await userEvent.click(trigger);
    await settle();
    const checked = one<HTMLInputElement>(container, `${POPOVER} input:checked`);
    expect(checked.value).toBe("amer");
    expect(style(checked).backgroundImage).toContain("radial-gradient");
  });

  it("closes on a click outside", async () => {
    const container = await renderCase("filters");
    await userEvent.click(one(container, ".openui-dashboard-filter-select-trigger--single"));
    await settle();
    expect(container.querySelector(POPOVER)).not.toBeNull();
    await userEvent.click(one(container, ".openui-dashboard-header-title"));
    await settle();
    expect(container.querySelector(POPOVER)).toBeNull();
  });
});

describe("a filter connected to values", () => {
  it("changes the card and charts the prompt's example connects it to", async () => {
    const container = await renderCase("example-3");
    expect(byText(container, "4,500")).toBeTruthy();
    const bars = () =>
      [...container.querySelectorAll("svg path, svg rect")].map((el) => el.outerHTML);
    await settle(800);
    const before = bars();

    await userEvent.click(one(container, ".openui-dashboard-filter-select-trigger--single"));
    await settle(300);
    await userEvent.click(byText(container, "EMEA"));
    await settle(800);

    expect(byText(container, "1,800")).toBeTruthy();
    expect(container.textContent).not.toContain("4,500");
    expect(bars()).not.toEqual(before);
  });
});

describe("FilterMultiSelect", () => {
  it("ticks options, counts them and stays open", async () => {
    const container = await renderCase("filters");
    const trigger = one(container, ".openui-dashboard-filter-select-trigger--multi");
    await userEvent.click(trigger);
    await settle();

    const options = [
      ...container.querySelectorAll(`${POPOVER} .openui-dashboard-filter-select-option`),
    ];
    expect(options).toHaveLength(3);
    await userEvent.click(one(options[0]!, "input, button, [role=checkbox]"));
    await settle();
    await userEvent.click(one(options[1]!, "input, button, [role=checkbox]"));
    await settle();

    expect(one(trigger, ".openui-dashboard-filter-select-summary-text").textContent).toBe(
      "API, Web",
    );
    expect(one(trigger, ".openui-dashboard-filter-select-count").textContent).toBe("2");
    expect(container.querySelector(POPOVER)).not.toBeNull();
  });
});

describe("DatePicker", () => {
  it("opens its calendar", async () => {
    const container = await renderCase("filters");
    await userEvent.click(one(container, ".openui-date-picker-trigger"));
    await settle();
    expect(container.ownerDocument.querySelector(".openui-date-picker-content")).not.toBeNull();
  });
});

describe("collapsed card", () => {
  // A zero-basis flex item once collapsed this to nothing, which also hid the Expand control.
  it("shows a preview with a fade and an Expand control", async () => {
    const container = await renderCase("interactive");
    const wrap = one(container, ".openui-dashboard-shell-card-content-wrap[data-collapsed]");
    expect(box(wrap).height).toBe(240);
    expect(style(wrap).overflowY).toBe("hidden");
    expect(container.querySelector(".openui-dashboard-shell-card-collapse-fade")).not.toBeNull();
    expect(
      container.querySelector(".openui-dashboard-shell-card-collapse-control button"),
    ).not.toBeNull();
  });

  it("opens a modal that Escape closes", async () => {
    const container = await renderCase("interactive");
    await userEvent.click(one(container, ".openui-dashboard-shell-card-collapse-control button"));
    await settle();

    const modal = one(container, ".openui-dashboard-shell-card-modal");
    expect(style(modal).position).toBe("fixed");
    expect(style(modal).zIndex).toBe("10000");
    const frame = box(one(modal, ".openui-dashboard-shell-card-modal-frame"));
    expect(frame.width).toBeLessThanOrEqual(1120);
    expect(Math.round(frame.left + frame.width / 2)).toBe(Math.round(innerWidth / 2));
    expect(style(one(modal, ".openui-dashboard-shell-card-modal-body")).overflowY).toBe("auto");

    await userEvent.keyboard("{Escape}");
    await settle();
    expect(container.querySelector(".openui-dashboard-shell-card-modal")).toBeNull();
  });

  it("closes the modal from Minimize", async () => {
    const container = await renderCase("interactive");
    await userEvent.click(one(container, ".openui-dashboard-shell-card-collapse-control button"));
    await settle();
    await userEvent.click(one(container, ".openui-dashboard-shell-card-modal-minimize button"));
    await settle();
    expect(container.querySelector(".openui-dashboard-shell-card-modal")).toBeNull();
  });
});

describe("Table", () => {
  it("pages through its rows", async () => {
    const container = await renderCase("interactive");
    const table = one(container, ".openui-dashboard-table");
    expect(byText(table, "Row 01")).toBeTruthy();
    await userEvent.click(one(table, 'button[aria-label="Next page"]'));
    await settle();
    expect(byText(table, "Row 11")).toBeTruthy();
    expect(table.textContent).not.toContain("Row 01");
  });
});

describe("OverviewCardBlock carousel", () => {
  it("scrolls and updates its edge mask", async () => {
    const container = await renderCase("interactive");
    const carousel = one(container, ".openui-card-block-layout-carousel");
    const track = one(container, ".openui-card-block-layout-carousel-track");
    const scroller = track.scrollWidth > track.clientWidth ? track : carousel;
    expect(carousel.dataset["mask"]).toBe("right");
    scroller.scrollLeft = 120;
    await settle();
    expect(carousel.dataset["mask"]).toBe("both");
  });
});

describe("actions", () => {
  it("Button fires continue_conversation with its label", async () => {
    const onAction = vi.fn();
    const container = await renderCase("content", onAction);
    await userEvent.click(byText(container, "Export"));
    await settle();
    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({ type: "continue_conversation", humanFriendlyMessage: "Export" }),
    );
  });

  it("IconButton fires continue_conversation with its label", async () => {
    const onAction = vi.fn();
    const container = await renderCase("primitives", onAction);
    await userEvent.click(
      one(container, '.openui-dashboard-shell-card button[aria-label="Expand"]'),
    );
    await settle();
    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({ type: "continue_conversation", humanFriendlyMessage: "Expand" }),
    );
  });
});
