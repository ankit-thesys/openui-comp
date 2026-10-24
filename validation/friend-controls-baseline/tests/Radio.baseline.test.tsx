/**
 * RadioGroup + RadioItem.
 *
 * RadioGroup is a real value-managing group (Radix RadioGroup.Root), unlike
 * CheckBoxGroup/SwitchGroup. RadioItem is the individual control.
 *
 * Source: packages/react-ui/src/components/RadioGroup/RadioGroup.tsx
 *         packages/react-ui/src/components/RadioItem/RadioItem.tsx
 */
import * as RadixRadio from "@radix-ui/react-radio-group";
import { expect, fn, userEvent } from "@storybook/test";
import { describe, it } from "vitest";
import { RadioGroup } from "../../../packages/react-ui/src/components/RadioGroup";
import { RadioItem } from "../../../packages/react-ui/src/components/RadioItem";
import { RADIO_ITEMS } from "../fixtures/data";
import { render } from "../setup/render";

const [standard, express, overnight] = RADIO_ITEMS;

const Group = (props: {
  onValueChange?: (v: string) => void;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
}) => (
  <RadioGroup {...props}>
    <RadioItem value={standard.value} label={standard.label} description={standard.description} />
    <RadioItem value={express.value} label={express.label} description={express.description} />
    <RadioItem value={overnight.value} label={overnight.label} />
  </RadioGroup>
);

describe("RadioGroup — rendered contract", () => {
  it("renders role=radiogroup with the default `clear` variant", async () => {
    const { getByRole } = await render(<Group />);
    const group = getByRole("radiogroup");

    expect(group).toHaveClass("openui-radio-group", "openui-radio-group-clear");
  });

  it("maps each variant to its class (RadioGroup.tsx:14-18)", async () => {
    for (const [variant, expected] of [
      ["clear", "openui-radio-group-clear"],
      ["card", "openui-radio-group-card"],
      ["sunk", "openui-radio-group-sunk"],
    ] as const) {
      const { getByRole, unmount } = await render(
        <RadioGroup variant={variant}>
          <RadioItem value={standard.value} label={standard.label} />
        </RadioGroup>,
      );
      expect(getByRole("radiogroup")).toHaveClass(expected);
      unmount();
    }
  });

  it("forwards native/Radix props, because RadioGroupProps extends Radix's", async () => {
    // Contrast with CheckBoxGroup, whose props are closed (finding FC-1).
    const { getByRole } = await render(
      <RadioGroup name="shipping" aria-label="Shipping speed" data-testid="rg">
        <RadioItem value={standard.value} label={standard.label} />
      </RadioGroup>,
    );
    const group = getByRole("radiogroup");

    expect(group).toHaveAttribute("aria-label", "Shipping speed");
    expect(group).toHaveAttribute("data-testid", "rg");
  });

  it("renders one role=radio per item, all unchecked with no value", async () => {
    const { getAllByRole } = await render(<Group />);
    const radios = getAllByRole("radio");

    expect(radios).toHaveLength(3);
    for (const radio of radios) {
      expect(radio).toHaveAttribute("data-state", "unchecked");
    }
  });
});

describe("RadioItem — rendered contract", () => {
  it("renders label and description, with description as a <p>", async () => {
    const { getByText, container } = await render(
      <RadioGroup>
        <RadioItem
          value={standard.value}
          label={standard.label}
          description={standard.description}
        />
      </RadioGroup>,
    );
    expect(getByText(standard.label)).toBeInTheDocument();
    expect(container.querySelector(".openui-radio-item-description")!.tagName).toBe("P");
  });

  it("nests a <label> inside a <label>, both targeting the same id", async () => {
    // OBSERVED DEFECT R-1 — same shape as CB-1. RadioItem.tsx:19 opens the
    // container <label htmlFor={id}>; RadioItem.tsx:55 opens a second one inside.
    const { container } = await render(
      <RadioGroup>
        <RadioItem value={standard.value} label={standard.label} />
      </RadioGroup>,
    );
    const outer = container.querySelector("label")!;
    const inner = outer.querySelector("label");

    expect(inner).not.toBeNull();
    expect(inner!.getAttribute("for")).toBe(outer.getAttribute("for"));
  });

  it("applies `style` to the radio control, NOT to the row container", async () => {
    // RadioItem.tsx:27 passes style to Radio.Item. A consumer expecting to lay
    // out the whole row via `style` gets the control instead — finding R-2.
    const { container } = await render(
      <RadioGroup>
        <RadioItem value={standard.value} label={standard.label} style={{ marginTop: "8px" }} />
      </RadioGroup>,
    );
    const row = container.querySelector(".openui-radio-item-container") as HTMLElement;
    const control = container.querySelector('[role="radio"]') as HTMLElement;

    expect(row.style.marginTop).toBe("");
    expect(control.style.marginTop).toBe("8px");
  });
});

