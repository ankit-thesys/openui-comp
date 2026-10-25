export const channel = "openui-component-comparison/v1";
export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  complete?: boolean;
  display?: string;
  chunks?: string[];
};
export type Snapshot = {
  presetId?: string;
  themePreset?: { id:string; label:string; definitionHash:string; lightTheme:Record<string,string|string[]>; darkTheme:Record<string,string|string[]> };
  bench?: { pendingQuery?: boolean; directHorizontal?: {height:number|string; fitLegendInHeight:boolean; parentHeight:number} };
  offline?: boolean;
  activity?: { pane: string; event: unknown }[];
  messages: Message[];
  status: string;
  error: string;
  theme: "light" | "dark";
  viewId: string;
  revision: number;
  allowActions: boolean;
};
export function isSnapshot(value: unknown): value is Snapshot {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<Snapshot>;
  return (
    Array.isArray(v.messages) &&
    v.messages.every(
      (m) =>
        m &&
        typeof m.id === "string" &&
        ["user", "assistant"].includes(m.role) &&
        typeof m.content === "string",
    ) &&
    typeof v.viewId === "string" &&
    Number.isInteger(v.revision) &&
    ["light", "dark"].includes(v.theme ?? "") &&
    ["idle", "streaming", "replaying"].includes(v.status ?? "") &&
    typeof v.allowActions === "boolean"
  );
}
