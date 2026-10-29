import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Image,
  ImageBlock,
  ImageGallery,
  ImageText,
  ImageTextLarge,
} from "openui-under-test";
import { useEffect } from "react";

export type MediaFamily =
  | "image"
  | "image-block"
  | "image-text"
  | "image-text-large"
  | "image-gallery"
  | "image-gallery-modal"
  | "carousel";
export const mediaImage = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="360" height="240"><rect width="360" height="240" fill="#6286ab"/><circle cx="180" cy="120" r="70" fill="#e1b267"/></svg>')}`;
export const mediaImages = Array.from({ length: 12 }, (_, i) => ({
  src: mediaImage,
  alt: `Photo ${i + 1}`,
}));
declare const __PARITY_BASELINE__: boolean;
const old = __PARITY_BASELINE__;
export const mediaClass = (part: string) =>
  old
    ? (
        {
          gallery: "openui-gallery",
          tile: "openui-gallery__image",
          modal: "openui-gallery__modal",
          track: "openui-gallery__modal-carousel",
        } as Record<string, string>
      )[part]
    : (
        {
          gallery: "openui-image-gallery",
          tile: "openui-image-gallery-image",
          modal: "openui-image-gallery-modal",
          track: "openui-image-gallery-modal-carousel",
        } as Record<string, string>
      )[part];

export function MediaCases({ family, parity = false }: { family: MediaFamily; parity?: boolean }) {
  useEffect(() => {
    if (!parity) return;
    let frame = 0;
    let opened = false;
    const ready = () => {
      if (family === "image-gallery-modal" && !opened) {
        document.querySelector<HTMLElement>(`.${mediaClass("tile")}`)?.click();
        opened = true;
      }
      const modal = document.querySelector<HTMLElement>(`.${mediaClass("modal")}`);
      if (
        (family === "image-gallery-modal" && !modal) ||
        // Carousel measures overflow in an effect. Label parts only after every requested
        // control (including its icon) has mounted, in both #72 and the current build.
        (family === "carousel" &&
          [...document.querySelectorAll('[data-case$="-true"]')].some(
            (root) => !root.querySelector('[aria-label="Next card"] svg'),
          )) ||
        [...document.images].some((img) => !img.src.endsWith("/media-pending.svg") && !img.complete)
      ) {
        frame = requestAnimationFrame(ready);
        return;
      }
      if (modal) {
        const track = modal.querySelector<HTMLElement>(`.${mediaClass("track")}`)!;
        track.scrollLeft = 100;
        // Wait for both measurement-only controls before exposing the portal parity case.
        if (
          !modal.querySelector('[aria-label="Scroll images left"]') ||
          !modal.querySelector('[aria-label="Scroll images right"]')
        ) {
          frame = requestAnimationFrame(ready);
          return;
        }
        modal.setAttribute("data-case", "portal-middle");
        modal.setAttribute("data-parity-target", '[id="openui-gallery-modal-heading"]');
      }
      document.querySelectorAll("[data-case]").forEach((root) => {
        root
          .querySelectorAll("*")
          .forEach((part, i) =>
            part.setAttribute("data-parity-part", `${part.tagName.toLowerCase()}-${i}`),
          );
        root.setAttribute("data-parity-case", root.getAttribute("data-case")!);
      });
      if (modal) {
        // These stay visible at the middle offset, clear of the left scroll control.
        const selected = modal.querySelector<HTMLElement>('[aria-label="Photo 2"][aria-pressed]')!;
        selected.click();
        for (const [label, name] of [
          ["Photo 2", "selected"],
          ["Photo 3", "inactive"],
        ]) {
          const thumb = modal.querySelector<HTMLElement>(`[aria-label="${label}"][aria-pressed]`)!;
          thumb.setAttribute("data-parity-case", `thumbnail-${name}`);
          thumb.setAttribute("data-parity-parts", JSON.stringify({ image: "img" }));
        }
      }
    };
    frame = requestAnimationFrame(ready);
    return () => cancelAnimationFrame(frame);
  }, [family, parity]);
  const wrap = (id: string, child: React.ReactNode, width = 600) => (
    <section
      key={id}
      data-case={id}
      onClickCapture={family === "image-gallery" && parity ? (e) => e.stopPropagation() : undefined}
      style={{ width, maxWidth: "100%", marginBottom: 24 }}
    >
      {child}
    </section>
  );
  if (family === "image")
    return (
      <>
        {(["1:1", "3:2", "3:4", "4:3", "16:9"] as const).flatMap((aspectRatio) =>
          (["fit", "fill"] as const).map((scale) =>
            wrap(
              `${aspectRatio}-${scale}`,
              <Image src={mediaImage} alt="Landscape" aspectRatio={aspectRatio} scale={scale} />,
              180,
            ),
          ),
        )}
      </>
    );
  if (family === "image-block")
    return (
      <>
        {wrap("desktop-loaded", <ImageBlock src={mediaImage} alt="Loaded" imageLoading={false} />)}
        {wrap(
          "mobile-loaded",
          <ImageBlock src={mediaImage} alt="Mobile" imageLoading={false} />,
          320,
        )}
        {wrap("loading", <ImageBlock src="/media-pending.svg" alt="Loading" />, 320)}
      </>
    );
  if (family === "image-text")
    return (
      <>
        {(["horizontal", "vertical"] as const).flatMap((layout) =>
          [false, true].flatMap((bold) =>
            [undefined, 64].map((imageSize) =>
              wrap(
                `${layout}-${bold}-${imageSize ?? "default"}`,
                <ImageText
                  src={mediaImage}
                  title="Title"
                  subtitle="Subtitle"
                  layout={layout}
                  bold={bold}
                  imageSize={imageSize}
                />,
                300,
              ),
            ),
          ),
        )}
      </>
    );
  if (family === "image-text-large")
    return (
      <>
        {wrap("banner", <ImageTextLarge src={mediaImage} title="Title" subtitle="Subtitle" />)}
        {wrap("title-only", <ImageTextLarge src={mediaImage} title="Title" />, 320)}
      </>
    );
  if (family === "image-gallery-modal")
    return (
      <div style={{ width: 600 }}>
        <ImageGallery images={mediaImages} />
      </div>
    );
  if (family === "image-gallery")
    return (
      <>
        {[1, 2, 3, 4, 5, 6].map((count) =>
          wrap(`count-${count}`, <ImageGallery images={mediaImages.slice(0, count)} />),
        )}
      </>
    );
  return (
    <>
      {(["card", "sunk"] as const).flatMap((variant) =>
        [false, true].flatMap((noSnap) =>
          [false, true].map((showButtons) =>
            wrap(
              `${variant}-${noSnap}-${showButtons}`,
              <Carousel variant={variant} noSnap={noSnap} showButtons={showButtons}>
                <CarouselContent>
                  {[1, 2, 3, 4].map((i) => (
                    <CarouselItem key={i}>Card {i}</CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious aria-label="Previous card" icon={<svg />} />
                <CarouselNext aria-label="Next card" icon={<svg />} />
              </Carousel>,
              600,
            ),
          ),
        ),
      )}
    </>
  );
}
