import { afterEach, describe, expect, it } from "vitest";
import { mapColor } from "../../components/Map/map-utils";
import { program, small } from "../helpers/cases";
import { addCss, box, byText, cleanup, distance, inkAt, one, renderProgram, rgba, settle, style } from "../helpers/render";

afterEach(cleanup);

const BADGE = ".openui-intelligent-badge";
const THEMES = ["light", "dark"] as const;

describe("Badge", () => {
  it("is a small pill that fits its text, not a bar across the column", async () => {
    const container = await renderProgram(small.badges);
    const badge = byText(container, "Plain").closest<HTMLElement>(BADGE)!;
    const { width, height } = box(badge);
    expect(height).toBeGreaterThanOrEqual(24);
    expect(height).toBeLessThanOrEqual(28);
    expect(width).toBeLessThan(100);
    expect(parseFloat(style(badge).borderTopLeftRadius)).toBeGreaterThanOrEqual(height / 2);
    expect(style(badge).fontSize).toBe("13px");
    expect(style(badge).fontWeight).toBe("560");
  });

  it("keeps info grey like neutral, and tints the other tones", async () => {
    const container = await renderProgram(small.badges);
    const fill = (text: string) => style(byText(container, text).closest(BADGE)!).backgroundColor;
    const ink = (text: string) => style(byText(container, text).closest(BADGE)!).color;
    expect(distance(fill("Note"), fill("Plain"))).toBeLessThan(12);
    expect(distance(ink("Note"), inkAt(container.querySelector(BADGE)!))).toBeLessThan(12);
    for (const tone of ["Good", "Careful", "Bad", "Purple", "Pink"]) {
      expect(distance(fill(tone), fill("Plain")), tone).toBeGreaterThan(12);
    }
  });

  it("centres in a Row and doesn't shrink", async () => {
    const container = await renderProgram(small.badgeInRow);
    const badge = one(container, BADGE);
    expect(style(badge).alignSelf).toBe("center");
    expect(style(badge).flexShrink).toBe("0");
  });
});

describe.each(THEMES)("Checkbox in %s", (theme) => {
  it("draws a box you can see, and fills it with ink when ticked", async () => {
    const container = await renderProgram(small.checkboxes, { theme });
    const boxes = [...container.querySelectorAll<HTMLElement>(".openui-check-box-item")];
    const [open, done] = [boxes[0]!, boxes[1]!];
    expect(box(open).width).toBe(17);
    expect(style(open).borderTopWidth).toBe("1px");
    expect(rgba(style(open).borderTopColor)[3]).toBeGreaterThan(90);
    expect(distance(style(done).backgroundColor, inkAt(done))).toBeLessThan(12);
  });

  it("takes its label's size from the text around it", async () => {
    const container = await renderProgram(small.checkboxes, { theme });
    const label = byText(container, "Open");
    expect(style(label).fontSize).toBe(style(one(container, ".openui-intelligent-card")).fontSize);
  });
});

describe("Checkbox's lineThrough", () => {
  it("strikes the label only once it's ticked", async () => {
    const container = await renderProgram(small.checkboxes);
    expect(style(byText(container, "Done")).textDecorationLine).toBe("line-through");
    expect(style(byText(container, "Not done")).textDecorationLine).toBe("none");
    expect(style(byText(container, "Open")).textDecorationLine).toBe("none");
  });
});

describe.each(THEMES)("RadioGroup list in %s", (theme) => {
  it("draws circles you can see, and marks the chosen one in ink, not blue", async () => {
    const container = await renderProgram(small.radios, { theme });
    const items = [...container.querySelectorAll<HTMLElement>(".openui-radio-item")];
    const chosen = items.find((item) => item.getAttribute("data-state") === "checked")!;
    const other = items.find((item) => item.getAttribute("data-state") !== "checked")!;
    expect(rgba(style(one(other, ".openui-radio-item-border")).stroke)[3]).toBeGreaterThan(90);
    expect(distance(style(one(chosen, ".openui-radio-item-inner")).fill, inkAt(chosen))).toBeLessThan(12);
    expect(distance(style(one(chosen, ".openui-radio-item-border")).stroke, inkAt(chosen))).toBeLessThan(12);
  });
});

