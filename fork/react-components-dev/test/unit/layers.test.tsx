// Node seam: ThemeProvider's cssLayer changes only Button's generated classes, never its stable
// classes, and a provider without it leaves Button's markup unchanged.
import { Button, ThemeProvider } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const classesOf = (html: string) => html.match(/<button[^>]*class="([^"]*)"/)![1]!.split(" ");
const generated = (classes: string[]) => classes.filter((name) => /^go\d+$/.test(name));
const stable = (classes: string[]) => classes.filter((name) => name.startsWith("openui-"));

describe("ThemeProvider cssLayer", () => {
  it("leaves Button's classes unchanged without cssLayer", () => {
    const outside = classesOf(renderToString(<Button tone="destructive">Delete</Button>));
    const inside = classesOf(
      renderToString(
        <ThemeProvider>
          <Button tone="destructive">Delete</Button>
        </ThemeProvider>,
      ),
    );
    expect(inside).toEqual(outside);
  });

  it("gives Button other generated classes in a layer, with the same stable classes", () => {
    const unlayered = classesOf(renderToString(<Button>Save</Button>));
    const layered = classesOf(
      renderToString(
        <ThemeProvider cssLayer="openui">
          <Button>Save</Button>
        </ThemeProvider>,
      ),
    );
    expect(stable(layered)).toEqual(stable(unlayered));
    expect(generated(layered)).toHaveLength(generated(unlayered).length);
    for (const name of generated(layered)) expect(generated(unlayered)).not.toContain(name);
  });

  it("ignores a cssLayer that is not a layer name, with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const unlayered = classesOf(renderToString(<Button>Save</Button>));
    for (const cssLayer of ["open ui", "openui{", ""]) {
      const html = renderToString(
        <ThemeProvider cssLayer={cssLayer}>
          <Button>Save</Button>
        </ThemeProvider>,
      );
      expect(classesOf(html)).toEqual(unlayered);
    }
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('cssLayer "open ui"'));
    warn.mockRestore();
  });
});
