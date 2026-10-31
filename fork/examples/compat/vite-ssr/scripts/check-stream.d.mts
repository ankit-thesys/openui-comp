export function checkStream(mode: "layered" | "unlayered"): Promise<{
  mode: string;
  chunks: number;
  sheetBytes: number;
  fallbackChunk: number;
  resolvedChunk: number;
}>;
