/**
 * Slider.
 *
 * Interactive, hybrid controlled/uncontrolled. `SliderBlock` is also exported
 * from this family's index but composes `Input` (owned by #9), so it is
 * documented in docs/behavior-matrix.md rather than given its own suite here.
 *
 * Source: packages/react-ui/src/components/Slider/Slider.tsx
 */
import { expect, fn, userEvent } from "@storybook/test";
import { describe, it } from "vitest";
import { Slider } from "../../../packages/react-ui/src/components/Slider/Slider";
import {
  SLIDER_DEFAULT,
  SLIDER_MAX,
  SLIDER_MIN,
  SLIDER_RANGE_DEFAULT,
  SLIDER_STEP,
} from "../fixtures/data";
import { render } from "../setup/render";

const base = { variant: "continuous", min: SLIDER_MIN, max: SLIDER_MAX } as const;

describe("Slider — rendered contract", () => {
  it("renders a single role=slider thumb with the expected ARIA range", async () => {
    const { getByRole } = await render(<Slider {...base} defaultValue={SLIDER_DEFAULT} />);
    const thumb = getByRole("slider");

    expect(thumb).toHaveAttribute("aria-valuemin", String(SLIDER_MIN));
    expect(thumb).toHaveAttribute("aria-valuemax", String(SLIDER_MAX));
    expect(thumb).toHaveAttribute("aria-valuenow", String(SLIDER_DEFAULT[0]));
  });

  it("renders wrapper, track and range elements", async () => {
    const { container } = await render(<Slider {...base} defaultValue={SLIDER_DEFAULT} />);

    expect(container.querySelector(".openui-slider-wrapper")).toBeInTheDocument();
    expect(container.querySelector(".openui-slider-track")).toBeInTheDocument();
    expect(container.querySelector(".openui-slider-range")).toBeInTheDocument();
  });

  it("defaults the uncontrolled value to [min] when no defaultValue is given", async () => {
    // Slider.tsx:58-60.
    const { getByRole } = await render(<Slider {...base} />);
    expect(getByRole("slider")).toHaveAttribute("aria-valuenow", String(SLIDER_MIN));
  });

  it("renders min/max labels through the compact formatter", async () => {
    // formatNumber (Slider.tsx:5-19) switches to Intl compact notation at >= 1000
    // and lowercases it, so 1000 renders as "1k" while 0 renders as "0".
    const { container } = await render(<Slider {...base} defaultValue={SLIDER_DEFAULT} />);
    const labels = container.querySelector(".openui-slider-labels")!;

    expect(labels.children[0]).toHaveTextContent("0");
    expect(labels.children[1]).toHaveTextContent("1k");
  });

  it("formats the thumb indicator with the same compact rule", async () => {
    const under = await render(<Slider {...base} defaultValue={[999]} />);
    expect(under.container.querySelector(".openui-slider-thumb-value")).toHaveTextContent("999");
    under.unmount();

    const over = await render(<Slider {...base} defaultValue={[1500]} max={2000} />);
    expect(over.container.querySelector(".openui-slider-thumb-value")).toHaveTextContent("1.5k");
  });

  it("adds the at-min class only when a single value sits exactly on min", async () => {
    const atMin = await render(<Slider {...base} defaultValue={[SLIDER_MIN]} />);
    expect(atMin.container.querySelector(".openui-slider-range")).toHaveClass(
      "openui-slider-range--at-min",
    );
    atMin.unmount();

    const above = await render(<Slider {...base} defaultValue={SLIDER_DEFAULT} />);
    expect(above.container.querySelector(".openui-slider-range")).not.toHaveClass(
      "openui-slider-range--at-min",
    );
  });

  it("renders optional left and right content slots", async () => {
    const { container, getByText } = await render(
      <Slider
        {...base}
        defaultValue={SLIDER_DEFAULT}
        leftContent={<span>Low</span>}
        rightContent={<span>High</span>}
      />,
    );

    expect(container.querySelector(".openui-slider-left-content")).toBeInTheDocument();
    expect(container.querySelector(".openui-slider-right-content")).toBeInTheDocument();
    expect(getByText("Low")).toBeInTheDocument();
    expect(getByText("High")).toBeInTheDocument();
  });

  it("omits the content slots when not provided", async () => {
    const { container } = await render(<Slider {...base} defaultValue={SLIDER_DEFAULT} />);

    expect(container.querySelector(".openui-slider-left-content")).toBeNull();
    expect(container.querySelector(".openui-slider-right-content")).toBeNull();
  });
});

