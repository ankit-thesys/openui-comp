import type { ReactNode } from "react";

declare const __PARITY_BASELINE__: boolean;

export const variants = ["clear", "card", "sunk"] as const;
export const flags = [false, true];
export const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";

export const selector = (oldName: string, newName: string) =>
  `.${__PARITY_BASELINE__ ? oldName : newName}`;

// An item owns a container around its button. Snapshot both, and hover/press the actual control
// in a separate case so the state rules are exercised even when the label is wider than it.
export function ChoiceCase({
  id,
  parts,
  controlParts = {},
  children,
}: {
  id: string;
  parts: Record<string, string>;
  controlParts?: Record<string, string>;
  children: ReactNode;
}) {
  return (
    <div
      style={{ width: 280 }}
      data-parity-case={`${id}/container`}
      data-parity-parts={JSON.stringify(parts)}
      data-parity-properties='["fill","stroke","transform"]'
      ref={(element) => {
        const button = element?.querySelector("button");
        if (button) {
          button.dataset["parityCase"] = `${id}/control`;
          button.dataset["parityParts"] = JSON.stringify(controlParts);
          button.dataset["parityProperties"] = '["fill","stroke","transform"]';
        }
      }}
    >
      {children}
    </div>
  );
}
