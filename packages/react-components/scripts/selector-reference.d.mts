export type StableNames = Record<string, string | Record<string, string>>;
export interface ComponentNames {
  /** Folder under dist/components, nested folders joined with "/". */
  component: string;
  /** Style module file name without `.styles.mjs`. */
  module: string;
  names: StableNames;
}
export function readStableNames(): Promise<ComponentNames[]>;
export function renderSelectorReference(entries: ComponentNames[]): string;
