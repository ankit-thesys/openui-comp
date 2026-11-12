/**
 * FormControl + Hint — NON-INTERACTIVE family.
 *
 * FormControl is a layout wrapper that also publishes a `hasError` flag on
 * context; Hint is the consumer of that flag. Recorded here: the layout role,
 * the context contract, and the prop-forwarding asymmetry between the two.
 *
 * Source: packages/react-ui/src/components/FormControl/FormControl.tsx
 *         packages/react-ui/src/components/FormControl/context.tsx
 *         packages/react-ui/src/components/FormControl/Hint/Hint.tsx
 */
import { expect } from "@storybook/test";
import { describe, it } from "vitest";
import { FormControl, Hint } from "../../../packages/react-ui/src/components/FormControl";
import { Label } from "../../../packages/react-ui/src/components/Label";
import { render } from "../setup/render";

describe("FormControl — layout role", () => {
  it("renders a plain <div> wrapper with the openui-form-control class (FormControl.tsx:15)", async () => {
    const { container } = await render(
      <FormControl>
        <Label htmlFor="a">Amount</Label>
      </FormControl>,
    );
    const root = container.firstElementChild!;

    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("openui-form-control");
  });

  it("imposes no DOM structure on its children beyond the wrapper", async () => {
    // Layout role only: children are rendered in order, untouched. FormControl
    // does NOT inject ids, aria-describedby or label/control wiring.
    const { container } = await render(
      <FormControl>
        <Label htmlFor="amount">Amount</Label>
        <input id="amount" />
        <Hint>Up to two decimal places.</Hint>
      </FormControl>,
    );
    const root = container.firstElementChild!;

    expect(Array.from<Element>(root.children).map((c) => c.tagName)).toEqual([
      "LABEL",
      "INPUT",
      "DIV",
    ]);
    // No automatic association is created between the hint and the input.
    expect(container.querySelector("input")).not.toHaveAttribute("aria-describedby");
  });

  it("DOES NOT forward unknown/native props to the wrapper div", async () => {
    // Observed baseline: FormControl.tsx:12 destructures only children/className/
    // style/hasError and never spreads a rest object, so id, data-* and aria-*
    // are silently dropped. Recorded as finding FC-1 in docs/defects.md.
    const { container } = await render(
      // @ts-expect-error FormControlProps intentionally does not declare these;
      // passing them documents that they are dropped at runtime too.
      <FormControl id="fc-root" data-testid="fc" aria-label="Amount group">
        <span>child</span>
      </FormControl>,
    );
    const root = container.firstElementChild!;

    expect(root).not.toHaveAttribute("id");
    expect(root).not.toHaveAttribute("data-testid");
    expect(root).not.toHaveAttribute("aria-label");
  });

  it("applies className and style, which ARE declared props", async () => {
    const { container } = await render(
      <FormControl className="dense" style={{ gap: "4px" }}>
        <span>child</span>
      </FormControl>,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("openui-form-control", "dense");
    expect(root.style.gap).toBe("4px");
  });

  it("exposes hasError only through context — no attribute lands on the wrapper", async () => {
    const { container } = await render(
      <FormControl hasError>
        <Hint>Required.</Hint>
      </FormControl>,
    );
    const root = container.firstElementChild!;

    expect(root).not.toHaveAttribute("data-has-error");
    expect(root).not.toHaveAttribute("aria-invalid");
    // The flag is observable only via the Hint that consumes the context.
    expect(container.querySelector(".openui-hint")).toHaveClass("openui-hint-error");
  });
});

describe("Hint — context consumer", () => {
  it("renders a <div class=openui-hint> and forwards native div props (Hint.tsx:17-24)", async () => {
    const { container } = await render(
      <Hint id="amount-hint" data-testid="hint">
        Up to two decimals.
      </Hint>,
    );
    const hint = container.querySelector(".openui-hint")!;

    expect(hint.tagName).toBe("DIV");
    expect(hint).toHaveAttribute("id", "amount-hint");
    // Unlike FormControl, Hint DOES spread rest props (HintProps extends
    // ComponentPropsWithoutRef<"div">) — the asymmetry is finding FC-1.
    expect(hint).toHaveAttribute("data-testid", "hint");
  });

  it("defaults to the non-error class outside a FormControl", async () => {
    const { container } = await render(<Hint>Plain hint.</Hint>);
    // resolvedHasError = hasError ?? ctx?.hasError ?? false  (Hint.tsx:15)
    expect(container.querySelector(".openui-hint")).not.toHaveClass("openui-hint-error");
  });

  it("inherits hasError from FormControl context", async () => {
    const { container } = await render(
      <FormControl hasError>
        <Hint>Inherited error.</Hint>
      </FormControl>,
    );
    expect(container.querySelector(".openui-hint")).toHaveClass("openui-hint-error");
  });

  it("lets an explicit hasError prop win over context in both directions", async () => {
    const { container: a } = await render(
      <FormControl hasError={false}>
        <Hint hasError>Local error wins.</Hint>
      </FormControl>,
    );
    expect(a.querySelector(".openui-hint")).toHaveClass("openui-hint-error");

    const { container: b } = await render(
      <FormControl hasError>
        <Hint hasError={false}>Local non-error wins.</Hint>
      </FormControl>,
    );
    expect(b.querySelector(".openui-hint")).not.toHaveClass("openui-hint-error");
  });

  it("re-renders hint state when FormControl.hasError changes", async () => {
    const { container, rerender } = await render(
      <FormControl hasError={false}>
        <Hint>Hint</Hint>
      </FormControl>,
    );
    expect(container.querySelector(".openui-hint")).not.toHaveClass("openui-hint-error");

    await rerender(
      <FormControl hasError>
        <Hint>Hint</Hint>
      </FormControl>,
    );
    expect(container.querySelector(".openui-hint")).toHaveClass("openui-hint-error");
  });
});
