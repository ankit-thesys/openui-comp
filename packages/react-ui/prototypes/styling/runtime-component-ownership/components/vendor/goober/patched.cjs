var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../../../private/tmp/openui-runtime-owned-components/vendor/goober/src/index.js
var index_exports = {};
__export(index_exports, {
  css: () => css,
  extractCss: () => extractCss,
  glob: () => glob,
  keyframes: () => keyframes,
  setup: () => setup,
  styled: () => styled
});
module.exports = __toCommonJS(index_exports);

// ../../../../private/tmp/openui-runtime-owned-components/vendor/goober/src/core/to-hash.js
var toHash = (str) => {
  let i = 0, out = 11;
  while (i < str.length) out = 101 * out + str.charCodeAt(i++) >>> 0;
  return "go" + out;
};

// ../../../../private/tmp/openui-runtime-owned-components/vendor/goober/src/core/get-sheet.js
var GOOBER_ID = "_goober";
var ssr = {
  data: ""
};
var getSheet = (target) => {
  if (typeof window === "object") {
    let el = (target ? target.querySelector("#" + GOOBER_ID) : window[GOOBER_ID]) || Object.assign(document.createElement("style"), {
      innerHTML: " ",
      id: GOOBER_ID
    });
    el.nonce = window.__nonce__;
    if (!el.parentNode) (target || document.head).appendChild(el);
    return el.firstChild;
  }
  return target || ssr;
};

// ../../../../private/tmp/openui-runtime-owned-components/vendor/goober/src/core/update.js
var extractCss = (target) => {
  let sheet = getSheet(target);
  let out = sheet.data;
  sheet.data = "";
  return out;
};
var update = (css2, sheet, append, cssToReplace) => {
  cssToReplace ? sheet.data = sheet.data.replace(cssToReplace, css2) : sheet.data.indexOf(css2) === -1 && (sheet.data = append ? css2 + sheet.data : sheet.data + css2);
};

