// Node seam: Button's stable classes in server-rendered markup.
import { Button } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

const classesOf = (html: string, tag = "button") =>
  html.match(new RegExp(`<${tag}[^>]*class="([^"]*)"`))![1]!.split(" ");

describe("Button stable classes", () => {
  it("emits the modifier of every axis, defaults included", () => {
    const classes = classesOf(renderToString(<Button>Save</Button>));
    expect(classes).toEqual(
      expect.arrayContaining([
        "openui-button",
        "openui-button--variant-primary",
        "openui-button--size-medium",
        "openui-button--tone-default",
      ]),
    );
  });

  it("emits the modifiers of the props passed", () => {
    const classes = classesOf(
      renderToString(
        <Button variant="tertiary" size="extra-small" tone="destructive">
          Delete
        </Button>,
      ),
    );
    expect(classes).toEqual(
      expect.arrayContaining([
        "openui-button--variant-tertiary",
        "openui-button--size-extra-small",
        "openui-button--tone-destructive",
      ]),
    );
    expect(classes).not.toContain("openui-button--tone-default");
  });

  it("keeps the consumer's className", () => {
    expect(classesOf(renderToString(<Button className="app-save">Save</Button>))).toContain(
      "app-save",
    );
  });

  it("wraps each icon in the icon part and renders no part without one", () => {
    const withIcons = renderToString(
      <Button iconLeft={<svg data-icon="left" />} iconRight={<svg data-icon="right" />}>
        Save
      </Button>,
    );
    expect(
      withIcons.match(/<span class="[^"]*\bopenui-button-icon\b[^"]*"><svg data-icon/g),
    ).toHaveLength(2);
    expect(renderToString(<Button>Save</Button>)).not.toContain("openui-button-icon");
    expect(renderToString(<Button iconLeft="">Save</Button>)).not.toContain("openui-button-icon");
  });
});
