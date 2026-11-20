/**
 * Select — compound, portal-rendering family.
 *
 * Exported parts: Select, SelectGroup, SelectValue, SelectTrigger,
 * SelectContent, SelectLabel, SelectItem, SelectSeparator (Select.tsx).
 *
 * Harness note: SelectContent renders into a PORTAL on document.body, and
 * Radix marks everything outside the open popup aria-hidden. Tests therefore
 * capture the trigger element by reference before opening and query popup
 * content from `document`, not from the render container.
 *
 * Source: packages/react-ui/src/components/Select/Select.tsx
 */
import { expect, fn, userEvent } from "@storybook/test";
import { describe, it } from "vitest";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../../../packages/react-ui/src/components/Select";
import { SELECT_ITEMS } from "../fixtures/data";
import { render } from "../setup/render";

const [eur, gbp, jpy] = SELECT_ITEMS;

type FixtureProps = {
  onValueChange?: (value: string) => void;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  disableLast?: boolean;
};

const Fixture = ({ disableLast, ...rootProps }: FixtureProps) => (
  <Select {...rootProps}>
    <SelectTrigger aria-label="Currency">
      <SelectValue placeholder="Pick one" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value={eur.value}>{eur.label}</SelectItem>
      <SelectItem value={gbp.value}>{gbp.label}</SelectItem>
      <SelectItem value={jpy.value} disabled={disableLast}>
        {jpy.label}
      </SelectItem>
    </SelectContent>
  </Select>
);

/** The trigger, held by reference so it stays queryable once Radix aria-hides it. */
const triggerOf = (container: HTMLElement) =>
  container.querySelector('[role="combobox"]') as HTMLElement;

const openOptions = () => Array.from<HTMLElement>(document.querySelectorAll('[role="option"]'));

describe("Select — closed state", () => {
  it("renders the trigger as a role=combobox button, collapsed", async () => {
    const { container } = await render(<Fixture />);
    const trigger = triggerOf(container);

    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toHaveAttribute("type", "button");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("data-state", "closed");
  });

  it("shows the placeholder and marks data-placeholder with no value", async () => {
    const { container } = await render(<Fixture />);
    const trigger = triggerOf(container);

    expect(trigger).toHaveTextContent("Pick one");
    expect(trigger).toHaveAttribute("data-placeholder");
  });

  it("renders NO popup content before opening", async () => {
    await render(<Fixture />);

    expect(openOptions()).toHaveLength(0);
    expect(document.querySelector(".openui-select-content")).toBeNull();
  });

  it("applies the default md size class to the trigger", async () => {
    const { container } = await render(<Fixture />);
    expect(triggerOf(container)).toHaveClass("openui-select-trigger", "openui-select-trigger-md");
  });

  it("renders a chevron icon by default", async () => {
    const { container } = await render(<Fixture />);
    expect(triggerOf(container).querySelector("svg")).toBeInTheDocument();
  });

  it("CRASHES when hideDropdownIcon is set", async () => {
    // OBSERVED DEFECT SE-1 — a hard render error, not a styling quirk.
    //
    // Select.tsx:99-101 renders:
    //   <SelectPrimitive.Icon asChild>
    //     {!hideDropdownIcon && <ChevronDown … />}
    //   </SelectPrimitive.Icon>
    //
    // With hideDropdownIcon={true} the expression is `false`, so Radix's Slot
    // receives a boolean instead of a single element and throws:
    //   "Primitive.span failed to slot onto its children."
    // The prop is declared in SelectTriggerProps (Select.tsx:68) and is
    // therefore unusable at this baseline. Recorded, not fixed.
    await expect(
      render(
        <Select>
          <SelectTrigger hideDropdownIcon aria-label="Currency">
            <SelectValue placeholder="Pick one" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={eur.value}>{eur.label}</SelectItem>
          </SelectContent>
        </Select>,
      ),
    ).rejects.toThrow(/failed to slot onto its children/);
  });
});

