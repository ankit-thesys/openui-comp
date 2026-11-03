import type { ParseResult } from "@openuidev/react-lang";

/** What the host page records on `window.__iu`, for the checks to read. */
export type HostState = {
  react: string;
  program: string;
  /** Set once the Renderer has reported a parse. */
  rendered: boolean;
  parse: { meta: ParseResult["meta"]; hasRoot: boolean; rootType: string | null } | null;
  /** Errors the Renderer reported through `onError`. */
  renderErrors: string[];
  /** Problems with the page itself, such as an unknown program id. */
  hostErrors: string[];
  actions: { type: string; params: unknown }[];
};

declare global {
  interface Window {
    __iu: HostState;
  }
}
