// The shape of his catalog entries (preview/src/catalog.ts), and of the programs the tests render.
export type Variant = { title: string; note?: string; program: string };

export type ComponentDoc = {
  slug: string;
  name: string;
  group: string;
  summary: string;
  /**
   * The kit components this entry documents. Its Props panel is generated
   * from their library signatures: call shape, every argument in order, and
   * its type, so it can't fall behind the schema.
   */
  components: string[];
  /** A short note per argument, keyed "arg" (or "Component.arg" when the entry documents several). Types come from the schema. */
  notes: Record<string, string>;
  variants: Variant[];
  /** What the example tabs choose, for entries without controls ("Options", "Region"); every control row is titled. */
  variantsLabel?: string;
};

/** A catalog program the tests parse and render, with text it must show. */
export type RenderFixture = { name: string; program: string; text: string };
