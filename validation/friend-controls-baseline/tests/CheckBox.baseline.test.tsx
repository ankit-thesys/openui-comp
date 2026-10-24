/**
 * CheckBoxItem + CheckBoxGroup.
 *
 * CheckBoxItem is interactive (Radix Checkbox underneath). CheckBoxGroup is a
 * presentational wrapper only — it is recorded as such rather than being given
 * invented group semantics.
 *
 * Source: packages/react-ui/src/components/CheckBoxItem/CheckBoxItem.tsx
 *         packages/react-ui/src/components/CheckBoxGroup/CheckBoxGroup.tsx
 */
import { expect, fn, userEvent } from "@storybook/test";
import { describe, it } from "vitest";
import { CheckBoxGroup } from "../../../packages/react-ui/src/components/CheckBoxGroup";
import { CheckBoxItem } from "../../../packages/react-ui/src/components/CheckBoxItem";
import { CHECKBOX_ITEMS } from "../fixtures/data";
import { render } from "../setup/render";

const [first, second, third] = CHECKBOX_ITEMS;

describe("CheckBoxItem — rendered contract", () => {
  it("renders a role=checkbox button, unchecked by default", async () => {
    const { getByRole } = await render(<CheckBoxItem label={first.label} />);
    const box = getByRole("checkbox");

    // Radix renders a <button role=checkbox> rather than <input type=checkbox>.
    expect(box.tagName).toBe("BUTTON");
    expect(box).toHaveAttribute("data-state", "unchecked");
    expect(box).toHaveAttribute("aria-checked", "false");
  });

  it("renders label and description text when provided (CheckBoxItem.tsx:51-58)", async () => {
    const { getByText, container } = await render(
      <CheckBoxItem label={first.label} description={first.description} />,
    );
    expect(getByText(first.label)).toBeInTheDocument();
    expect(getByText(first.description)).toBeInTheDocument();
    expect(container.querySelector(".openui-checkbox-item-description")!.tagName).toBe("P");
  });

  it("omits the label and description nodes entirely when not provided", async () => {
    const { container } = await render(<CheckBoxItem />);
    expect(container.querySelector(".openui-checkbox-item-label")).not.toBeInTheDocument();
    expect(container.querySelector(".openui-checkbox-item-description")).not.toBeInTheDocument();
  });

  it("nests a <label> inside a <label>, both pointing at the same control", async () => {
    // OBSERVED DEFECT CB-1 (docs/defects.md): CheckBoxItem.tsx:23 opens a
    // <label htmlFor={id}> wrapper and CheckBoxItem.tsx:53 opens a SECOND
    // <label htmlFor={id}> inside it. Nested <label> elements are invalid HTML
    // and both target the same generated id.
    const { container } = await render(
      <CheckBoxItem label={first.label} description={first.description} />,
    );
    const outer = container.querySelector("label")!;
    const inner = outer.querySelector("label");

    expect(inner).not.toBeNull();
    expect(inner!.getAttribute("for")).toBe(outer.getAttribute("for"));
  });
});

