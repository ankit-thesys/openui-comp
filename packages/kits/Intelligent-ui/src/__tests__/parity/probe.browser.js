// Runs inside the page. It reads what a person sees rather than the DOM's shape, because the source
// app and the kit build the same control from different elements: text, controls, surfaces and media,
// each with its size, position and colours.
(() => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const colors = new Map();

  /** Any CSS colour, including oklch, as "rrggbb" or "rrggbbaa"; null when fully transparent. */
  const hex = (value) => {
    if (!value) return null;
    if (colors.has(value)) return colors.get(value);
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = "#000";
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
    const two = (n) => n.toString(16).padStart(2, "0");
    const result = a === 0 ? null : `${two(r)}${two(g)}${two(b)}${a === 255 ? "" : two(a)}`;
    colors.set(value, result);
    return result;
  };

  const round = (n) => Math.round(n);
  const clean = (text) => text.replace(/\s+/g, " ").trim();
  const SKIP = new Set(["STYLE", "SCRIPT", "NOSCRIPT", "TITLE", "DEFS", "TEMPLATE", "METADATA"]);

  const visible = (el) => {
    for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
        return false;
      }
    }
    return el.getClientRects().length > 0;
  };

  const classOf = (el) => el.getAttribute("class") ?? "";

  /** The outermost chart around an element. Charts are compared on their own, in `charts`. */
  const chartOf = (el) => {
    let found = null;
    for (let node = el; node && node.nodeType === 1 && node.tagName !== "MAIN"; node = node.parentElement) {
      if (/chart/i.test(classOf(node))) found = node;
    }
    return found;
  };

  /** A native select shows its chosen option, which isn't a text node of the page. */
  const selectTexts = (scope) =>
    [...scope.querySelectorAll("select")].filter(visible).map((el) => {
      const box = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return {
        text: clean(el.selectedOptions[0]?.textContent ?? ""),
        x: round(box.x + scrollX),
        y: round(box.y + scrollY),
        w: round(box.width),
        h: round(box.height),
        size: parseFloat(style.fontSize),
        weight: Number(style.fontWeight),
        color: hex(style.color),
        italic: false,
        line: "",
      };
    });

  const texts = (scope) => {
    const out = selectTexts(scope).filter((item) => item.text);
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const value = clean(node.nodeValue ?? "");
      const parent = node.parentElement;
      if (!value || !parent || SKIP.has(parent.tagName) || parent.closest("style,script,defs,select")) continue;
      if (chartOf(parent)) continue;
      if (!visible(parent)) continue;
      range.selectNodeContents(node);
      const box = range.getBoundingClientRect();
      if (box.width <= 1 || box.height <= 1) continue; // screen-reader-only text
      const style = getComputedStyle(parent);
      out.push({
        text: value,
        x: round(box.x + scrollX),
        y: round(box.y + scrollY),
        w: round(box.width),
        h: round(box.height),
        size: parseFloat(style.fontSize),
        weight: Number(style.fontWeight),
        color: hex(parent.namespaceURI?.endsWith("svg") ? style.fill : style.color),
        italic: style.fontStyle === "italic",
        line: style.textDecorationLine === "none" ? "" : style.textDecorationLine,
      });
    }
    return out;
  };

  const CONTROLS =
    'button,a[href],input:not([type=hidden]),select,textarea,[role=button],[role=checkbox],[role=radio],[role=switch],[role=slider],[role=tab],[role=combobox],[role=menuitem],[role=option],[role=link]';

  const roleOf = (el) => {
    const role = el.getAttribute("role");
    if (role) return role;
    const tag = el.tagName;
    if (tag === "BUTTON") return "button";
    if (tag === "A") return "link";
    if (tag === "SELECT") return "combobox";
    if (tag === "TEXTAREA") return "textbox";
    if (tag === "INPUT") {
      const type = el.type;
      if (type === "checkbox" || type === "radio") return type;
      if (type === "range") return "slider";
      if (type === "number") return "spinbutton";
      if (type === "date") return "date";
      return "textbox";
    }
    return tag.toLowerCase();
  };

  const nameOf = (el) => {
    const label = el.getAttribute("aria-label");
    if (label) return clean(label);
    if (el.tagName === "SELECT") {
      // A label around a select also holds every option. A combobox is named by its label and value.
      const chosen = clean(el.selectedOptions[0]?.textContent ?? "");
      const holder = el.labels?.[0] ?? el.closest("label");
      if (!holder) return chosen;
      const copy = holder.cloneNode(true);
      copy.querySelectorAll("select").forEach((node) => node.remove());
      return clean(`${copy.textContent ?? ""}${chosen}`);
    }
    const ids = el.getAttribute("aria-labelledby");
    if (ids) {
      const named = clean(
        ids
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent ?? "")
          .join(" "),
      );
      if (named) return named;
    }
    if (el.labels?.length) return clean(el.labels[0].textContent ?? "");
    const wrapped = el.closest("label");
    if (wrapped && el.tagName === "INPUT") return clean(wrapped.textContent ?? "");
    return clean(el.textContent ?? "") || el.getAttribute("placeholder") || el.getAttribute("title") || "";
  };

  /** Controls in page order. Real elements win over a role on the same spot, such as a hidden input. */
  const controlElements = (scope) =>
    [...scope.querySelectorAll(CONTROLS)].filter((el) => {
      if (!visible(el) || chartOf(el)) return false;
      const box = el.getBoundingClientRect();
      // A native checkbox or radio is often hidden on top of its drawn box, so keep it however small.
      return box.width > 0 && box.height > 0;
    });

  const stateOf = (el) => {
    const state = [];
    if (el.disabled || el.getAttribute("aria-disabled") === "true") state.push("disabled");
    if (el.checked || el.getAttribute("aria-checked") === "true") state.push("checked");
    if (el.getAttribute("aria-pressed") === "true") state.push("pressed");
    if (el.getAttribute("aria-selected") === "true") state.push("selected");
    if (el.getAttribute("aria-expanded") === "true") state.push("expanded");
    return state.join(",");
  };

  const borderOf = (style) => {
    const width = parseFloat(style.borderTopWidth) || parseFloat(style.borderBottomWidth);
    if (!width || style.borderTopStyle === "none") return null;
    return hex(style.borderTopColor);
  };

  const controls = (scope) =>
    controlElements(scope).map((el) => {
      const box = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return {
        role: roleOf(el),
        name: nameOf(el).slice(0, 80),
        x: round(box.x + scrollX),
        y: round(box.y + scrollY),
        w: round(box.width),
        h: round(box.height),
        bg: hex(style.backgroundColor),
        color: hex(style.color),
        border: borderOf(style),
        radius: parseFloat(style.borderTopLeftRadius) || 0,
        state: stateOf(el),
        href: el.tagName === "A" ? el.getAttribute("href") : undefined,
      };
    });

  const media = (scope) =>
    [...scope.querySelectorAll("img,canvas,iframe,video,svg")]
      .filter((el) => {
        if (!visible(el)) return false;
        if (el.tagName.toLowerCase() === "svg") {
          // Icons and chart parts are not media. A drawing is a top-level svg of some size.
          const box = el.getBoundingClientRect();
          return !el.parentElement?.closest("svg") && !chartOf(el) && box.width >= 32 && box.height >= 32;
        }
        return !chartOf(el);
      })
      .map((el) => {
        const box = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          x: round(box.x + scrollX),
          y: round(box.y + scrollY),
          w: round(box.width),
          h: round(box.height),
        };
      });

  /** Anything that draws a box: a fill, a border or a shadow. */
  const surfaces = (scope) => {
    const out = [];
    for (const el of scope.querySelectorAll("*")) {
      if (SKIP.has(el.tagName) || el.closest("svg") || chartOf(el)) continue;
      if (!visible(el)) continue;
      const box = el.getBoundingClientRect();
      if (box.width < 16 || box.height < 16) continue;
      const style = getComputedStyle(el);
      const bg = hex(style.backgroundColor);
      const border = borderOf(style);
      const shadow = style.boxShadow !== "none";
      if (!bg && !border && !shadow) continue;
      out.push({
        x: round(box.x + scrollX),
        y: round(box.y + scrollY),
        w: round(box.width),
        h: round(box.height),
        bg,
        border,
        radius: parseFloat(style.borderTopLeftRadius) || 0,
        shadow,
      });
    }
    return out;
  };

  const charts = (scope) => {
    const roots = new Set();
    for (const el of scope.querySelectorAll("*")) {
      if (!visible(el)) continue;
      const root = chartOf(el);
      if (root) roots.add(root);
    }
    return [...roots].map((root) => {
      const box = root.getBoundingClientRect();
      const words = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const value = clean(node.nodeValue ?? "");
        if (value && node.parentElement && !SKIP.has(node.parentElement.tagName) && visible(node.parentElement)) {
          words.push(...value.split(" "));
        }
      }
      const scrolls = [root, ...root.querySelectorAll("*")].some(
        (el) => !(el instanceof SVGElement) && el.scrollWidth > el.clientWidth + 4 && getComputedStyle(el).overflowX !== "visible",
      );
      return { x: round(box.x + scrollX), y: round(box.y + scrollY), w: round(box.width), h: round(box.height), words, scrolls };
    });
  };

  window.__probe = {
    collect() {
      const scope = document.querySelector("main") ?? document.body;
      const doc = document.documentElement;
      return {
        page: {
          width: round(scope.getBoundingClientRect().width),
          height: round(scope.scrollHeight),
          overflowX: Math.max(0, doc.scrollWidth - doc.clientWidth),
        },
        texts: texts(scope),
        controls: controls(scope),
        media: media(scope),
        surfaces: surfaces(scope),
        charts: charts(scope),
      };
    },
    /** All the visible text on the page, portals included, for before-and-after comparisons. */
    words() {
      return texts(document.body)
        .flatMap((item) => item.text.split(" "))
        .filter(Boolean);
    },
    controlList() {
      return controlElements(document.querySelector("main") ?? document.body).map((el) => ({
        role: roleOf(el),
        name: nameOf(el).slice(0, 80),
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute("type") ?? "",
        href: el.tagName === "A" ? (el.getAttribute("href") ?? "") : "",
        disabled: el.disabled || el.getAttribute("aria-disabled") === "true",
      }));
    },
    /** Where a control is in the list right now. A map adds controls as it loads, so positions move. */
    indexOf(role, name, nth) {
      const found = controlElements(document.querySelector("main") ?? document.body)
        .map((el, index) => ({ role: roleOf(el), name: nameOf(el).slice(0, 80), index }))
        .filter((item) => item.role === role && item.name === name);
      return found[nth]?.index ?? -1;
    },
    /** Scrolls a control into view and says where to click it. */
    locate(index) {
      const el = controlElements(document.querySelector("main") ?? document.body)[index];
      if (!el) return null;
      el.scrollIntoView({ block: "center" });
      const box = el.getBoundingClientRect();
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    },
    focus(index) {
      const el = controlElements(document.querySelector("main") ?? document.body)[index];
      el?.focus();
    },
    /** Picks the next option of a native select. A real popup can't be driven the same way on every OS. */
    selectNext(index) {
      const el = controlElements(document.querySelector("main") ?? document.body)[index];
      const next = el.options[(el.selectedIndex + 1) % el.options.length];
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set.call(el, next.value);
      el.dispatchEvent(new Event("change", { bubbles: true }));
    },
    stateOf(index) {
      const el = controlElements(document.querySelector("main") ?? document.body)[index];
      return el ? { state: stateOf(el), value: el.value ?? el.getAttribute("aria-valuenow") ?? "" } : null;
    },
  };
})();
