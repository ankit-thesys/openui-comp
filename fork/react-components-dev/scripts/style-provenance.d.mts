export function styleProvenance(
  layer?: string,
): Promise<Record<string, { module: string; stableClasses: string[] }[]>>;
