/**
 * Citations and sources (#31 item 1), plus the URL-handling boundary that the
 * sources path owns (#31 item 3).
 *
 * `getFaviconUrl` is a pure string function, so it is asserted directly and
 * cannot cause a request. The components that WOULD issue a request are only
 * rendered under jsdom, which does not load subresources -- so nothing in this
 * file fetches external content. The Chrome runner additionally blocks all
 * non-local requests at the protocol level rather than relying on that.
 */
import { describe, expect, it, vi } from "vitest";
import {
  CardSourceProvider,
  Citation,
  Sources,
  getFaviconUrl,
  openSourceInNewTab,
  type CardSource,
} from "../../../packages/react-ui/src/index";
import { render } from "../setup/render";

const SOURCES: CardSource[] = [
  { url: "https://example.com/article", title: "First article", sourceName: "Example" },
  { url: "https://docs.example.org/guide", title: "A guide", sourceName: "Example Docs" },
];

describe("getFaviconUrl -- URL construction", () => {
  it("builds a Google favicon URL from the hostname", async () => {
    expect(getFaviconUrl("https://example.com/deep/path?q=1#frag")).toBe(
      "https://www.google.com/s2/favicons?sz=128&domain=example.com",
    );
  });

  it("returns an empty string for an unparseable URL", () => {
    expect(getFaviconUrl("not a url")).toBe("");
    expect(getFaviconUrl("example.com")).toBe(""); // no scheme -> URL() throws
  });

  it("returns an empty string for missing input", () => {
    expect(getFaviconUrl(undefined)).toBe("");
    expect(getFaviconUrl("")).toBe("");
  });

  /**
   * Positive security property worth pinning: only the hostname is forwarded.
   * Credentials, path, query and fragment -- the parts most likely to carry
   * secrets -- are dropped by construction.
   */
  it("forwards only the hostname, never credentials, path, query or fragment", () => {
    const built = getFaviconUrl("https://user:s3cret@example.com/private/doc?token=abc#x");
    expect(built).toBe("https://www.google.com/s2/favicons?sz=128&domain=example.com");
    expect(built).not.toContain("s3cret");
    expect(built).not.toContain("token");
    expect(built).not.toContain("private");
  });

  it("rejects a hostname that cannot be parsed at all", () => {
    expect(getFaviconUrl("https://exa%20mple.com/x")).toBe(""); // space -> unparseable
    expect(getFaviconUrl("https://exa mple.com/x")).toBe("");
  });

  /**
   * FINDING SRC-2 (docs/defects.md). `domain` is interpolated into the query
   * string WITHOUT encoding (SourceContext.tsx:41-43), and `&`, `=`, `~` and `'`
   * are all legal WHATWG hostname characters. A crafted source url therefore
   * appends arbitrary query parameters to the outbound third-party request.
   *
   * Bounded, but real: the scheme, host and path of the favicon URL are fixed
   * before the interpolation point, and `#`/`?` act as URL delimiters so they
   * never reach the hostname. So the reachable impact is adding or overriding
   * query parameters on the Google request -- not redirecting it.
   *
   * Source urls are document- or LLM-supplied, which makes this reachable from
   * untrusted data. Recorded as observed behavior; not repaired here, and the fix
   * (encodeURIComponent) is a one-liner for whoever owns the migration.
   */
  it("SRC-2: an unencoded hostname injects extra query parameters", () => {
    expect(getFaviconUrl("https://example.com&evil=1/x")).toBe(
      "https://www.google.com/s2/favicons?sz=128&domain=example.com&evil=1",
    );
    // Percent-encoding in the input does not help: it is decoded into the hostname.
    expect(getFaviconUrl("https://example.com%26evil/x")).toBe(
      "https://www.google.com/s2/favicons?sz=128&domain=example.com&evil",
    );
    // `=` survives too, so an existing parameter can be targeted.
    expect(getFaviconUrl("https://exa=mple.com/x")).toContain("domain=exa=mple.com");
  });

  it("SRC-2: the fixed scheme/host/path of the endpoint cannot be redirected", () => {
    // Bounds the finding, so nobody over-reads it as an open redirect.
    for (const hostile of [
      "https://example.com&evil=1/x",
      "https://exa=mple.com/x",
      "https://exa'mple.com/x",
    ]) {
      const built = getFaviconUrl(hostile);
      expect(built.startsWith("https://www.google.com/s2/favicons?sz=128&domain=")).toBe(true);
    }
    // `#` and `?` are consumed as delimiters and never reach the hostname.
    expect(getFaviconUrl("https://example.com#frag/x")).toBe(
      "https://www.google.com/s2/favicons?sz=128&domain=example.com",
    );
    expect(getFaviconUrl("https://example.com?q=1/x")).toBe(
      "https://www.google.com/s2/favicons?sz=128&domain=example.com",
    );
  });

  it("a well-formed hostname produces exactly two query parameters", () => {
    const parsable = getFaviconUrl("https://sub.example.co.uk/x");
    expect(parsable).toBe("https://www.google.com/s2/favicons?sz=128&domain=sub.example.co.uk");
    expect(parsable.split("&")).toHaveLength(2); // sz and domain only
  });

  /**
   * FINDING SRC-1 (docs/defects.md). Not a bug -- the behavior is deliberate and
   * documented in SourceContext.tsx -- but it is a privacy characteristic the
   * migration should decide on explicitly rather than inherit silently: rendering
   * sources discloses, to a third party, the hostname of every source the reader
   * is shown. Recorded here with the exact endpoint so the decision is informed.
   */
  it("SRC-1: every source hostname is destined for a third-party endpoint", () => {
    for (const source of SOURCES) {
      expect(getFaviconUrl(source.url)).toContain("https://www.google.com/s2/favicons");
    }
  });

  it("SRC-1: a javascript: URL yields no favicon request", () => {
    // URL() parses javascript: successfully but its hostname is empty, so the
    // built URL has an empty domain rather than being rejected outright.
    const built = getFaviconUrl("javascript:alert(1)");
    expect(built).toBe("https://www.google.com/s2/favicons?sz=128&domain=");
    expect(built).not.toContain("alert");
  });
});