describe("RadioGroup", () => {
  it("has no border, even under react-ui's stylesheet, which targets the same class", async () => {
    const container = await renderProgram(small.radios);
    addCss(".openui-radio-group { border: 1px solid; }");
    await settle(50);
    expect(style(one(container, ".openui-radio-group")).borderTopWidth).toBe("0px");
  });

  it("takes its labels' size from the text around them", async () => {
    const container = await renderProgram(small.radios);
    expect(style(byText(container, "First")).fontSize).toBe(style(one(container, ".openui-intelligent-card")).fontSize);
  });

  it("puts three cards in one row", async () => {
    const container = await renderProgram(small.radioCards);
    const tops = [...container.querySelectorAll(".openui-option-cards-card")].map((card) => Math.round(box(card).top));
    expect(tops).toHaveLength(3);
    expect(new Set(tops).size).toBe(1);
  });

  it("marks the chosen card in ink", async () => {
    const container = await renderProgram(small.radioCards);
    const card = one(container, '.openui-option-cards-card[aria-checked="true"]');
    expect(distance(style(card).borderTopColor, inkAt(card))).toBeLessThan(12);
    expect(style(card).boxShadow).not.toBe("none");
  });
});

describe.each(THEMES)("Code in %s", (theme) => {
  it("is a tinted block on the page's theme, not a fixed dark one", async () => {
    const container = await renderProgram(small.code, { theme });
    const block = one(container, ".openui-intelligent-code");
    // The surface is a soft tint of ink, so it's nearly clear in either theme.
    expect(rgba(style(block).backgroundColor)[3]).toBeLessThan(60);
    const [red] = rgba(style(one(block, "code")).color);
    if (theme === "dark") expect(red).toBeGreaterThan(200);
    else expect(red).toBeLessThan(60);
  });
});

describe("Code", () => {
  it("shows the language, or says code when there isn't one", async () => {
    const container = await renderProgram(small.code);
    const heads = [...container.querySelectorAll(".openui-intelligent-code-head span")].map((el) => el.textContent);
    expect(heads).toContain("python");
    expect(heads).toContain("code");
  });

  it("always shows its Copy button, without needing a hover", async () => {
    const container = await renderProgram(small.code);
    const copy = one(container, ".openui-intelligent-code-copy");
    expect(style(copy).opacity).toBe("1");
    expect(style(copy).visibility).toBe("visible");
    expect(copy.textContent).toContain("Copy");
  });
});

describe("Button", () => {
  it("keeps the page's font and animates only its colours", async () => {
    const container = await renderProgram(small.buttons);
    const button = byText(container, "Solid").closest("button")!;
    expect(style(button).fontFamily).toContain("Inter");
    expect(style(button).transitionProperty).not.toBe("all");
  });

  it("keeps the fill of a disabled outline button", async () => {
    const container = await renderProgram(small.buttons);
    const button = byText(container, "Off").closest("button")!;
    expect(button.disabled).toBe(true);
    expect(rgba(style(button).backgroundColor)[3]).toBeGreaterThan(0);
  });
});

describe("dark mode with no ThemeProvider", () => {
  it("still goes dark from data-theme alone", async () => {
    const container = await renderProgram(small.card, { bare: true, theme: "dark" });
    expect(style(byText(container, "Heading")).color).toBe("rgb(236, 236, 236)");
    expect(style(one(container, ".openui-intelligent-card")).backgroundColor).toBe("rgb(23, 23, 23)");
  });

  it("lets a host's own token win when the theme is set on the page", async () => {
    addCss(":root { --openui-foreground: #123456; }");
    const container = await renderProgram(small.card, { bare: true, theme: "dark", themeOnRoot: true });
    expect(style(one(container, ".openui-intelligent-card")).backgroundColor).toBe("rgb(18, 52, 86)");
  });
});

