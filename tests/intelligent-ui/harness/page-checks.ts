import type { Check } from "./checks";

/**
 * The checks that read the rendered page (#201): what a reader would see as broken, whatever the
 * program. They look at the page's boxes, text and media, never at the library's own class names;
 * the only class named is KaTeX's, the formula renderer's.
 *
 * The page code runs in the browser, so each check passes its own function to `page.evaluate`.
 */

/** Overlaps and overhangs this small are rounding and focus rings, not layout bugs. */
const TOLERANCE = 2;
/** At most this many problems per check and program, so one bad layout doesn't bury the report. */
const LIMIT = 8;

export const pageChecks: Check[] = [
  {
    name: "no horizontal scroll",
    run: async ({ page }) => {
      const { scroll, viewport } = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
      }));
      return scroll > viewport
        ? [`the page scrolls sideways: ${scroll}px of content in a ${viewport}px window`]
        : [];
    },
  },
  {
    // What caught the pie and donut overflow: a drawing taller than the box it was given.
    name: "boxes stay inside their container",
    run: ({ page }) =>
      page.evaluate(
        ({ tolerance, limit }) => {
          const host = document.getElementById("host")!;
          const problems: string[] = [];
          const reported = new Set<Element>();
          const name = (element: Element) => {
            const text = (element.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
            return `<${element.tagName.toLowerCase()}>${text ? ` "${text}"` : ""}`;
          };
          // Whether a box is something a reader sees the edges of.
          const drawn = (style: CSSStyleDeclaration) =>
            style.backgroundColor !== "rgba(0, 0, 0, 0)" ||
            style.backgroundImage !== "none" ||
            style.boxShadow !== "none" ||
            ["Top", "Right", "Bottom", "Left"].some(
              (side) =>
                parseFloat(style.getPropertyValue(`border-${side.toLowerCase()}-width`)) > 0,
            );
          /**
           * The box an element is seen against: the nearest ancestor that draws an edge, or the page.
           * Running past a bare layout wrapper shows nothing. An ancestor that clips hides the
           * overhang, so there's nothing to report (`null`).
           */
          const frame = (element: Element): Element | null => {
            for (let parent = element.parentElement; parent; parent = parent.parentElement) {
              if (parent === host) return host;
              const style = getComputedStyle(parent);
              // `display: contents` draws no box, and an inline box is a line of text, not a container.
              if (style.display === "contents" || style.display === "inline") continue;
              if (style.overflowX !== "visible" || style.overflowY !== "visible") return null;
              if (drawn(style)) return parent;
            }
            return null;
          };
          for (const element of host.querySelectorAll("*")) {
            if (problems.length >= limit) break;
            // SVG drawings, KaTeX formulas and iframes lay out their own insides.
            if (element.closest("svg, iframe, math, .katex") && element.tagName !== "svg") {
              continue;
            }
            // Its container already sticks out, which says the same thing.
            if (element.parentElement && reported.has(element.parentElement)) {
              reported.add(element);
              continue;
            }
            const style = getComputedStyle(element);
            if (style.display === "contents" || style.display === "none") continue;
            if (style.position === "absolute" || style.position === "fixed") continue;
            // A transform moves the drawing, not the layout: a flip, a lift on hover.
            if (style.transform !== "none") continue;
            const box = element.getBoundingClientRect();
            if (box.width === 0 || box.height === 0) continue;
            const outerElement = frame(element);
            if (!outerElement) continue;
            const outer = outerElement.getBoundingClientRect();
            const over = [
              box.left < outer.left - tolerance && `${Math.round(outer.left - box.left)}px left`,
              box.right > outer.right + tolerance &&
                `${Math.round(box.right - outer.right)}px right`,
              box.top < outer.top - tolerance && `${Math.round(outer.top - box.top)}px above`,
              box.bottom > outer.bottom + tolerance &&
                `${Math.round(box.bottom - outer.bottom)}px below`,
            ].filter(Boolean);
            if (over.length > 0) {
              reported.add(element);
              problems.push(
                `${name(element)} sticks out of ${name(outerElement)} by ${over.join(", ")}`,
              );
            }
          }
          return problems;
        },
        { tolerance: TOLERANCE, limit: LIMIT },
      ),
  },
  {
    name: "siblings don't overlap",
    run: ({ page }) =>
      page.evaluate(
        ({ tolerance, limit }) => {
          const host = document.getElementById("host")!;
          const problems: string[] = [];
          const name = (element: Element) => {
            const text = (element.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
            return `<${element.tagName.toLowerCase()}>${text ? ` "${text}"` : ""}`;
          };
          // A box's laid-out children, looking through `display: contents` wrappers.
          const children = (element: Element): Element[] =>
            [...element.children].flatMap((child) =>
              getComputedStyle(child).display === "contents" ? children(child) : [child],
            );
          const inFlow = (element: Element) => {
            const style = getComputedStyle(element);
            const box = element.getBoundingClientRect();
            return (
              style.display !== "none" &&
              // An inline run's box spans its lines, so it can meet its neighbours' without overlapping them.
              style.display !== "inline" &&
              style.position !== "absolute" &&
              style.position !== "fixed" &&
              style.visibility !== "hidden" &&
              box.width > 0 &&
              box.height > 0
            );
          };
          for (const parent of [host, ...host.querySelectorAll("*")]) {
            if (problems.length >= limit) break;
            if (parent.closest("svg, iframe, math, .katex")) continue;
            const laid = children(parent).filter(inFlow);
            for (let i = 0; i < laid.length; i++) {
              for (let j = i + 1; j < laid.length; j++) {
                // Two boxes given the same grid cell are stacked on purpose, like a card's two faces.
                const first = getComputedStyle(laid[i]!).gridArea;
                if (first !== "auto" && first === getComputedStyle(laid[j]!).gridArea) continue;
                const a = laid[i]!.getBoundingClientRect();
                const b = laid[j]!.getBoundingClientRect();
                const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
                const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
                if (x > tolerance && y > tolerance && problems.length < limit) {
                  problems.push(
                    `${name(laid[i]!)} and ${name(laid[j]!)} overlap by ${Math.round(x)}×${Math.round(y)}px`,
                  );
                }
              }
            }
          }
          return problems;
        },
        { tolerance: TOLERANCE, limit: LIMIT },
      ),
  },
  {
    name: "no bad text values",
    run: async ({ page }) => {
      const text = await page.evaluate(() => document.getElementById("host")!.innerText);
      const bad = text.match(/\bNaN\b|\bundefined\b|\[object Object\]|\bInfinity\b/g) ?? [];
      return [...new Set(bad)].map((value) => `"${value}" in the rendered text`);
    },
  },
  {
    name: "images load",
    run: ({ page }) =>
      page.evaluate(async () => {
        const images = [...document.getElementById("host")!.querySelectorAll("img")];
        // A lazy image off screen never loads, and its decode() never settles: bring each one into
        // view, and give up waiting after a few seconds rather than hang the run.
        for (const image of images) image.scrollIntoView({ block: "nearest" });
        await Promise.all(
          images.map((image) =>
            Promise.race([
              image.decode().catch(() => undefined),
              new Promise((resolve) => setTimeout(resolve, 5_000)),
            ]),
          ),
        );
        window.scrollTo(0, 0);
        return images
          .filter((image) => image.complete && image.naturalWidth === 0)
          .filter((image) => getComputedStyle(image).display !== "none")
          .map((image) => `a broken image: ${image.currentSrc || image.src || "(no src)"}`);
      }),
  },
  {
    name: "drawings aren't empty",
    run: ({ page }) =>
      page.evaluate(() => {
        const drawn = "path, rect, circle, ellipse, line, polyline, polygon, text, image, use";
        return [...document.getElementById("host")!.querySelectorAll("svg")]
          .filter((svg) => !svg.parentElement?.closest("svg"))
          .filter((svg) => {
            const box = svg.getBoundingClientRect();
            return box.width > 0 && box.height > 0;
          })
          .filter((svg) => {
            const bbox = svg.getBBox();
            return svg.querySelector(drawn) === null || bbox.width + bbox.height === 0;
          })
          .map((svg) => {
            const box = svg.getBoundingClientRect();
            return `an empty ${Math.round(box.width)}×${Math.round(box.height)}px drawing`;
          });
      }),
  },
];