describe("Select — opening and closing", () => {
  it("opens on trigger click and portals the listbox to document.body", async () => {
    const { container } = await render(<Fixture />);
    const trigger = triggerOf(container);

    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector('[role="listbox"]')).toBeInTheDocument();
    // Portal target: outside the render container, directly under body.
    expect(container.querySelector('[role="listbox"]')).toBeNull();
  });

  it("renders one option per item, in source order", async () => {
    const { container } = await render(<Fixture />);
    await userEvent.click(triggerOf(container));

    expect(openOptions().map((o) => o.textContent)).toEqual([eur.label, gbp.label, jpy.label]);
  });

  it("aria-hides the rest of the document while open", async () => {
    // Behavior worth recording because it dictates how consumers' own tests
    // must query a Select: role queries scoped to the page body stop matching.
    const { container } = await render(<Fixture />);
    await userEvent.click(triggerOf(container));

    expect(container).toHaveAttribute("aria-hidden", "true");
  });

  it("opens from the keyboard with Enter", async () => {
    const { container } = await render(<Fixture />);
    const trigger = triggerOf(container);

    await userEvent.tab();
    expect(trigger).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(openOptions()).toHaveLength(3);
  });

  it("closes on Escape and restores focus to the trigger", async () => {
    const { container } = await render(<Fixture />);
    const trigger = triggerOf(container);

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{Escape}");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(openOptions()).toHaveLength(0);
    expect(trigger).toHaveFocus();
  });

  it("unmounts the portal content on close", async () => {
    const { container } = await render(<Fixture />);
    await userEvent.click(triggerOf(container));
    expect(document.querySelector(".openui-select-content")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    expect(document.querySelector(".openui-select-content")).toBeNull();
  });
});

