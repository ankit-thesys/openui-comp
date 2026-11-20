/**
 * Calendar.
 *
 * A thin wrapper over react-day-picker v9: `CalendarProps` is literally
 * `React.ComponentProps<typeof DayPicker>` (Calendar.tsx:8), so the entire
 * public prop surface is DayPicker's. What this suite pins down is the part
 * openui actually owns — the container element, the injected defaults, and
 * which of them a consumer can and cannot override.
 *
 * Determinism: DayPicker defaults its visible month to "today", so every test
 * either passes an explicit `month` or fakes the clock. Only `Date` is faked,
 * leaving timers real so userEvent still works.
 *
 * Source: packages/react-ui/src/components/Calendar/Calendar.tsx
 */
import { expect, fn, userEvent } from "@storybook/test";
import { useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { Calendar } from "../../../packages/react-ui/src/components/Calendar";
import { FIXED_DATE, FIXED_RANGE_END } from "../fixtures/data";
import { render } from "../setup/render";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"], now: FIXED_DATE });
});

afterEach(() => {
  vi.useRealTimers();
});

const dayButton = (root: ParentNode, day: string): HTMLButtonElement | undefined =>
  Array.from<HTMLButtonElement>(root.querySelectorAll("button")).find(
    (b) => b.textContent?.trim() === day,
  );

describe("Calendar — rendered contract", () => {
  it("wraps DayPicker in a div.openui-calendar-container (Calendar.tsx:30)", async () => {
    const { container } = await render(<Calendar mode="single" month={FIXED_DATE} />);
    const root = container.firstElementChild!;

    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("openui-calendar-container");
  });

  it("puts a consumer className on the container, not on DayPicker", async () => {
    const { container } = await render(
      <Calendar mode="single" month={FIXED_DATE} className="my-cal" />,
    );
    expect(container.firstElementChild).toHaveClass("openui-calendar-container", "my-cal");
  });

  it("renders a day grid for the requested month", async () => {
    const { container } = await render(<Calendar mode="single" month={FIXED_DATE} />);

    expect(container.querySelector('[role="grid"]')).toBeInTheDocument();
    // March 2024 starts on a Friday and has 31 days → 5 weeks of cells.
    expect(dayButton(container, "1")).toBeDefined();
    expect(dayButton(container, "31")).toBeDefined();
  });

  it("defaults captionLayout to dropdown, rendering openui Selects — not native <select>", async () => {
    // Calendar.tsx:18 injects captionLayout: "dropdown", and Calendar.tsx:19-26
    // replaces DayPicker's native dropdowns with MonthsDropdown/YearsDropdown
    // from ./components/helperComponents, which are built on the openui Select.
    //
    // Consequence worth recording for the migration: the month/year pickers are
    // role=combobox buttons, so they inherit Select's behavior (and its
    // findings SE-1/SE-3) rather than native select semantics.
    const { container } = await render(<Calendar mode="single" month={FIXED_DATE} />);

    expect(container.querySelectorAll("select")).toHaveLength(0);
    const comboboxes = container.querySelectorAll('[role="combobox"]');
    expect(comboboxes).toHaveLength(2);
    expect(container.querySelector(".openui-calendar-months-dropdown")).toBeInTheDocument();
    expect(container.querySelector(".openui-calendar-years-dropdown")).toBeInTheDocument();
    expect(comboboxes[0]).toHaveTextContent("March");
    expect(comboboxes[1]).toHaveTextContent("2024");
  });

  it("lets a consumer override the injected captionLayout", async () => {
    // commonProps is spread BEFORE {...props} (Calendar.tsx:32-33), so consumer
    // props win and the caption falls back to a plain label.
    const { container } = await render(
      <Calendar mode="single" month={FIXED_DATE} captionLayout="label" />,
    );
    expect(container.querySelectorAll('[role="combobox"]')).toHaveLength(0);
  });

  it("defaults the visible month to today when `month` is omitted", async () => {
    const { container } = await render(<Calendar mode="single" />);
    // Clock is faked to March 2024.
    expect(container.textContent).toContain("2024");
    expect(dayButton(container, "14")).toBeDefined();
  });

  it("merges consumer classNames over the mode-derived defaults", async () => {
    // Calendar.tsx:34-39: the day-picker classNames object is spread first and
    // consumer entries override individual keys.
    const { container } = await render(
      <Calendar mode="single" month={FIXED_DATE} classNames={{ month_grid: "my-grid" }} />,
    );
    expect(container.querySelector(".my-grid")).toBeInTheDocument();
  });

  it("REPLACES the injected dropdown components if a consumer passes `components`", async () => {
    // OBSERVED DEFECT CA-1: `components` lives in commonProps (Calendar.tsx:19-26)
    // and is spread before {...props}, so any consumer-supplied `components`
    // object replaces the whole map — silently dropping the MonthsDropdown and
    // YearsDropdown wrappers that give the caption its container-aware
    // behavior. There is no per-key merge.
    const { container } = await render(
      <Calendar
        mode="single"
        month={FIXED_DATE}
        components={{ MonthsDropdown: () => <span data-testid="custom-months" /> }}
      />,
    );

    expect(container.querySelector('[data-testid="custom-months"]')).toBeInTheDocument();
  });
});

