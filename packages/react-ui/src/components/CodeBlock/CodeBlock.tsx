import clsx from "clsx";
import { CheckCheck, Copy } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { IconButton } from "../IconButton";

export interface CodeBlockProps {
  language: string;
  codeString: string;
  theme?: {
    [key: string]: React.CSSProperties;
  };
}

export const CodeBlock = ({ language, codeString, theme }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // The clipboard write can reject: an insecure context, a denied permission,
    // or simply a document that is not focused. Previously the promise was
    // neither awaited nor caught and `copied` was set unconditionally, so the
    // button reported "Copied to clipboard" when nothing had been copied, and
    // the rejection surfaced as an unhandled promise rejection.
    const clipboard = navigator.clipboard;
    if (!clipboard) return;
    clipboard.writeText(codeString).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
      },
      () => {
        setCopied(false);
      },
    );
  };

  return (
    <div className="openui-code-block-wrapper">
      <IconButton
        onClick={handleCopy}
        variant="secondary"
        size={"small"}
        className={clsx("openui-code-block-copy-button", {
          "openui-code-block-copy-button-copied": copied,
        })}
        icon={copied ? <CheckCheck /> : <Copy />}
        aria-label={copied ? "Copied to clipboard" : "Copy code"}
      />
      <SyntaxHighlighter
        style={theme ?? vscDarkPlus}
        language={language}
        PreTag="div"
        className="openui-code-block-syntax-highlighter"
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};
