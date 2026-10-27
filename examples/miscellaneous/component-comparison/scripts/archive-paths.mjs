// Follow declared package archives; historical candidates may coexist on disk.
export function localArchives(manifest) {
  return Object.entries(manifest.dependencies ?? {})
    .filter(([, value]) => value.startsWith("file:") && value.endsWith(".tgz"))
    .map(([name, value]) => ({ name, path: value.slice(5) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
