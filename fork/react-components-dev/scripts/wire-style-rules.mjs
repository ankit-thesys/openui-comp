// Wires server-rendered rules (#178): after every element whose className comes from a style
// module, renders `{styleRules(<that class string>)}`, so a server render carries exactly the
// rendered classes. Rerunnable and idempotent: an element already followed by its styleRules call
// is left alone.
//
//   node scripts/wire-style-rules.mjs <component dir or .tsx file>...   rewrite in place
//   node scripts/wire-style-rules.mjs --check <...>                     exit 1 if anything is unwired
//
// - An inline class expression is hoisted into a `<part>Class` const before its statement, so it
//   is computed once; one evaluated only conditionally (inside `&&`, `?:`, an `if` branch) is
//   repeated in the call instead, under the same condition.
// - The call goes after the element, never before: before it, React separates a preceding text
//   node with `<!-- -->`, changing the markup.
// - A child of JSX gets the call as its next sibling; any other element is wrapped in a fragment
//   (a keyed element in a keyed `Fragment`).
// - React renders `<style>` in place inside SVG, so for an SVG element or its descendants the call
//   goes after the outermost `<svg>`; a Radix `asChild` parent or `Slot` takes one element child,
//   so the call goes after that parent.
// - Elements in a portal (`*.Portal`, `createPortal`) never render on the server: no call.
// - A component that calls Children.only (TooltipWrapper) is treated like a slotting parent, and
//   one that wires its own className (IconWrapper) is skipped.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const here = dirname(fileURLToPath(import.meta.url));
const CSS_MODULE = resolve(here, "../../../packages/react-components/src/styles/css");

const args = process.argv.slice(2);
const check = args.includes("--check");
const files = args
  .filter((arg) => arg !== "--check")
  .flatMap((arg) => {
    const path = resolve(arg);
    return statSync(path).isDirectory() ? walk(path) : [path];
  })
  .filter((file) => /\.tsx$/.test(file) && !/\.(test|stories)\.tsx$/.test(file));
if (!files.length) {
  console.error("Usage: wire-style-rules.mjs [--check] <component dir or .tsx file>...");
  process.exit(2);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const parse = (file, text) =>
  ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

const isElement = (node) => ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node);
const opening = (node) => (ts.isJsxElement(node) ? node.openingElement : node);
const tagOf = (node) => opening(node).tagName.getText();
const attribute = (node, name) =>
  opening(node).attributes.properties.find(
    (prop) => ts.isJsxAttribute(prop) && prop.name.getText() === name,
  );

// Names bound to style modules: imports from `*.styles` and consts initialised from them.
function styleNames(source) {
  const names = new Set();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    if (!/\.styles["']$/.test(statement.moduleSpecifier.getText())) continue;
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings))
      for (const element of bindings.elements) names.add(element.name.text);
  }
  // `names` holds the stable classes, which travel with the generated ones but carry no rules.
  names.delete("names");
  for (const imported of [...names]) if (/^names$|Names$/.test(imported)) names.delete(imported);
  let grew = true;
  while (grew) {
    grew = false;
    source.forEachChild(function visit(node) {
      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.initializer &&
        !names.has(node.name.text) &&
        references(node.initializer, names)
      ) {
        names.add(node.name.text);
        grew = true;
      }
      node.forEachChild(visit);
    });
  }
  return names;
}

function references(node, names) {
  let found = false;
  (function visit(child) {
    if (found) return;
    if (ts.isIdentifier(child) && names.has(child.text)) {
      // A property name (`x.styles`) is not a reference.
      const parent = child.parent;
      if (!(parent && ts.isPropertyAccessExpression(parent) && parent.name === child)) found = true;
    }
    child.forEachChild(visit);
  })(node);
  return found;
}

const SVG_ONLY = new Set([
  "path",
  "g",
  "circle",
  "rect",
  "line",
  "polyline",
  "polygon",
  "ellipse",
  "text",
  "tspan",
  "defs",
  "linearGradient",
  "radialGradient",
  "stop",
  "clipPath",
  "mask",
  "pattern",
  "use",
  "symbol",
  "marker",
  "foreignObject",
]);

/** The outermost `<svg>` element containing `node` (or `node` itself), if any. */
function svgRoot(node) {
  let root;
  for (let current = node; current; current = current.parent)
    if (isElement(current) && tagOf(current) === "svg") root = current;
  return root;
}

// A Radix `asChild` parent, a `Slot`, or a component that calls Children.only needs exactly one
// element child.
const SINGLE_CHILD = new Set(["TooltipWrapper"]);
const slots = (node) =>
  isElement(node) &&
  (attribute(node, "asChild") !== undefined ||
    /^(.*\.)?Slot$/.test(tagOf(node)) ||
    SINGLE_CHILD.has(tagOf(node)));

