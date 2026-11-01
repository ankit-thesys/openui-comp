export const compatMode = process.env.NEXT_PUBLIC_OPENUI_COMPAT_MODE;
if (compatMode !== "layered" && compatMode !== "unlayered") {
  throw new Error(`Invalid compat mode: ${compatMode}`);
}
export const layered = compatMode === "layered";
