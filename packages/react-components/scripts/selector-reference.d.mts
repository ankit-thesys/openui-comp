export type StableNames = Record<string, string | Record<string, string>>;
export interface ComponentNames {
  /** Folder under dist/components, or a shared helper's contract name. */
  component: string;
  /** Style module file name without `.styles.mjs` (or `.mjs` for shared helpers). */
  module: string;
  names: StableNames;
}
export function readStableNames(): Promise<ComponentNames[]>;
export function renderSelectorReference(entries: ComponentNames[]): string;
