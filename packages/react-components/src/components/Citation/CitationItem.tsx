"use client";

import clsx from "clsx";
import { memo } from "react";
import { SourceFaviconImage } from "../SourceFaviconImage";
import { openSourceInNewTab, SourceWithFavicon } from "../Sources/SourceContext";
import { contentClass, itemClass, logoClass, sourceClass, titleClass } from "./citationItem.styles";

export interface CitationItemProps extends SourceWithFavicon {
  onClick?: () => void;
}

export const CitationItem = memo((props: CitationItemProps) => {
  const { title, sourceName, onClick, faviconUrl, url } = props;
  const handleClick = () => {
    openSourceInNewTab(url);
    onClick?.();
  };
  const hasUrl = url && url.trim() !== "";
  return (
    <button
      className={clsx(itemClass, "openui-citation-item", {
        "openui-citation-item--has-url": hasUrl,
      })}
      onClick={handleClick}
      type="button"
    >
      <div className={clsx(logoClass, "openui-citation-item__logo")}>
        <SourceFaviconImage url={faviconUrl} alt={sourceName} width={24} height={24} />
      </div>
      <div className={clsx(contentClass, "openui-citation-item__content")}>
        <div className={clsx(titleClass, "openui-citation-item__title")}>{title}</div>
        <div className={clsx(sourceClass, "openui-citation-item__source")}>{sourceName}</div>
      </div>
    </button>
  );
});

CitationItem.displayName = "CitationItem";
