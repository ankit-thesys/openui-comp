/**
 * DatePicker — popup/portal family with hybrid controlled/uncontrolled state.
 *
 * Its public surface is small (DatePicker.tsx:7-17) but its state handling is
 * the most intricate in this slice, and three of this harness's most
 * significant findings live here (DP-1, DP-2, DP-3).
 *
 * Determinism: the popup calendar has no `month` prop, so it opens on "today".
 * Only `Date` is faked, leaving timers real so userEvent still works.
 *
 * Source: packages/react-ui/src/components/DatePicker/DatePicker.tsx
 *         .../DatePicker/helpers/components/FloatingDatePickerRenderer.tsx
 *         .../DatePicker/helpers/utils/helperFn.tsx
 */
import { expect, fn, userEvent } from "@storybook/test";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { DatePicker } from "../../../packages/react-ui/src/components/DatePicker";
import {
  DATE_PLACEHOLDER_RANGE,
  DATE_PLACEHOLDER_SINGLE,
  FIXED_DATE,
  FIXED_DATE_LABEL,
  FIXED_RANGE_END,
  FIXED_RANGE_END_LABEL,
  FIXED_RANGE_LABEL,
} from "../fixtures/data";
import { render } from "../setup/render";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"], now: FIXED_DATE });
});

afterEach(() => {
  vi.useRealTimers();
});

const TRIGGER = ".openui-date-picker-renderer-floating-input-container";
const POPUP = ".openui-date-picker-renderer-floating-content";

const triggerOf = (container: HTMLElement) => container.querySelector(TRIGGER) as HTMLElement;
const popup = () => document.querySelector(POPUP);
const popupDay = (day: string) =>
  Array.from(document.querySelectorAll(`${POPUP} button`)).find(
    (b) => b.textContent?.trim() === day,
  ) as HTMLElement | undefined;

describe("DatePicker — closed state", () => {
  it("renders a container and a trigger, with no popup", async () => {
    const { container } = await render(<DatePicker />);

    expect(
      container.querySelector(".openui-date-picker-renderer-floating-container"),
    ).toBeInTheDocument();
    expect(triggerOf(container)).toBeInTheDocument();
    expect(popup()).toBeNull();
  });

  it("shows the single-mode placeholder by default (mode defaults to 'single')", async () => {
    // DatePicker.tsx:23 defaults mode to "single"; formatSingleDate returns
    // "Select a date" for undefined (helperFn.tsx:84-87).
    const { container } = await render(<DatePicker />);
    expect(triggerOf(container)).toHaveTextContent(DATE_PLACEHOLDER_SINGLE);
  });

  it("shows the range placeholder in range mode", async () => {
    const { container } = await render(<DatePicker mode="range" />);
    expect(triggerOf(container)).toHaveTextContent(DATE_PLACEHOLDER_RANGE);
  });

  it("formats a provided single date as 'MMM d, yyyy'", async () => {
    const { container } = await render(
      <DatePicker mode="single" selectedSingleDate={FIXED_DATE} />,
    );
    expect(triggerOf(container)).toHaveTextContent(FIXED_DATE_LABEL);
  });

  it("formats a complete range as 'from - to'", async () => {
    const { container } = await render(
      <DatePicker mode="range" selectedRangeDates={{ from: FIXED_DATE, to: FIXED_RANGE_END }} />,
    );
    expect(triggerOf(container)).toHaveTextContent(FIXED_RANGE_LABEL);
  });

  it("formats a half-open range as the single `from` date", async () => {
    // helperFn.tsx:73-75.
    const { container } = await render(
      <DatePicker mode="range" selectedRangeDates={{ from: FIXED_DATE, to: undefined }} />,
    );
    expect(triggerOf(container)).toHaveTextContent(FIXED_DATE_LABEL);
    expect(triggerOf(container)).not.toHaveTextContent("-");
  });

  it("collapses a same-day range to one date", async () => {
    // helperFn.tsx:77-79.
    const { container } = await render(
      <DatePicker mode="range" selectedRangeDates={{ from: FIXED_DATE, to: FIXED_DATE }} />,
    );
    expect(triggerOf(container)).toHaveTextContent(FIXED_DATE_LABEL);
  });

  it("applies className and style to the outer container", async () => {
    const { container } = await render(
      <DatePicker className="my-picker" style={{ width: "240px" }} />,
    );
    const root = container.querySelector(
      ".openui-date-picker-renderer-floating-container",
    ) as HTMLElement;

    expect(root).toHaveClass("my-picker");
    expect(root.style.width).toBe("240px");
  });
});

