// Query keys in one place so invalidation stays consistent across features.
export const queryKeys = {
  devices: ["devices"] as const,
  songSearch: (query: string) => ["songs", "search", query] as const,
  generations: ["generations"] as const,
  generation: (id: string) => ["generations", id] as const,
  toneProfile: (id: string) => ["tone-profiles", id] as const,
  preset: (id: string) => ["presets", id] as const,
  examples: (locale: string) => ["examples", locale] as const,
  example: (slug: string, locale: string) => ["examples", locale, slug] as const,
  presetVersion: (id: string, version: number) => ["presets", id, "versions", version] as const,
};