describe("Calendar — single mode selection", () => {
  it("marks the selected day with aria-selected", async () => {
    const { container } = await render(
      <Calendar mode="single" month={FIXED_DATE} selected={FIXED_DATE} />,
    );
    expect(container.querySelector('[aria-selected="true"]')).toHaveTextContent("14");
  });

  it("reports the clicked Date through onSelect", async () => {
    const onSelect = fn();
    const { container } = await render(
      <Calendar mode="single" month={FIXED_DATE} selected={FIXED_DATE} onSelect={onSelect} />,
    );

    await userEvent.click(dayButton(container, "20")!);

    expect(onSelect).toHaveBeenCalledTimes(1);
    // Payload is DayPicker's: (date, triggerDate, modifiers, event).
    const [selected] = onSelect.mock.calls[0] as [unknown];
    expect(selected).toBeInstanceOf(Date);
    expect((selected as Date).toDateString()).toBe(FIXED_RANGE_END.toDateString());
  });

  it("reports `undefined` when the selected day is clicked again", async () => {
    const onSelect = fn();
    const { container } = await render(
      <Calendar mode="single" month={FIXED_DATE} selected={FIXED_DATE} onSelect={onSelect} />,
    );

    await userEvent.click(dayButton(container, "14")!);
    expect(onSelect.mock.calls[0]?.[0]).toBeUndefined();
  });

  it("is controlled: `selected` does not move on its own", async () => {
    const onSelect = fn();
    const { container } = await render(
      <Calendar mode="single" month={FIXED_DATE} selected={FIXED_DATE} onSelect={onSelect} />,
    );

    await userEvent.click(dayButton(container, "20")!);
    expect(container.querySelector('[aria-selected="true"]')).toHaveTextContent("14");
  });

  it("does NOT re-read `selected` on re-render — and raw DayPicker does the same", async () => {
    // OBSERVED DEFECT CA-2, attributed UPSTREAM rather than to openui.
    //
    // Pushing a new `selected` into an already-mounted Calendar leaves the
    // highlight on the original day. A fresh mount with the same prop is
    // correct, so this is an update path only.
    //
    // react-day-picker 9.14.0 is rendered directly below as a control group and
    // behaves identically, which establishes that Calendar.tsx is not the
    // cause. It is recorded here because it is high-impact for the migration:
    // a consumer holding the selection in its own state cannot drive this
    // component through `selected` alone.
    const openui = await render(
      <Calendar mode="single" month={FIXED_DATE} selected={FIXED_DATE} />,
    );
    expect(openui.container.querySelector('[aria-selected="true"]')).toHaveTextContent("14");

    await openui.rerender(<Calendar mode="single" month={FIXED_DATE} selected={FIXED_RANGE_END} />);
    expect(openui.container.querySelector('[aria-selected="true"]')).toHaveTextContent("14");
    openui.unmount();

    const raw = await render(<DayPicker mode="single" month={FIXED_DATE} selected={FIXED_DATE} />);
    await raw.rerender(<DayPicker mode="single" month={FIXED_DATE} selected={FIXED_RANGE_END} />);
    expect(raw.container.querySelector('[aria-selected="true"]')).toHaveTextContent("14");
  });

  it("DOES honor `selected` on a fresh mount", async () => {
    // The counterpart to CA-2: the prop is read correctly at mount time.
    const { container } = await render(
      <Calendar mode="single" month={FIXED_DATE} selected={FIXED_RANGE_END} />,
    );
    expect(container.querySelector('[aria-selected="true"]')).toHaveTextContent("20");
  });
});