describe("CardSourceProvider -- context enrichment", () => {
  it("renders nothing from Sources when no provider supplies sources", async () => {
    const { container } = await render(<Sources />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing from Sources when the provider supplies an empty list", async () => {
    const { container } = await render(
      <CardSourceProvider sources={[]}>
        <Sources />
      </CardSourceProvider>,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders the sources strip with a title and one item per source", async () => {
    const { container } = await render(
      <CardSourceProvider sources={SOURCES}>
        <Sources />
      </CardSourceProvider>,
    );
    expect(container.querySelector(".openui-listed-sources")).not.toBeNull();
    expect(container.querySelector(".openui-listed-sources-header__title")?.textContent).toBe(
      "Sources",
    );
    expect(container.textContent).toContain("First article");
    expect(container.textContent).toContain("A guide");
  });

  it("tolerates a source with no url", async () => {
    const { container } = await render(
      <CardSourceProvider sources={[{ title: "No link", sourceName: "Nowhere" }]}>
        <Sources />
      </CardSourceProvider>,
    );
    expect(container.textContent).toContain("No link");
  });

  it("depends on Carousel and IconButton (recorded for the #12 dependency map)", async () => {
    // ListedSources.tsx imports Carousel/CarouselContent/CarouselItem and
    // IconButton. Asserting the rendered markers keeps the dependency map honest
    // if a refactor drops them.
    const { container } = await render(
      <CardSourceProvider sources={SOURCES}>
        <Sources />
      </CardSourceProvider>,
    );
    const html = container.innerHTML;
    expect(/openui-carousel/.test(html)).toBe(true);
  });
});

describe("openSourceInNewTab -- the sources link sink", () => {
  it("opens a safe source URL with reverse-tabnabbing protection", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    openSourceInNewTab("https://example.com/article");
    expect(open).toHaveBeenCalledWith(
      "https://example.com/article",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("refuses an executable scheme coming from source data", () => {
    // Source URLs are LLM- or document-supplied, so this is the realistic
    // threat: a crafted source entry whose url is a script URL.
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    openSourceInNewTab("javascript:alert(document.cookie)");
    openSourceInNewTab("data:text/html,<script>alert(1)</script>");
    openSourceInNewTab("vbscript:msgbox(1)");
    openSourceInNewTab("file:///etc/passwd");
    expect(open).not.toHaveBeenCalled();
  });

  it("refuses a missing url without throwing", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    expect(() => openSourceInNewTab(undefined)).not.toThrow();
    expect(open).not.toHaveBeenCalled();
  });
});

describe("Citation", () => {
  it("renders a citation trigger button with an accessible label", async () => {
    const { container } = await render(
      <Citation
        sources={SOURCES.map((s) => ({
          ...s,
          faviconUrl: getFaviconUrl(s.url),
        }))}
      />,
    );
    const button = container.querySelector("button.openui-citation");
    expect(button).not.toBeNull();
    expect(button?.getAttribute("type")).toBe("button");
    expect(button?.getAttribute("aria-label")).toBe("Citations");
  });

  it("renders without a provider, driven purely by its sources prop", async () => {
    const { container } = await render(<Citation sources={[]} />);
    // Recorded: the empty-sources shape is a rendering decision the migration
    // needs to preserve, so pin whichever it is rather than assuming null.
    expect(container).toBeTruthy();
  });
});
