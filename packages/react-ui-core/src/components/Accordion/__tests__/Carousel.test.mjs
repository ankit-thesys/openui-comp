import assert from "node:assert/strict";
import test from "node:test";
import { core, React, require } from "../../Button/__tests__/consumer.mjs";
const { renderToStaticMarkup } = require("react-dom/server");
const { createElement: h } = React;
test("Carousel preserves composed public content, native attributes, noSnap wrapper and hidden-button option", () => {
  assert.equal(typeof core.Carousel, "object", "public Carousel export");
  const tree = (noSnap) =>
    h(
      core.Carousel,
      {
        noSnap,
        showButtons: false,
        variant: "sunk",
        className: "consumer",
        "aria-label": "Cards",
        style: { maxWidth: "430px" },
      },
      h(
        core.CarouselContent,
        { id: "cards", "data-consumer": "content" },
        h(core.CarouselItem, null, "Alpha"),
        h(core.CarouselItem, null, "Beta"),
      ),
      h(core.CarouselPrevious, { icon: "previous" }),
      h(core.CarouselNext, { icon: "next" }),
    );
  const html = renderToStaticMarkup(tree(true));
  const container = document.createElement("div");
  container.innerHTML = html;
  assert(container.firstElementChild.classList.contains("consumer"));
  assert.equal(container.firstElementChild.getAttribute("aria-label"), "Cards");
  assert.equal(container.firstElementChild.style.maxWidth, "430px");
  assert.equal(
    container.querySelectorAll(".openui-carousel-content-wrapper > .openui-carousel-item").length,
    2,
  );
  assert.equal(container.querySelector("#cards").dataset.consumer, "content");
  assert.equal(container.querySelectorAll("button").length, 0);
  container.innerHTML = renderToStaticMarkup(tree(false));
  assert.equal(container.querySelector(".openui-carousel-content-wrapper"), null);
  assert.equal(container.querySelectorAll("#cards > .openui-carousel-item").length, 2);
});
