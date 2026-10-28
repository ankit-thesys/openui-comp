/**
 * Buttons (the plural layout component) + IconButton.
 *
 * `Buttons` is NON-INTERACTIVE: a layout wrapper, recorded as such.
 * `IconButton` is interactive. The standalone `Button` is out of scope for #19
 * (it belongs to #9) and appears below only as an unavoidable child fixture,
 * with no assertions about its own behavior.
 *
 * Source: packages/react-ui/src/components/Buttons/Buttons.tsx
 *         packages/react-ui/src/components/IconButton/IconButton.tsx
 */
import { expect, fn, userEvent } from "@storybook/test";
import { describe, it } from "vitest";
import { Button } from "../../../packages/react-ui/src/components/Button";
import { Buttons } from "../../../packages/react-ui/src/components/Buttons";
import { IconButton } from "../../../packages/react-ui/src/components/IconButton";
import { render } from "../setup/render";

const Icon = () => <svg data-testid="icon" aria-hidden="true" />;

describe("Buttons — layout role", () => {
  it("renders a div defaulting to the horizontal variant (Buttons.tsx:22,26)", async () => {
    const { container } = await render(
      <Buttons>
        <IconButton icon={<Icon />} aria-label="Save" />
      </Buttons>,
    );
    const root = container.firstElementChild!;

    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("openui-buttons", "openui-buttons-horizontal");
  });

  it("maps the vertical variant to its class", async () => {
    const { container } = await render(
      <Buttons variant="vertical">
        <IconButton icon={<Icon />} aria-label="Save" />
      </Buttons>,
    );
    expect(container.firstElementChild).toHaveClass("openui-buttons-vertical");
  });

  it("adds no role, no toolbar semantics and no child coordination", async () => {
    const onFirst = fn();
    const onSecond = fn();
    const { container, getAllByRole } = await render(
      <Buttons>
        <IconButton icon={<Icon />} aria-label="First" onClick={onFirst} />
        <IconButton icon={<Icon />} aria-label="Second" onClick={onSecond} />
      </Buttons>,
    );

    expect(container.firstElementChild).not.toHaveAttribute("role");

    await userEvent.click(getAllByRole("button")[0]);
    expect(onFirst).toHaveBeenCalledTimes(1);
    expect(onSecond).not.toHaveBeenCalled();
  });

  it("forwards native div props (ButtonsProps extends HTMLAttributes)", async () => {
    const { container } = await render(
      <Buttons id="actions" data-testid="buttons" aria-label="Actions" style={{ gap: "8px" }}>
        <IconButton icon={<Icon />} aria-label="Save" />
      </Buttons>,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveAttribute("id", "actions");
    expect(root).toHaveAttribute("data-testid", "buttons");
    expect(root).toHaveAttribute("aria-label", "Actions");
    expect(root.style.gap).toBe("8px");
  });

  it("renders children in order and does not alter them", async () => {
    // `Button` here is a fixture dependency only (owned by #9).
    const { container } = await render(
      <Buttons>
        <Button>Cancel</Button>
        <IconButton icon={<Icon />} aria-label="Save" />
      </Buttons>,
    );
    const root = container.firstElementChild!;

    expect(root.children).toHaveLength(2);
    expect(root.children[0]).toHaveTextContent("Cancel");
  });
});

describe("IconButton — rendered contract", () => {
  it("renders a <button> with the default variant/size/shape classes", async () => {
    const { getByRole } = await render(<IconButton icon={<Icon />} aria-label="Save" />);
    const button = getByRole("button");

    // Defaults per IconButton.tsx:56-59.
    expect(button).toHaveClass(
      "openui-icon-button",
      "openui-icon-button-primary",
      "openui-icon-button-medium",
      "openui-icon-button-square",
    );
  });

  it("wraps the icon in a dedicated span (IconButton.tsx:83)", async () => {
    const { container, getByTestId } = await render(
      <IconButton icon={<Icon />} aria-label="Save" />,
    );
    const slot = container.querySelector(".openui-icon-button-icon")!;

    expect(slot).toBeInTheDocument();
    expect(slot).toContainElement(getByTestId("icon"));
  });

  it("renders children BEFORE the icon", async () => {
    const { getByRole, container } = await render(<IconButton icon={<Icon />}>Save</IconButton>);
    const button = getByRole("button");

    expect(button).toHaveTextContent("Save");
    // Slottable children (IconButton.tsx:82) precede the icon span.
    expect(container.querySelector(".openui-icon-button-icon")).toBe(button.lastElementChild);
  });

  it("maps every variant, size, shape and appearance to its class", async () => {
    for (const [size, expected] of [
      ["3-extra-small", "openui-icon-button-3-extra-small"],
      ["2-extra-small", "openui-icon-button-2-extra-small"],
      ["extra-small", "openui-icon-button-extra-small"],
      ["small", "openui-icon-button-small"],
      ["medium", "openui-icon-button-medium"],
      ["large", "openui-icon-button-large"],
    ] as const) {
      const { getByRole, unmount } = await render(
        <IconButton icon={<Icon />} size={size} aria-label="x" />,
      );
      expect(getByRole("button")).toHaveClass(expected);
      unmount();
    }

    for (const [variant, normal, destructive] of [
      ["primary", "openui-icon-button-primary", "openui-icon-button-destructive-primary"],
      ["secondary", "openui-icon-button-secondary", "openui-icon-button-destructive-secondary"],
      ["tertiary", "openui-icon-button-tertiary", "openui-icon-button-destructive-tertiary"],
    ] as const) {
      const a = await render(<IconButton icon={<Icon />} variant={variant} aria-label="x" />);
      expect(a.getByRole("button")).toHaveClass(normal);
      a.unmount();

      const b = await render(
        <IconButton icon={<Icon />} variant={variant} appearance="destructive" aria-label="x" />,
      );
      expect(b.getByRole("button")).toHaveClass(destructive);
      b.unmount();
    }

    const circle = await render(<IconButton icon={<Icon />} shape="circle" aria-label="x" />);
    expect(circle.getByRole("button")).toHaveClass("openui-icon-button-circle");
  });

  it("omits the icon span when `icon` is falsy", async () => {
    // `icon` is a required PROPERTY, but its type is ReactNode — which includes
    // null and undefined — so `icon={null}` type-checks, and the `{icon && ...}`
    // guard at IconButton.tsx:83 then renders no slot at all. An "IconButton"
    // with no icon is therefore a legal, silent no-op.
    const { container } = await render(<IconButton icon={null} aria-label="x" />);
    expect(container.querySelector(".openui-icon-button-icon")).toBeNull();
  });
});

describe("IconButton — native button behavior", () => {
  it("does NOT set type=button, so it submits inside a form", async () => {
    // OBSERVED DEFECT IB-1: IconButton.tsx:71-84 never defaults `type`, so the
    // native default ("submit") applies. Chips and OptionCards both set
    // type="button" explicitly, so an icon-only action button placed in a form
    // submits it unexpectedly. Recorded, not corrected.
    const standalone = await render(<IconButton icon={<Icon />} aria-label="Save" />);
    expect(standalone.getByRole("button")).not.toHaveAttribute("type");
    standalone.unmount();

    const onSubmit = fn((event: React.FormEvent) => event.preventDefault());
    const { getByRole } = await render(
      <form onSubmit={onSubmit}>
        <IconButton icon={<Icon />} aria-label="Delete row" />
      </form>,
    );

    await userEvent.click(getByRole("button"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("accepts an explicit type=button, which suppresses submission", async () => {
    const onSubmit = fn((event: React.FormEvent) => event.preventDefault());
    const { getByRole } = await render(
      <form onSubmit={onSubmit}>
        <IconButton icon={<Icon />} type="button" aria-label="Delete row" />
      </form>,
    );

    await userEvent.click(getByRole("button"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("fires onClick, is focusable and activates by keyboard", async () => {
    const onClick = fn();
    const { getByRole } = await render(
      <IconButton icon={<Icon />} type="button" aria-label="Save" onClick={onClick} />,
    );
    const button = getByRole("button");

    // Tab first: a click leaves focus ON the button, so tabbing afterwards
    // would move focus away and make the assertion misleading.
    await userEvent.tab();
    expect(button).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);

    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);

    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("is disabled, unclickable and not tabbable when disabled", async () => {
    const onClick = fn();
    const { getByRole } = await render(
      <IconButton icon={<Icon />} type="button" aria-label="Save" disabled onClick={onClick} />,
    );
    const button = getByRole("button");

    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();

    await userEvent.tab();
    expect(button).not.toHaveFocus();
  });

  it("gets its accessible name only from the consumer — no name is derived", async () => {
    // An icon-only button has no text content, so aria-label is the consumer's
    // responsibility; the component supplies no fallback.
    const unnamed = await render(<IconButton icon={<Icon />} />);
    expect(unnamed.getByRole("button")).not.toHaveAccessibleName();
    unnamed.unmount();

    const named = await render(<IconButton icon={<Icon />} aria-label="Save draft" />);
    expect(named.getByRole("button")).toHaveAccessibleName("Save draft");
  });
});

describe("IconButton — asChild", () => {
  it("renders the provided child element instead of a <button>", async () => {
    const { container, getByRole } = await render(
      <IconButton asChild icon={<Icon />}>
        <a href="/settings">Settings</a>
      </IconButton>,
    );
    const link = getByRole("link");

    expect(container.querySelector("button")).toBeNull();
    expect(link).toHaveAttribute("href", "/settings");
    // Classes are merged onto the slotted element.
    expect(link).toHaveClass("openui-icon-button", "openui-icon-button-primary");
  });

  it("keeps the icon span inside the slotted element", async () => {
    const { getByRole } = await render(
      <IconButton asChild icon={<Icon />}>
        <a href="/settings">Settings</a>
      </IconButton>,
    );
    expect(getByRole("link").querySelector(".openui-icon-button-icon")).toBeInTheDocument();
  });

  it("forwards the click handler to the slotted element", async () => {
    const onClick = fn((event: React.MouseEvent) => event.preventDefault());
    const { getByRole } = await render(
      <IconButton asChild icon={<Icon />} onClick={onClick}>
        <a href="/settings">Settings</a>
      </IconButton>,
    );

    await userEvent.click(getByRole("link"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
