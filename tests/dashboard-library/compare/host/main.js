// The comparison's host page: renders one OpenUI Lang program at a time with the library, the way
// an app does (ThemeProvider around Renderer), into a host as wide as the preview's dashboard.
//
// It imports the library from source, as the browser tests do, so the one host override it needs
// (CompareOverride, which the preview sets for specimens with "Previous period" ticked) shares the
// library's contexts. After a restructure, only that override's import path may change.
import { Renderer } from "@openuidev/react-lang";
import { createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { library, ThemeProvider } from "../../../../packages/libraries/dashboard/src/index";
import { CompareOverride } from "../../../../packages/libraries/dashboard/src/shared/compare";

let root = null;
const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));

window.__render = async ({ program, width, theme, context }) => {
  root?.unmount();
  const host = document.getElementById("host");
  const specimen = context?.wrapper === "dl-specimen";
  document.querySelector("section.dl-comp").id = context?.id ?? "context";
  document.getElementById("wrapper").className = context?.wrapper ?? "";
  host.className = specimen ? "dl-specimen-body" : "";
  host.style.width = `${width}px`;
  root = createRoot(host);
  const tree = h(Renderer, { response: program, library });
  root.render(
    h(
      ThemeProvider,
      { mode: theme },
      h(CompareOverride, { value: context?.compare ? true : null }, tree),
    ),
  );
  for (let i = 0; i < 100 && !host.querySelector(".openui-dashboard-dashboard"); i++) await frame();
  await frame();
  await frame();
};

window.__scope = () =>
  [...document.querySelectorAll(".openui-dashboard-root")]
    .filter((r) => r.querySelector(":scope > .openui-dashboard-dashboard"))
    .at(-1) ?? null;

/** Sets the host width so the dashboard's content box (inside its padding) is `target` px wide. */
window.__fit = async (target) => {
  const host = document.getElementById("host");
  const dashboard = window.__scope()?.querySelector(":scope > .openui-dashboard-dashboard");
  if (!dashboard || !target) return;
  for (let i = 0; i < 3; i++) {
    const s = getComputedStyle(dashboard);
    const inner =
      dashboard.getBoundingClientRect().width -
      parseFloat(s.paddingLeft) -
      parseFloat(s.paddingRight);
    if (Math.abs(inner - target) < 0.1) return;
    host.style.width = `${parseFloat(host.style.width) + target - inner}px`;
    await frame();
    await frame();
  }
};
