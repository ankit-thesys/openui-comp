/**
 * End-to-end pass over the runnable legacy consumer.
 *
 * Where the per-family suites pin each component's contract in isolation, this
 * drives the same app a human would click through, to show the families compose
 * and that real user interactions produce the expected consumer-visible values.
 *
 * Fixture: ../fixtures/LegacyConsumerApp.tsx
 */
import { expect, fn, userEvent } from "@storybook/test";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { LegacyConsumerApp } from "../fixtures/LegacyConsumerApp";
import { FIXED_DATE, FIXED_DATE_LABEL, SELECT_ITEMS, SLIDER_DEFAULT } from "../fixtures/data";
import { render } from "../setup/render";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"], now: FIXED_DATE });
});

afterEach(() => {
  vi.useRealTimers();
});

const POPUP = ".openui-date-picker-renderer-floating-content";

describe("legacy consumer — smoke", () => {
  it("renders every in-scope family in one tree without error", async () => {
    const { getByTestId } = await render(<LegacyConsumerApp />);

    for (const section of [
      "section-checkboxes",
      "section-radio",
      "section-switches",
      "section-toggle",
      "section-select",
      "section-chips",
      "section-option-cards",
      "section-slider",
      "section-datepicker-single",
      "section-datepicker-range",
      "section-calendar",
      "section-buttons",
    ]) {
      expect(getByTestId(section)).toBeInTheDocument();
    }
  });

  it("starts from the documented deterministic defaults", async () => {
    const { getByTestId } = await render(<LegacyConsumerApp />);

    expect(getByTestId("v-checkboxes")).toHaveTextContent("—");
    expect(getByTestId("v-shipping")).toHaveTextContent("standard");
    expect(getByTestId("v-notifications")).toHaveTextContent("—");
    expect(getByTestId("v-view")).toHaveTextContent("list");
    expect(getByTestId("v-currency")).toHaveTextContent("—");
    expect(getByTestId("v-budget")).toHaveTextContent(String(SLIDER_DEFAULT[0]));
    expect(getByTestId("v-icon-clicks")).toHaveTextContent("0");
  });
});

