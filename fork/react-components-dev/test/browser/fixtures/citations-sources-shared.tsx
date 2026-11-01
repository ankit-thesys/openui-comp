// Shared consumer data and caller examples for #95; also bundled against the #72 source.
import {
  ContextCardBlock,
  EntityList,
  InlineHeader,
  OptionCards,
  TextBlockView,
} from "openui-under-test";
import { useEffect } from "react";

export const favicon = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#6286ab"/></svg>')}`;
export const source = {
  title: "A useful source title",
  sourceName: "Example",
  faviconUrl: favicon,
  url: "https://example.com",
};
export const sources = [source, { ...source, title: "Without a URL", url: undefined }];
export const inlineText = "**Inline** *text*, [link](https://example.com) and `code` [1]";

export function InlineExamples() {
  return (
    <>
      <section data-case="text-block" data-testid="text-block">
        <TextBlockView
          primary={inlineText}
          secondary="Secondary **text**"
          tertiary="Third"
          align="right"
        />
      </section>
      <section data-case="inline-header" data-testid="inline-header">
        <InlineHeader heading={inlineText} description="Description *text*" />
      </section>
      <section data-case="entity-list" data-testid="entity-list">
        <EntityList rows={[{ left: inlineText, right: "**42**", rightVariant: "number" }]} />
      </section>
      <section data-case="option-cards" data-testid="option-cards">
        <OptionCards items={[{ value: "one", title: inlineText, subtitle: "A *subtitle*" }]} />
      </section>
      <section data-case="context-card-block" data-testid="context-card-block">
        <ContextCardBlock items={[{ title: "Context", body: inlineText }]} />
      </section>
    </>
  );
}

// Delay exposing parity cases until dynamic globe imports and images settle. Name parts by DOM
// position rather than by classes, so the same observations survive the rollout's class renames.
export function useParityReady(globes = 0, openTooltip = false) {
  useEffect(() => {
    if (openTooltip) document.querySelector<HTMLButtonElement>(".openui-citation")!.click();
    let frame = 0;
    const ready = () => {
      const tooltip = document.querySelector(".openui-citation-tooltip");
      if (
        (openTooltip && !tooltip) ||
        document.querySelectorAll("svg.lucide-globe").length < globes ||
        [...document.images].some((image) => !image.complete)
      ) {
        frame = requestAnimationFrame(ready);
        return;
      }
      if (openTooltip) tooltip!.setAttribute("data-case", "tooltip");
      document.querySelectorAll("[data-case]").forEach((root) => {
        // Radix's visually hidden accessible copy is not a visible part.
        root.querySelectorAll("*").forEach((part, index) => {
          if (!part.closest('[role="tooltip"]'))
            part.setAttribute("data-parity-part", `${part.tagName.toLowerCase()}-${index}`);
        });
        root.setAttribute("data-parity-case", root.getAttribute("data-case")!);
      });
    };
    frame = requestAnimationFrame(ready);
    return () => cancelAnimationFrame(frame);
  }, [globes, openTooltip]);
}
