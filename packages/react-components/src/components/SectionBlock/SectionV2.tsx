import { css } from "goober";
import React from "react";
import { Separator } from "../Separator";
import { sectionStyles } from "./sectionV2.styles";

const componentClass = "openui-section-block-section-v2-root";

interface SectionV2Props {
  trigger: string;
  children?: React.ReactNode;
}

export const SectionV2 = ({ trigger, children }: SectionV2Props) => {
  return (
    <div className={`${componentClass} openui-section-v2`}>
      <div className="openui-section-v2-wrapper">
        <Separator orientation="horizontal" />
        <div className="openui-section-v2-header">
          <div className="openui-section-v2-header-trigger">{trigger}</div>
        </div>
        <div className="openui-section-v2-content">{children}</div>
      </div>
    </div>
  );
};

const stylesheetScope = css`
  :where(&:root) {
    .openui-section-block-section-v2-root {
      ${sectionStyles}
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