// Components that wire the className they are given next to the element they render, which may
// render nothing on the server (IconWrapper before its icon loads).
const SELF_WIRED = new Set(["IconWrapper"]);

// Portal content never renders on the server, so the browser sheet alone styles it.
function inPortal(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (isElement(current) && /^(.*\.)?Portal$/.test(tagOf(current))) return true;
    if (ts.isCallExpression(current) && /(^|\.)createPortal$/.test(current.expression.getText()))
      return true;
  }
  return false;
}

/**
 * The node that gets the call after it: the element, or its outermost `<svg>`, moved out of any
 * slotting parent.
 */
function insertionTarget(element) {
  let target = svgRoot(element) ?? element;
  while (target.parent && slots(target.parent)) target = svgRoot(target.parent) ?? target.parent;
  return target;
}

// Code compared without whitespace or trailing commas, so a call a formatter rewrapped still matches.
const sameCode = (code) => code.replace(/\s+/g, "").replace(/,(?=[)\]}])/g, "");

/**
 * The styleRules calls directly after `node` among its JSX siblings, and where the last one ends,
 * so a new call goes after them, keeping document order.
 */
function followingCalls(node) {
  const parent = node.parent;
  const calls = [];
  calls.end = node.getEnd();
  if (!parent || !(ts.isJsxElement(parent) || ts.isJsxFragment(parent))) return calls;
  const children = parent.children;
  for (let index = children.indexOf(node) + 1; index < children.length; index++) {
    const child = children[index];
    if (ts.isJsxText(child) && !child.text.trim()) continue;
    if (
      ts.isJsxExpression(child) &&
      child.expression &&
      ts.isCallExpression(child.expression) &&
      child.expression.expression.getText() === "styleRules"
    ) {
      calls.push(sameCode(child.expression.arguments.map((arg) => arg.getText()).join(",")));
      calls.end = child.getEnd();
      continue;
    }
    break;
  }
  return calls;
}

/** Elements to wire, in document order, with the class expression each passes. */
function unwired(source) {
  const names = styleNames(source);
  const found = [];
  source.forEachChild(function visit(node) {
    if (isElement(node)) {
      const className = attribute(node, "className");
      const expression =
        className?.initializer && ts.isJsxExpression(className.initializer)
          ? className.initializer.expression
          : undefined;
      if (
        expression &&
        references(expression, names) &&
        !inPortal(node) &&
        !SELF_WIRED.has(tagOf(node))
      ) {
        const target = insertionTarget(node);
        const orphanSvg = !svgRoot(node) && SVG_ONLY.has(tagOf(node));
        if (orphanSvg)
          skipped.push(`${source.fileName}: <${tagOf(node)}> renders inside an <svg> elsewhere`);
        else if (!followingCalls(target).includes(sameCode(expression.getText())))
          found.push({ element: node, expression, target });
      }
    }
    node.forEachChild(visit);
  });
  return found;
}

const skipped = [];

/** The nearest enclosing function-like node. */
function enclosingFunction(node) {
  for (let current = node.parent; current; current = current.parent)
    if (ts.isFunctionLike(current)) return current;
  return undefined;
}

/**
 * Where a hoisted const can go: the statement holding the element, when that statement sits
 * directly in a block and the element is evaluated whenever it runs. Undefined otherwise.
 */
function hoistPoint(element) {
  let child = element;
  for (let current = element.parent; current; child = current, current = current.parent) {
    if (ts.isFunctionLike(current)) {
      // An expression-bodied arrow: its body becomes a block.
      return ts.isArrowFunction(current) && current.body === child ? { arrow: current } : undefined;
    }
    if (ts.isConditionalExpression(current) && child !== current.condition) return undefined;
    if (
      ts.isBinaryExpression(current) &&
      child === current.right &&
      [
        ts.SyntaxKind.AmpersandAmpersandToken,
        ts.SyntaxKind.BarBarToken,
        ts.SyntaxKind.QuestionQuestionToken,
      ].includes(current.operatorToken.kind)
    )
      return undefined;
    if (ts.isStatement(current) && !ts.isBlock(current)) {
      return current.parent && ts.isBlock(current.parent) ? { statement: current } : undefined;
    }
  }
  return undefined;
}

function constName(expression, fn) {
  // The part: the property read on the first style reference, e.g. `styles.icon` → `iconClass`.
  let part;
  (function visit(node) {
    if (part) return;
    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression)) {
      part = node.name.text;
      return;
    }
    node.forEachChild(visit);
  })(expression);
  part ??= "root";
  const base = `${part.replace(/^[A-Z]/, (c) => c.toLowerCase())}Class`;
  const taken = new Set();
  (function visit(node) {
    if (ts.isIdentifier(node)) taken.add(node.text);
    node.forEachChild(visit);
  })(fn ?? expression.getSourceFile());
  let name = base;
  for (let index = 2; taken.has(name); index++) name = `${base}${index}`;
  return name;
}

