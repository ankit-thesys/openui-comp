"use client";

import clsx from "clsx";
import { forwardRef, useContext } from "react";
import { styleRules } from "../../styles/css";
import { TextBlockView, type TextBlockOverflow, type TextBlockWidth } from "../TextBlock";
import { TextFitContext } from "../TextBlock/TextFit";
import { imageTextStyles, names } from "./imageText.styles";

export type ImageTextLayout = "horizontal" | "vertical";

export interface ImageTextProps {
  title: string;
  subtitle?: string;
  src: string;
  alt?: string;
  bold?: boolean;
  layout?: ImageTextLayout;
  /** Square image size in px. Defaults to 40 for horizontal layout. */
  imageSize?: number;
  /**
   * `"truncate"` keeps the title and subtitle to one line each, ending in an ellipsis, and lets the
   * component shrink in a flex row. SnippetCardBlock sets it for its slots; pass `"wrap"` there to
   * wrap anyway. Omitted elsewhere, the text wraps.
   */
  overflow?: TextBlockOverflow;
  /** `"fill"` makes the component as wide as its container. Omit it to size to the content. */
  width?: TextBlockWidth;
  className?: string;
}

/** A small square image beside (or above) a title with an optional subtitle. */
export const ImageText = forwardRef<HTMLDivElement, ImageTextProps>(
  (
    {
      title,
      subtitle,
      src,
      alt,
      bold = false,
      layout = "horizontal",
      imageSize,
      overflow: ownOverflow,
      width: ownWidth,
      className,
    },
    ref,
  ) => {
    // A card slot supplies the fit the caller leaves out.
    const slot = useContext(TextFitContext);
    const overflow = ownOverflow ?? slot.overflow ?? "wrap";
    const width = ownWidth ?? slot.width;
    const styles = imageTextStyles;
    const altText = alt ?? title;
    const size = imageSize ?? (layout === "horizontal" ? 40 : undefined);

    const rootClass = clsx(
      styles.root,
      names.root,
      styles.layout[layout],
      names.layout[layout],
      bold && names.bold.true,
      overflow && [styles.overflow[overflow], names.overflow[overflow]],
      width && [styles.width[width], names.width[width]],
      className,
    );
    const imageContainerClass = clsx(styles.imageContainer, names.imageContainer);
    const imageClass = clsx(styles.image, names.image);
    const contentClass = clsx(styles.content, names.content);
    return (
      <>
        <div ref={ref} className={rootClass}>
          <div
            className={imageContainerClass}
            style={
              size
                ? ({ "--_openui-image-text-size": `${size}px` } as React.CSSProperties)
                : undefined
            }
          >
            <img className={imageClass} src={src} alt={altText} />
            {styleRules(imageClass)}
          </div>
          {styleRules(imageContainerClass)}
          <div className={contentClass}>
            <TextBlockView
              variant={bold ? "highlight-text-number-subtext" : "text-subtext"}
              primary={title}
              secondary={subtitle}
              type="text"
              size={layout === "horizontal" ? "xs" : "sm"}
              overflow={overflow}
              width={width}
            />
          </div>
          {styleRules(contentClass)}
        </div>
        {styleRules(rootClass)}
      </>
    );
  },
);

ImageText.displayName = "ImageText";
