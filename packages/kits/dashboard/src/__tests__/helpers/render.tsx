import { Renderer } from "@openuidev/react-lang";
import type { ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { openuiDashboardLibrary } from "../../lib";
import { cases } from "./cases";

let mounted: { root: Root; container: HTMLElement }[] = [];

/** Long enough for ResizeObservers and chart measurement to settle. */
export const settle = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export async function renderNode(node: ReactNode) {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  mounted.push({ root, container });
  root.render(node);
  await settle();
  return container;
}

export function renderProgram(program: string, onAction?: (event: unknown) => void) {
  return renderNode(
    <Renderer response={program} library={openuiDashboardLibrary} onAction={onAction} />,
  );
}

export function renderCase(id: string, onAction?: (event: unknown) => void) {
  const found = cases.find((item) => item.id === id);
  if (!found) throw new Error(`No case called ${id}`);
  return renderProgram(found.program, onAction);
}

export function cleanup() {
  for (const { root, container } of mounted) {
    root.unmount();
    container.remove();
  }
  mounted = [];
}

/** The element whose own text is exactly `text`. */
export function byText(container: Element, text: string): HTMLElement {
  const found = [...container.querySelectorAll<HTMLElement>("*")].find((element) =>
    [...element.childNodes].some(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === text,
    ),
  );
  if (!found) throw new Error(`No element with the text "${text}"`);
  return found;
}

export function one<T extends Element = HTMLElement>(container: ParentNode, selector: string): T {
  const found = container.querySelector<T>(selector);
  if (!found) throw new Error(`Nothing matches ${selector}`);
  return found;
}

export const style = (element: Element) => getComputedStyle(element);

export const box = (element: Element) => element.getBoundingClientRect();
