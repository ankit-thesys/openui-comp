/**
 * Public URL-safety contract: `safeUrl` and `safeOpenUrl`.
 *
 * These are package-root exports (packages/react-ui/src/index.ts:139), not
 * internals, so asserting them directly is testing the public contract rather
 * than mirroring an implementation. They matter to #31 because `Sources`'
 * public `openSourceInNewTab` delegates to `safeOpenUrl`, which makes this the
 * security gate for every in-scope link sink.
 *
 * Expectations below are derived from the DOCUMENTED contract -- "reject URLs
 * whose scheme can execute JS in the host origin", "defaults target to _blank
 * and features to noopener,noreferrer" -- not from re-reading the regex. Where
 * observed behavior is narrower than a reader of that sentence would expect, the
 * test records what actually happens and the finding is written up in
 * docs/defects.md rather than asserted as desired behavior.
 *
 * No network: `safeUrl` is pure, and `window.open` is stubbed. Nothing here
 * fetches external content.
 */
import { describe, expect, it, vi } from "vitest";
import { safeOpenUrl, safeUrl } from "../../../packages/react-ui/src/index";

/** Schemes the contract explicitly names as executable in the host origin. */
const EXECUTABLE_SCHEMES = ["javascript", "data", "vbscript", "file"];

describe("safeUrl -- rejects executable schemes", () => {
  for (const scheme of EXECUTABLE_SCHEMES) {
    it(`rejects ${scheme}:`, () => {
      expect(safeUrl(`${scheme}:payload`)).toBeUndefined();
    });

    it(`rejects ${scheme}: regardless of case`, () => {
      const mixed = scheme
        .split("")
        .map((c, i) => (i % 2 ? c.toUpperCase() : c))
        .join("");
      expect(safeUrl(`${mixed}:payload`)).toBeUndefined();
    });

    it(`rejects ${scheme}: with leading whitespace`, () => {
      expect(safeUrl(`   \n\t ${scheme}:payload`)).toBeUndefined();
    });
  }

  it("rejects ASCII-control obfuscation inside the scheme", () => {
    // Browsers strip ASCII control characters when parsing a scheme, so these
    // all resolve to `javascript:` in a real navigation.
    expect(safeUrl("java\tscript:alert(1)")).toBeUndefined();
    expect(safeUrl("java\nscript:alert(1)")).toBeUndefined();
    expect(safeUrl("java\rscript:alert(1)")).toBeUndefined();
    expect(safeUrl("java\u0000script:alert(1)")).toBeUndefined();
    expect(safeUrl("java\u001Fscript:alert(1)")).toBeUndefined();
    expect(safeUrl("java\u007Fscript:alert(1)")).toBeUndefined();
  });
});

describe("safeUrl -- allows ordinary navigable URLs", () => {
  const allowed = [
    "https://example.com/a?b=c#d",
    "http://example.com",
    "mailto:someone@example.com",
    "tel:+15555550123",
    "/relative/path",
    "./sibling",
    "#anchor-only",
    "example.com/no-scheme",
  ];

  for (const url of allowed) {
    it(`allows ${JSON.stringify(url)}`, () => {
      expect(safeUrl(url)).toBe(url);
    });
  }

  it("trims surrounding whitespace and returns the trimmed value", () => {
    expect(safeUrl("  https://example.com  ")).toBe("https://example.com");
  });
});

describe("safeUrl -- empty and non-string input", () => {
  it("returns undefined for nullish input", () => {
    expect(safeUrl(undefined)).toBeUndefined();
    expect(safeUrl(null)).toBeUndefined();
  });

  it("returns undefined for empty or whitespace-only input", () => {
    expect(safeUrl("")).toBeUndefined();
    expect(safeUrl("    ")).toBeUndefined();
    expect(safeUrl("\n\t ")).toBeUndefined();
  });

  it("returns undefined for a non-string, without throwing", () => {
    // A JS consumer (or LLM-shaped JSON) can pass anything; the gate must not
    // throw, because a throw inside a render is worse than a rejected URL.
    expect(safeUrl(42 as unknown as string)).toBeUndefined();
    expect(safeUrl({} as unknown as string)).toBeUndefined();
    expect(safeUrl([] as unknown as string)).toBeUndefined();
  });
});

describe("safeUrl -- observed boundaries of the policy", () => {
  /**
   * FINDING SU-1 (see docs/defects.md). The denylist names four schemes. `blob:`
   * is not among them, so it is returned as safe. A `blob:` URL can carry an HTML
   * document, and navigating to one created by the page's own origin executes in
   * that origin. This is RECORDED, not asserted as correct: it is observed
   * baseline behavior and a scope decision for the migration, not something this
   * ticket may change.
   */
  it("SU-1: blob: is NOT rejected (recorded, not endorsed)", () => {
    expect(safeUrl("blob:https://example.com/0b1c2d3e")).toBe("blob:https://example.com/0b1c2d3e");
  });

  /**
   * FINDING SU-2 (see docs/defects.md). The implementation comment claims NBSP is
   * handled "via String.trim". `String.prototype.trim` does remove U+00A0, but
   * only at the ENDS of the string; the control-character strip covers
   * U+0000-U+001F and U+007F, which excludes U+00A0. So an NBSP placed INSIDE the
   * scheme is not normalized away and the string is returned as safe.
   *
   * Whether that is exploitable depends on whether a browser coerces
   * `java script:` to `javascript:` -- NBSP is not ASCII whitespace, so it
   * most likely does not. The Chrome runner settles that question empirically
   * (browser/scenarios: su-2-nbsp); this test only pins the gate's own output.
   */
  it("SU-2: an NBSP inside the scheme is not normalized away (recorded)", () => {
    const withNbsp = "java script:alert(1)";
    expect(safeUrl(withNbsp)).toBe(withNbsp);
  });

  /**
   * The gate returns the TRIMMED ORIGINAL, not the control-stripped normalized
   * form. So a URL with a safe scheme keeps interior control characters, and the
   * consumer (or the browser) is what ultimately removes them.
   */
  it("returns the original, not the normalized, form for a safe scheme", () => {
    const withTab = "https://exa\tmple.com/path";
    expect(safeUrl(withTab)).toBe(withTab);
  });
});

describe("safeOpenUrl -- the single allowed window.open entry point", () => {
  it("opens a safe URL with _blank and noopener,noreferrer by default", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    safeOpenUrl("https://example.com");
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith("https://example.com", "_blank", "noopener,noreferrer");
  });

  it("does not call window.open at all for a rejected URL", () => {
    // The important half of the contract: rejection must mean "no navigation",
    // not "navigate to something sanitized".
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    for (const scheme of EXECUTABLE_SCHEMES) {
      safeOpenUrl(`${scheme}:payload`);
    }
    safeOpenUrl("java\tscript:alert(1)");
    safeOpenUrl("");
    safeOpenUrl(undefined);
    expect(open).not.toHaveBeenCalled();
  });

  it("returns null for a rejected URL and forwards the window for a safe one", () => {
    const fakeWindow = {} as Window;
    const open = vi.spyOn(window, "open").mockReturnValue(fakeWindow);
    expect(safeOpenUrl("javascript:alert(1)")).toBeNull();
    expect(open).not.toHaveBeenCalled();
    expect(safeOpenUrl("https://example.com")).toBe(fakeWindow);
  });

  it("honours an explicit target and features", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    safeOpenUrl("https://example.com", "_self", "noopener");
    expect(open).toHaveBeenCalledWith("https://example.com", "_self", "noopener");
  });
});