// ../../../../private/tmp/openui-runtime-owned-components/vendor/goober/src/core/astish.js
var newRule = /(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g;
var ruleClean = /\/\*[^]*?\*\/|  +/g;
var ruleNewline = /\n+/g;
var empty = " ";
var astish = (val) => {
  let tree = [{}];
  let block, left;
  while (block = newRule.exec(val.replace(ruleClean, ""))) {
    if (block[4]) {
      tree.shift();
    } else if (block[3]) {
      left = block[3].replace(ruleNewline, empty).trim();
      tree.unshift(tree[0][left] = tree[0][left] || {});
    } else {
      tree[0][block[1]] = block[2].replace(ruleNewline, empty).trim();
    }
  }
  return tree[0];
};

// ../../../../private/tmp/openui-runtime-owned-components/vendor/goober/src/core/parse.js
function list(value) {
  const out = [];
  let start = 0, round = 0, square = 0, quote = "", escape = false;
  for (let i = 0; i < value.length; i++) {
    const c = value[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\") {
      escape = true;
      continue;
    }
    if (quote) {
      if (c === quote) quote = "";
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      continue;
    }
    if (c === "(") round++;
    else if (c === ")") round--;
    else if (c === "[") square++;
    else if (c === "]") square--;
    else if (c === "," && round === 0 && square === 0) {
      out.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(value.slice(start).trim());
  return out;
}
function nesting(value, parent) {
  let out = "", quote = "", escape = false, found = false;
  for (const c of value) {
    if (escape) {
      out += c;
      escape = false;
      continue;
    }
    if (c === "\\") {
      out += c;
      escape = true;
      continue;
    }
    if (quote) {
      out += c;
      if (c === quote) quote = "";
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      out += c;
      continue;
    }
    if (c === "&") {
      out += parent;
      found = true;
    } else out += c;
  }
  return found ? out : parent ? parent + " " + out : out;
}
function expand(parent, child) {
  return list(parent).flatMap((p) => list(child).map((c) => nesting(c, p))).join(",");
}
var parse = (obj, selector) => {
  let outer = "";
  let blocks = "";
  let current = "";
  for (let key in obj) {
    let val = obj[key];
    if (key[0] == "@") {
      if (key[1] == "i") {
        outer = key + " " + val + ";";
      } else if (key[1] == "f") {
        blocks += parse(val, key);
      } else {
        blocks += key + "{" + parse(val, key[1] == "k" ? "" : selector) + "}";
      }
    } else if (typeof val == "object") {
      blocks += parse(
        val,
        selector ? (
          // Go over the selector and replace the matching multiple selectors if any
          expand(selector, key)
        ) : key
      );
    } else if (val != void 0) {
      key = key[1] == "-" ? key : key.replace(/[A-Z]/g, "-$&").toLowerCase();
      current += parse.p ? (
        // We have a prefixer and we need to run this through that
        parse.p(key, val)
      ) : (
        // Nope no prefixer just append it
        key + ":" + val + ";"
      );
    }
  }
  return outer + (selector && current ? selector + "{" + current + "}" : current) + blocks;
};

// ../../../../private/tmp/openui-runtime-owned-components/vendor/goober/src/core/hash.js
var cache = {};
var stringify = (data) => {
  if (typeof data == "object") {
    let out = "";
    for (let p in data) out += p + stringify(data[p]);
    return out;
  } else {
    return data;
  }
};
var hash = (compiled, sheet, global, append, keyframes2) => {
  let stringifiedCompiled = stringify(compiled);
  let className = cache[stringifiedCompiled] || (cache[stringifiedCompiled] = toHash(stringifiedCompiled));
  if (!cache[className]) {
    let ast = stringifiedCompiled !== compiled ? compiled : astish(compiled);
    cache[className] = parse(
      // For keyframes
      keyframes2 ? { ["@keyframes " + className]: ast } : ast,
      global ? "" : "." + className
    );
  }
  let cssToReplace = global && cache.g;
  if (global) cache.g = cache[className];
  update(cache[className], sheet, append, cssToReplace);
  return className;
};

// ../../../../private/tmp/openui-runtime-owned-components/vendor/goober/src/core/compile.js
var compile = (str, defs, data) => {
  return str.reduce((out, next, i) => {
    let tail = defs[i];
    if (tail && tail.call) {
      let res = tail(data);
      let className = res && res.props && res.props.className;
      let end = className || /^go/.test(res) && res;
      if (end) {
        tail = "." + end;
      } else if (res && typeof res == "object") {
        tail = res.props ? "" : parse(res, "");
      } else {
        tail = res === false ? "" : res;
      }
    }
    return out + next + (tail == null ? "" : tail);
  }, "");
};

// ../../../../private/tmp/openui-runtime-owned-components/vendor/goober/src/css.js
function css(val) {
  let ctx = this || {};
  let _val = val.call ? val(ctx.p) : val;
  return hash(
    _val.unshift ? _val.raw ? (
      // Tagged templates
      compile(_val, [].slice.call(arguments, 1), ctx.p)
    ) : (
      // Regular arrays
      _val.reduce((o, i) => Object.assign(o, i && i.call ? i(ctx.p) : i), {})
    ) : _val,
    getSheet(ctx.target),
    ctx.g,
    ctx.o,
    ctx.k
  );
}
var glob = css.bind({ g: 1 });
var keyframes = css.bind({ k: 1 });

// ../../../../private/tmp/openui-runtime-owned-components/vendor/goober/src/styled.js
var h;
var useTheme;
var fwdProp;
function setup(pragma, prefix, theme, forwardProps) {
  parse.p = prefix;
  h = pragma;
  useTheme = theme;
  fwdProp = forwardProps;
}
function styled(tag, forwardRef) {
  let _ctx = this || {};
  return function wrapper() {
    let _args = arguments;
    function Styled(props, ref) {
      let _props = Object.assign({}, props);
      let _previousClassName = _props.className || Styled.className;
      _ctx.p = Object.assign({ theme: useTheme && useTheme() }, _props);
      _ctx.o = /go\d/.test(_previousClassName);
      _props.className = // Define the new className
      css.apply(_ctx, _args) + (_previousClassName ? " " + _previousClassName : "");
      if (forwardRef) {
        _props.ref = ref;
      }
      let _as = tag;
      if (tag[0]) {
        _as = _props.as || tag;
        delete _props.as;
      }
      if (fwdProp && _as[0]) {
        fwdProp(_props);
      }
      return h(_as, _props);
    }
    return forwardRef ? forwardRef(Styled) : Styled;
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  css,
  extractCss,
  glob,
  keyframes,
  setup,
  styled
});
//# sourceMappingURL=patched.cjs.map
