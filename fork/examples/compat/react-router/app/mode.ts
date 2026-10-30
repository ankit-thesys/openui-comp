export const compatMode = import.meta.env.VITE_OPENUI_COMPAT_MODE;
if (compatMode !== "layered" && compatMode !== "unlayered") {
  throw new Error(`Invalid compatibility mode: ${compatMode}`);
}
