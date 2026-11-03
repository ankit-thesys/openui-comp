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
  /**
   * Every action the Renderer handed to `onAction`, in order. `passedOn` is true when
   * `runLibraryAction` returned null, so the host ran it itself (the README's pattern).
   */
  actions: {
    type: string;
    params: unknown;
    humanFriendlyMessage: string;
    formState?: Record<string, unknown>;
    formName?: string;
    passedOn: boolean;
  }[];
};

declare global {
  interface Window {
    __iu: HostState;
    /** With `stream=1`, replaces the response the Renderer is given, as a chat streams one in. */
    __iuStream?: (response: string, streaming: boolean) => void;
  }
}
