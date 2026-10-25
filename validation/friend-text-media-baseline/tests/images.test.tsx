/**
 * Image, ImageBlock and SourceFaviconImage: loading, error and content states
 * (#31 item 1).
 *
 * HARNESS HONESTY: jsdom never loads subresources, so `onLoad`/`onError` never
 * fire on their own and `naturalWidth`/`naturalHeight` are always 0. Every state
 * transition below is driven by dispatching the DOM event the browser would
 * dispatch, with natural dimensions defined per case. That makes these
 * SIMULATIONS of a browser event rather than observations of real decoding,
 * which is why the same transitions are re-verified against real local image
 * files in the Chrome runner (browser/run.mjs, scenarios img-*).
 *
 * No test points at a remote URL: nothing here can fetch external content.
 */
import { describe, expect, it, vi } from "vitest";
import { act } from "react";
import {
  Image,
  ImageBlock,
  SourceFaviconImage,
} from "../../../packages/react-ui/src/index";
import { render } from "../setup/render";

/** Local, inert data URI: a 1x1 transparent GIF. Never leaves the process. */
const INERT_SRC =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/** Give an <img> the natural dimensions a browser would report after decoding. */
const setNatural = (img: HTMLImageElement, width: number, height: number) => {
  Object.defineProperty(img, "naturalWidth", { value: width, configurable: true });
  Object.defineProperty(img, "naturalHeight", { value: height, configurable: true });
};

const fire = async (el: Element, type: "load" | "error") => {
  await act(async () => {
    el.dispatchEvent(new Event(type));
  });
};

describe("Image -- defaults and public props", () => {
  it("renders an <img> inside a Radix AspectRatio wrapper", async () => {
    const { container } = await render(<Image src={INERT_SRC} alt="probe" />);
    const img = container.querySelector("img.openui-image");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("alt")).toBe("probe");
  });

  it("defaults to scale=fill, giving the openui-image-fill class", async () => {
    const { container } = await render(<Image src={INERT_SRC} alt="d" />);
    expect(container.querySelector("img")?.className).toContain("openui-image-fill");
  });

  it("honours scale=fit", async () => {
    const { container } = await render(<Image src={INERT_SRC} alt="d" scale="fit" />);
    const cls = container.querySelector("img")?.className ?? "";
    expect(cls).toContain("openui-image-fit");
    expect(cls).not.toContain("openui-image-fill");
  });

  it("forwards a ref to the underlying <img>", async () => {
    let captured: HTMLImageElement | null = null;
    await render(
      <Image
        ref={(el) => {
          captured = el;
        }}
        src={INERT_SRC}
        alt="r"
      />,
    );
    expect(captured).toBeInstanceOf(HTMLImageElement);
  });

  it("applies the `styles` prop to the image element", async () => {
    // Note the prop is `styles`, not `style` -- an easy migration trap.
    const { container } = await render(
      <Image src={INERT_SRC} alt="s" styles={{ opacity: 0.5 }} />,
    );
    expect((container.querySelector("img") as HTMLElement).style.opacity).toBe("0.5");
  });
});