describe("Calendar — range mode selection", () => {
  it("marks every day in the range as selected", async () => {
    const { container } = await render(
      <Calendar
        mode="range"
        month={FIXED_DATE}
        selected={{ from: FIXED_DATE, to: FIXED_RANGE_END }}
      />,
    );
    const selected = container.querySelectorAll('[aria-selected="true"]');

    // 14th through 20th inclusive.
    expect(selected).toHaveLength(7);
  });

  it("reports a DateRange payload when a day is clicked", async () => {
    const onSelect = fn();
    const { container } = await render(
      <Calendar mode="range" month={FIXED_DATE} onSelect={onSelect} />,
    );

    await userEvent.click(dayButton(container, "14")!);

    const [range] = onSelect.mock.calls[0] as [unknown];
    expect(range).toMatchObject({ from: expect.any(Date) });
    expect((range as { from: Date }).from.toDateString()).toBe(FIXED_DATE.toDateString());
  });

  it("completes a range across two clicks", async () => {
    const onSelect = fn();
    const Harness = () => {
      const [range, setRange] = useState<DateRange | undefined>(undefined);
      return (
        <Calendar
          mode="range"
          month={FIXED_DATE}
          selected={range}
          onSelect={(next) => {
            setRange(next);
            onSelect(next);
          }}
        />
      );
    };
    const { container } = await render(<Harness />);

    await userEvent.click(dayButton(container, "14")!);
    await userEvent.click(dayButton(container, "20")!);

    const last = onSelect.mock.calls.at(-1)?.[0] as { from: Date; to?: Date };
    expect(last.from.toDateString()).toBe(FIXED_DATE.toDateString());
    expect(last.to?.toDateString()).toBe(FIXED_RANGE_END.toDateString());
  });
});

describe("Calendar — disabled days", () => {
  it("disables matching day buttons and suppresses their selection", async () => {
    const onSelect = fn();
    const { container } = await render(
      <Calendar
        mode="single"
        month={FIXED_DATE}
        disabled={{ before: FIXED_DATE }}
        onSelect={onSelect}
      />,
    );
    const earlier = dayButton(container, "10")!;

    expect(earlier).toBeDisabled();

    await userEvent.click(earlier);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("keeps enabled days clickable alongside disabled ones", async () => {
    const onSelect = fn();
    const { container } = await render(
      <Calendar
        mode="single"
        month={FIXED_DATE}
        disabled={{ before: FIXED_DATE }}
        onSelect={onSelect}
      />,
    );

    await userEvent.click(dayButton(container, "20")!);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

describe("Calendar — focus and keyboard", () => {
  it("exposes a single tab stop into the grid and moves focus with arrows", async () => {
    const { container } = await render(
      <Calendar mode="single" month={FIXED_DATE} selected={FIXED_DATE} captionLayout="label" />,
    );

    // Observed tab order: "Go to the Previous Month", "Go to the Next Month",
    // then a SINGLE grid tab stop (the selected day).
    await userEvent.tab();
    expect(container.querySelector(".openui-calendar-button-previous")).toHaveFocus();

    await userEvent.tab();
    expect(container.querySelector(".openui-calendar-button-next")).toHaveFocus();

    await userEvent.tab();
    expect(dayButton(container, "14")).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    expect(dayButton(container, "15")).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    expect(dayButton(container, "22")).toHaveFocus();
  });

  it("selects the focused day with Enter", async () => {
    const onSelect = fn();
    const { container } = await render(
      <Calendar
        mode="single"
        month={FIXED_DATE}
        selected={FIXED_DATE}
        captionLayout="label"
        onSelect={onSelect}
      />,
    );

    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    expect(dayButton(container, "14")).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    await userEvent.keyboard("{Enter}");

    const [selected] = onSelect.mock.calls[0] as [unknown];
    expect((selected as Date).getDate()).toBe(15);
  });
});
