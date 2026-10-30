export interface CssBodyPlace {
  path: string;
  line: number;
}

export function sharedCssBodies(
  sources: { path: string; text: string }[],
  converted: ReadonlySet<string>,
): (CssBodyPlace & { others: CssBodyPlace[] })[];
