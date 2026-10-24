/**
 * ToggleGroup + ToggleItem.
 *
 * A real value-managing group (Radix ToggleGroup) supporting single and
 * multiple selection. Two structural notes recorded here: neither component
 * forwards a ref, and neither is re-exported from the package's root barrel.
 *
 * Source: packages/react-ui/src/components/ToggleGroup/ToggleGroup.tsx
 *         packages/react-ui/src/components/ToggleItem/ToggleItem.tsx
 */
import { expect, fn, userEvent } from "@storybook/test";
import { describe, it } from "vitest";
import { ToggleGroup } from "../../../packages/react-ui/src/components/ToggleGroup";
import { ToggleItem } from "../../../packages/react-ui/src/components/ToggleItem";
import * as packageRoot from "../../../packages/react-ui/src/index";
import { TOGGLE_ITEMS } from "../fixtures/data";
import { render } from "../setup/render";

const [list, grid, table] = TOGGLE_ITEMS;

const Items = () => (
  <>
    <ToggleItem value={list.value}>{list.label}</ToggleItem>
    <ToggleItem value={grid.value}>{grid.label}</ToggleItem>
    <ToggleItem value={table.value}>{table.label}</ToggleItem>
  </>
);

describe("ToggleGroup — packaging", () => {
  it("is NOT re-exported from the package root barrel", async () => {
    // OBSERVED DEFECT T-1: src/index.ts re-exports every other in-scope family
    // but omits ToggleGroup/ToggleItem, even though components/index.scss:75-76
    // DOES forward their stylesheets. Consumers can only reach them through the
    // "./*" subpath export (@openuidev/react-ui/ToggleGroup).
    expect(packageRoot).not.toHaveProperty("ToggleGroup");
    expect(packageRoot).not.toHaveProperty("ToggleItem");
    // Control: a sibling family in the same slice IS exported.
    expect(packageRoot).toHaveProperty("RadioGroup");
    expect(packageRoot).toHaveProperty("SwitchItem");
  });

  it("is NOT forwardRef, so ref support depends on the React major version", async () => {
    // OBSERVED DEFECT T-2. Every sibling family wraps in forwardRef;
    // ToggleGroup.tsx:14 and ToggleItem.tsx:10 are plain function components.
    //
    // Under React 19 (installed here: see docs/report.md) `ref` is an ordinary
    // prop, so it travels through the `{...props}` spread and reaches the Radix
    // primitive, which DOES forward it. The ref therefore happens to work:
    const groupRef = { current: null as HTMLElement | null };
    const itemRef = { current: null as HTMLElement | null };

    await render(
      // @ts-expect-error ToggleGroupProps does not declare `ref`; it only works
      // because React 19 passes it through as a normal prop.
      <ToggleGroup type="single" ref={groupRef}>
        {/* @ts-expect-error same for the item */}
        <ToggleItem value={list.value} ref={itemRef}>
          {list.label}
        </ToggleItem>
      </ToggleGroup>,
    );

    expect(groupRef.current).not.toBeNull();
    expect(groupRef.current!.tagName).toBe("DIV");
    expect(itemRef.current).not.toBeNull();
    expect(itemRef.current!.tagName).toBe("BUTTON");

    // The defect is the version dependence, not today's outcome: react-ui's
    // peerDependency range is "^18.3.1 || ^19.0.0" (pnpm-workspace.yaml
    // catalog). On React 18, `ref` is extracted before props and never reaches
    // the spread, so both refs would stay null for a non-forwardRef component.
    // That divergence is unverified here — this harness installs only React 19,
    // so it is recorded as coverage gap G-2 rather than asserted.
  });
});

describe("ToggleGroup — rendered contract", () => {
  it("renders a group with the openui-toggle-group class", async () => {
    const { container } = await render(
      <ToggleGroup type="single">
        <Items />
      </ToggleGroup>,
    );
    expect(container.firstElementChild).toHaveClass("openui-toggle-group");
  });

  it("renders each item as a pressable button with the item class", async () => {
    const { getAllByRole } = await render(
      <ToggleGroup type="single">
        <Items />
      </ToggleGroup>,
    );
    const buttons = getAllByRole("radio");

    expect(buttons).toHaveLength(3);
    for (const button of buttons) {
      expect(button).toHaveClass("openui-toggle-item");
      expect(button).toHaveAttribute("data-state", "off");
    }
  });

  it("merges a consumer className on both group and item", async () => {
    const { container } = await render(
      <ToggleGroup type="single" className="my-group">
        <ToggleItem value={list.value} className="my-item">
          {list.label}
        </ToggleItem>
      </ToggleGroup>,
    );
    expect(container.firstElementChild).toHaveClass("openui-toggle-group", "my-group");
    expect(container.querySelector("button")).toHaveClass("openui-toggle-item", "my-item");
  });
});

