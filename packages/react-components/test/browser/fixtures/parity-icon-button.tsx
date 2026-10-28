// Every IconButton variant × size × shape × tone, idle and disabled, for the parity snapshot.
// Bundled twice: against the current package and against the #72 baseline source.
import { IconButton, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";

declare const __PARITY_BASELINE__: boolean;

const variants = ["primary", "secondary", "tertiary"] as const;
const sizes = [
  "3-extra-small",
  "2-extra-small",
  "extra-small",
  "small",
  "medium",
  "large",
] as const;
const shapes = ["square", "circle"] as const;
const tones = ["default", "destructive"] as const;
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";

// #72 named the tone prop `appearance` with values normal | destructive.
const toneProps = (tone: (typeof tones)[number]) =>
  __PARITY_BASELINE__
    ? { appearance: tone === "destructive" ? "destructive" : "normal" }
    : { tone };

// Fills the icon part, so the snapshot measures the part's size through it.
const Icon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" data-parity-part="icon">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    {variants.flatMap((variant) =>
      sizes.flatMap((size) =>
        shapes.flatMap((shape) =>
          tones.flatMap((tone) =>
            [false, true].map((disabled) => (
              <IconButton
                key={`${variant}/${size}/${shape}/${tone}/${disabled}`}
                data-parity-case={`${variant}/${size}/${shape}/${tone}${disabled ? "/disabled" : ""}`}
                aria-label="Action"
                variant={variant}
                size={size}
                shape={shape}
                disabled={disabled}
                icon={<Icon />}
                {...(toneProps(tone) as object)}
              />
            )),
          ),
        ),
      ),
    )}
  </ThemeProvider>,
);
