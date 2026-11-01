import { SliderBlock, getComponentStyles } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

it("exposes SliderBlock input and error parts through public Input states", () => {
  const before = getComponentStyles();
  const html = renderToString(
    <SliderBlock label="Budget" variant="continuous" min={0} max={100} defaultValue={[-1, 75]} />,
  );
  expect(html).toContain("openui-slider-block-input");
  expect(html).toContain('data-invalid="true"');
  expect(html).toMatch(
    /<input[^>]*aria-invalid="true"[^>]*openui-slider-block-input|<input[^>]*openui-slider-block-input[^>]*aria-invalid="true"/,
  );
  expect(html).not.toContain("is-range");
  const generated = [...html.matchAll(/class="([^"]*)"/g)]
    .flatMap((match) => match[1]!.split(" "))
    .filter((name) => /^go\d+$/.test(name));
  expect(generated.length).toBeGreaterThan(0);
  for (const name of generated) expect(before).toMatch(new RegExp(`\\.${name}(?![0-9])`));
  expect(getComponentStyles()).toBe(before);
});

it("records SliderBlock's requested variant while streaming suppresses its discrete controls", () => {
  const html = renderToString(
    <SliderBlock label="Budget" variant="discrete" min={0} max={100} step={25} isStreaming />,
  );
  expect(html).toMatch(/class="[^"]*openui-slider-block openui-slider-block--variant-discrete/);
  expect(html).toContain("openui-slider--variant-continuous");
  expect(html).not.toContain("openui-slider-block-controls");
});
