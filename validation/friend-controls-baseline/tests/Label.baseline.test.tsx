/**
 * Label — NON-INTERACTIVE family.
 *
 * Per issue #19 item 3, no interaction requirements are invented here. What is
 * recorded instead is Label's association and layout role: what it renders,
 * which props reach the DOM natively, and what `disabled`/`required` actually do.
 *
 * Source: packages/react-ui/src/components/Label/Label.tsx
 */
import { expect, userEvent } from "@storybook/test";
import { describe, it } from "vitest";
import { Label } from "../../../packages/react-ui/src/components/Label";
import { render } from "../setup/render";

describe("Label — element and association role", () => {
  it("renders a native <label> carrying the openui-label class (Label.tsx:16-24)", async () => {
    const { container } = await render(<Label>Delivery speed</Label>);
    const label = container.querySelector("label");

    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("openui-label");
    expect(label).toHaveTextContent("Delivery speed");
  });

  it("forwards htmlFor natively, so clicking the label focuses the control", async () => {
    // `htmlFor` is NOT a custom prop: it arrives through the {...props} spread
    // at Label.tsx:26 onto @radix-ui/react-label's Root, which renders a <label>.
    const { container } = await render(
      <>
        <Label htmlFor="speed-input">Delivery speed</Label>
        <input id="speed-input" />
      </>,
    );
    const label = container.querySelector("label")!;
    const input = container.querySelector("input")!;

    expect(label).toHaveAttribute("for", "speed-input");

    await userEvent.click(label);
    expect(input).toHaveFocus();
  });

  it("appends a decorative asterisk span when required (Label.tsx:29)", async () => {
    const { container } = await render(<Label required>Email</Label>);
    const asterisk = container.querySelector(".openui-label-required-asterisk");

    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveTextContent("*");
    // Observed: the asterisk is plain text in a span. It is not aria-hidden and
    // carries no accessible "required" semantics; the label's text content
    // therefore becomes "Email*" for assistive technology.
    expect(container.querySelector("label")).toHaveTextContent("Email*");
  });

  it("omits the asterisk by default", async () => {
    const { container } = await render(<Label>Email</Label>);
    expect(container.querySelector(".openui-label-required-asterisk")).not.toBeInTheDocument();
  });

  it("treats `disabled` as presentation only — no attribute, no aria state", async () => {
    // Observed baseline (Label.tsx:21): `disabled` only adds a class. It does not
    // set aria-disabled, and a <label> has no native disabled attribute. Recorded
    // as a finding in docs/defects.md (L-1), not asserted as desired behavior.
    const { container } = await render(
      <Label disabled htmlFor="x">
        Disabled label
      </Label>,
    );
    const label = container.querySelector("label")!;

    expect(label).toHaveClass("openui-label-disabled");
    expect(label).not.toHaveAttribute("aria-disabled");
    expect(label).not.toHaveAttribute("disabled");
  });

  it("merges a consumer className rather than replacing the base class", async () => {
    const { container } = await render(<Label className="my-label">Label</Label>);
    expect(container.querySelector("label")).toHaveClass("openui-label", "my-label");
  });

  it("still forwards htmlFor while disabled, so the label stays clickable", async () => {
    // Direct consequence of the finding above: `disabled` does not suppress the
    // label's native activation behavior.
    const { container } = await render(
      <>
        <Label disabled htmlFor="speed-input">
          Delivery speed
        </Label>
        <input id="speed-input" />
      </>,
    );
    await userEvent.click(container.querySelector("label")!);
    expect(container.querySelector("input")).toHaveFocus();
  });
});
