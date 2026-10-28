/**
 * Harness self-check. Not a baseline assertion about any component: it only
 * proves the jsdom environment, the React-19 act wiring, the single-React-
 * instance aliasing and the jest-dom matchers are all live, so that a failure
 * in a real family test means something about that family.
 */
import { expect, userEvent } from "@storybook/test";
import { describe, it } from "vitest";
import { Button } from "../../../packages/react-ui/src/components/Button";
import { render } from "../setup/render";

describe("harness probe", () => {
  it("provides a jsdom document", () => {
    expect(typeof document).toBe("object");
    expect(document.body).toBeTruthy();
  });

  it("renders a legacy component, queries it, and has jest-dom matchers", async () => {
    const { getByRole } = await render(<Button>probe</Button>);
    expect(getByRole("button")).toBeInTheDocument();
  });

  it("routes userEvent clicks into React state (single React instance)", async () => {
    const seen: string[] = [];
    const { getByRole } = await render(<Button onClick={() => seen.push("click")}>probe</Button>);
    await userEvent.click(getByRole("button"));
    expect(seen).toEqual(["click"]);
  });
});