describe("Slider — discrete variant dots", () => {
  it("renders (max-min)/step + 1 dots when variant=discrete AND step is set", async () => {
    // Slider.tsx:103-107: 0..1000 step 100 → 11 dots.
    const { container } = await render(
      <Slider
        variant="discrete"
        min={SLIDER_MIN}
        max={SLIDER_MAX}
        step={SLIDER_STEP}
        defaultValue={SLIDER_DEFAULT}
      />,
    );
    expect(container.querySelectorAll(".openui-slider-dots-dot")).toHaveLength(11);
  });

  it("marks dots up to the current value as active", async () => {
    const { container } = await render(
      <Slider
        variant="discrete"
        min={SLIDER_MIN}
        max={SLIDER_MAX}
        step={SLIDER_STEP}
        defaultValue={[200]}
      />,
    );
    const active = container.querySelectorAll(".openui-slider-dots-dot--active");

    // Dots at 0, 100 and 200 are <= the current value.
    expect(active).toHaveLength(3);
  });

  it("renders NO dots for variant=discrete when step is omitted", async () => {
    // OBSERVED DEFECT SL-1: the dots are gated on `step` being truthy
    // (Slider.tsx:103), so a discrete slider without an explicit step silently
    // looks continuous. `step` is optional in SliderProps.
    const { container } = await render(
      <Slider variant="discrete" min={SLIDER_MIN} max={SLIDER_MAX} defaultValue={SLIDER_DEFAULT} />,
    );
    expect(container.querySelectorAll(".openui-slider-dots-dot")).toHaveLength(0);
  });

  it("renders no dots for the continuous variant even when step is set", async () => {
    const { container } = await render(
      <Slider {...base} step={SLIDER_STEP} defaultValue={SLIDER_DEFAULT} />,
    );
    expect(container.querySelectorAll(".openui-slider-dots-dot")).toHaveLength(0);
  });
});

describe("Slider — range (multi-thumb)", () => {
  it("renders one thumb per value with its own indicator", async () => {
    const { getAllByRole, container } = await render(
      <Slider {...base} defaultValue={SLIDER_RANGE_DEFAULT} />,
    );

    expect(getAllByRole("slider")).toHaveLength(2);
    expect(container.querySelectorAll(".openui-slider-thumb-value")).toHaveLength(2);
  });

  it("gives each thumb its own aria-valuenow", async () => {
    const { getAllByRole } = await render(<Slider {...base} defaultValue={SLIDER_RANGE_DEFAULT} />);
    const [low, high] = getAllByRole("slider");

    expect(low).toHaveAttribute("aria-valuenow", String(SLIDER_RANGE_DEFAULT[0]));
    expect(high).toHaveAttribute("aria-valuenow", String(SLIDER_RANGE_DEFAULT[1]));
  });

  it("never renders the at-min class in range mode", async () => {
    // `!isRange &&` guard at Slider.tsx:159.
    const { container } = await render(<Slider {...base} defaultValue={[SLIDER_MIN, 400]} />);
    expect(container.querySelector(".openui-slider-range")).not.toHaveClass(
      "openui-slider-range--at-min",
    );
  });
});

describe("Slider — keyboard interaction (uncontrolled)", () => {
  it("increments by step on ArrowRight and reports the new array", async () => {
    const onValueChange = fn();
    const { getByRole } = await render(
      <Slider
        variant="discrete"
        min={SLIDER_MIN}
        max={SLIDER_MAX}
        step={SLIDER_STEP}
        defaultValue={[200]}
        onValueChange={onValueChange}
      />,
    );
    const thumb = getByRole("slider");

    await userEvent.tab();
    expect(thumb).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");

    // Payload is Radix's number[] (Slider.tsx:145-150).
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith([300]);
    // Uncontrolled: internal state advances, so the DOM follows.
    expect(thumb).toHaveAttribute("aria-valuenow", "300");
  });

  it("decrements on ArrowLeft and clamps at min", async () => {
    const onValueChange = fn();
    const { getByRole } = await render(
      <Slider
        variant="discrete"
        min={SLIDER_MIN}
        max={SLIDER_MAX}
        step={SLIDER_STEP}
        defaultValue={[SLIDER_STEP]}
        onValueChange={onValueChange}
      />,
    );
    const thumb = getByRole("slider");

    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}");
    expect(thumb).toHaveAttribute("aria-valuenow", String(SLIDER_MIN));

    // Already at min: a further press must not go below it.
    await userEvent.keyboard("{ArrowLeft}");
    expect(thumb).toHaveAttribute("aria-valuenow", String(SLIDER_MIN));
  });

  it("clamps at max", async () => {
    const { getByRole } = await render(
      <Slider
        variant="discrete"
        min={SLIDER_MIN}
        max={SLIDER_MAX}
        step={SLIDER_STEP}
        defaultValue={[SLIDER_MAX]}
      />,
    );
    const thumb = getByRole("slider");

    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(thumb).toHaveAttribute("aria-valuenow", String(SLIDER_MAX));
  });

  it("jumps to the bounds with Home and End", async () => {
    const { getByRole } = await render(
      <Slider {...base} step={SLIDER_STEP} defaultValue={[400]} />,
    );
    const thumb = getByRole("slider");

    await userEvent.tab();
    await userEvent.keyboard("{Home}");
    expect(thumb).toHaveAttribute("aria-valuenow", String(SLIDER_MIN));

    await userEvent.keyboard("{End}");
    expect(thumb).toHaveAttribute("aria-valuenow", String(SLIDER_MAX));
  });

  it("updates the thumb indicator text as the value moves", async () => {
    const { container, getByRole } = await render(
      <Slider
        variant="discrete"
        min={SLIDER_MIN}
        max={SLIDER_MAX}
        step={SLIDER_STEP}
        defaultValue={[800]}
      />,
    );
    expect(container.querySelector(".openui-slider-thumb-value")).toHaveTextContent("800");

    await userEvent.tab();
    expect(getByRole("slider")).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.keyboard("{ArrowRight}");

    // Crosses the compact-notation boundary at 1000.
    expect(container.querySelector(".openui-slider-thumb-value")).toHaveTextContent("1k");
  });

  it("enforces minStepsBetweenThumbs=1 in range mode", async () => {
    // Hardcoded at Slider.tsx:151 and not overridable through props.
    const { getAllByRole } = await render(
      <Slider
        variant="discrete"
        min={SLIDER_MIN}
        max={SLIDER_MAX}
        step={SLIDER_STEP}
        defaultValue={[200, 300]}
      />,
    );
    const [low] = getAllByRole("slider");

    await userEvent.tab();
    expect(low).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");

    // Cannot reach 300: it must stay at least one step below the upper thumb.
    expect(low).toHaveAttribute("aria-valuenow", "200");
  });
});

