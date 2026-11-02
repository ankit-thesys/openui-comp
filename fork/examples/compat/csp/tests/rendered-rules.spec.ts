// The server HTML carries every rendered class's rule in React's hoisted tags (#178), with no
// <style> inside <svg>; where content is not behind Suspense the page is styled before scripts run.
import { expect, test } from "@playwright/test";
import { renderedRules } from "../../shared/ssr";

const pages: Array<{ path: string; scripted: boolean }> = [
  { path: "/?theme=light", scripted: true },
];

for (const { path, scripted } of pages) {
  test(`${path}: the server sends the rendered rules`, async ({ page, browser }) => {
    const result = await renderedRules(page, browser, expect, { path, scripted });
    console.log(`rendered-rules ${path} ${JSON.stringify(result)}`);
  });
}
