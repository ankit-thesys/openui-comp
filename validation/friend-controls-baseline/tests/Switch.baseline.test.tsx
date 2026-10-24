/**
 * SwitchItem + SwitchGroup.
 *
 * SwitchItem is interactive (Radix Switch). SwitchGroup is presentational only.
 * The notable difference from CheckBoxItem/RadioItem is the container element:
 * SwitchItem uses a <div>, so its click target is narrower.
 *
 * Source: packages/react-ui/src/components/SwitchItem/SwitchItem.tsx
 *         packages/react-ui/src/components/SwitchGroup/SwitchGroup.tsx
 */
import { expect, fn, userEvent } from "@storybook/test";
import { describe, it } from "vitest";
import { SwitchGroup } from "../../../packages/react-ui/src/components/SwitchGroup";
import { SwitchItem } from "../../../packages/react-ui/src/components/SwitchItem";
import { SWITCH_ITEMS } from "../fixtures/data";
import { render } from "../setup/render";

const [analytics, beta] = SWITCH_ITEMS;

describe("SwitchItem — rendered contract", () => {
  it("renders role=switch, unchecked by default", async () => {
    const { getByRole } = await render(<SwitchItem label={analytics.label} />);
    const sw = getByRole("switch");

    expect(sw.tagName).toBe("BUTTON");
    expect(sw).toHaveAttribute("data-state", "unchecked");
    expect(sw).toHaveAttribute("aria-checked", "false");
  });

  it("renders a thumb element (SwitchItem.tsx:33)", async () => {
    const { container } = await render(<SwitchItem label={analytics.label} />);
    expect(container.querySelector(".openui-switch-item-thumb")).toBeInTheDocument();
  });

  it("uses a <div> container, not a <label> like CheckBoxItem/RadioItem", async () => {
    // SwitchItem.tsx:23. This is the root cause of the click-target difference
    // asserted below (finding S-1).
    const { container } = await render(
      <SwitchItem label={analytics.label} description={analytics.description} />,
    );
    const row = container.querySelector(".openui-switch-item-container")!;

    expect(row.tagName).toBe("DIV");
    expect(container.querySelector("label.openui-switch-item-container")).toBeNull();
  });

  it("associates the label with the control via htmlFor/id", async () => {
    const { container, getByRole } = await render(<SwitchItem label={analytics.label} />);
    const label = container.querySelector(".openui-switch-item-label")!;

    expect(label.getAttribute("for")).toBe(getByRole("switch").id);
  });
});

