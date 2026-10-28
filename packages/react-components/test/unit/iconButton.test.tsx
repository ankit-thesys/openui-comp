// Node seam: IconButton's stable classes in server-rendered markup.
import { IconButton } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

const classesOf = (html: string, tag = "button") =>
  html.match(new RegExp(`<${tag}[^>]*class="([^"]*)"`))![1]!.split(" ");

const icon = <svg data-icon="" />;

describe("IconButton stable classes", () => {
  it("emits the root and the modifier of every axis, defaults included", () => {
    const classes = classesOf(renderToString(<IconButton icon={icon} aria-label="Add" />));
    expect(classes).toEqual(
      expect.arrayContaining([
        "openui-icon-button",
        "openui-icon-button--variant-primary",
        "openui-icon-button--size-medium",
        "openui-icon-button--shape-square",
        "openui-icon-button--tone-default",
      ]),
    );
  });

  it("emits the modifiers of the props passed, including tone", () => {
    const classes = classesOf(
      renderToString(
        <IconButton
          icon={icon}
          aria-label="Delete"
          variant="tertiary"
          size="3-extra-small"
          shape="circle"
          tone="destructive"
        />,
      ),
    );
    expect(classes).toEqual(
      expect.arrayContaining([
        "openui-icon-button--variant-tertiary",
        "openui-icon-button--size-3-extra-small",
        "openui-icon-button--shape-circle",
        "openui-icon-button--tone-destructive",
      ]),
    );
    expect(classes).not.toContain("openui-icon-button--tone-default");
    expect(classes).not.toContain("openui-icon-button--shape-square");
  });

  it("drops the pre-flat class names", () => {
    const classes = classesOf(
      renderToString(<IconButton icon={icon} aria-label="Add" size="small" />),
    );
    for (const old of [
      "openui-icon-button-root",
      "openui-icon-button-primary",
      "openui-icon-button-small",
      "openui-icon-button-square",
    ])
      expect(classes).not.toContain(old);
  });

  it("keeps the consumer's className and wraps the icon in the icon part", () => {
    const html = renderToString(<IconButton icon={icon} aria-label="Add" className="app-add" />);
    expect(classesOf(html)).toContain("app-add");
    expect(html).toMatch(/<span class="[^"]*\bopenui-icon-button-icon\b[^"]*"><svg data-icon/);
  });

  it("renders no icon part without an icon", () => {
    expect(renderToString(<IconButton icon={null} aria-label="Add" />)).not.toContain(
      "openui-icon-button-icon",
    );
  });

  it("with asChild, puts the classes and the icon part on the child element", () => {
    const html = renderToString(
      <IconButton asChild icon={icon} size="3-extra-small" variant="secondary">
        <div role="button" aria-label="Open" />
      </IconButton>,
    );
    expect(html).not.toContain("<button");
    expect(classesOf(html, "div")).toEqual(
      expect.arrayContaining([
        "openui-icon-button",
        "openui-icon-button--variant-secondary",
        "openui-icon-button--size-3-extra-small",
      ]),
    );
    expect(html).toMatch(/<div[^>]*>.*<span class="[^"]*\bopenui-icon-button-icon\b/);
  });
});
