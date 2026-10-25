/**
 * Minimal React 19 render helper.
 *
 * Adapted for #31 from validation/friend-controls-baseline/setup/render.tsx,
 * which #31 permits reading as an example. Unchanged in substance: the problem
 * it solves is identical.
 *
 * `@testing-library/react` is not in this repository's lockfile, so there is
 * no `render()` to reuse. Rather than add a dependency (out of scope for #31),
 * this wraps `react-dom/client` + React 19's own `act` and then hands the
 * container to `@storybook/test`'s `within()` for the usual queries.
 *
 * Deliberately tiny: it mounts, it unmounts, it re-renders. Anything else a
 * test needs should be an explicit user interaction via `userEvent`.
 */
import { within } from "@storybook/test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";

export type RenderResult = ReturnType<typeof within> & {
  container: HTMLElement;
  /** The portal-friendly root: use for queries that may escape the container. */
  baseElement: HTMLElement;
  rerender: (ui: ReactElement) => Promise<void>;
  unmount: () => void;
};

const activeRoots = new Set<{ root: Root; container: HTMLElement }>();

export const cleanup = () => {
  for (const entry of activeRoots) {
    act(() => entry.root.unmount());
    entry.container.remove();
  }
  activeRoots.clear();
};

export const render = async (ui: ReactElement): Promise<RenderResult> => {
  const container = document.createElement("div");
  container.setAttribute("data-baseline-container", "");
  document.body.appendChild(container);

  const root = createRoot(container);
  const entry = { root, container };
  activeRoots.add(entry);

  await act(async () => {
    root.render(ui);
  });

  const queries = within(container);

  return {
    ...queries,
    container,
    baseElement: document.body,
    rerender: async (next: ReactElement) => {
      await act(async () => {
        root.render(next);
      });
    },
    unmount: () => {
      act(() => root.unmount());
      container.remove();
      activeRoots.delete(entry);
    },
  };
};

/**
 * Queries scoped to `document.body` instead of the render container.
 * Radix-based controls (Select, DatePicker, Modal) render their popups into a
 * portal appended to the body, so content there is invisible to `within(container)`.
 */
export const inBody = (): ReturnType<typeof within> => within(document.body);
