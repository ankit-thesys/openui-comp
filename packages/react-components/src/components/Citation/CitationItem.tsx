"use client";

import clsx from "clsx";
import { memo } from "react";
import { styleRules } from "../../styles/css";
import { SourceFaviconImage } from "../SourceFaviconImage";
import { openSourceInNewTab, SourceWithFavicon } from "../Sources/SourceContext";
import { citationItemStyles, names } from "./citationItem.styles";

export interface CitationItemProps extends SourceWithFavicon {
  onClick?: () => void;
}

export const CitationItem = memo((props: CitationItemProps) => {
  const styles = citationItemStyles;
  const { title, sourceName, onClick, faviconUrl, url } = props;
  const handleClick = () => {
    openSourceInNewTab(url);
    onClick?.();
  };
  const hasUrl = url && url.trim() !== "";
  const rootClass = clsx(styles.root, names.root, hasUrl && styles.linked);
  const logoClass = clsx(styles.logo, names.logo);
  const contentClass = clsx(styles.content, names.content);
  const titleClass = clsx(styles.title, names.title);
  const sourceClass = clsx(styles.source, names.source);
  return (
    <>
      <button className={rootClass} onClick={handleClick} type="button">
        <div className={logoClass}>
          <SourceFaviconImage url={faviconUrl} alt={sourceName} width={24} height={24} />
        </div>
        {styleRules(logoClass)}
        <div className={contentClass}>
          <div className={titleClass}>{title}</div>
          {styleRules(titleClass)}
          <div className={sourceClass}>{sourceName}</div>
          {styleRules(sourceClass)}
        </div>
        {styleRules(contentClass)}
      </button>
      {styleRules(rootClass)}
    </>
  );
});

CitationItem.displayName = "CitationItem";
