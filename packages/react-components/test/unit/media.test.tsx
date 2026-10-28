import {
  Carousel,
  CarouselContent,
  CarouselItem,
  Image,
  ImageBlock,
  ImageGallery,
  ImageText,
  ImageTextLarge,
} from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

it("Image emits default scale and aspect-ratio modifiers and CSS-owned aspect parts", () => {
  const html = renderToString(<Image src="image.png" alt="Example" />);
  expect(html).toContain("openui-image--scale-fill");
  expect(html).toContain("openui-image-aspect--aspect-ratio-3-2");
  expect(html).toContain("openui-image-viewport");
  expect(html).not.toContain("style=");
});

it("ImageBlock exposes loading and responsive states without state classes", () => {
  const html = renderToString(<ImageBlock src="image.png" alt="Example" />);
  expect(html).toMatch(/class="[^"]*openui-image-block(?: |")/);
  expect(html).toContain('data-breakpoint="mobile"');
  expect(html).toContain('data-loading="true"');
  expect(html).not.toContain("openui-image-block-wrapper--mobile");
});

it("ImageText records layout and bold and leaves numeric image size overridable", () => {
  const html = renderToString(<ImageText title="Title" src="image.png" imageSize={64} bold />);
  expect(html).toContain("openui-image-text--layout-horizontal");
  expect(html).toContain("openui-image-text--bold");
  expect(html).not.toContain("height:64px");
  expect(html).not.toContain("width:64px");
  expect(html).not.toContain("openui-image-text__");
});

it("ImageTextLarge gives its banner and content stable part classes", () => {
  const html = renderToString(<ImageTextLarge title="Title" src="image.png" />);
  expect(html).toContain("openui-image-text-large-content");
  expect(html).not.toContain("openui-image-text-large__");
});

it("ImageGallery gives grid images owned classes and exposes the derived layout as an attribute", () => {
  const html = renderToString(<ImageGallery images={[{ src: "image.png" }]} />);
  expect(html).toContain('data-layout="single"');
  expect(html).toContain("openui-image-gallery-img");
  expect(html).not.toContain("openui-gallery");
});

it("Carousel emits appearance defaults and boolean modifiers, with masks as runtime data", () => {
  const html = renderToString(
    <Carousel noSnap>
      <CarouselContent>
        <CarouselItem>Card</CarouselItem>
      </CarouselContent>
    </Carousel>,
  );
  expect(html).toContain("openui-carousel--variant-card");
  expect(html).toContain("openui-carousel--no-snap");
  expect(html).toContain("openui-carousel--show-buttons");
  expect(html).toContain('data-mask="none"');
});
