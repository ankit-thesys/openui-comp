import { extractCss } from "goober";

// Component rules register once per process: when a component first renders, or when an
// unconverted component's module evaluates. Goober's extractCss empties its server sheet, so only
// the first caller would see them; keep what has been drained so every server render can inline
// the full sheet.
let collected = "";

/**
 * Returns the CSS for every OpenUI component style registered so far.
 *
 * On the server, render first, then inline the result as `<style id="_goober">` in each response.
 * Unlike Goober's `extractCss`, repeated calls return the full stylesheet instead of only rules
 * added since the previous call. In the browser it returns the current contents of the `_goober`
 * style element.
 *
 * Never returns an empty string: the browser runtime writes into the first text node of the
 * `_goober` element it adopts, and an empty element has none.
 */
export function getComponentStyles(): string {
  if (typeof document !== "undefined") {
    return document.getElementById("_goober")?.textContent || " ";
  }
  const added = extractCss();
  if (added && !collected.includes(added)) collected += added;
  return collected || " ";
}