describe("RadioGroup — selection behavior", () => {
  it("selects on click and reports the item's value", async () => {
    const onValueChange = fn();
    const { getAllByRole } = await render(<Group onValueChange={onValueChange} />);
    const radios = getAllByRole("radio");

    await userEvent.click(radios[1]);

    // Payload is Radix's onValueChange: the selected value string.
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(express.value);
    expect(radios[1]).toHaveAttribute("data-state", "checked");
    expect(radios[0]).toHaveAttribute("data-state", "unchecked");
  });

  it("is single-select: choosing another item clears the previous one", async () => {
    const { getAllByRole } = await render(<Group />);
    const radios = getAllByRole("radio");

    await userEvent.click(radios[0]);
    expect(radios[0]).toHaveAttribute("data-state", "checked");

    await userEvent.click(radios[2]);
    expect(radios[2]).toHaveAttribute("data-state", "checked");
    expect(radios[0]).toHaveAttribute("data-state", "unchecked");
  });

  it("selects when the row's label text is clicked (whole row is a label)", async () => {
    const onValueChange = fn();
    const { container } = await render(<Group onValueChange={onValueChange} />);

    await userEvent.click(container.querySelectorAll(".openui-radio-item-label")[1]);
    expect(onValueChange).toHaveBeenCalledWith(express.value);
  });

  it("also selects when the DESCRIPTION text is clicked", async () => {
    // Consequence of the container <label> wrapper: the entire row, description
    // included, is a click target. SwitchItem deliberately differs — see S-1.
    const onValueChange = fn();
    const { container } = await render(<Group onValueChange={onValueChange} />);

    await userEvent.click(container.querySelectorAll(".openui-radio-item-description")[1]);
    expect(onValueChange).toHaveBeenCalledWith(express.value);
  });

  it("honors defaultValue (uncontrolled) and moves freely afterwards", async () => {
    const { getAllByRole } = await render(<Group defaultValue={express.value} />);
    const radios = getAllByRole("radio");

    expect(radios[1]).toHaveAttribute("data-state", "checked");
    await userEvent.click(radios[0]);
    expect(radios[0]).toHaveAttribute("data-state", "checked");
  });

  it("stays pinned when controlled, while still reporting intent", async () => {
    const onValueChange = fn();
    const { getAllByRole } = await render(
      <Group value={standard.value} onValueChange={onValueChange} />,
    );
    const radios = getAllByRole("radio");

    await userEvent.click(radios[1]);

    expect(radios[0]).toHaveAttribute("data-state", "checked");
    expect(radios[1]).toHaveAttribute("data-state", "unchecked");
    expect(onValueChange).toHaveBeenCalledWith(express.value);
  });

  it("reflects a controlled value pushed in by the consumer", async () => {
    const { getAllByRole, rerender } = await render(<Group value={standard.value} />);
    expect(getAllByRole("radio")[0]).toHaveAttribute("data-state", "checked");

    await rerender(<Group value={overnight.value} />);
    expect(getAllByRole("radio")[2]).toHaveAttribute("data-state", "checked");
  });
});

