import { CodeBlock, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";

declare const __PARITY_BASELINE__: boolean;
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
const cases = [
  { id: "default", language: "javascript", codeString: "const answer = 42;" },
  { id: "copy-button", language: "text", codeString: "Copy me" },
  { id: "copied", language: "text", codeString: "Copied code" },
  { id: "plain", language: "text", codeString: "First line\nSecond line" },
  // The two class props were introduced after #72. Their behavior is verified in
  // loading-code.spec.ts and the Node tests, rather than compared to an API #72 lacks.
  {
    id: "theme",
    language: "text",
    codeString: "Custom theme",
    theme: {
      'pre[class*="language-"]': {
        color: "rgb(12, 34, 56)",
        background: "rgb(230, 240, 250)",
        padding: "12px",
        margin: "7px",
      },
    },
  },
];
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    {cases.map(({ id, ...props }) => (
      <div
        key={id}
        data-parity-case={id}
        data-parity-target={
          id === "copy-button" || id === "copied" ? ".openui-code-block-copy-button" : undefined
        }
        data-parity-setup-click={id === "copied" ? ".openui-code-block-copy-button" : undefined}
        data-parity-parts={JSON.stringify({
          root: __PARITY_BASELINE__ ? ".openui-code-block-wrapper" : ".openui-code-block",
          copy: ".openui-code-block-copy-button",
          highlighter: ".openui-code-block-copy-button + div",
          code: ".openui-code-block-copy-button + div code",
        })}
      >
        <CodeBlock {...props} />
      </div>
    ))}
  </ThemeProvider>,
);
