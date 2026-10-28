// Every Button variant × size × tone, idle and disabled, with icons, for the parity snapshot.
// Bundled twice: against the current package and against the #72 baseline source.
import { Button, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";

declare const __PARITY_BASELINE__: boolean;

const variants = ["primary", "secondary", "tertiary"] as const;
const sizes = ["extra-small", "small", "medium", "large"] as const;
const tones = ["default", "destructive"] as const;
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";

// #72 named the tone prop `buttonType` with values normal | destructive.
const toneProps = (tone: (typeof tones)[number]) =>
  __PARITY_BASELINE__
    ? { buttonType: tone === "destructive" ? "destructive" : "normal" }
    : { tone };

const Icon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" data-parity-part="icon">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    {variants.flatMap((variant) =>
      sizes.flatMap((size) =>
        tones.flatMap((tone) =>
          [false, true].map((disabled) => (
            <Button
              key={`${variant}/${size}/${tone}/${disabled}`}
              data-parity-case={`${variant}/${size}/${tone}${disabled ? "/disabled" : ""}`}
              variant={variant}
              size={size}
              disabled={disabled}
              iconLeft={<Icon />}
              {...(toneProps(tone) as object)}
            >
              Label
            </Button>
          )),
        ),
      ),
    )}
  </ThemeProvider>,
);
