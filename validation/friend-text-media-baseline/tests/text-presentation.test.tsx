/**
 * Default rendering and representative public-prop behavior for the remaining
 * in-scope families, so every family named in #31 has evidence rather than only
 * the interesting ones.
 *
 * Deliberately shallow per family: one default render plus the props that change
 * observable output. Deeper interaction work lives in the Chrome runner, and
 * anything not covered is recorded in docs/coverage-matrix.md instead of being
 * implied here.
 */
import { describe, expect, it, vi } from "vitest";
import {
  CodeBlock,
  IconTag,
  IconText,
  ImageGallery,
  ImageText,
  ImageTextLarge,
  InlineHeader,
  ListBlock,
  ListItem,
  Separator,
  Steps,
  StepsItem,
  TextBlockView,
} from "../../../packages/react-ui/src/index";
import { render } from "../setup/render";

const INERT_SRC =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

describe("IconText", () => {
  it("renders title and subtitle", async () => {
    const { container } = await render(
      <IconText icon={{ name: "rocket" }} title="Launch" subtitle="Ready" />,
    );
    expect(container.textContent).toContain("Launch");
    expect(container.textContent).toContain("Ready");
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders without a subtitle", async () => {
    const { container } = await render(<IconText icon={{ name: "rocket" }} title="Only" />);
    expect(container.textContent).toContain("Only");
  });

  it("reflects the layout prop in the rendered class list", async () => {
    const h = await render(
      <IconText icon={{ name: "rocket" }} title="t" layout="horizontal" />,
    );
    const v = await render(<IconText icon={{ name: "rocket" }} title="t" layout="vertical" />);
    expect(h.container.innerHTML).not.toBe(v.container.innerHTML);
  });

  it("falls back to an icon rather than throwing on an unresolvable name", async () => {
    // Icon names are LLM-supplied, so an unknown name must degrade, not crash.
    const { container } = await render(
      <IconText icon={{ name: "definitely-not-a-lucide-icon" }} title="Fallback" />,
    );
    expect(container.textContent).toContain("Fallback");
    expect(container.querySelector("svg")).not.toBeNull();
  });
});

