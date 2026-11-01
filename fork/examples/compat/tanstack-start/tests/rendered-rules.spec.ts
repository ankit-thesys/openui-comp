// PROTOTYPE: the server HTML carries only the rules of the components it rendered, and the page is
// styled before any script runs.
import { expect, test } from "@playwright/test";
import { renderedRules } from "../../shared/ssr";

for (const path of ["/"]) {
  test(`${path}: server sends only rendered rules`, async ({ page, browser }) => {
    const result = await renderedRules(page, browser, expect, { path, scripted: false });
    console.log(`rendered-rules ${path} ${JSON.stringify(result)}`);
  });
}
