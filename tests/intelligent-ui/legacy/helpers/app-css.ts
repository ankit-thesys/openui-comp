import { addCss, one, settle, style, transitionsDone } from "./render";

/** A page with the pieces an app most often restyles. */
export const page = `root = Col([Title("Hello"), Card([Text("Inside")]), Badge("New"), Button("Save"), Select("", ["S", "M"], "Size")])`;

const prepended: HTMLElement[] = [];

/** Adds an app stylesheet ahead of the kit's tags, where an app's own CSS usually loads. */
export function addCssFirst(css: string) {
  const element = document.createElement("style");
  element.textContent = css;
  document.head.prepend(element);
  prepended.push(element);
}

export function removeAppCss() {
  for (const element of prepended.splice(0)) element.remove();
}

/** Adds an app stylesheet, before or after the kit's, and waits for the page to restyle. */
export async function appCss(css: string, where: "before" | "after" = "before") {
  if (where === "before") addCssFirst(css);
  else addCss(css);
  await settle(50);
  await transitionsDone();
}

export const blue = "rgb(0, 0, 255)";

/** One rule per piece, each with just the piece's stable class. */
export const restyle = `
  .openui-intelligent-button { border-radius: 0px; background-color: ${blue}; }
  .openui-intelligent-title { color: ${blue}; }
  .openui-intelligent-card { border-radius: 3px; }
  .openui-intelligent-badge { color: ${blue}; }
  .openui-intelligent-field-control { border-radius: 2px; }
`;

export function read(scope: HTMLElement) {
  const at = (selector: string) => style(one(scope, selector));
  return {
    button: at(".openui-intelligent-button").borderRadius,
    buttonFill: at(".openui-intelligent-button").backgroundColor,
    title: at(".openui-intelligent-title").color,
    card: at(".openui-intelligent-card").borderRadius,
    badge: at(".openui-intelligent-badge").color,
    select: at(".openui-intelligent-field-control").borderRadius,
  };
}

/** What `restyle` gives when every rule wins. */
export const restyled = { button: "0px", buttonFill: blue, title: blue, card: "3px", badge: blue, select: "2px" };
