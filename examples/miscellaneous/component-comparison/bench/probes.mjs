// Read-only browser measurements. No generated classes or IDs are compared.
export function measureDocument() {
  const properties = [
    "display",
    "position",
    "transform",
    "boxSizing",
    "width",
    "height",
    "minWidth",
    "minHeight",
    "maxWidth",
    "maxHeight",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "marginTop",
    "marginRight",
    "marginBottom",
    "marginLeft",
    "gap",
    "rowGap",
    "columnGap",
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "lineHeight",
    "letterSpacing",
    "textAlign",
    "textDecorationLine",
    "color",
    "backgroundColor",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "borderTopStyle",
    "borderRadius",
    "boxShadow",
    "opacity",
    "visibility",
    "overflowX",
    "overflowY",
    "cursor",
    "outlineColor",
    "outlineWidth",
    "outlineStyle",
    "fill",
    "stroke",
    "strokeWidth",
    "flexDirection",
    "alignItems",
    "justifyContent",
    "objectFit",
  ];
  const elements = [
    ...document.querySelectorAll(
      "#comparison-pane, #comparison-pane *, body > [data-radix-popper-content-wrapper], body > [data-radix-popper-content-wrapper] *, [role=dialog], [role=dialog] *, [role=alertdialog], [role=alertdialog] *, [role=tooltip], [role=tooltip] *",
    ),
  ].filter((e) => !["SCRIPT", "STYLE"].includes(e.tagName));
  const geometry = [],
    styles = [],
    semantics = [];
  for (let index = 0; index < elements.length; index++) {
    const e = elements[index],
      style = getComputedStyle(e),
      rect = e.getBoundingClientRect();
    if (style.display === "none" || style.visibility === "hidden") continue;
    const key = `${index}:${e.tagName.toLowerCase()}`;
    geometry.push({
      key,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      scrollWidth: e.scrollWidth,
      scrollHeight: e.scrollHeight,
    });
    styles.push({
      key,
      ...Object.fromEntries(properties.map((p) => [p, style[p]])),
    });
    if (
      e.matches(
        "input,textarea,select,button,[role],img,a,label,h1,h2,h3,h4,table,th,td",
      )
    )
      semantics.push({
        key,
        tag: e.tagName,
        role: e.getAttribute("role"),
        type: e.getAttribute("type"),
        name: e.getAttribute("aria-label"),
        alt: e.getAttribute("alt"),
        disabled:
          e.matches(":disabled") || e.getAttribute("aria-disabled") === "true",
        checked: e.getAttribute("aria-checked"),
        expanded: e.getAttribute("aria-expanded"),
        selected: e.getAttribute("aria-selected"),
        text: e.innerText ?? "",
      });
  }
  const brokenReferences = [];
  for (const e of document.querySelectorAll(
    "[aria-labelledby],[aria-describedby],[aria-controls],label[for]",
  ))
    for (const attr of [
      "aria-labelledby",
      "aria-describedby",
      "aria-controls",
      "for",
    ])
      for (const id of (e.getAttribute(attr) ?? "")
        .split(/\s+/)
        .filter(Boolean))
        if (
          !document.getElementById(id) &&
          (attr !== "aria-controls" ||
            e.getAttribute("aria-expanded") === "true")
        )
          brokenReferences.push({
            tag: e.tagName,
            attribute: attr,
            target: id,
          });
  const unnamedControls = [
    ...document.querySelectorAll(
      "button,input:not([type=hidden]),textarea,select,[role=combobox],[role=switch],[role=checkbox],[role=radio]",
    ),
  ]
    .filter(
      (e) =>
        e.tabIndex >= 0 &&
        e.getAttribute("aria-hidden") !== "true" &&
        !e.closest("[hidden]") &&
        getComputedStyle(e).display !== "none" &&
        !e.getAttribute("aria-label") &&
        !e.getAttribute("aria-labelledby") &&
        !e.textContent?.trim() &&
        !e.getAttribute("placeholder") &&
        !(e.id && document.querySelector(`label[for="${CSS.escape(e.id)}"]`)),
    )
    .map((e) => e.tagName + ":" + (e.getAttribute("role") ?? ""));
  return {
    text: document.querySelector("#comparison-pane")?.innerText ?? "",
    geometry,
    styles,
    semantics,
    brokenReferences,
    unnamedControls,
    scroll: { x: scrollX, y: scrollY },
    notices: [...document.querySelectorAll(".pane-error")].map(
      (e) => e.textContent,
    ),
    stylesheets: [...document.styleSheets].map((s) => ({
      href: s.href ? new URL(s.href).pathname : null,
      id: s.ownerNode?.id ?? "",
      host: s.ownerNode?.getAttribute?.("data-bench-host") ?? null,
    })),
    viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
    active: {
      tag: document.activeElement?.tagName,
      role: document.activeElement?.getAttribute("role"),
    },
  };
}