describe("DatePicker — trigger accessibility", () => {
  it("renders the trigger as a plain <div> with NO interactive semantics", async () => {
    // OBSERVED DEFECT DP-1. FloatingDatePickerRenderer.tsx:20-31 builds the
    // trigger as a <div onClick>. It has no role, no tabIndex, no
    // aria-expanded, no aria-haspopup and no keyboard handler.
    const { container } = await render(<DatePicker />);
    const trigger = triggerOf(container);

    expect(trigger.tagName).toBe("DIV");
    expect(trigger).not.toHaveAttribute("role");
    expect(trigger).not.toHaveAttribute("tabindex");
    expect(trigger).not.toHaveAttribute("aria-expanded");
    expect(trigger).not.toHaveAttribute("aria-haspopup");
  });

  it("is UNREACHABLE by keyboard — Tab never lands on it", async () => {
    // The user-visible consequence of DP-1: a keyboard-only user cannot open
    // this control at all. Recorded as a defect, not corrected.
    const { container } = await render(<DatePicker />);
    const trigger = triggerOf(container);

    await userEvent.tab();
    expect(trigger).not.toHaveFocus();
    expect(document.body).toHaveFocus();

    // Enter with nothing focused cannot open the popup either.
    await userEvent.keyboard("{Enter}");
    expect(popup()).toBeNull();
  });

  it("exposes no accessible name or role for the control", async () => {
    const { queryByRole } = await render(<DatePicker />);
    expect(queryByRole("button")).toBeNull();
    expect(queryByRole("combobox")).toBeNull();
  });
});

describe("DatePicker — opening and closing by pointer", () => {
  it("opens on trigger click and portals the popup to document.body", async () => {
    const { container } = await render(<DatePicker />);

    await userEvent.click(triggerOf(container));

    expect(popup()).toBeInTheDocument();
    // FloatingDatePickerRenderer.tsx:71-82 portals to document.body.
    expect(container.querySelector(POPUP)).toBeNull();
    expect(document.querySelector(`${POPUP} [role="grid"]`)).toBeInTheDocument();
  });

  it("marks the trigger open/closed through its class, not an aria attribute", async () => {
    const { container } = await render(<DatePicker />);
    const trigger = triggerOf(container);

    expect(trigger).toHaveClass("openui-date-picker-renderer-floating-input-container-not-open");

    await userEvent.click(trigger);
    expect(trigger).toHaveClass("openui-date-picker-renderer-floating-input-container-open");
  });

  it("toggles closed on a second trigger click", async () => {
    const { container } = await render(<DatePicker />);
    const trigger = triggerOf(container);

    await userEvent.click(trigger);
    expect(popup()).toBeInTheDocument();

    await userEvent.click(trigger);
    expect(popup()).toBeNull();
  });

  it("closes on an outside mousedown", async () => {
    // FloatingDatePickerRenderer.tsx:98-116 listens on document.body.
    const { container } = await render(
      <>
        <DatePicker />
        <button type="button">outside</button>
      </>,
    );

    await userEvent.click(triggerOf(container));
    expect(popup()).toBeInTheDocument();

    await userEvent.click(container.querySelector("button")!);
    expect(popup()).toBeNull();
  });

  it("stays open when the popup itself is clicked", async () => {
    const { container } = await render(<DatePicker />);
    await userEvent.click(triggerOf(container));

    await userEvent.click(document.querySelector(`${POPUP} [role="grid"]`) as HTMLElement);
    expect(popup()).toBeInTheDocument();
  });

  it("does NOT close on Escape", async () => {
    // Observed baseline: only outside pointer interaction and a trigger click
    // close the popup. No key handling is wired up at all (a consequence of
    // DP-1's missing keyboard support).
    const { container } = await render(<DatePicker />);
    await userEvent.click(triggerOf(container));

    await userEvent.keyboard("{Escape}");
    expect(popup()).toBeInTheDocument();
  });
});