describe("CheckBoxItem — uncontrolled behavior", () => {
  it("toggles on click and reports the new checked state", async () => {
    const onChange = fn();
    const { getByRole } = await render(<CheckBoxItem label={first.label} onChange={onChange} />);
    const box = getByRole("checkbox");

    await userEvent.click(box);
    expect(box).toHaveAttribute("data-state", "checked");
    expect(onChange).toHaveBeenCalledTimes(1);
    // Payload is the plain boolean, mapped from Radix onCheckedChange
    // (CheckBoxItem.tsx:27).
    expect(onChange).toHaveBeenLastCalledWith(true);

    await userEvent.click(box);
    expect(box).toHaveAttribute("data-state", "unchecked");
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("honors defaultChecked as the initial uncontrolled state", async () => {
    const { getByRole } = await render(<CheckBoxItem label={first.label} defaultChecked />);
    expect(getByRole("checkbox")).toHaveAttribute("data-state", "checked");
  });

  it("toggles via the keyboard: Space on the focused control", async () => {
    const onChange = fn();
    const { getByRole } = await render(<CheckBoxItem label={first.label} onChange={onChange} />);
    const box = getByRole("checkbox");

    await userEvent.tab();
    expect(box).toHaveFocus();

    await userEvent.keyboard(" ");
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(box).toHaveAttribute("data-state", "checked");
  });

  it("does not respond to Enter (Radix checkbox binds Space only)", async () => {
    const onChange = fn();
    const { getByRole } = await render(<CheckBoxItem label={first.label} onChange={onChange} />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");

    // Observed baseline, recorded not corrected: Enter is inert here.
    expect(onChange).not.toHaveBeenCalled();
    expect(getByRole("checkbox")).toHaveAttribute("data-state", "unchecked");
  });
});

describe("CheckBoxItem — controlled behavior", () => {
  it("stays pinned to the `checked` prop and still reports intent", async () => {
    const onChange = fn();
    const { getByRole } = await render(
      <CheckBoxItem label={first.label} checked={false} onChange={onChange} />,
    );
    const box = getByRole("checkbox");

    await userEvent.click(box);

    // Controlled: the DOM state does not move on its own.
    expect(box).toHaveAttribute("data-state", "unchecked");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("reflects a controlled value change from the consumer", async () => {
    const { getByRole, rerender } = await render(
      <CheckBoxItem label={first.label} checked={false} />,
    );
    expect(getByRole("checkbox")).toHaveAttribute("data-state", "unchecked");

    await rerender(<CheckBoxItem label={first.label} checked />);
    expect(getByRole("checkbox")).toHaveAttribute("data-state", "checked");
  });
});

describe("CheckBoxItem — disabled and required", () => {
  it("sets the native disabled attribute and ignores clicks", async () => {
    const onChange = fn();
    const { getByRole } = await render(
      <CheckBoxItem label={third.label} disabled onChange={onChange} />,
    );
    const box = getByRole("checkbox");

    expect(box).toBeDisabled();
    expect(box).toHaveAttribute("data-disabled");

    await userEvent.click(box);
    expect(onChange).not.toHaveBeenCalled();
    expect(box).toHaveAttribute("data-state", "unchecked");
  });

  it("is not reachable by Tab while disabled", async () => {
    const { getByRole } = await render(<CheckBoxItem label={third.label} disabled />);
    await userEvent.tab();
    expect(getByRole("checkbox")).not.toHaveFocus();
  });

  it("marks required via aria-required", async () => {
    const { getByRole } = await render(<CheckBoxItem label={first.label} required />);
    expect(getByRole("checkbox")).toHaveAttribute("aria-required", "true");
  });

  it("emits a hidden native input for name/value ONLY inside a <form>", async () => {
    // Observed baseline: Radix only mounts its hidden "bubble" input when the
    // control has a <form> ancestor. Standalone, `name`/`value` are accepted by
    // the type signature and then have no DOM effect at all — recorded as
    // finding CB-2 in docs/defects.md.
    const standalone = await render(
      <CheckBoxItem label={first.label} name="digest" value="email" defaultChecked />,
    );
    expect(standalone.container.querySelector('input[type="checkbox"]')).toBeNull();
    standalone.unmount();

    const inForm = await render(
      <form>
        <CheckBoxItem label={first.label} name="digest" value="email" defaultChecked />
      </form>,
    );
    const nativeInput = inForm.container.querySelector('input[type="checkbox"]');

    expect(nativeInput).not.toBeNull();
    expect(nativeInput).toHaveAttribute("name", "digest");
    expect(nativeInput).toHaveAttribute("value", "email");
  });

  it("submits the checked item's value through a real form submission", async () => {
    // Full public-API round trip: the value a consumer would actually receive.
    let submitted: string[] = [];
    const { getByRole } = await render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted = new FormData(event.currentTarget).getAll("digest") as string[];
        }}
      >
        <CheckBoxItem label={first.label} name="digest" value="email" />
        <button type="submit">Save</button>
      </form>,
    );

    await userEvent.click(getByRole("checkbox"));
    await userEvent.click(getByRole("button", { name: "Save" }));

    expect(submitted).toEqual(["email"]);
  });
});

describe("CheckBoxGroup — presentational wrapper only", () => {
  it("renders a div with the default `clear` variant class (CheckBoxGroup.tsx:21-27)", async () => {
    const { container } = await render(
      <CheckBoxGroup>
        <CheckBoxItem label={first.label} />
      </CheckBoxGroup>,
    );
    const root = container.firstElementChild!;

    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("openui-checkbox-group", "openui-checkbox-group-clear");
  });

  it("maps each variant to its class", async () => {
    for (const [variant, expected] of [
      ["clear", "openui-checkbox-group-clear"],
      ["card", "openui-checkbox-group-card"],
      ["sunk", "openui-checkbox-group-sunk"],
    ] as const) {
      const { container, unmount } = await render(
        <CheckBoxGroup variant={variant}>
          <CheckBoxItem label={first.label} />
        </CheckBoxGroup>,
      );
      expect(container.firstElementChild).toHaveClass(expected);
      unmount();
    }
  });

  it("adds NO group role, NO value management and NO child coordination", async () => {
    // Recorded contract: unlike RadioGroup/ToggleGroup, CheckBoxGroup is layout
    // only. Each item owns its own state; the group neither reads nor writes it.
    const onFirst = fn();
    const onSecond = fn();
    const { container, getAllByRole } = await render(
      <CheckBoxGroup>
        <CheckBoxItem label={first.label} onChange={onFirst} />
        <CheckBoxItem label={second.label} onChange={onSecond} />
      </CheckBoxGroup>,
    );

    expect(container.firstElementChild).not.toHaveAttribute("role");

    const boxes = getAllByRole("checkbox");
    await userEvent.click(boxes[0]);

    // Independent state: checking one does not touch the other.
    expect(onFirst).toHaveBeenCalledTimes(1);
    expect(onFirst).toHaveBeenCalledWith(true);
    expect(onSecond).not.toHaveBeenCalled();
    expect(boxes[0]).toHaveAttribute("data-state", "checked");
    expect(boxes[1]).toHaveAttribute("data-state", "unchecked");
  });

  it("does NOT forward native props to the wrapper div", async () => {
    // Same closed-props shape as FormControl — see finding FC-1.
    const { container } = await render(
      // @ts-expect-error CheckBoxGroupProps declares no native div props.
      <CheckBoxGroup data-testid="group" id="g1">
        <CheckBoxItem label={first.label} />
      </CheckBoxGroup>,
    );
    expect(container.firstElementChild).not.toHaveAttribute("data-testid");
    expect(container.firstElementChild).not.toHaveAttribute("id");
  });
});
