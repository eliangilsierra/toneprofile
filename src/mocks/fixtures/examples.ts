import type { GuitarInput, Locale, TimeWindow } from "@/lib/api/types";

/*
 * Curated examples for the public Examples page. They reuse the FICTIONAL demo scenarios, so no
 * gear is attributed to real musicians. Order matters: it's the order of the list.
 */

export interface ExampleFixture {
  slug: string;
  scenarioKey: string;
  /** Excerpt window when the example includes a measured excerpt. */
  window: TimeWindow | null;
  guitar: GuitarInput;
  headline: Record<Locale, string>;
}

export const EXAMPLES: ExampleFixture[] = [
  {
    slug: "northern-lights",
    scenarioKey: "northern-lights",
    window: { start_s: 62, end_s: 92 },
    guitar: { pickup_config: "sss", pickup_position: "neck_middle", tuning: "standard" },
    headline: {
      en: "Clean, wide ambient guitar: measured dotted-eighth delay and chorus, strong evidence.",
      es: "Guitarra ambiental limpia y amplia: delay de corchea con puntillo y chorus medidos, evidencia sólida.",
    },
  },
  {
    slug: "iron-parade",
    scenarioKey: "iron-parade",
    window: null,
    guitar: { pickup_config: "hh", pickup_position: "bridge", tuning: "drop_d" },
    headline: {
      en: "Tight high-gain rhythm from research alone — including a cabinet claim we mark as unknown.",
      es: "Rítmica de alta ganancia ajustada solo con investigación, incluida una afirmación de gabinete que marcamos como desconocida.",
    },
  },
  {
    slug: "porch-light",
    scenarioKey: "porch-light",
    window: { start_s: 18, end_s: 48 },
    guitar: { pickup_config: "ss", pickup_position: "bridge", tuning: "standard" },
    headline: {
      en: "No sources to research, so the tone comes from the excerpt alone — with lower confidence, said plainly.",
      es: "Sin fuentes que investigar, el tono sale solo del fragmento, con menos confianza y dicho claramente.",
    },
  },
];