describe("ToggleGroup — type=single", () => {
  it("selects one value at a time and reports the new value", async () => {
    const onValueChange = fn();
    const { getAllByRole } = await render(
      <ToggleGroup type="single" onValueChange={onValueChange}>
        <Items />
      </ToggleGroup>,
    );
    const buttons = getAllByRole("radio");

    await userEvent.click(buttons[1]);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(grid.value);
    expect(buttons[1]).toHaveAttribute("data-state", "on");

    await userEvent.click(buttons[2]);
    expect(onValueChange).toHaveBeenLastCalledWith(table.value);
    expect(buttons[2]).toHaveAttribute("data-state", "on");
    expect(buttons[1]).toHaveAttribute("data-state", "off");
  });

  it("deselects on re-click and reports an EMPTY STRING, not undefined", async () => {
    // Payload detail worth pinning: Radix single-mode emits "" when cleared.
    const onValueChange = fn();
    const { getAllByRole } = await render(
      <ToggleGroup type="single" onValueChange={onValueChange}>
        <Items />
      </ToggleGroup>,
    );
    const buttons = getAllByRole("radio");

    await userEvent.click(buttons[0]);
    await userEvent.click(buttons[0]);

    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(buttons[0]).toHaveAttribute("data-state", "off");
  });

  it("honors defaultValue, and a controlled value pins the state", async () => {
    const uncontrolled = await render(
      <ToggleGroup type="single" defaultValue={grid.value}>
        <Items />
      </ToggleGroup>,
    );
    expect(uncontrolled.getAllByRole("radio")[1]).toHaveAttribute("data-state", "on");
    uncontrolled.unmount();

    const onValueChange = fn();
    const controlled = await render(
      <ToggleGroup type="single" value={list.value} onValueChange={onValueChange}>
        <Items />
      </ToggleGroup>,
    );
    const buttons = controlled.getAllByRole("radio");

    await userEvent.click(buttons[2]);
    expect(buttons[0]).toHaveAttribute("data-state", "on");
    expect(buttons[2]).toHaveAttribute("data-state", "off");
    expect(onValueChange).toHaveBeenCalledWith(table.value);
  });
});

describe("ToggleGroup — type=multiple", () => {
  it("accumulates values and reports the full array", async () => {
    const onValueChange = fn();
    const { getAllByRole } = await render(
      <ToggleGroup type="multiple" onValueChange={onValueChange}>
        <Items />
      </ToggleGroup>,
    );
    // Multiple mode uses role=button with aria-pressed, not role=radio.
    const buttons = getAllByRole("button");

    await userEvent.click(buttons[0]);
    expect(onValueChange).toHaveBeenLastCalledWith([list.value]);

    await userEvent.click(buttons[2]);
    expect(onValueChange).toHaveBeenLastCalledWith([list.value, table.value]);

    expect(buttons[0]).toHaveAttribute("data-state", "on");
    expect(buttons[2]).toHaveAttribute("data-state", "on");
    expect(buttons[1]).toHaveAttribute("data-state", "off");
  });

  it("removes a value on re-click and reports the remaining array", async () => {
    const onValueChange = fn();
    const { getAllByRole } = await render(
      <ToggleGroup
        type="multiple"
        defaultValue={[list.value, grid.value]}
        onValueChange={onValueChange}
      >
        <Items />
      </ToggleGroup>,
    );
    const buttons = getAllByRole("button");

    await userEvent.click(buttons[0]);
    expect(onValueChange).toHaveBeenLastCalledWith([grid.value]);
  });

  it("uses aria-pressed rather than a radio role", async () => {
    const { getAllByRole } = await render(
      <ToggleGroup type="multiple" defaultValue={[list.value]}>
        <Items />
      </ToggleGroup>,
    );
    const buttons = getAllByRole("button");

    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[1]).toHaveAttribute("aria-pressed", "false");
  });
});

describe("ToggleGroup — focus, keyboard and disabled", () => {
  it("exposes a single tab stop and moves focus with arrows", async () => {
    const { getAllByRole } = await render(
      <ToggleGroup type="single">
        <Items />
      </ToggleGroup>,
    );
    const buttons = getAllByRole("radio");

    await userEvent.tab();
    expect(buttons[0]).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    expect(buttons[1]).toHaveFocus();
  });

  it("activates the focused item with Enter", async () => {
    const onValueChange = fn();
    const { getAllByRole } = await render(
      <ToggleGroup type="single" onValueChange={onValueChange}>
        <Items />
      </ToggleGroup>,
    );

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");

    expect(onValueChange).toHaveBeenCalledWith(list.value);
    expect(getAllByRole("radio")[0]).toHaveAttribute("data-state", "on");
  });

  it("disables every item when the group is disabled", async () => {
    const onValueChange = fn();
    const { getAllByRole } = await render(
      <ToggleGroup type="single" disabled onValueChange={onValueChange}>
        <Items />
      </ToggleGroup>,
    );
    const buttons = getAllByRole("radio");

    for (const button of buttons) {
      expect(button).toBeDisabled();
    }
    await userEvent.click(buttons[0]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disables a single item while leaving siblings usable", async () => {
    const onValueChange = fn();
    const { getAllByRole } = await render(
      <ToggleGroup type="single" onValueChange={onValueChange}>
        <ToggleItem value={list.value} disabled>
          {list.label}
        </ToggleItem>
        <ToggleItem value={grid.value}>{grid.label}</ToggleItem>
      </ToggleGroup>,
    );
    const buttons = getAllByRole("radio");

    expect(buttons[0]).toBeDisabled();
    await userEvent.click(buttons[0]);
    expect(onValueChange).not.toHaveBeenCalled();

    await userEvent.click(buttons[1]);
    expect(onValueChange).toHaveBeenCalledWith(grid.value);
  });
});