describe("DatePicker — choosing a date (full interaction)", () => {
  it("reports the chosen Date and updates the trigger label", async () => {
    const setSelectedSingleDate = fn();
    const { container } = await render(
      <DatePicker mode="single" setSelectedSingleDate={setSelectedSingleDate} />,
    );
    const trigger = triggerOf(container);

    await userEvent.click(trigger);
    await userEvent.click(popupDay("20")!);

    expect(setSelectedSingleDate).toHaveBeenCalledTimes(1);
    const [chosen] = setSelectedSingleDate.mock.calls[0] as [unknown];
    expect(chosen).toBeInstanceOf(Date);
    expect((chosen as Date).toDateString()).toBe(FIXED_RANGE_END.toDateString());

    // Uncontrolled: internal state advances, so the label follows.
    expect(trigger).toHaveTextContent(FIXED_RANGE_END_LABEL);
  });

  it("stays OPEN after a single date is chosen", async () => {
    // Observed baseline (finding DP-4): there is no close-on-select and no
    // apply/dismiss affordance inside the popup, so the only way to dismiss it
    // is a trigger click or an outside click.
    const { container } = await render(<DatePicker mode="single" />);

    await userEvent.click(triggerOf(container));
    await userEvent.click(popupDay("20")!);

    expect(popup()).toBeInTheDocument();
  });

  it("works with no setter supplied at all (purely internal state)", async () => {
    const { container } = await render(<DatePicker mode="single" />);
    const trigger = triggerOf(container);

    await userEvent.click(trigger);
    await userEvent.click(popupDay("14")!);

    expect(trigger).toHaveTextContent(FIXED_DATE_LABEL);
  });

  it("builds a range across two clicks and reports each step", async () => {
    const setSelectedRangeDates = fn();
    const { container } = await render(
      <DatePicker mode="range" setSelectedRangeDates={setSelectedRangeDates} />,
    );
    const trigger = triggerOf(container);

    await userEvent.click(trigger);
    await userEvent.click(popupDay("14")!);

    // First click opens a half-open range.
    const first = setSelectedRangeDates.mock.calls[0]?.[0] as DateRange;
    expect(first.from?.toDateString()).toBe(FIXED_DATE.toDateString());
    expect(trigger).toHaveTextContent(FIXED_DATE_LABEL);

    await userEvent.click(popupDay("20")!);

    const last = setSelectedRangeDates.mock.calls.at(-1)?.[0] as DateRange;
    expect(last.from?.toDateString()).toBe(FIXED_DATE.toDateString());
    expect(last.to?.toDateString()).toBe(FIXED_RANGE_END.toDateString());
    expect(trigger).toHaveTextContent(FIXED_RANGE_LABEL);
  });
});

