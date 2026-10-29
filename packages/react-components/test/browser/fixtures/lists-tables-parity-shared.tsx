// These examples are bundled against both the built package and #72. No baseline is hand-written.
import { useEffect } from "react";
export const image = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="teal"/></svg>')}`;
export const Icon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="6" />
  </svg>
);
export const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
// Expose cases only after local images and measured scroll controls settle.
export function useReady() {
  useEffect(() => {
    let frame = 0;
    let settled = 0;
    const ready = () => {
      if ([...document.images].some((img) => !img.complete) || settled++ < 3) {
        frame = requestAnimationFrame(ready);
        return;
      }
      document
        .querySelectorAll("[data-case]")
        .forEach((el) => el.setAttribute("data-parity-case", el.getAttribute("data-case")!));
    };
    frame = requestAnimationFrame(ready);
    return () => cancelAnimationFrame(frame);
  }, []);
}
