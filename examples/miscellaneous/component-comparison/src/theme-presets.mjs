import fixture from "./theme-presets.json" with { type: "json" };
export const themePresetFixture = fixture;
export function getThemePreset(id = "default") {
  const preset = fixture.presets.find((p) => p.id === id);
  if (!preset) throw Error("Unknown lab theme preset: " + id);
  return preset;
}