describe("legacy consumer — full interactions", () => {
  it("toggles a group value: checkboxes accumulate and drop", async () => {
    const onStateChange = fn();
    const { getByTestId, getAllByRole } = await render(
      <LegacyConsumerApp onStateChange={onStateChange} />,
    );

    const boxes = getAllByRole("checkbox");
    await userEvent.click(boxes[0]);
    expect(getByTestId("v-checkboxes")).toHaveTextContent("email");

    await userEvent.click(boxes[1]);
    expect(getByTestId("v-checkboxes")).toHaveTextContent("email,sms");

    // Re-clicking removes it again.
    await userEvent.click(boxes[0]);
    expect(getByTestId("v-checkboxes")).toHaveTextContent("sms");

    // The third checkbox is disabled in the fixture and must stay inert.
    expect(boxes[2]).toBeDisabled();
    await userEvent.click(boxes[2]);
    expect(getByTestId("v-checkboxes")).toHaveTextContent("sms");
  });

  it("changes the radio selection and flips the FormControl error state", async () => {
    const { container, getByTestId, getAllByRole } = await render(<LegacyConsumerApp />);
    const radios = getAllByRole("radio");

    // The fixture treats "overnight" as an error state.
    const hints = container.querySelectorAll(".openui-hint");
    expect(Array.from<Element>(hints).some((h) => h.classList.contains("openui-hint-error"))).toBe(
      false,
    );

    await userEvent.click(radios[2]);
    expect(getByTestId("v-shipping")).toHaveTextContent("overnight");
    expect(
      Array.from<Element>(container.querySelectorAll(".openui-hint")).some((h) =>
        h.classList.contains("openui-hint-error"),
      ),
    ).toBe(true);
  });

  it("toggles switches independently", async () => {
    const { getByTestId, getAllByRole } = await render(<LegacyConsumerApp />);
    const switches = getAllByRole("switch");

    await userEvent.click(switches[1]);
    expect(getByTestId("v-notifications")).toHaveTextContent("beta");

    await userEvent.click(switches[0]);
    expect(getByTestId("v-notifications")).toHaveTextContent("beta,analytics");
  });

  it("moves the toggle group to another view", async () => {
    const { getByTestId, getByText } = await render(<LegacyConsumerApp />);

    await userEvent.click(getByText("Table"));
    expect(getByTestId("v-view")).toHaveTextContent("table");
  });

  it("selects an option from the portal Select", async () => {
    const { getByTestId } = await render(<LegacyConsumerApp />);
    // Scoped deliberately: in a composed app three different families expose
    // overlapping roles — Chips uses role=listbox/option, the Calendar caption
    // is built from openui Selects (role=combobox), and OptionCards uses
    // role=radiogroup/radio just like RadioGroup. A bare getByRole would be
    // ambiguous, which is itself worth recording for consumers writing tests.
    const trigger = getByTestId("section-select").querySelector('[role="combobox"]') as HTMLElement;

    await userEvent.click(trigger);
    // The Select's own options live in its portal content, not anywhere else.
    const options = Array.from(document.querySelectorAll('.openui-select-content [role="option"]'));
    expect(options.map((o) => o.textContent)).toEqual(SELECT_ITEMS.map((i) => i.label));

    await userEvent.click(options[1]!);

    expect(getByTestId("v-currency")).toHaveTextContent(SELECT_ITEMS[1].value);
    expect(trigger).toHaveTextContent(SELECT_ITEMS[1].label);
  });

  it("toggles chips, with the consumer owning the array", async () => {
    const { getByTestId } = await render(<LegacyConsumerApp />);
    const chips = getByTestId("section-chips").querySelectorAll('[role="option"]');

    await userEvent.click(chips[0]);
    expect(getByTestId("v-languages")).toHaveTextContent("typescript");

    await userEvent.click(chips[1]);
    expect(getByTestId("v-languages")).toHaveTextContent("typescript,rust");

    await userEvent.click(chips[0]);
    expect(getByTestId("v-languages")).toHaveTextContent("rust");

    // The third chip is disabled in the fixture.
    expect(chips[2]).toBeDisabled();
  });

  it("enforces single-select for option cards in the CONSUMER, not the component", async () => {
    const { getByTestId } = await render(<LegacyConsumerApp />);
    // Scoped by section: RadioGroup and OptionCards both render role=radiogroup.
    const cards = getByTestId("section-option-cards").querySelectorAll('[role="radio"]');

    await userEvent.click(cards[0]);
    expect(getByTestId("v-plan")).toHaveTextContent("starter");

    await userEvent.click(cards[1]);
    // Single value only, because LegacyConsumerApp replaces rather than appends.
    expect(getByTestId("v-plan")).toHaveTextContent("team");
  });

  it("moves the slider with the keyboard and reports the new value", async () => {
    const { getByTestId, getByRole } = await render(<LegacyConsumerApp />);
    const thumb = getByRole("slider");

    thumb.focus();
    expect(thumb).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    expect(getByTestId("v-budget")).toHaveTextContent("300");

    await userEvent.keyboard("{ArrowLeft}");
    await userEvent.keyboard("{ArrowLeft}");
    expect(getByTestId("v-budget")).toHaveTextContent("100");
  });

  it("chooses a date through the single DatePicker popup", async () => {
    const { getByTestId } = await render(<LegacyConsumerApp />);
    const trigger = getByTestId("section-datepicker-single").querySelector(
      ".openui-date-picker-renderer-floating-input-container",
    ) as HTMLElement;

    expect(trigger).toHaveTextContent("Select a date");

    await userEvent.click(trigger);
    const day = Array.from(document.querySelectorAll(`${POPUP} button`)).find(
      (b) => b.textContent?.trim() === "14",
    ) as HTMLElement;
    await userEvent.click(day);

    expect(trigger).toHaveTextContent(FIXED_DATE_LABEL);
  });

  it("builds a range through the range DatePicker popup", async () => {
    const { getByTestId } = await render(<LegacyConsumerApp />);
    const trigger = getByTestId("section-datepicker-range").querySelector(
      ".openui-date-picker-renderer-floating-input-container",
    ) as HTMLElement;

    await userEvent.click(trigger);
    const buttons = Array.from(document.querySelectorAll(`${POPUP} button`));
    const from = buttons.find((b) => b.textContent?.trim() === "14") as HTMLElement;
    await userEvent.click(from);
    const to = buttons.find((b) => b.textContent?.trim() === "20") as HTMLElement;
    await userEvent.click(to);

    expect(trigger).toHaveTextContent("Mar 14, 2024 - Mar 20, 2024");
  });

  it("selects a day in the inline Calendar", async () => {
    const onStateChange = fn();
    const { getByTestId } = await render(<LegacyConsumerApp onStateChange={onStateChange} />);
    const calendar = getByTestId("section-calendar");

    const day20 = Array.from<HTMLButtonElement>(calendar.querySelectorAll("button")).find(
      (b) => b.textContent?.trim() === "20",
    ) as HTMLElement;
    await userEvent.click(day20);

    const last = onStateChange.mock.calls.at(-1)?.[0] as { calendarDay?: Date };
    expect(last.calendarDay?.getDate()).toBe(20);
  });

  it("fires the icon button and leaves the disabled one inert", async () => {
    const { getByTestId, getByRole } = await render(<LegacyConsumerApp />);

    await userEvent.click(getByRole("button", { name: "Delete row" }));
    expect(getByTestId("v-icon-clicks")).toHaveTextContent("1");

    const disabled = getByRole("button", { name: "Delete row (disabled)" });
    expect(disabled).toBeDisabled();
    await userEvent.click(disabled);
    expect(getByTestId("v-icon-clicks")).toHaveTextContent("1");
  });

  it("keeps every family's value independent across a mixed session", async () => {
    const { getByTestId, getAllByRole, getByText } = await render(<LegacyConsumerApp />);

    await userEvent.click(getAllByRole("checkbox")[0]);
    await userEvent.click(getAllByRole("switch")[0]);
    await userEvent.click(getByText("Grid"));
    await userEvent.click(
      getByTestId("section-chips").querySelector('[role="option"]') as HTMLElement,
    );

    expect(getByTestId("v-checkboxes")).toHaveTextContent("email");
    expect(getByTestId("v-notifications")).toHaveTextContent("analytics");
    expect(getByTestId("v-view")).toHaveTextContent("grid");
    expect(getByTestId("v-languages")).toHaveTextContent("typescript");
    // Untouched families keep their defaults.
    expect(getByTestId("v-shipping")).toHaveTextContent("standard");
    expect(getByTestId("v-budget")).toHaveTextContent(String(SLIDER_DEFAULT[0]));
  });
});