describe("DatePicker — controlled state", () => {
  it("renders a controlled value and reports selections to the consumer", async () => {
    const setSelectedSingleDate = fn();
    const { container } = await render(
      <DatePicker
        mode="single"
        selectedSingleDate={FIXED_DATE}
        setSelectedSingleDate={setSelectedSingleDate}
      />,
    );
    const trigger = triggerOf(container);

    expect(trigger).toHaveTextContent(FIXED_DATE_LABEL);

    await userEvent.click(trigger);
    await userEvent.click(popupDay("20")!);

    expect(setSelectedSingleDate).toHaveBeenCalledTimes(1);
    // Pinned to the prop: the label does not move on its own.
    expect(trigger).toHaveTextContent(FIXED_DATE_LABEL);
  });

  it("CANNOT be cleared once a date has been picked while controlled", async () => {
    // OBSERVED DEFECT DP-2 — the highest-impact finding in this family.
    //
    // selectedDateHandler (DatePicker.tsx:49-57) guards on the TRUTHINESS of the
    // current prop, not on whether the prop was provided:
    //
    //   if (selectedSingleDate) { setSelectedSingleDate?.(d); return; }
    //   setSelectedSingleDate?.(d);
    //   setInternalSelectedDate(d);      // <-- also runs when controlled-but-empty
    //
    // A consumer that starts controlled-and-empty therefore ALSO seeds internal
    // state on the first pick. Because the render reads
    // `selectedSingleDate ?? internalSelectedDate` (DatePicker.tsx:73), setting
    // the controlled value back to undefined does not clear the display — the
    // stale internal date resurfaces.
    const Harness = () => {
      const [date, setDate] = useState<Date | undefined>(undefined);
      return (
        <>
          <button type="button" onClick={() => setDate(undefined)}>
            clear
          </button>
          <DatePicker mode="single" selectedSingleDate={date} setSelectedSingleDate={setDate} />
        </>
      );
    };

    const { container, getByText } = await render(<Harness />);
    const trigger = triggerOf(container);

    await userEvent.click(trigger);
    await userEvent.click(popupDay("14")!);
    expect(trigger).toHaveTextContent(FIXED_DATE_LABEL);

    // The consumer clears its own state...
    await userEvent.click(getByText("clear"));

    // ...and the picker still shows the old date instead of the placeholder.
    expect(trigger).toHaveTextContent(FIXED_DATE_LABEL);
    expect(trigger).not.toHaveTextContent(DATE_PLACEHOLDER_SINGLE);
  });

  it("has the same clearing defect in range mode", async () => {
    // DP-2 counterpart: selectedRangeHandler (DatePicker.tsx:59-67) is the same
    // shape, and the render reads `selectedRangeDates ?? internalSelectedRange`.
    const Harness = () => {
      const [range, setRange] = useState<DateRange | undefined>(undefined);
      return (
        <>
          <button type="button" onClick={() => setRange(undefined)}>
            clear
          </button>
          <DatePicker mode="range" selectedRangeDates={range} setSelectedRangeDates={setRange} />
        </>
      );
    };

    const { container, getByText } = await render(<Harness />);
    const trigger = triggerOf(container);

    await userEvent.click(trigger);
    await userEvent.click(popupDay("14")!);
    expect(trigger).toHaveTextContent(FIXED_DATE_LABEL);

    await userEvent.click(getByText("clear"));
    expect(trigger).not.toHaveTextContent(DATE_PLACEHOLDER_RANGE);
  });
});

describe("DatePicker — open state control", () => {
  it("honors isOpen={true} as the initial open state", async () => {
    await render(<DatePicker isOpen setIsOpen={() => {}} />);
    expect(popup()).toBeInTheDocument();
  });

  it("is STUCK OPEN when isOpen is given without setIsOpen", async () => {
    // OBSERVED DEFECT DP-3. DatePicker.tsx:77-78 wires the provider as:
    //
    //   isOpenFromParent={isOpen ?? internalIsOpen}
    //   setIsOpenFromParent={setIsOpen ?? setInternalIsOpen}
    //
    // With `isOpen` supplied but no setter, the fallback INTERNAL setter is used
    // while the displayed value still prefers the prop. Internal updates are
    // therefore invisible and the popup can never be dismissed — not by the
    // trigger, not by an outside click.
    const { container } = await render(
      <>
        <DatePicker isOpen />
        <button type="button">outside</button>
      </>,
    );
    expect(popup()).toBeInTheDocument();

    await userEvent.click(triggerOf(container));
    expect(popup()).toBeInTheDocument();

    await userEvent.click(container.querySelector("button")!);
    expect(popup()).toBeInTheDocument();
  });

  it("reports open-state changes to setIsOpen when one is supplied", async () => {
    const setIsOpen = fn();
    const { container } = await render(<DatePicker isOpen={false} setIsOpen={setIsOpen} />);

    await userEvent.click(triggerOf(container));

    expect(setIsOpen).toHaveBeenCalledTimes(1);
    expect(setIsOpen).toHaveBeenCalledWith(true);
  });

  it("is fully controllable when both isOpen and setIsOpen are supplied", async () => {
    const Harness = () => {
      const [open, setOpen] = useState(false);
      return <DatePicker isOpen={open} setIsOpen={setOpen} />;
    };

    const { container } = await render(<Harness />);
    const trigger = triggerOf(container);

    await userEvent.click(trigger);
    expect(popup()).toBeInTheDocument();

    await userEvent.click(trigger);
    expect(popup()).toBeNull();
  });
});
