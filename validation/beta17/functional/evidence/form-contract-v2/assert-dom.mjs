import assert from 'node:assert/strict';
export async function assertManifestDom(page, cell) {
  for (const [name, probe] of Object.entries(cell.expectedDom)) {
    assert.equal(await page.locator(probe.selector).count(), probe.count,
      `${name}: ${probe.selector} must match the frozen manifest`);
  }
  const text = await page.locator(cell.renderedRoot).textContent();
  for (const required of cell.requiredText) assert(text.includes(required), `Missing rendered text: ${required}`);
}
