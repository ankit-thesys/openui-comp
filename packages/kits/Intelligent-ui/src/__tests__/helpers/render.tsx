/// <reference types="vite/client" />
import { ThemeProvider } from "@openuidev/react-components";
import { Renderer, type ActionEvent } from "@openuidev/react-lang";
import { createRoot, type Root } from "react-dom/client";
import { commands } from "vitest/browser";
import { demoTools } from "../../lib/demo-data";
import { library, runLibraryAction } from "../../lib";
// The reset the source app has on its pages, so these tests see the page the kit was designed for.
import reset from "../parity/harness/public/globals.css?inline";

declare module "vitest/browser" {
  interface BrowserCommands {
    isolate: () => Promise<void>;
  }
}

let mounted: { root: Root; container: HTMLElement }[] = [];
const added: HTMLElement[] = [];
let isolated = false;

/** Long enough for React, goober and ResizeObservers to settle. */
export const settle = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

/** A colour read part-way through a transition isn't the colour it's heading for. */
export const transitionsDone = () =>
  Promise.allSettled(
    document
      .getAnimations()
      .filter((animation) => animation instanceof CSSTransition)
      .map((animation) => animation.finished),
  );

export const clipboard: string[] = [];
Object.defineProperty(navigator, "clipboard", {
  configurable: true,
  value: {
    writeText: async (text: string) => {
      clipboard.push(text);
    },
  },
});

/** Adds a stylesheet for one test, after everything else, as a host page's would be. */
export function addCss(css: string) {
  const element = document.createElement("style");
  element.textContent = css;
  document.head.append(element);
  added.push(element);
}

type Options = {
  theme?: "light" | "dark";
  /** A bare host: no CSS reset and no ThemeProvider. */
  bare?: boolean;
  /** Sets the theme on the page itself, not on a wrapper around the output. */
  themeOnRoot?: boolean;
  onAction?: (event: ActionEvent) => void;
};

export async function renderProgram(program: string, options: Options = {}) {
  if (!isolated) {
    await commands.isolate();
    isolated = true;
  }
  const theme = options.theme ?? "light";
  if (!options.bare) addCss(`${reset}\nbody { font-family: "Inter", sans-serif; }`);
  document.documentElement.setAttribute("data-openui-theme", theme);

  const errors: string[] = [];
  const container = document.body.appendChild(document.createElement("div"));
  if (options.bare && !options.themeOnRoot) container.setAttribute("data-theme", theme);
  const root = createRoot(container);
  mounted.push({ root, container });
  const page = (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px", boxSizing: "border-box", fontSize: 16, lineHeight: 1.6 }}>
      <Renderer
        response={program}
        library={library}
        isStreaming={false}
        toolProvider={demoTools}
        onError={(list) => errors.push(...list.map((error) => error.message))}
        onAction={(event) => {
          void runLibraryAction(event);
          options.onAction?.(event);
        }}
      />
    </main>
  );
  root.render(options.bare ? page : <ThemeProvider mode={theme}>{page}</ThemeProvider>);
  await settle(/\bMap\(|Chart\(|HtmlView\(/.test(program) ? 700 : 200);
  await transitionsDone();
  return Object.assign(container, { renderErrors: errors });
}

export function cleanup() {
  for (const { root, container } of mounted) {
    root.unmount();
    container.remove();
  }
  mounted = [];
  for (const element of added.splice(0)) element.remove();
  document.documentElement.removeAttribute("data-openui-theme");
  document.body.style.removeProperty("font-family");
  clipboard.length = 0;
}

export function one<T extends Element = HTMLElement>(scope: ParentNode, selector: string): T {
  const found = scope.querySelector<T>(selector);
  if (!found) throw new Error(`Nothing matches ${selector}`);
  return found;
}

/** The element whose own text is exactly `text`. */
export function byText(scope: Element, text: string): HTMLElement {
  const found = [...scope.querySelectorAll<HTMLElement>("*")].find((element) =>
    [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === text),
  );
  if (!found) throw new Error(`No element with the text "${text}"`);
  return found;
}

export const buttonNamed = (scope: ParentNode, name: string) => {
  const found = [...scope.querySelectorAll<HTMLElement>("button,[role=button],[role=radio]")].find(
    (element) => element.textContent?.trim() === name || element.getAttribute("aria-label") === name,
  );
  if (!found) throw new Error(`No button called "${name}"`);
  return found;
};

export const style = (element: Element, pseudo?: string) => getComputedStyle(element, pseudo);
export const box = (element: Element) => element.getBoundingClientRect();

const canvas = document.createElement("canvas");
canvas.width = canvas.height = 1;
const context = canvas.getContext("2d", { willReadFrequently: true })!;

/** Any CSS colour, including oklch, as [r, g, b, a] with a from 0 to 255. */
export function rgba(color: string): [number, number, number, number] {
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = "#000";
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
  return [r!, g!, b!, a!];
}

export const distance = (a: string, b: string) => {
  const [left, right] = [rgba(a), rgba(b)];
  return Math.max(...left.map((value, index) => Math.abs(value - right[index]!)));
};

/** The kit's ink where this element sits, whatever the theme. */
export const inkAt = (element: Element) => style(element).getPropertyValue("--openui-intelligent-ink").trim();