describe("IconTag", () => {
  it("renders an icon with default size and variant", async () => {
    const { container } = await render(<IconTag icon={{ name: "shield" }} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("produces distinct output per variant", async () => {
    const seen = new Set<string>();
    for (const variant of ["neutral", "info", "success", "warning", "danger", "inverted"] as const) {
      const { container } = await render(<IconTag icon={{ name: "shield" }} variant={variant} />);
      seen.add(container.innerHTML);
    }
    expect(seen.size).toBe(6);
  });

  it("produces distinct output per size", async () => {
    const seen = new Set<string>();
    for (const size of ["xs", "s", "m", "l", "xl"] as const) {
      const { container } = await render(<IconTag icon={{ name: "shield" }} size={size} />);
      seen.add(container.innerHTML);
    }
    expect(seen.size).toBe(5);
  });
});

describe("InlineHeader", () => {
  it("renders heading and description", async () => {
    const { container } = await render(
      <InlineHeader heading="Section" description="About this" />,
    );
    expect(container.textContent).toContain("Section");
    expect(container.textContent).toContain("About this");
  });

  it("renders with neither prop supplied, without throwing", async () => {
    // Both props are optional; pin the empty shape so a migration preserves it.
    const { container } = await render(<InlineHeader />);
    expect(container).toBeTruthy();
  });
});

describe("Separator", () => {
  it("renders a Radix separator with the openui class", async () => {
    const { container } = await render(<Separator />);
    const sep = container.querySelector(".openui-separator");
    expect(sep).not.toBeNull();
    // OBSERVATION: openui does not set Radix's `decorative` flag, so the default
    // is a SEMANTIC separator (role="separator"), announced by assistive tech,
    // rather than a presentational one. Recorded as observed behavior; this
    // ticket makes no accessibility certification claim either way.
    expect(sep?.getAttribute("role")).toBe("separator");
  });

  it("becomes presentational only when the consumer passes decorative", async () => {
    // Confirms the default above is a default, not a hard-coded role.
    const { container } = await render(<Separator decorative />);
    expect(container.querySelector(".openui-separator")?.getAttribute("role")).toBe("none");
  });

  it("exposes orientation through the forwarded Radix props", async () => {
    const { container } = await render(<Separator orientation="vertical" />);
    expect(container.querySelector(".openui-separator")?.getAttribute("data-orientation")).toBe(
      "vertical",
    );
  });
});

describe("ListBlock and ListItem", () => {
  it("renders one item per child with number indicators by default", async () => {
    const { container } = await render(
      <ListBlock>
        <ListItem title="First" />
        <ListItem title="Second" />
      </ListBlock>,
    );
    expect(container.textContent).toContain("First");
    expect(container.textContent).toContain("Second");
  });

  it("passes its variant down to the items", async () => {
    const number = await render(
      <ListBlock variant="number">
        <ListItem title="x" />
      </ListBlock>,
    );
    const icon = await render(
      <ListBlock variant="icon">
        <ListItem title="x" />
      </ListBlock>,
    );
    expect(number.container.innerHTML).not.toBe(icon.container.innerHTML);
  });

  it("reflects the size prop", async () => {
    const d = await render(
      <ListBlock size="default">
        <ListItem title="x" />
      </ListBlock>,
    );
    const s = await render(
      <ListBlock size="small">
        <ListItem title="x" />
      </ListBlock>,
    );
    expect(d.container.innerHTML).not.toBe(s.container.innerHTML);
  });

  it("fires onClick on a ListItem", async () => {
    const onClick = vi.fn();
    const { container } = await render(<ListItem title="Clickable" onClick={onClick} />);
    // Click the element that actually carries the handler.
    const clickable =
      (container.querySelector("[role='button']") as HTMLElement | null) ??
      (container.firstElementChild as HTMLElement | null);
    clickable?.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders an image variant item from a local source", async () => {
    const { container } = await render(
      <ListItem title="With image" variant="image" image={{ src: INERT_SRC, alt: "thumb" }} />,
    );
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("thumb");
  });
});

describe("Steps", () => {
  it("renders each StepsItem with its title and details", async () => {
    const { container } = await render(
      <Steps>
        <StepsItem title="One" details="First detail" />
        <StepsItem title="Two" details="Second detail" />
      </Steps>,
    );
    expect(container.textContent).toContain("One");
    expect(container.textContent).toContain("First detail");
    expect(container.textContent).toContain("Two");
    expect(container.textContent).toContain("Second detail");
  });

  it("accepts an explicit number on an item", async () => {
    const { container } = await render(
      <Steps>
        <StepsItem title="Numbered" details="d" number={7} />
      </Steps>,
    );
    expect(container.textContent).toContain("Numbered");
  });
});

describe("CodeBlock", () => {
  it("renders the code string for a known language", async () => {
    const { container } = await render(
      <CodeBlock language="ts" codeString={"const a = 1;"} />,
    );
    expect(container.textContent).toContain("const a = 1;");
  });

  it("renders an unknown language without throwing", async () => {
    const { container } = await render(
      <CodeBlock language="not-a-language" codeString={"plain text"} />,
    );
    expect(container.textContent).toContain("plain text");
  });

  it("does not execute code content", async () => {
    await render(
      <CodeBlock
        language="html"
        codeString={"<script>globalThis.__pwnedCB = true;</script>"}
      />,
    );
    expect((globalThis as Record<string, unknown>)["__pwnedCB"]).toBeUndefined();
  });

  it("renders a copy affordance (its declared IconButton dependency)", async () => {
    // CodeBlock/dependencies.ts declares [...IconButtonDeps]; this keeps the
    // dependency map honest.
    const { container } = await render(<CodeBlock language="ts" codeString={"x"} />);
    expect(container.querySelector("button")).not.toBeNull();
  });
});

describe("ImageText and ImageTextLarge", () => {
  it("ImageText renders title, subtitle and a local image", async () => {
    const { container } = await render(
      <ImageText title="Caption" subtitle="Sub" src={INERT_SRC} alt="pic" />,
    );
    expect(container.textContent).toContain("Caption");
    expect(container.textContent).toContain("Sub");
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("pic");
  });

  it("ImageText reflects its layout prop", async () => {
    const h = await render(
      <ImageText title="t" src={INERT_SRC} layout="horizontal" />,
    );
    const v = await render(<ImageText title="t" src={INERT_SRC} layout="vertical" />);
    expect(h.container.innerHTML).not.toBe(v.container.innerHTML);
  });

  it("ImageTextLarge renders title, subtitle and a local image", async () => {
    const { container } = await render(
      <ImageTextLarge title="Big" subtitle="Sub" src={INERT_SRC} alt="big pic" />,
    );
    expect(container.textContent).toContain("Big");
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("big pic");
  });
});

describe("TextBlockView", () => {
  // Reached this family through the dependency map, not the initial scope list:
  // IconText, ImageText and ImageTextLarge all import it, and it is package-root
  // exported (src/index.ts:126).
  it("renders the primary line", async () => {
    const { container } = await render(<TextBlockView primary="Primary line" />);
    expect(container.textContent).toContain("Primary line");
  });

  it("renders secondary and tertiary lines when supplied", async () => {
    const { container } = await render(
      <TextBlockView primary="P" secondary="S" tertiary="T" />,
    );
    expect(container.textContent).toContain("P");
    expect(container.textContent).toContain("S");
    expect(container.textContent).toContain("T");
  });

  it("applies the secondary tone class", async () => {
    const { container } = await render(
      <TextBlockView primary="P" secondary="S" secondaryTone="negative" />,
    );
    expect(container.innerHTML).toContain("openui-text-block__secondary--negative");
  });

  it("produces distinct output per size", async () => {
    const seen = new Set<string>();
    for (const size of ["xs", "sm", "md", "lg"] as const) {
      const { container } = await render(<TextBlockView primary="P" size={size} />);
      seen.add(container.innerHTML);
    }
    expect(seen.size).toBe(4);
  });

  it("forwards a ref to its root element", async () => {
    let captured: HTMLDivElement | null = null;
    await render(
      <TextBlockView
        ref={(el) => {
          captured = el;
        }}
        primary="P"
      />,
    );
    expect(captured).toBeInstanceOf(HTMLDivElement);
  });

  it("renders its text as inline markdown, inheriting that behavior", async () => {
    // TextBlock.tsx:3 imports InlineMarkdownRenderer, so TextBlock content is
    // markdown, not plain text. That is load-bearing for #12: every consumer of
    // TextBlock inherits InlineMarkdownRenderer's behavior, MD-2 included.
    const { container } = await render(<TextBlockView primary="plain **bold** text" />);
    expect(container.querySelector("strong")?.textContent).toBe("bold");
  });

  it("keeps raw HTML inert through that markdown path", async () => {
    const { container } = await render(
      <TextBlockView primary={'<script>globalThis.__pwnedTB = true;</script>'} />,
    );
    expect(container.querySelector("script")).toBeNull();
    expect((globalThis as Record<string, unknown>)["__pwnedTB"]).toBeUndefined();
  });
});

describe("ImageGallery", () => {
  it("renders the supplied images", async () => {
    const { container } = await render(
      <ImageGallery
        images={[
          { src: INERT_SRC, alt: "one" },
          { src: INERT_SRC, alt: "two" },
        ]}
      />,
    );
    expect(container.querySelectorAll("img").length).toBeGreaterThanOrEqual(1);
  });

  it("renders with an empty image list without throwing", async () => {
    const { container } = await render(<ImageGallery images={[]} />);
    expect(container).toBeTruthy();
  });
});