describe("SwitchItem — toggle behavior", () => {
  it("toggles on click and reports the boolean payload", async () => {
    const onChange = fn();
    const { getByRole } = await render(<SwitchItem label={analytics.label} onChange={onChange} />);
    const sw = getByRole("switch");

    await userEvent.click(sw);
    expect(sw).toHaveAttribute("data-state", "checked");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);

    await userEvent.click(sw);
    expect(sw).toHaveAttribute("data-state", "unchecked");
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("honors defaultChecked (uncontrolled)", async () => {
    const { getByRole } = await render(<SwitchItem label={analytics.label} defaultChecked />);
    expect(getByRole("switch")).toHaveAttribute("data-state", "checked");
  });

  it("stays pinned when controlled, while still reporting intent", async () => {
    const onChange = fn();
    const { getByRole } = await render(
      <SwitchItem label={analytics.label} checked={false} onChange={onChange} />,
    );

    await userEvent.click(getByRole("switch"));
    expect(getByRole("switch")).toHaveAttribute("data-state", "unchecked");
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("reflects a controlled value pushed in by the consumer", async () => {
    const { getByRole, rerender } = await render(
      <SwitchItem label={analytics.label} checked={false} />,
    );
    expect(getByRole("switch")).toHaveAttribute("data-state", "unchecked");

    await rerender(<SwitchItem label={analytics.label} checked />);
    expect(getByRole("switch")).toHaveAttribute("data-state", "checked");
  });

  it("toggles when the LABEL text is clicked", async () => {
    const onChange = fn();
    const { container } = await render(
      <SwitchItem
        label={analytics.label}
        description={analytics.description}
        onChange={onChange}
      />,
    );

    await userEvent.click(container.querySelector(".openui-switch-item-label")!);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does NOT toggle when the DESCRIPTION text is clicked", async () => {
    // OBSERVED INCONSISTENCY S-1: CheckBoxItem and RadioItem wrap the whole row
    // in a <label>, so their descriptions are click targets. SwitchItem's <div>
    // container means its description is inert. Recorded, not corrected.
    const onChange = fn();
    const { container, getByRole } = await render(
      <SwitchItem
        label={analytics.label}
        description={analytics.description}
        onChange={onChange}
      />,
    );

    await userEvent.click(container.querySelector(".openui-switch-item-description")!);
    expect(onChange).not.toHaveBeenCalled();
    expect(getByRole("switch")).toHaveAttribute("data-state", "unchecked");
  });
});

describe("SwitchItem — focus, keyboard and disabled", () => {
  it("is focusable and toggles with Space", async () => {
    const onChange = fn();
    const { getByRole } = await render(<SwitchItem label={analytics.label} onChange={onChange} />);

    await userEvent.tab();
    expect(getByRole("switch")).toHaveFocus();

    await userEvent.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("also toggles with Enter (Radix Switch binds both)", async () => {
    // Differs from CheckBoxItem, where Enter is inert — recorded as part of the
    // keyboard baseline rather than normalized.
    const onChange = fn();
    const { getByRole } = await render(<SwitchItem label={analytics.label} onChange={onChange} />);

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith(true);
    expect(getByRole("switch")).toHaveAttribute("data-state", "checked");
  });

  it("is disabled, unclickable and not tabbable when disabled", async () => {
    const onChange = fn();
    const { getByRole } = await render(
      <SwitchItem label={beta.label} disabled onChange={onChange} />,
    );
    const sw = getByRole("switch");

    expect(sw).toBeDisabled();
    await userEvent.click(sw);
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.tab();
    expect(sw).not.toHaveFocus();
  });

  it("marks required via aria-required", async () => {
    const { getByRole } = await render(<SwitchItem label={analytics.label} required />);
    expect(getByRole("switch")).toHaveAttribute("aria-required", "true");
  });

  it("participates in a form only inside a <form>, like CheckBoxItem (CB-2)", async () => {
    const standalone = await render(
      <SwitchItem label={analytics.label} name="flags" value="analytics" defaultChecked />,
    );
    expect(standalone.container.querySelector("input")).toBeNull();
    standalone.unmount();

    let submitted: string[] = [];
    const { getByRole } = await render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted = new FormData(event.currentTarget).getAll("flags") as string[];
        }}
      >
        <SwitchItem label={analytics.label} name="flags" value="analytics" defaultChecked />
        <button type="submit">Save</button>
      </form>,
    );

    await userEvent.click(getByRole("button", { name: "Save" }));
    expect(submitted).toEqual(["analytics"]);
  });
});

describe("SwitchGroup — presentational wrapper only", () => {
  it("renders a div with the default `clear` variant class", async () => {
    const { container } = await render(
      <SwitchGroup>
        <SwitchItem label={analytics.label} />
      </SwitchGroup>,
    );
    const root = container.firstElementChild!;

    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("openui-switch-group", "openui-switch-group-clear");
    expect(root).not.toHaveAttribute("role");
  });

  it("maps each variant to its class (SwitchGroup.tsx:13-17)", async () => {
    for (const [variant, expected] of [
      ["clear", "openui-switch-group-clear"],
      ["card", "openui-switch-group-card"],
      ["sunk", "openui-switch-group-sunk"],
    ] as const) {
      const { container, unmount } = await render(
        <SwitchGroup variant={variant}>
          <SwitchItem label={analytics.label} />
        </SwitchGroup>,
      );
      expect(container.firstElementChild).toHaveClass(expected);
      unmount();
    }
  });

  it("does not coordinate its children's state", async () => {
    const onFirst = fn();
    const onSecond = fn();
    const { getAllByRole } = await render(
      <SwitchGroup>
        <SwitchItem label={analytics.label} onChange={onFirst} />
        <SwitchItem label={beta.label} onChange={onSecond} />
      </SwitchGroup>,
    );
    const switches = getAllByRole("switch");

    await userEvent.click(switches[0]);
    expect(onFirst).toHaveBeenCalledWith(true);
    expect(onSecond).not.toHaveBeenCalled();
    expect(switches[1]).toHaveAttribute("data-state", "unchecked");
  });
});