describe("List's timeline", () => {
  it("draws its line down every row but the last", async () => {
    const container = await renderProgram(small.timeline);
    const rows = [...container.querySelectorAll(".openui-intelligent-list-row")];
    expect(rows).toHaveLength(3);
    expect(style(rows[0]!, "::after").content).not.toBe("none");
    expect(style(rows[2]!, "::after").content).toBe("none");
  });
});

describe("Map", () => {
  it("turns any theme colour into one MapLibre can parse", () => {
    expect(mapColor("oklch(0.097 0 0 / 1)")).toMatch(/^rgba?\(/);
    expect(mapColor("#123456")).toMatch(/^rgba?\(/);
  });

  it("keeps the vector map under an oklch theme, with pins", async () => {
    const container = await renderProgram(program("map"));
    await settle(1500);
    expect(container.querySelectorAll(".maplibregl-marker").length).toBeGreaterThan(0);
    expect(container.textContent).not.toContain("temporarily unavailable");
    expect(container.textContent).not.toContain("Esri");
  });
});

describe("known problems", () => {
  // These pass while the problem exists and fail once it's fixed, which is the reminder to delete them.
  it.fails("sets its own font on a page with none", async () => {
    document.body.style.fontFamily = "serif";
    const container = await renderProgram(small.card, { bare: true });
    expect(style(byText(container, "Body text")).fontFamily).toContain("Inter");
  });

  it.fails("keeps a Card's contents inside it on a page with no CSS reset", async () => {
    const container = await renderProgram(`root = Card([Card([Text("Inner")])])`, { bare: true });
    const [outer, inner] = [...container.querySelectorAll(".openui-intelligent-card")];
    expect(box(inner!).right).toBeLessThanOrEqual(box(outer!).right);
  });
});

describe("Carousel arrows", () => {
  for (const theme of THEMES) {
    it(`sit inside the carousel, round and frosted, with no square backing (${theme})`, async () => {
      const container = await renderProgram(program("primitives"), { theme });
      const carousel = one(container, ".openui-intelligent-carousel");
      const holder = one(carousel, ".openui-carousel-button-right");
      const arrow = one(holder, "button");
      const [outer, inner] = [box(carousel), box(holder)];
      // Wholly inside, so a chat bubble that hides overflow can't cut it.
      expect(inner.left).toBeGreaterThanOrEqual(outer.left);
      expect(inner.right).toBeLessThanOrEqual(outer.right);
      expect(rgba(style(holder).backgroundColor)[3]).toBe(0);
      expect(style(arrow).borderRadius).toBe("9999px");
      expect(box(arrow).width).toBe(34);
      // Frosted: a see-through fill of the page colour, not none and not solid.
      const [, , , alpha] = rgba(style(arrow).backgroundColor);
      expect(alpha).toBeGreaterThan(100);
      expect(alpha).toBeLessThan(255);
      expect(style(arrow).backdropFilter).toContain("blur");
    });
  }
});

describe("List labels", () => {
  const timeline = `root = List([ListItem("Kennin-ji", "Sit beside the rock garden", "Early afternoon"), ListItem("Gion", "Walk the lanes", "4pm"), ListItem("Dinner", "Pontocho", "Evening and late night")], "bullet", true)`;

  for (const theme of THEMES) {
    it(`wrap inside their lane instead of running into the timeline's dot (${theme})`, async () => {
      const container = await renderProgram(timeline, { theme });
      const labels = [...container.querySelectorAll<HTMLElement>(".openui-intelligent-list-marker--kind-text")];
      expect(labels).toHaveLength(3);
      for (const label of labels) {
        // Nothing spills out of the lane, so the text stays clear of the dot just past it.
        expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth);
        const range = document.createRange();
        range.selectNodeContents(label);
        expect(range.getBoundingClientRect().right).toBeLessThanOrEqual(box(label).right + 0.5);
      }
      // A short label still sits on one line, level with its title.
      const short = labels[1]!;
      const title = short.parentElement!.querySelector(".openui-intelligent-list-title")!;
      expect(Math.abs(box(short).top - box(title).top)).toBeLessThan(4);
      expect(box(short).height).toBeLessThan(26);
    });
  }
});

describe("form fields share one size and look", () => {
  // Input, Select and DatePicker sit side by side in a form, so one taller, rounder or darker
  // field stands out. Every field-like control is compared against the Input.
  const fields = `root = Form([Row([Input("", "Name"), Select("", ["10:00", "11:00"], "Time"), DatePicker("", "Date")])])`;
  const look = (element: Element) => {
    const s = style(element);
    return {
      height: Math.round(box(element).height),
      paddingTop: s.paddingTop,
      paddingLeft: s.paddingLeft,
      radius: s.borderTopLeftRadius,
      border: `${s.borderTopWidth} ${s.borderTopColor}`,
      fill: s.backgroundColor,
      shadow: s.boxShadow,
      font: `${s.fontSize}/${s.lineHeight}`,
    };
  };
  for (const theme of THEMES) {
    it(`Input, Select and DatePicker match (${theme})`, async () => {
      const container = await renderProgram(fields, { theme });
      const input = one(container, "input.openui-input");
      const select = one(container, ".openui-select-trigger");
      const date = one(container, ".openui-date-picker-trigger");
      expect(look(select)).toEqual(look(input));
      expect(look(date)).toEqual(look(input));
      // Empty, both arrows are muted like their placeholder; filled, both are ink.
      const arrow = (element: Element) => style(one(element, "svg")).color;
      expect(arrow(date)).toBe(arrow(select));
    });

    it(`filled Select and DatePicker match too (${theme})`, async () => {
      const container = await renderProgram(
        `root = Form([Row([Input("Ada", "Name"), Select("10:00", ["10:00", "11:00"], "Time"), DatePicker("2026-03-14", "Date")])])`,
        { theme },
      );
      const input = one(container, "input.openui-input");
      const select = one(container, ".openui-select-trigger");
      const date = one(container, ".openui-date-picker-trigger");
      expect(look(date)).toEqual(look(input));
      expect(look(select)).toEqual(look(input));
      expect(style(one(date, "svg")).color).toBe(style(one(select, "svg")).color);
    });
  }

  it("TextArea shares their corners, border, fill and padding", async () => {
    const container = await renderProgram(`root = Form([Input("", "Name"), TextArea("", "Notes")])`);
    const { height: _input, ...input } = look(one(container, "input.openui-input"));
    const { height: _area, ...area } = look(one(container, "textarea"));
    expect(area).toEqual(input);
  });
});

describe("on a coloured card", () => {
  // A tile or card with its own colour switches its text to suit that colour. Whatever sits on that
  // text colour (a selected tick, a solid button's label) has to switch with it, in either theme.
  const beige = '"#e0d4b9"';
  for (const theme of THEMES) {
    it(`a selected Pressable's tick stays visible (${theme})`, async () => {
      const container = await renderProgram(`root = Pressable([Title("Kale", "md"), Text("12-inch pot")], null, true, 4, ${beige})`, { theme });
      const tile = one(container, ".openui-intelligent-pressable");
      const circle = style(tile, "::before").backgroundColor;
      const tick = style(tile, "::before").backgroundImage;
      // The circle is dark on beige, so the tick drawn on it is white.
      expect(distance(circle, "#0d0d0d")).toBeLessThan(30);
      expect(tick).toContain("white");
    });

    it(`a solid Button's label stays readable (${theme})`, async () => {
      const container = await renderProgram(`root = Box([Button("Pick")], "col", 0, 4, ${beige})`, { theme });
      const button = one(container, ".openui-intelligent-button");
      const fill = rgba(style(button).backgroundColor);
      const label = rgba(style(button).color);
      // Far apart in brightness: a dark label on a dark button is the bug.
      const brightness = (c: number[]) => (c[0]! * 299 + c[1]! * 587 + c[2]! * 114) / 1000;
      expect(Math.abs(brightness(fill) - brightness(label))).toBeGreaterThan(120);
    });
  }
});