describe("Select — choosing an option (full interaction)", () => {
  it("selects by click, reports the value and reflects it on the trigger", async () => {
    const onValueChange = fn();
    const { container } = await render(<Fixture onValueChange={onValueChange} />);
    const trigger = triggerOf(container);

    await userEvent.click(trigger);
    await userEvent.click(openOptions()[1]!);

    // Payload is Radix's onValueChange: the item's `value`, not its label.
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(gbp.value);
    // The trigger now shows the chosen item's LABEL.
    expect(trigger).toHaveTextContent(gbp.label);
    expect(trigger).not.toHaveAttribute("data-placeholder");
    // Choosing closes the popup.
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("selects by keyboard: ArrowDown then Enter", async () => {
    const onValueChange = fn();
    const { container } = await render(<Fixture onValueChange={onValueChange} />);
    const trigger = triggerOf(container);

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");

    expect(onValueChange).toHaveBeenCalledWith(gbp.value);
    expect(trigger).toHaveTextContent(gbp.label);
  });

  it("marks the chosen option checked when reopened", async () => {
    const { container } = await render(<Fixture defaultValue={gbp.value} />);
    const trigger = triggerOf(container);

    await userEvent.click(trigger);
    const options = openOptions();

    expect(options[1]).toHaveAttribute("aria-selected", "true");
    expect(options[0]).toHaveAttribute("aria-selected", "false");
  });

  it("honors defaultValue as the initial uncontrolled selection", async () => {
    const { container } = await render(<Fixture defaultValue={jpy.value} />);
    expect(triggerOf(container)).toHaveTextContent(jpy.label);
  });

  it("stays pinned when controlled, while still reporting intent", async () => {
    const onValueChange = fn();
    const { container } = await render(<Fixture value={eur.value} onValueChange={onValueChange} />);
    const trigger = triggerOf(container);

    await userEvent.click(trigger);
    await userEvent.click(openOptions()[1]!);

    expect(onValueChange).toHaveBeenCalledWith(gbp.value);
    // Controlled: the display does not move on its own.
    expect(trigger).toHaveTextContent(eur.label);
  });

  it("reflects a controlled value pushed in by the consumer", async () => {
    const { container, rerender } = await render(<Fixture value={eur.value} />);
    expect(triggerOf(container)).toHaveTextContent(eur.label);

    await rerender(<Fixture value={jpy.value} />);
    expect(triggerOf(container)).toHaveTextContent(jpy.label);
  });
});

describe("Select — disabled", () => {
  it("does not open when the root is disabled", async () => {
    const { container } = await render(<Fixture disabled />);
    const trigger = triggerOf(container);

    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute("data-disabled");

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(openOptions()).toHaveLength(0);
  });

  it("is not tabbable when disabled", async () => {
    const { container } = await render(<Fixture disabled />);
    await userEvent.tab();
    expect(triggerOf(container)).not.toHaveFocus();
  });

  it("marks a disabled option and ignores clicks on it", async () => {
    const onValueChange = fn();
    const { container } = await render(<Fixture disableLast onValueChange={onValueChange} />);

    await userEvent.click(triggerOf(container));
    const options = openOptions();

    expect(options[2]).toHaveAttribute("aria-disabled", "true");
    expect(options[2]).toHaveAttribute("data-disabled");

    await userEvent.click(options[2]!);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("Select — item rendering details", () => {
  it("renders a tick wrapper by default and omits it for showTick={false}", async () => {
    const withTick = await render(
      <Select defaultValue={eur.value}>
        <SelectTrigger aria-label="Currency">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={eur.value}>{eur.label}</SelectItem>
        </SelectContent>
      </Select>,
    );
    await userEvent.click(triggerOf(withTick.container));
    expect(openOptions()[0]).toHaveClass("openui-select-item--with-tick");
    expect(document.querySelector(".openui-select-item-check-wrapper")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    withTick.unmount();

    const noTick = await render(
      <Select>
        <SelectTrigger aria-label="Currency">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={eur.value} showTick={false}>
            {eur.label}
          </SelectItem>
        </SelectContent>
      </Select>,
    );
    await userEvent.click(triggerOf(noTick.container));
    expect(openOptions()[0]).toHaveClass("openui-select-item--without-tick");
    expect(document.querySelector(".openui-select-item-check-wrapper")).toBeNull();
  });

  it("renders `textValue` as EXTRA VISIBLE TEXT instead of forwarding it to Radix", async () => {
    // OBSERVED DEFECT SE-2. In Radix, `textValue` is the typeahead string used
    // when an item's children are not plain text; it is never meant to render.
    // Select.tsx:176 destructures it OUT of the props passed to
    // SelectPrimitive.Item and Select.tsx:197 renders it in its own <span>.
    //
    // Two consequences, both asserted below: the option shows duplicated text,
    // and Radix's real textValue is left unset.
    const { container } = await render(
      <Select>
        <SelectTrigger aria-label="Currency">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={eur.value} textValue="Euro currency">
            {eur.label}
          </SelectItem>
        </SelectContent>
      </Select>,
    );
    await userEvent.click(triggerOf(container));
    const option = openOptions()[0];

    expect(option).toHaveTextContent("EuroEuro currency");
    expect(document.querySelector(".openui-select-item-text-value")).toHaveTextContent(
      "Euro currency",
    );
  });

  it("renders SelectGroup, SelectLabel and SelectSeparator inside the popup", async () => {
    const { container } = await render(
      <Select>
        <SelectTrigger aria-label="Currency">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Europe</SelectLabel>
            <SelectItem value={eur.value}>{eur.label}</SelectItem>
            <SelectItem value={gbp.value}>{gbp.label}</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Asia</SelectLabel>
            <SelectItem value={jpy.value}>{jpy.label}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );
    await userEvent.click(triggerOf(container));

    expect(document.querySelectorAll(".openui-select-group")).toHaveLength(2);
    expect(document.querySelectorAll(".openui-select-label")).toHaveLength(2);
    expect(document.querySelector(".openui-select-separator")).toBeInTheDocument();
    expect(document.querySelector(".openui-select-label")).toHaveTextContent("Europe");
  });

  it("sets the viewport's data-position, defaulting to popper", async () => {
    const { container } = await render(<Fixture />);
    await userEvent.click(triggerOf(container));

    // SelectContent.tsx:118 defaults position to "popper".
    expect(document.querySelector(".openui-select-viewport")).toHaveAttribute(
      "data-position",
      "popper",
    );
  });
});

describe("Select — size context", () => {
  it("propagates the root size to both trigger and content", async () => {
    const { container } = await render(
      <Select size="sm">
        <SelectTrigger aria-label="Currency">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={eur.value}>{eur.label}</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = triggerOf(container);
    await userEvent.click(trigger);

    expect(trigger).toHaveClass("openui-select-trigger-sm");
    expect(document.querySelector(".openui-select-content")).toHaveClass(
      "openui-select-content-sm",
    );
  });

  it("leaves trigger and content DISAGREEING when both declare a size", async () => {
    // OBSERVED DEFECT SE-3. Two effects fight over one piece of shared state:
    //   * SelectTrigger (Select.tsx:85-89) pushes its own `size` into context.
    //   * Select (Select.tsx:25-27) resets context back to the root `size`.
    // Child effects run before parent effects, so the root wins the context
    // while the trigger keeps its own class — the popup is sized differently
    // from the control that opened it.
    const { container } = await render(
      <Select size="sm">
        <SelectTrigger size="lg" aria-label="Currency">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={eur.value}>{eur.label}</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = triggerOf(container);
    await userEvent.click(trigger);

    expect(trigger).toHaveClass("openui-select-trigger-lg");
    expect(document.querySelector(".openui-select-content")).toHaveClass(
      "openui-select-content-sm",
    );
  });
});
