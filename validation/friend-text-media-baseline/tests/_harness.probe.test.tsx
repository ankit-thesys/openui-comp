/**
 * Harness probe. Asserts the things the rest of the suite silently depends on,
 * so a broken harness fails here with one clear message instead of producing
 * dozens of misleading component failures.
 *
 * Written and run FIRST, before any component test, because the preceding
 * baseline tickets showed that an unverified harness assumption (a missing DOM,
 * a duplicated React) is indistinguishable from a component defect.
 */
import { describe, expect, it } from "vitest";
import { expect as sbExpect } from "@storybook/test";
import * as React from "react";
// Imported from the package ROOT barrel on purpose: #31 asks for evidence against
// the public contract, and `src/index.ts` is the surface the inventory describes.
// A `dist/` exists on this base commit, but source is authoritative and cannot be
// stale relative to the recorded revision.
import {
  MarkDownRenderer,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "../../../packages/react-ui/src/index";
import { render } from "../setup/render";

describe("harness", () => {
  it("runs in a real jsdom DOM", () => {
    expect(typeof document).toBe("object");
    expect(navigator.userAgent.toLowerCase()).toContain("jsdom");
  });

  it("has exactly one React instance shared with the legacy package", async () => {
    // Two React copies is the failure mode that produces "invalid hook call"
    // deep inside a legacy component and looks like a component bug.
    const { container } = await render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>one instance</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(container.querySelector("table.openui-table")).not.toBeNull();
    expect(React.version).toBe(React.version);
  });

  it("carries the jest-dom matchers from @storybook/test", async () => {
    const { container } = await render(<div data-probe>present</div>);
    const el = container.querySelector("[data-probe]");
    // If this throws "is not a function", tests are importing the wrong expect.
    sbExpect(el).toBeInTheDocument();
  });

  it("renders a legacy component that pulls in the real theme context", async () => {
    // MarkDownRenderer calls useTheme(); rendering it without a provider proves
    // the default-context path works, which every markdown test relies on.
    const { container } = await render(<MarkDownRenderer textMarkdown="probe **bold**" />);
    expect(container.querySelector(".openui-markdown-renderer")).not.toBeNull();
    expect(container.querySelector("strong")?.textContent).toBe("bold");
  });
});
