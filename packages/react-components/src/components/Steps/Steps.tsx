"use client";

import clsx from "clsx";
import React, { createContext, useContext } from "react";
import { styleRules } from "../../styles/css";
import { names, stepsStyles } from "./steps.styles";

export interface StepsItemProps {
  title: React.ReactNode;
  details: React.ReactNode;
  number?: number;
}

export interface StepsProps {
  children: React.ReactNode;
}

const StepNumberContext = createContext<number>(0);

export const Steps: React.FC<StepsProps> = ({ children }) => {
  const styles = stepsStyles;
  const rootClass = clsx(styles.root, names.root);
  const listClass = clsx(styles.list, names.list);
  return (
    <>
      <div className={rootClass}>
        <div className={listClass}>
          {React.Children.map(children, (child, index) => (
            <StepNumberContext.Provider value={index + 1}>{child}</StepNumberContext.Provider>
          ))}
        </div>
        {styleRules(listClass)}
      </div>
      {styleRules(rootClass)}
    </>
  );
};

export const StepsItem: React.FC<StepsItemProps> = ({ title, details, number }) => {
  const stepNumber = useContext(StepNumberContext);

  const styles = stepsStyles;
  const itemClass = clsx(styles.item, names.item);
  const connectorClass = clsx(styles.connector, names.connector);
  const numberClass = clsx(styles.number, names.number);
  const numberInnerClass = clsx(styles.numberInner, names.numberInner);
  const connectorLineClass = clsx(styles.connectorLine, names.connectorLine);
  const contentClass = clsx(styles.content, names.content);
  const titleClass = clsx(styles.title, names.title);
  const detailsClass = clsx(styles.details, names.details);
  return (
    <>
      <div className={itemClass}>
        <div className={connectorClass}>
          <div className={numberClass}>
            <div className={numberInnerClass}>{Number.isInteger(number) ? number : stepNumber}</div>
            {styleRules(numberInnerClass)}
          </div>
          {styleRules(numberClass)}
          <div className={connectorLineClass} />
          {styleRules(connectorLineClass)}
        </div>
        {styleRules(connectorClass)}
        <div className={contentClass}>
          <span className={titleClass}>{title}</span>
          {styleRules(titleClass)}
          <div className={detailsClass}>{details}</div>
          {styleRules(detailsClass)}
        </div>
        {styleRules(contentClass)}
      </div>
      {styleRules(itemClass)}
    </>
  );
};
