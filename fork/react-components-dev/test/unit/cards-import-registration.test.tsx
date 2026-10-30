// #135: the built public entry supplies Card and CardHeader CSS before the first SSR render.
import { Card, CardHeader, getComponentStyles } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

it("imports card styles before rendering and leaves the sheet unchanged by rendering", () => {
  const before = getComponentStyles();
  const html = renderToString(
    <>
      <Card variant="clear" width="standard" />
      <Card variant="sunk" width="full" />
      <Card>
        <CardHeader icon={<span>Icon</span>} title="Title" subtitle="Subtitle" />
      </Card>
    </>,
  );
  const generated = new Set(html.match(/\bgo\d+\b/g));
  expect(generated.size).toBeGreaterThan(0);
  for (const name of generated) expect(before).toMatch(new RegExp(`\\.${name}(?![0-9])`));
  expect(getComponentStyles()).toBe(before);
});