describe("Slider — controlled behavior", () => {
  it("stays pinned to the `value` prop while still reporting intent", async () => {
    const onValueChange = fn();
    const { getByRole } = await render(
      <Slider
        variant="discrete"
        min={SLIDER_MIN}
        max={SLIDER_MAX}
        step={SLIDER_STEP}
        value={[200]}
        onValueChange={onValueChange}
      />,
    );
    const thumb = getByRole("slider");

    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");

    expect(onValueChange).toHaveBeenLastCalledWith([300]);
    expect(thumb).toHaveAttribute("aria-valuenow", "200");
  });

  it("reflects a controlled value pushed in by the consumer", async () => {
    const { getByRole, rerender } = await render(<Slider {...base} value={[200]} />);
    expect(getByRole("slider")).toHaveAttribute("aria-valuenow", "200");

    await rerender(<Slider {...base} value={[700]} />);
    expect(getByRole("slider")).toHaveAttribute("aria-valuenow", "700");
  });

  it("ignores later changes to defaultValue, as an uncontrolled input should", async () => {
    const { getByRole, rerender } = await render(<Slider {...base} defaultValue={[200]} />);
    expect(getByRole("slider")).toHaveAttribute("aria-valuenow", "200");

    await rerender(<Slider {...base} defaultValue={[700]} />);
    expect(getByRole("slider")).toHaveAttribute("aria-valuenow", "200");
  });

  it("switches from uncontrolled to controlled when `value` appears", async () => {
    // `isControlled` is recomputed per render (Slider.tsx:62), so adding
    // `value` later takes over immediately. Recorded as observed behavior.
    const { getByRole, rerender } = await render(<Slider {...base} defaultValue={[200]} />);
    await rerender(<Slider {...base} defaultValue={[200]} value={[900]} />);

    expect(getByRole("slider")).toHaveAttribute("aria-valuenow", "900");
  });
});

describe("Slider — disabled", () => {
  it("marks every thumb disabled and adds the disabled class", async () => {
    const { container, getByRole } = await render(
      <Slider {...base} defaultValue={SLIDER_DEFAULT} disabled />,
    );

    expect(container.querySelector(".openui-slider-root")).toHaveClass("openui-slider--disabled");
    expect(getByRole("slider")).toHaveAttribute("data-disabled");
  });

  it("HIDES the value indicator while disabled", async () => {
    // Slider.tsx:80,94 gate the indicator on `!disabled`, so a disabled slider
    // shows no numeric value at all.
    const { container } = await render(<Slider {...base} defaultValue={SLIDER_DEFAULT} disabled />);
    expect(container.querySelector(".openui-slider-thumb-value")).toBeNull();
  });

  it("ignores keyboard input and is not tabbable while disabled", async () => {
    const onValueChange = fn();
    const { getByRole } = await render(
      <Slider
        variant="discrete"
        min={SLIDER_MIN}
        max={SLIDER_MAX}
        step={SLIDER_STEP}
        defaultValue={[200]}
        disabled
        onValueChange={onValueChange}
      />,
    );
    const thumb = getByRole("slider");

    await userEvent.tab();
    expect(thumb).not.toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(thumb).toHaveAttribute("aria-valuenow", "200");
  });
});
