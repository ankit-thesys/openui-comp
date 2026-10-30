import clsx from "clsx";
import type { ReactNode } from "react";
import { C1_CLASS_PREFIX } from "../../shared/classPrefix";
import { sectionClass } from "./section.styles";

export interface SectionProps {
  filterBar?: ReactNode;
  children?: ReactNode;
}

export function Section({ filterBar, children }: SectionProps) {
  return (
    <section className={clsx(sectionClass, `${C1_CLASS_PREFIX}-section`)}>
      {filterBar ? <div className={`${C1_CLASS_PREFIX}-section__filter`}>{filterBar}</div> : null}
      <div className={`${C1_CLASS_PREFIX}-section__rows`}>{children}</div>
    </section>
  );
}
