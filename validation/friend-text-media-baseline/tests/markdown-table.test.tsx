/**
 * Table x markdown: the dependency #31 asks to be covered "together".
 *
 * The coupling is structural, not incidental: MarkDownRenderer.tsx:76-82 maps
 * `table/thead/th/tbody/tr/td` onto the Table primitives, and
 * MarkDownRenderer/dependencies.ts declares `[...TableDeps]`. So Table's public
 * behavior inside markdown is a different surface from Table's behavior when a
 * consumer composes it by hand, and this file covers both.
 *
 * Each finding below is paired with a CONTROL GROUP -- the same assertion against
 * a hand-composed Table, or against the renderer with the plugin supplied -- so
 * "the markdown mapping causes this" is demonstrated rather than assumed. A
 * control group that shares an omission with the case under test proves nothing,
 * which is a lesson taken from the CA-2 withdrawal in the sibling #23 work.
 */
import { describe, expect, it } from "vitest";
import remarkGfm from "remark-gfm";
import {
  IconText,
  InlineHeader,
  InlineMarkdownRenderer,
  MarkDownRenderer,
  TextBlockView,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../packages/react-ui/src/index";
import { render } from "../setup/render";

const GFM_TABLE = "| a | b |\n| --- | --- |\n| 1 | 2 |";

describe("MD-1: MarkDownRenderer maps Table but ships no GFM plugin", () => {
  it("renders a GFM table as a paragraph of raw pipes by default", async () => {
    const { container } = await render(<MarkDownRenderer textMarkdown={GFM_TABLE} />);
    expect(container.querySelectorAll("table")).toHaveLength(0);
    // The pipes survive as literal text in a paragraph.
    const p = container.querySelector("p");
    expect(p).not.toBeNull();
    expect(p?.textContent).toContain("| a | b |");
  });

  it("CONTROL: the same input renders a real Table once remarkGfm is supplied", async () => {
    // Proves the mapping itself is correct and the gap is the missing default
    // plugin -- not a broken override.
    const { container } = await render(
      <MarkDownRenderer textMarkdown={GFM_TABLE} options={{ remarkPlugins: [remarkGfm] }} />,
    );
    expect(container.querySelectorAll("table")).toHaveLength(1);
    expect(container.querySelector("table")?.className).toContain("openui-table");
    expect(container.querySelector(".openui-table-container")).not.toBeNull();
  });

  it("so the six table overrides are unreachable through the default public API", async () => {
    // Recorded as the consumer-visible consequence: a consumer who passes
    // markdown containing a table and supplies no options gets text, not a table.
    const { container } = await render(<MarkDownRenderer textMarkdown={GFM_TABLE} />);
    for (const selector of [
      ".openui-table",
      ".openui-table-header",
      ".openui-table-body",
      ".openui-table-row",
      ".openui-table-head",
      ".openui-table-cell",
    ]) {
      expect(container.querySelector(selector)).toBeNull();
    }
  });
});

describe("MD-2: InlineMarkdownRenderer emits block content inside a <span>", () => {
  it("flattens paragraphs, headings and lists as documented", async () => {
    const { container } = await render(
      <InlineMarkdownRenderer content={"# Heading\n\n- one\n- two\n\npara **bold**"} />,
    );
    for (const tag of ["h1", "h2", "ul", "ol", "li", "p"]) {
      expect(container.querySelector(tag)).toBeNull();
    }
    // Inline emphasis survives, which is the point of the component.
    expect(container.querySelector("strong")?.textContent).toBe("bold");
  });

  it("but does NOT flatten tables, so a <table> lands inside the <span>", async () => {
    // InlineMarkdownRenderer's own doc comment: "Block-level elements
    // (paragraphs, headings, lists) are flattened so the output stays inline."
    // It overrides p/h1-h6/ul/ol/li but not table -- and it DOES enable
    // remarkGfm, so tables genuinely occur.
    const { container } = await render(<InlineMarkdownRenderer content={GFM_TABLE} />);

    const span = container.querySelector("span.openui-inline-markdown-renderer");
    expect(span).not.toBeNull();

    const table = container.querySelector("table");
    expect(table).not.toBeNull();

    // A <table> (and the two wrapping <div>s) nested inside a <span> violates the
    // HTML content model: <span> is phrasing content, <div>/<table> are flow
    // content. Recorded as observed baseline behavior, not repaired here.
    expect(span?.contains(table!)).toBe(true);
    expect(table?.closest("div.openui-table-container")).not.toBeNull();
    expect(table?.closest("span.openui-inline-markdown-renderer")).not.toBeNull();
  });

  it("CONTROL: a table-free inline input stays genuinely inline", async () => {
    // Shows MD-2 is specific to the unflattened table path, not a general
    // property of the inline renderer.
    const { container } = await render(
      <InlineMarkdownRenderer content={"just **bold** and `code` and [a link](https://example.com)"} />,
    );
    expect(container.querySelector("table")).toBeNull();
    expect(container.querySelector("div.openui-table-container")).toBeNull();
  });
});

describe("MD-2 blast radius: families that inherit the inline renderer", () => {
  // Found via the dependency map, then VERIFIED rather than inferred. TextBlock
  // and InlineHeader both render their text through InlineMarkdownRenderer, so
  // anything that renders through them inherits MD-2. That makes MD-2 reachable
  // from ordinary "just some text" props, which is what raises its severity.
  it("TextBlockView produces a table from table-shaped text", async () => {
    const { container } = await render(<TextBlockView primary={GFM_TABLE} />);
    expect(container.querySelectorAll("table")).toHaveLength(1);
    expect(container.querySelector("span table")).not.toBeNull();
  });

  it("InlineHeader produces a table from a table-shaped heading", async () => {
    const { container } = await render(<InlineHeader heading={GFM_TABLE} description="d" />);
    expect(container.querySelectorAll("table")).toHaveLength(1);
  });

  it("IconText produces a table from a table-shaped title", async () => {
    const { container } = await render(
      <IconText icon={{ name: "rocket" }} title={GFM_TABLE} />,
    );
    expect(container.querySelectorAll("table")).toHaveLength(1);
  });

  it("CONTROL: ordinary text through the same path produces no table", async () => {
    // Confirms the trigger is the table-shaped content, not these components.
    const { container } = await render(<TextBlockView primary="ordinary text" />);
    expect(container.querySelector("table")).toBeNull();
  });
});

describe("MD-3: react-markdown's `node` prop leaks into the DOM", () => {
  it("puts node=\"[object Object]\" on every markdown-rendered table element", async () => {
    const { container } = await render(
      <MarkDownRenderer textMarkdown={GFM_TABLE} options={{ remarkPlugins: [remarkGfm] }} />,
    );
    const leaked = container.querySelectorAll("[node]");
    // table, thead, tr, th, th, tbody, tr, td, td on this fixture.
    expect(leaked.length).toBeGreaterThan(0);
    expect(container.querySelector("table")?.getAttribute("node")).toBe("[object Object]");

    // Every leaking element is part of the table subtree.
    for (const el of Array.from(leaked) as Element[]) {
      expect(["TABLE", "THEAD", "TBODY", "TR", "TH", "TD"]).toContain(el.tagName);
    }
  });

  it("CONTROL: a hand-composed Table has no `node` attribute at all", async () => {
    // Isolates the cause to the markdown component mapping rather than to the
    // Table primitives, which are shared by both paths.
    const { container } = await render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>a</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>1</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(container.querySelectorAll("[node]")).toHaveLength(0);
  });

  it("leaks silently: React logs no warning for the unknown attribute", async () => {
    const seen: string[] = [];
    const origError = console.error;
    const origWarn = console.warn;
    console.error = (...a: unknown[]) => void seen.push(String(a[0]));
    console.warn = (...a: unknown[]) => void seen.push(String(a[0]));
    try {
      await render(
        <MarkDownRenderer textMarkdown={GFM_TABLE} options={{ remarkPlugins: [remarkGfm] }} />,
      );
    } finally {
      console.error = origError;
      console.warn = origWarn;
    }
    // Recorded because it explains how this survived: nothing surfaces it at
    // runtime, so only inspecting the DOM reveals it.
    expect(seen.filter((m) => /node/i.test(m))).toHaveLength(0);
  });
});

describe("MD-4: the markdown alignment adapter never fires", () => {
  const ALIGNED = "| l | c | r |\n| :--- | :---: | ---: |\n| 1 | 2 | 3 |";

  it("produces NO openui alignment class from a markdown delimiter row", async () => {
    // MarkdownTableHead/MarkdownTableCell (MarkDownRenderer.tsx:25-31) exist only
    // to translate a markdown `align` prop into openui's alignment classes via
    // toTableAlignment. react-markdown 10.1.0 does not pass `align`: it emits the
    // alignment as an inline style. So the adapter receives align === undefined,
    // toTableAlignment returns undefined, and no class is ever applied.
    //
    // This reads like a silent casualty of a react-markdown major upgrade --
    // `align` was how older versions passed it. Recorded, not repaired.
    const { container } = await render(
      <MarkDownRenderer textMarkdown={ALIGNED} options={{ remarkPlugins: [remarkGfm] }} />,
    );
    const html = container.innerHTML;
    expect(html).not.toContain("openui-table-align-left");
    expect(html).not.toContain("openui-table-align-center");
    expect(html).not.toContain("openui-table-align-right");
  });

  it("instead leaks a raw inline text-align style onto the cells", async () => {
    // The alignment is still visually correct, which is why this went unnoticed,
    // but it bypasses openui's class-based styling system entirely.
    const { container } = await render(
      <MarkDownRenderer textMarkdown={ALIGNED} options={{ remarkPlugins: [remarkGfm] }} />,
    );
    const heads = Array.from(container.querySelectorAll("th.openui-table-head"));
    expect(heads.map((h) => (h as HTMLElement).style.textAlign)).toEqual([
      "left",
      "center",
      "right",
    ]);
    const cells = Array.from(container.querySelectorAll("td.openui-table-cell"));
    expect(cells.map((c) => (c as HTMLElement).style.textAlign)).toEqual([
      "left",
      "center",
      "right",
    ]);
  });

  it("CONTROL: the align prop DOES work when passed directly", async () => {
    // Isolates the cause. The adapter and toTableAlignment are not broken; they
    // are simply never fed an `align` prop by this version of react-markdown.
    const { container } = await render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead align="left">l</TableHead>
            <TableHead align="center">c</TableHead>
            <TableHead align="right">r</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell align="left">1</TableCell>
            <TableCell align="center">2</TableCell>
            <TableCell align="right">3</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const html = container.innerHTML;
    expect(html).toContain("openui-table-align-left");
    expect(html).toContain("openui-table-align-center");
    expect(html).toContain("openui-table-align-right");
  });

  it("records the head/cell asymmetry: TableHead aligns an inner div, TableCell the <td>", async () => {
    // Composed by hand so the assertion is about the primitives' public contract
    // rather than about markdown.
    const { container } = await render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead align="center">h</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell align="center">c</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    // th: the class lands on a descendant, not the cell itself.
    const th = container.querySelector("th.openui-table-head");
    expect(th?.classList.contains("openui-table-align-center")).toBe(false);
    expect(th?.querySelector(".openui-table-head-content.openui-table-align-center")).not.toBeNull();

    // td: the class lands directly on the cell.
    const td = container.querySelector("td.openui-table-cell");
    expect(td?.classList.contains("openui-table-align-center")).toBe(true);
  });
});
