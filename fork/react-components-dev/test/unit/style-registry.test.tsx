import {
  Button,
  configureStyles,
  createStyleRegistry,
  css,
  getComponentStyles,
  keyframes,
  type StyleRegistry,
} from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

it("marks a complete streaming payload so a partially received style tag is never consumed", () => {
  const registry = createStyleRegistry();
  expect(registry.flush()).toBe(`/*openui-stream*/${getComponentStyles()}/*openui-stream-end*/`);
  expect(registry.flush()).toBe("");
});

it("flushes only rules not yet emitted for this response without draining the full sheet", () => {
  const registry = createStyleRegistry();
  const early = css`
    color: rgb(41, 53, 67);
  `;
  renderToString(<div className={early}>Early</div>);
  const first = registry.flush();
  const cumulative = getComponentStyles();
  expect(first).toBe(`/*openui-stream*/${cumulative}/*openui-stream-end*/`);
  expect(first).toContain(`.${early}{color:rgb(41, 53, 67);}`);
  expect(registry.flush()).toBe("");

  const late = css`
    padding: 147px;
  `;
  renderToString(<div className={late}>Late</div>);
  expect(registry.flush()).toBe(`/*openui-stream*/.${late}{padding:147px;}/*openui-stream-end*/`);
  expect(registry.flush()).toBe("");
  expect(getComponentStyles()).toContain(cumulative);
  expect(getComponentStyles()).toContain(`.${late}{padding:147px;}`);
});

it("keeps interleaved responses independent, including rules cached before either render", () => {
  const a: StyleRegistry = createStyleRegistry();
  const html = renderToString(<Button>Cached</Button>);
  const b = createStyleRegistry();
  const firstB = b.flush();
  const firstA = a.flush();
  expect(firstA).toBe(firstB);
  const names = [...html.matchAll(/class="([^"]+)"/g)]
    .flatMap((match) => match[1]!.split(" "))
    .filter((name) => /^go\d+$/.test(name));
  expect(names.length).toBeGreaterThan(0);
  for (const name of names) expect(firstA).toContain(`.${name}`);

  const late = css`
    margin: 147px;
  `;
  const delta = `/*openui-stream*/.${late}{margin:147px;}/*openui-stream-end*/`;
  expect(a.flush()).toBe(delta);
  expect(b.flush()).toBe(delta);
  expect(a.flush()).toBe("");
  expect(b.flush()).toBe("");
  expect(createStyleRegistry().flush()).toBe(
    `/*openui-stream*/${getComponentStyles()}/*openui-stream-end*/`,
  );
});

it("wraps each delta, including late keyframes, in the layer configured at flush time", () => {
  const registry = createStyleRegistry();
  registry.flush();
  const animation = keyframes`from { opacity: 0.147; } to { opacity: 0.741; }`;
  const name = css`
    animation: ${animation} 147ms linear;
  `;
  configureStyles({ layer: "app.openui" });
  try {
    const delta = registry.flush();
    expect(delta).toBe(
      `/*openui-stream*/@layer app.openui{@keyframes ${animation}{from{opacity:0.147;}to{opacity:0.741;}}.${name}{animation:${animation} 147ms linear;}}/*openui-stream-end*/`,
    );
    expect(registry.flush()).toBe("");
    expect(getComponentStyles()).toContain(
      `@keyframes ${animation}{from{opacity:0.147;}to{opacity:0.741;}}.${name}{animation:${animation} 147ms linear;}`,
    );
  } finally {
    configureStyles({ layer: undefined });
  }
});
