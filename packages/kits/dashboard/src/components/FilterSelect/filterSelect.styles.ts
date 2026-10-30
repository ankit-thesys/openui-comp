import { css } from "goober";
import { C1_CLASS_PREFIX as P } from "../../shared/classPrefix";
import { typography } from "../../shared/typography";
import { DROPDOWN } from "../../shared/zIndex";

const SINGLE = `${P}-filter-single-select`;
const MULTI = `${P}-filter-multi-select`;

/** The labelled wrapper shared by both filter flavours. */
export const filterSelectClass = css`
  display: flex;
  flex-direction: column;
  width: 180px;
  gap: var(--openui-space-3xs);
  min-width: 0;

  & .${P}-filter-select__label {
    color: var(--openui-text-neutral-secondary);
    ${typography("label", "small")}
  }
`;

export const singleSelectClass = css`
  position: relative;
  width: 100%;
  min-width: 0;

  & .${SINGLE}__trigger {
    all: unset;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 32px;
    gap: var(--openui-space-xs);
    padding: 0 var(--openui-space-s);
    border: 1px solid var(--openui-border-interactive);
    border-radius: var(--openui-radius-m);
    background: var(--openui-foreground);
    color: var(--openui-text-neutral-primary);
    cursor: pointer;
    ${typography("label", "small")}
  }

  & .${SINGLE}__trigger:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  & .${SINGLE}__trigger--empty {
    color: var(--openui-text-neutral-secondary);
  }

  & .${SINGLE}__value {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & .${SINGLE}__chevron {
    flex-shrink: 0;
    color: var(--openui-text-neutral-primary);
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  & .${SINGLE}__chevron--open {
    transform: rotate(180deg);
  }

  & .${SINGLE}__content {
    position: absolute;
    z-index: ${DROPDOWN};
    top: calc(100% + var(--openui-space-2xs));
    left: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: max-content;
    min-width: 180px;
    max-width: min(320px, calc(100vw - 32px));
    gap: var(--openui-space-3xs);
    padding: var(--openui-space-2xs);
    border: 1px solid var(--openui-border-default);
    border-radius: var(--openui-radius-l);
    background: var(--openui-foreground);
    box-shadow: var(--openui-shadow-m);
  }

  & .${SINGLE}__radio-option {
    position: relative;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    min-height: 32px;
    gap: var(--openui-space-s);
    padding: var(--openui-space-2xs) var(--openui-space-xs);
    border-radius: var(--openui-radius-s);
    color: var(--openui-text-neutral-primary);
    cursor: pointer;
    transition: background-color 120ms ease;
  }

  & .${SINGLE}__radio-option:hover {
    background: var(--openui-sunk);
  }

  & .${SINGLE}__radio-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  & .${SINGLE}__radio-control {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: 1px solid var(--openui-border-interactive);
    border-radius: var(--openui-radius-full);
    background: var(--openui-foreground);
  }

  & .${SINGLE}__radio-input:checked + .${SINGLE}__radio-control {
    border-color: var(--openui-border-interactive-selected);
    background:
      radial-gradient(circle, var(--openui-border-interactive-selected) 0 4px, transparent 4.5px),
      var(--openui-foreground);
  }

  & .${SINGLE}__radio-input:focus-visible + .${SINGLE}__radio-control {
    outline: 2px solid var(--openui-border-interactive-selected);
    outline-offset: 2px;
  }

  & .${SINGLE}__radio-label {
    overflow: hidden;
    ${typography("label", "small")}
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const multiSelectClass = css`
  position: relative;
  width: 100%;
  min-width: 0;

  & .${MULTI}__trigger {
    all: unset;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 32px;
    gap: var(--openui-space-xs);
    padding: var(--openui-space-2xs) var(--openui-space-s);
    border: 1px solid var(--openui-border-interactive);
    border-radius: var(--openui-radius-m);
    background: var(--openui-foreground);
    color: var(--openui-text-neutral-primary);
    cursor: pointer;
    ${typography("label", "small")}
  }

  & .${MULTI}__trigger:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  & .${MULTI}__trigger--empty {
    color: var(--openui-text-neutral-secondary);
  }

  & .${MULTI}__placeholder {
    color: var(--openui-text-neutral-secondary);
  }

  & .${MULTI}__summary {
    display: flex;
    flex: 1;
    align-items: center;
    gap: var(--openui-space-xs);
    min-width: 0;
  }

  & .${MULTI}__summary-text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & .${MULTI}__count {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 var(--openui-space-2xs);
    border-radius: var(--openui-radius-full);
    background: var(--openui-sunk);
    color: var(--openui-text-neutral-secondary);
    ${typography("label", "extra-small")}
  }

  & .${MULTI}__chevron {
    flex-shrink: 0;
    margin-left: auto;
    color: var(--openui-text-neutral-primary);
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  & .${MULTI}__chevron--open {
    transform: rotate(180deg);
  }

  & .${MULTI}__dropdown {
    position: absolute;
    z-index: ${DROPDOWN};
    top: calc(100% + var(--openui-space-2xs));
    left: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: max-content;
    min-width: 180px;
    max-width: min(320px, calc(100vw - 32px));
    max-height: 240px;
    border: 1px solid var(--openui-border-default);
    border-radius: var(--openui-radius-l);
    background: var(--openui-foreground);
    box-shadow: var(--openui-shadow-m);
    overflow: hidden;
  }

  & .${MULTI}__options {
    overflow-y: auto;
    flex: 1;
    padding: var(--openui-space-2xs);
  }

  & .${MULTI}__option {
    box-sizing: border-box;
    width: 100%;
    padding: var(--openui-space-2xs) var(--openui-space-xs);
    border-radius: var(--openui-radius-s);
    cursor: pointer;
    transition: background-color 120ms ease;
  }

  & .${MULTI}__option:hover {
    background: var(--openui-sunk);
  }
`;
