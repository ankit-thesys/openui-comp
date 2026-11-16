import { Button as RCButton, IconButton as RCIconButton, Tag, ThemeProvider } from "@openuidev/react-components";
import { Star } from "lucide-react";
import type { ReactNode } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Icon } from "../../components/Icon";
import { IconButton } from "../../components/IconButton";
import { box, settle, style } from "../helpers/render";

// The kit draws its icons through react-components' Button, IconButton and Tag, whose own rules
// size and stroke any svg inside them. Each kit icon keeps the source's 1.8 stroke, and the kit's
// rules leave react-components' own icons alone.

const roots: Root[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) root.unmount();
  document.querySelectorAll("[data-icon-host]").forEach((host) => host.remove());
});

async function mount(node: ReactNode) {
  const host = document.body.appendChild(document.createElement("div"));
  host.dataset.iconHost = "";
  const root = createRoot(host);
  roots.push(root);
  flushSync(() => root.render(<ThemeProvider>{node}</ThemeProvider>));
  // DynamicIcon loads each icon on first use.
  await expect.poll(() => host.querySelectorAll("[data-probe]").length === host.querySelectorAll("[data-probe] svg").length).toBe(true);
  await settle();
  return host;
}

const icon = (host: HTMLElement, probe: string) => {
  const svg = host.querySelector(`[data-probe="${probe}"] svg`)!;
  const { width, height } = box(svg);
  return { width, height, stroke: style(svg).strokeWidth };
};

const reactComponents = (
  <>
    <span data-probe="button"><RCButton iconLeft={<Star />}>Go</RCButton></span>
    <span data-probe="icon-button"><RCIconButton icon={<Star />} /></span>
    <span data-probe="tag"><Tag icon={<Star />} text="Tag" /></span>
  </>
);

describe("icons", () => {
  it("keep the kit's 1.8 stroke and size inside react-components' parts", async () => {
    const host = await mount(
      <>
        <span data-probe="icon"><Icon name="star" /></span>
        <span data-probe="icon-sm"><Icon name="star" size="sm" /></span>
        <span data-probe="button"><Button icon="star">Go</Button></span>
        <span data-probe="button-sm"><Button icon="star" size="sm">Go</Button></span>
        <span data-probe="icon-button"><IconButton icon="star" aria-label="Star" /></span>
        <span data-probe="badge"><Badge text="Done" icon="star" /></span>
      </>,
    );
    expect(icon(host, "icon")).toEqual({ width: 18, height: 18, stroke: "1.8px" });
    expect(icon(host, "icon-sm")).toEqual({ width: 14, height: 14, stroke: "1.8px" });
    expect(icon(host, "button")).toEqual({ width: 16, height: 16, stroke: "1.8px" });
    expect(icon(host, "button-sm")).toEqual({ width: 14, height: 14, stroke: "1.8px" });
    expect(icon(host, "icon-button")).toEqual({ width: 16, height: 16, stroke: "1.8px" });
    // Tag draws its svg at 2.5.
    expect(icon(host, "badge")).toEqual({ width: 14, height: 14, stroke: "1.8px" });
  });

  it("sit a Badge's icon 8px in, as the source's does", async () => {
    const host = await mount(<span data-probe="badge"><Badge text="Done" icon="star" /></span>);
    const badge = host.querySelector(".openui-intelligent-badge")!;
    expect(box(host.querySelector("[data-probe] svg")!).left - box(badge).left).toBe(8);
  });

  it("leave react-components' own icons as they were", async () => {
    const alone = await mount(reactComponents);
    const read = () => ["button", "icon-button", "tag"].map((probe) => icon(alone, probe));
    const before = read();
    await mount(
      <>
        <span data-probe="kit-button"><Button icon="star">Go</Button></span>
        <span data-probe="kit-icon-button"><IconButton icon="star" aria-label="Star" /></span>
        <span data-probe="kit-badge"><Badge text="Done" icon="star" /></span>
      </>,
    );
    expect(read()).toEqual(before);
    expect(before[2].stroke).toBe("2.5px");
  });
});