describe("RadioGroup — focus and keyboard", () => {
  it("exposes a single tab stop (roving tabindex)", async () => {
    const { getAllByRole } = await render(<Group />);
    const radios = getAllByRole("radio");

    await userEvent.tab();
    expect(radios[0]).toHaveFocus();
    expect(radios[0]).toHaveAttribute("tabindex", "0");
    expect(radios[1]).toHaveAttribute("tabindex", "-1");
  });

  it("puts the initial tab stop on the checked item", async () => {
    const { getAllByRole } = await render(<Group defaultValue={express.value} />);

    await userEvent.tab();
    expect(getAllByRole("radio")[1]).toHaveFocus();
  });

  it("selects the focused item with Space", async () => {
    const onValueChange = fn();
    const { getAllByRole } = await render(<Group onValueChange={onValueChange} />);

    await userEvent.tab();
    await userEvent.keyboard(" ");

    expect(onValueChange).toHaveBeenCalledWith(standard.value);
    expect(getAllByRole("radio")[0]).toHaveAttribute("data-state", "checked");
  });

  it("moves roving focus with ArrowDown/ArrowRight and wraps around", async () => {
    const { getAllByRole } = await render(<Group />);
    const radios = getAllByRole("radio");

    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    expect(radios[1]).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    expect(radios[2]).toHaveFocus();

    // Radix loops by default.
    await userEvent.keyboard("{ArrowDown}");
    expect(radios[0]).toHaveFocus();
  });

  it("COVERAGE GAP: arrow keys move focus but do not select in jsdom — same for raw Radix", async () => {
    // In a real browser, Radix RadioGroup selects the item that arrow-key focus
    // lands on. Under jsdom that auto-select does NOT fire. The raw Radix
    // primitive is rendered here as a control group to establish that this is a
    // harness/primitive limitation and NOT something the openui wrapper broke.
    // Recorded as coverage gap G-1 in docs/observed-baseline.md; arrow-key
    // SELECTION therefore remains unverified at this baseline.
    const openuiChange = fn();
    const openui = await render(<Group onValueChange={openuiChange} />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    const openuiStates = openui
      .getAllByRole("radio")
      .map((r: Element) => r.getAttribute("data-state"));
    openui.unmount();

    const radixChange = fn();
    const radix = await render(
      <RadixRadio.Root onValueChange={radixChange}>
        <RadixRadio.Item value={standard.value} />
        <RadixRadio.Item value={express.value} />
      </RadixRadio.Root>,
    );
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    const radixStates = radix
      .getAllByRole("radio")
      .map((r: Element) => r.getAttribute("data-state"));

    // Identical outcome on both sides: focus moved, nothing got selected.
    expect(openuiChange).not.toHaveBeenCalled();
    expect(radixChange).not.toHaveBeenCalled();
    expect(openuiStates.every((s: string | null) => s === "unchecked")).toBe(true);
    expect(radixStates.every((s: string | null) => s === "unchecked")).toBe(true);
  });
});

describe("RadioGroup / RadioItem — disabled", () => {
  it("disables every item when the group is disabled", async () => {
    const onValueChange = fn();
    const { getAllByRole } = await render(<Group disabled onValueChange={onValueChange} />);
    const radios = getAllByRole("radio");

    for (const radio of radios) {
      expect(radio).toBeDisabled();
    }
    await userEvent.click(radios[0]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disables a single item while leaving its siblings usable", async () => {
    const onValueChange = fn();
    const { getAllByRole } = await render(
      <RadioGroup onValueChange={onValueChange}>
        <RadioItem value={standard.value} label={standard.label} disabled />
        <RadioItem value={express.value} label={express.label} />
      </RadioGroup>,
    );
    const radios = getAllByRole("radio");

    expect(radios[0]).toBeDisabled();
    expect(radios[1]).not.toBeDisabled();

    await userEvent.click(radios[0]);
    expect(onValueChange).not.toHaveBeenCalled();

    await userEvent.click(radios[1]);
    expect(onValueChange).toHaveBeenCalledWith(express.value);
  });

  it("skips a disabled item when tabbing in", async () => {
    const { getAllByRole } = await render(
      <RadioGroup>
        <RadioItem value={standard.value} label={standard.label} disabled />
        <RadioItem value={express.value} label={express.label} />
      </RadioGroup>,
    );
    await userEvent.tab();
    expect(getAllByRole("radio")[1]).toHaveFocus();
  });
});
