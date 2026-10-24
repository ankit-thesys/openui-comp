import clsx from "clsx";
import React, { forwardRef, useRef, useState } from "react";
import { useResponsiveContainer } from "../../hooks/useResponsiveContainer";
import {
  errorClass,
  imageClass,
  imageMobileClass,
  loaderClass,
  wrapperClass,
  wrapperMobileClass,
} from "./imageBlock.styles";

export interface ImageBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt?: string;
  imageLoading?: boolean;
}

export const ImageBlock = forwardRef<HTMLDivElement, ImageBlockProps>(
  ({ src, alt, className, imageLoading, ...rest }, ref) => {
    const [isImageLoading, setIsImageLoading] = useState<boolean>(imageLoading ?? true);
    const [hasError, setHasError] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { breakpoint } = useResponsiveContainer(containerRef);
    const isMobile = breakpoint === "mobile";

    if (!src) return null;

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={clsx(
          wrapperClass,
          isMobile && wrapperMobileClass,
          hasError && errorClass,
          "openui-image-block-wrapper",
          {
            "openui-image-block-wrapper--mobile": isMobile,
            "openui-image-block-wrapper--error": hasError,
          },
          className,
        )}
        style={
          src && !hasError ? ({ "--bg-image": `url(${src})` } as React.CSSProperties) : undefined
        }
        {...rest}
      >
        <img
          src={src}
          alt={alt}
          className={clsx(
            imageClass,
            isMobile && imageMobileClass,
            hasError && errorClass,
            "openui-image-block-image",
            {
              "openui-image-block-image--mobile": isMobile,
              "openui-image-block-image--error": hasError,
            },
          )}
          onLoad={() => {
            setIsImageLoading(false);
            setHasError(false);
          }}
          onError={() => {
            setIsImageLoading(false);
            setHasError(true);
          }}
        />
        {isImageLoading && <div className={clsx(loaderClass, "openui-image-block-loader")} />}
      </div>
    );
  },
);

ImageBlock.displayName = "ImageBlock";