const indentAt = (text, pos) => {
  const lineStart = text.lastIndexOf("\n", pos - 1) + 1;
  return /^[ \t]*/.exec(text.slice(lineStart))[0];
};

/** Rewrites the first unwired element in `text`; null when none is left. */
function wireOne(file, text) {
  const source = parse(file, text);
  const [first] = unwired(source);
  if (!first) return null;
  const { element, expression, target } = first;
  const edits = [];

  // Hoist the class expression into a const, unless it is one already.
  let classText = expression.getText();
  if (!ts.isIdentifier(expression)) {
    const point = hoistPoint(element);
    if (point) {
      const name = constName(expression, enclosingFunction(element));
      edits.push({ pos: expression.getStart(), end: expression.getEnd(), text: name });
      classText = name;
      if (point.statement) {
        const at = point.statement.getStart();
        edits.push({
          pos: at,
          end: at,
          text: `const ${name} = ${expression.getText()};\n${indentAt(text, at)}`,
        });
      } else {
        const body = point.arrow.body;
        edits.push({
          pos: body.getStart(),
          end: body.getStart(),
          text: `{ const ${name} = ${expression.getText()}; return `,
        });
        edits.push({ pos: body.getEnd(), end: body.getEnd(), text: "; }" });
      }
    }
  }

  // The call after the target: as its next JSX sibling, or with the target in a fragment.
  const call = `{styleRules(${classText})}`;
  const parent = target.parent;
  if (ts.isJsxElement(parent) || ts.isJsxFragment(parent)) {
    const end = followingCalls(target).end;
    edits.push({ pos: end, end, text: call });
  } else {
    const key = attribute(target, "key");
    if (key) {
      const keyText = key.initializer.getText();
      edits.push({ pos: key.getFullStart(), end: key.getEnd(), text: "" });
      edits.push({
        pos: target.getStart(),
        end: target.getStart(),
        text: `<Fragment key=${keyText}>`,
      });
      edits.push({ pos: target.getEnd(), end: target.getEnd(), text: `${call}</Fragment>` });
    } else {
      edits.push({ pos: target.getStart(), end: target.getStart(), text: "<>" });
      edits.push({ pos: target.getEnd(), end: target.getEnd(), text: `${call}</>` });
    }
  }

  // Apply from the end so earlier positions stay valid; equal positions keep their order.
  let next = text;
  for (const edit of edits
    .map((edit, index) => ({ ...edit, index }))
    .sort((a, b) => b.pos - a.pos || b.index - a.index))
    next = next.slice(0, edit.pos) + edit.text + next.slice(edit.end);
  return next;
}

function ensureImports(file, text) {
  const source = parse(file, text);
  let next = text;
  const imports = source.statements.filter(ts.isImportDeclaration);
  const lastImport = imports[imports.length - 1];
  const add = (line) => {
    const at = lastImport ? lastImport.getEnd() : 0;
    next = next.slice(0, at) + `\n${line}` + next.slice(at);
  };
  if (/\bstyleRules\(/.test(text) && !/import \{[^}]*\bstyleRules\b[^}]*\} from/.test(text)) {
    let path = relative(dirname(file), CSS_MODULE);
    if (!path.startsWith(".")) path = `./${path}`;
    add(`import { styleRules } from "${path}";`);
  }
  if (/<Fragment key=/.test(next) && !/\bFragment\b[^;]*from "react"/.test(next)) {
    const react = parse(file, next).statements.find(
      (statement) =>
        ts.isImportDeclaration(statement) && statement.moduleSpecifier.getText() === '"react"',
    );
    const named = react?.importClause?.namedBindings;
    if (named && ts.isNamedImports(named)) {
      const end = named.elements[named.elements.length - 1].getEnd();
      next = next.slice(0, end) + ", Fragment" + next.slice(end);
    } else add('import { Fragment } from "react";');
  }
  return next;
}

let changed = 0;
let wired = 0;
const touched = [];
for (const file of files) {
  const original = readFileSync(file, "utf8");
  let text = original;
  for (let next = wireOne(file, text); next !== null; next = wireOne(file, text)) {
    text = next;
    wired++;
    if (wired > 10000) throw new Error("wire-style-rules: no progress");
  }
  if (text === original) continue;
  changed++;
  touched.push(file);
  if (!check) writeFileSync(file, ensureImports(file, text));
}
if (!check && touched.length)
  execFileSync("pnpm", ["exec", "prettier", "--write", ...touched], { cwd: here, stdio: "ignore" });
for (const message of new Set(skipped)) console.warn(`skipped: ${message}`);
console.log(`${check ? "would wire" : "wired"} ${wired} element(s) in ${changed} file(s)`);
if (check && wired) process.exit(1);
