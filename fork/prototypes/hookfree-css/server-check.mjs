// PROTOTYPE: run with `node server-check.mjs`. No document: goober takes its server path.
import { button } from "./fake-button.mjs"; // hoisted: registers before configureStyles below
import { configureStyles, getComponentStyles, writes } from "./hookfree-css.mjs";

const check = (label, ok, detail = "") => console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  (${detail})` : ""}`);

console.log("button class:", button);
check("rule registered before configure", getComponentStyles().includes(`.${button}{`));
check("unlayered before configure", !getComponentStyles().startsWith("@layer"));

configureStyles({ layer: "openui" });
const sheet = getComponentStyles();
check("import-time rule is layered after a later configure", sheet.startsWith("@layer openui{") && sheet.includes(`.${button}{`));

const { card } = await import("./lazy-card.mjs");
const after = getComponentStyles();
check("lazy rule lands inside the same layer", after.startsWith("@layer openui{") && after.includes(`.${card}{`) && after.endsWith("}"));
check("keyframes inside the layer", /@layer openui\{.*@keyframes go\w+/.test(after));
check("one layer wrapper, not one per rule", after.split("@layer").length - 1 === 1);

configureStyles({ layer: undefined });
check("reconfigure to unlayered rewrites the sheet", !getComponentStyles().includes("@layer") && getComponentStyles().includes(`.${card}{`));

console.log("\nwrites:", writes.map((w) => `${w.reason}[${w.layer ?? "-"}]`).join(" → "));
console.log("\nsheet (unlayered now):\n" + getComponentStyles());