describe("Image -- error state", () => {
  it("adds openui-image--error after the image fails to load", async () => {
    const { container } = await render(<Image src={INERT_SRC} alt="e" />);
    const img = container.querySelector("img")!;
    expect(img.className).not.toContain("openui-image--error");
    await fire(img, "error");
    expect(container.querySelector("img")!.className).toContain("openui-image--error");
  });

  it("clears the error class if a later load succeeds", async () => {
    const { container } = await render(<Image src={INERT_SRC} alt="e" />);
    const img = container.querySelector("img")!;
    await fire(img, "error");
    expect(container.querySelector("img")!.className).toContain("openui-image--error");
    await fire(container.querySelector("img")!, "load");
    expect(container.querySelector("img")!.className).not.toContain("openui-image--error");
  });

  /**
   * FINDING IMG-1 (docs/defects.md). Image.tsx:44-52 sets its own onLoad/onError
   * and THEN spreads `{...rest}`. Because onLoad/onError are part of
   * ImgHTMLAttributes and are not destructured out, a consumer-supplied handler
   * replaces the internal one, and the component's own error tracking --
   * the only thing that applies `openui-image--error` -- stops working.
   *
   * Supplying onError for logging is an ordinary, documented-looking thing for a
   * consumer to do, so this silently disables the error styling.
   */
  it("IMG-1: a consumer onError replaces the internal handler, losing the error class", async () => {
    const onError = vi.fn();
    const { container } = await render(<Image src={INERT_SRC} alt="e" onError={onError} />);
    const img = container.querySelector("img")!;
    await fire(img, "error");

    expect(onError).toHaveBeenCalledTimes(1);
    // The consumer's handler ran, but the internal state never updated.
    expect(container.querySelector("img")!.className).not.toContain("openui-image--error");
  });

  it("IMG-1 CONTROL: without a consumer handler the same event does set the class", async () => {
    // Same component, same event, only the extra prop differs -- so the cause is
    // the prop override, not the event dispatch.
    const { container } = await render(<Image src={INERT_SRC} alt="e" />);
    await fire(container.querySelector("img")!, "error");
    expect(container.querySelector("img")!.className).toContain("openui-image--error");
  });
});

describe("ImageBlock", () => {
  it("renders its image and is driven by public props", async () => {
    const { container } = await render(<ImageBlock src={INERT_SRC} alt="block" />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("alt")).toBe("block");
  });
});

describe("SourceFaviconImage -- globe fallback heuristic", () => {
  it("renders an <img> for a non-empty url before any load event", async () => {
    const { container } = await render(
      <SourceFaviconImage url={INERT_SRC} alt="favicon" width={32} height={32} />,
    );
    expect(container.querySelector("img.openui-source-favicon-image")).not.toBeNull();
  });

  it("falls back to the globe icon when url is empty", async () => {
    const { container } = await render(
      <SourceFaviconImage url="" alt="favicon" width={32} height={32} />,
    );
    expect(container.querySelector("img.openui-source-favicon-image")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("falls back to the globe icon on a load error", async () => {
    const { container } = await render(
      <SourceFaviconImage url={INERT_SRC} alt="favicon" width={32} height={32} />,
    );
    await fire(container.querySelector("img")!, "error");
    expect(container.querySelector("img.openui-source-favicon-image")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("treats a successful load of a <=16x16 image as a miss and shows the globe", async () => {
    // Documented behavior: Google's favicon service returns a 16x16 placeholder
    // when it has nothing better, so the component treats that size as a failure.
    const { container } = await render(
      <SourceFaviconImage url={INERT_SRC} alt="favicon" width={32} height={32} />,
    );
    const img = container.querySelector("img")!;
    setNatural(img, 16, 16);
    await fire(img, "load");
    expect(container.querySelector("img.openui-source-favicon-image")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("keeps a successfully loaded larger image", async () => {
    const { container } = await render(
      <SourceFaviconImage url={INERT_SRC} alt="favicon" width={32} height={32} />,
    );
    const img = container.querySelector("img")!;
    setNatural(img, 64, 64);
    await fire(img, "load");
    expect(container.querySelector("img.openui-source-favicon-image")).not.toBeNull();
  });

  it("gives a new url a fresh chance after a previous failure", async () => {
    // The url-keyed effect resets the error state; without it the globe would
    // stay pinned for every later url.
    const { container, rerender } = await render(
      <SourceFaviconImage url={INERT_SRC} alt="favicon" width={32} height={32} />,
    );
    await fire(container.querySelector("img")!, "error");
    expect(container.querySelector("img.openui-source-favicon-image")).toBeNull();

    await rerender(
      <SourceFaviconImage url={INERT_SRC + "#second"} alt="favicon" width={32} height={32} />,
    );
    expect(container.querySelector("img.openui-source-favicon-image")).not.toBeNull();
  });
});
