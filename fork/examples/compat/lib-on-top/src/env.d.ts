declare const __COMPAT_MODE__: "layered" | "unlayered";
interface Window {
  __nonce__?: string;
  __compat: {
    violations: string[];
    recoverable: string[];
    hydrated: boolean;
    firstPaint: { background: string; token: string };
    frames: string[];
  };
}
