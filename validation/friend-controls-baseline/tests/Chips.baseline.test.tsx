/**
 * Chips.
 *
 * A fully controlled, data-driven selector: it renders from `items`, reflects
 * `selected`, and emits one value per toggle. It holds NO internal state.
 *
 * Source: packages/react-ui/src/components/Chips/Chips.tsx
 */
import { expect, fn, userEvent } from "@storybook/test";
import { describe, it } from "vitest";
import { Chips } from "../../../packages/react-ui/src/components/Chips";
import { CHIPS_ITEMS } from "../fixtures/data";
import { render } from "../setup/render";

const items = CHIPS_ITEMS.map((i) => ({ ...i }));
const [typescript, rust, elixir] = CHIPS_ITEMS;

describe("Chips — rendered contract", () => {
  it("renders role=listbox with role=option children (Chips.tsx:42,54)", async () => {
    const { getByRole, getAllByRole } = await render(<Chips items={items} />);

    expect(getByRole("listbox")).toBeInTheDocument();
    expect(getAllByRole("option")).toHaveLength(3);
  });

  it("renders each option as a <button type=button>", async () => {
    // Explicit type="button" (Chips.tsx:53) — contrast with IconButton, which
    // omits it (finding IB-1).
    const { getAllByRole } = await render(<Chips items={items} />);
    for (const option of getAllByRole("option")) {
      expect(option.tagName).toBe("BUTTON");
      expect(option).toHaveAttribute("type", "button");
    }
  });

  it("defaults to type=multiple, so aria-multiselectable is true", async () => {
    const { getByRole } = await render(<Chips items={items} />);
    expect(getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
  });

  it("sets aria-multiselectable=false for type=single", async () => {
    const { getByRole } = await render(<Chips items={items} type="single" />);
    expect(getByRole("listbox")).toHaveAttribute("aria-multiselectable", "false");
  });

  it("renders the label text and an icon slot only when an icon is given", async () => {
    const withIcon = [{ value: "ts", label: "TypeScript", icon: <span>TS</span> }];
    const a = await render(<Chips items={withIcon} />);
    expect(a.container.querySelector(".openui-chip-item__icon")).toBeInTheDocument();
    a.unmount();

    const b = await render(<Chips items={[{ value: "ts", label: "TypeScript" }]} />);
    expect(b.container.querySelector(".openui-chip-item__icon")).not.toBeInTheDocument();
    expect(b.getByText("TypeScript")).toBeInTheDocument();
  });

  it("forwards native div props to the listbox", async () => {
    const { getByRole } = await render(
      <Chips items={items} id="langs" data-testid="chips" aria-label="Languages" />,
    );
    const listbox = getByRole("listbox");

    expect(listbox).toHaveAttribute("id", "langs");
    expect(listbox).toHaveAttribute("data-testid", "chips");
    expect(listbox).toHaveAttribute("aria-label", "Languages");
  });

  it("drops items with a falsy value (Chips.tsx:36)", async () => {
    const { getAllByRole } = await render(
      <Chips
        items={[
          { value: "ts", label: "TypeScript" },
          { value: "", label: "Dropped" },
        ]}
      />,
    );
    const options = getAllByRole("option");

    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("TypeScript");
  });

  it("tolerates a null/undefined items array without throwing (Chips.tsx:36)", async () => {
    // `(items ?? [])` makes this defensive; recorded because the prop type
    // declares `items` as required, so this path is reachable only from JS.
    const { getByRole, queryAllByRole } = await render(
      // @ts-expect-error documenting the runtime guard
      <Chips items={undefined} />,
    );
    expect(getByRole("listbox")).toBeInTheDocument();
    expect(queryAllByRole("option")).toHaveLength(0);
  });
});

describe("Chips — selection reflection", () => {
  it("marks selected options with aria-selected and the selected class", async () => {
    const { getAllByRole } = await render(<Chips items={items} selected={[rust.value]} />);
    const options = getAllByRole("option");

    expect(options[0]).toHaveAttribute("aria-selected", "false");
    expect(options[1]).toHaveAttribute("aria-selected", "true");
    expect(options[1]).toHaveClass("openui-chip-item--selected");
  });

  it("treats `selected` as fully controlled — clicking changes nothing on its own", async () => {
    // OBSERVED CONTRACT C-1: Chips has no internal selection state and no
    // uncontrolled mode. Without a consumer updating `selected`, the UI is inert.
    const onToggle = fn();
    const { getAllByRole } = await render(
      <Chips items={items} selected={[]} onToggle={onToggle} />,
    );
    const options = getAllByRole("option");

    await userEvent.click(options[0]);

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(options[0]).toHaveAttribute("aria-selected", "false");
  });

  it("emits ONLY the toggled value, never the resulting selection", async () => {
    // Payload contract: `(value: string) => void`. Computing the next array is
    // the consumer's job — see fixtures/LegacyConsumerApp.tsx.
    const onToggle = fn();
    const { getAllByRole } = await render(
      <Chips items={items} selected={[typescript.value]} onToggle={onToggle} />,
    );

    await userEvent.click(getAllByRole("option")[1]);
    expect(onToggle).toHaveBeenCalledWith(rust.value);

    // Re-clicking an ALREADY selected chip emits the same bare value, so the
    // callback alone cannot distinguish select from deselect.
    await userEvent.click(getAllByRole("option")[0]);
    expect(onToggle).toHaveBeenLastCalledWith(typescript.value);
  });

  it("does not enforce single-selection for type=single", async () => {
    // OBSERVED DEFECT C-2: `type` only drives aria-multiselectable. The
    // component will happily render two selected options in single mode.
    const { getAllByRole } = await render(
      <Chips items={items} type="single" selected={[typescript.value, rust.value]} />,
    );
    const options = getAllByRole("option");

    expect(options[0]).toHaveAttribute("aria-selected", "true");
    expect(options[1]).toHaveAttribute("aria-selected", "true");
  });

  it("reflects a consumer-driven selection update", async () => {
    const { getAllByRole, rerender } = await render(<Chips items={items} selected={[]} />);
    expect(getAllByRole("option")[0]).toHaveAttribute("aria-selected", "false");

    await rerender(<Chips items={items} selected={[typescript.value]} />);
    expect(getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true");
  });
});

describe("Chips — disabled", () => {
  it("disables a single item via item.disabled", async () => {
    const onToggle = fn();
    const { getAllByRole } = await render(<Chips items={items} onToggle={onToggle} />);
    const options = getAllByRole("option");

    expect(options[2]).toBeDisabled();
    expect(options[2]).toHaveClass("openui-chip-item--disabled");

    await userEvent.click(options[2]);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("disables every item via the group-level disabled prop", async () => {
    const onToggle = fn();
    const { getAllByRole } = await render(<Chips items={items} disabled onToggle={onToggle} />);
    const options = getAllByRole("option");

    for (const option of options) {
      expect(option).toBeDisabled();
      expect(option).toHaveClass("openui-chip-item--disabled");
    }
    await userEvent.click(options[0]);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("keeps a disabled chip's selected styling", async () => {
    const { getAllByRole } = await render(<Chips items={items} selected={[elixir.value]} />);
    const disabledChip = getAllByRole("option")[2];

    expect(disabledChip).toBeDisabled();
    expect(disabledChip).toHaveClass("openui-chip-item--selected");
  });
});

describe("Chips — focus and keyboard", () => {
  it("makes every enabled chip its own tab stop", async () => {
    // OBSERVED DEFECT C-3: role=listbox/option implies a SINGLE tab stop with
    // arrow-key navigation and aria-activedescendant. Chips renders plain
    // buttons instead, so Tab walks through every option and arrow keys do
    // nothing. Recorded as an a11y finding, not corrected.
    const { getAllByRole } = await render(<Chips items={items} />);
    const options = getAllByRole("option");

    await userEvent.tab();
    expect(options[0]).toHaveFocus();

    await userEvent.tab();
    expect(options[1]).toHaveFocus();

    // Disabled chips are skipped by native button semantics.
    await userEvent.tab();
    expect(options[2]).not.toHaveFocus();
  });

  it("has no arrow-key navigation and no aria-activedescendant", async () => {
    const onToggle = fn();
    const { getByRole, getAllByRole } = await render(<Chips items={items} onToggle={onToggle} />);

    expect(getByRole("listbox")).not.toHaveAttribute("aria-activedescendant");

    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(getAllByRole("option")[0]).toHaveFocus();
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("activates the focused chip with Enter and with Space", async () => {
    const onToggle = fn();
    const { getAllByRole } = await render(<Chips items={items} onToggle={onToggle} />);

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(onToggle).toHaveBeenLastCalledWith(typescript.value);

    await userEvent.keyboard(" ");
    expect(onToggle).toHaveBeenCalledTimes(2);
    expect(onToggle).toHaveBeenLastCalledWith(typescript.value);
  });
});
