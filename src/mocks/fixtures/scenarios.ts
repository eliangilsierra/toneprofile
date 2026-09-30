import type {
  AudioEvidence,
  Claim,
  DeviceBlock,
  ErrorCode,
  GainClassEstimate,
  IntentBlock,
  Locale,
  PerceptualTargets,
  SongCandidate,
  StepKey,
} from "@/lib/api/types";
import { block, chain, hz, knob, ms, volumeBlock } from "./device";
import type { SpectrumShape } from "./spectrum";

/*
 * Demo scenarios. Every song, artist, publication and quote here is FICTIONAL, and all source
 * URLs use the reserved example.com domain. The demo must never attribute invented gear to real
 * musicians.
 */

type Localized = Record<Locale, string>;

interface ClaimFixture extends Omit<Claim, "statement" | "sources"> {
  statement: Localized;
  sources: { url: string; publisher: string; title: string; quote: string | null }[];
}

export interface ToneFixture {
  presetName: string;
  confidence: number;
  gainClass: GainClassEstimate;
  guitarDominance: number;
  spectrum: SpectrumShape;
  ambience: AudioEvidence["ambience"];
  targets: PerceptualTargets;
  chain: IntentBlock[];
  claims: ClaimFixture[];
  /** Texts when an excerpt was measured. */
  summary: Localized;
  explanation: Localized;
  /** Texts when only research is available (no excerpt uploaded). */
  researchOnly?: { summary: Localized; explanation: Localized };
  device: DeviceBlock[];
  patchVolume: number;
  bpm: number | null;
  mappingCandidates: number;
}

export interface ScenarioFailure {
  step: StepKey;
  code: ErrorCode;
  retryable: boolean;
  hint?: string;
  /** Fails only on the first attempt; a retry succeeds. */
  once: boolean;
}

export interface Scenario {
  key: string;
  song: SongCandidate | null;
  research: { sources_read: number; claims_kept: number; claims_dropped: number } | "unavailable";
  failure?: ScenarioFailure;
  tone: ToneFixture;
}

const RETRIEVED_AT = "2026-09-12T10:00:00Z";

const target = (value: number, confidence: number, basis: "measured" | "research" | "inferred") => ({
  value,
  confidence,
  basis,
});

/* ------------------------------------------------------------------------------------------ */

const northernLights: Scenario = {
  key: "northern-lights",
  song: { id: "demo-northern-lights", title: "Northern Lights", artist: "Glass Harbor", year: 2019, duration_s: 284 },
  research: { sources_read: 7, claims_kept: 3, claims_dropped: 1 },
  tone: {
    presetName: "NorthernLts",
    confidence: 0.74,
    gainClass: { value: "clean", p: 0.88 },
    guitarDominance: 0.64,
    spectrum: {
      bumps: [
        { hz: 110, db: 2, octaves: 0.8 },
        { hz: 900, db: 1.2, octaves: 1 },
        { hz: 3200, db: 3.4, octaves: 0.9 },
      ],
      lowCut: { hz: 90, slope: 6 },
      highCut: { hz: 7500, slope: 8 },
    },
    ambience: {
      reverb: "medium",
      delay: { time_ms: 375, subdivision: "dotted_eighth" },
      modulation: { kind: "chorus", rate_hz: 1.2 },
    },
    targets: {
      saturation: target(0.12, 0.85, "measured"),
      low_end: target(0.45, 0.7, "measured"),
      mid_emphasis: target(0.4, 0.6, "measured"),
      brightness: target(0.72, 0.75, "measured"),
      tightness: target(0.55, 0.5, "inferred"),
      compression: target(0.55, 0.6, "research"),
      ambience: target(0.7, 0.8, "measured"),
    },
    chain: [
      { id: "i1", role: "compressor", archetype: "compressor", enabled: true, confidence: 0.62, evidence_level: "likely", alternatives: [], claim_ids: ["c2"] },
      { id: "i2", role: "amp", archetype: "fender_blackface_clean", enabled: true, confidence: 0.72, evidence_level: "reported", alternatives: ["vox_ac_topboost", "jazz_solid_state_clean"], claim_ids: ["c1"] },
      { id: "i3", role: "cab", archetype: "open_back_2x12", enabled: true, confidence: 0.55, evidence_level: "inferred", alternatives: ["open_back_1x12"], claim_ids: [] },
      { id: "i4", role: "modulation", archetype: "chorus", enabled: true, confidence: 0.78, evidence_level: "likely", alternatives: ["uni_vibe"], claim_ids: [] },
      { id: "i5", role: "delay", archetype: "dotted_eighth_delay", enabled: true, confidence: 0.9, evidence_level: "likely", alternatives: ["digital_delay"], claim_ids: ["c3"] },
      { id: "i6", role: "reverb", archetype: "hall", enabled: true, confidence: 0.68, evidence_level: "likely", alternatives: ["plate"], claim_ids: [] },
    ],
    claims: [
      {
        id: "c1",
        role: "amp",
        item: "Black-panel 2×12 combo",
        statement: {
          en: "The guitarist said the clean parts on the album were tracked through a black-panel style 2×12 combo.",
          es: "El guitarrista dijo que las partes limpias del disco se grabaron con un combo 2×12 estilo black-panel.",
        },
        specificity: "this_recording",
        evidence_level: "reported",
        sources: [
          {
            url: "https://example.com/demo/glass-harbor-tidelines-interview",
            publisher: "Demo Gear Weekly (fictional)",
            title: "Glass Harbor on the making of “Tidelines”",
            quote: "the cleans are all the black-panel 2×12, mic'd pretty close",
          },
        ],
      },
      {
        id: "c2",
        role: "compressor",
        item: "Compressor pedal",
        statement: {
          en: "A compressor is described as always on in the band's live rig.",
          es: "Se describe un compresor siempre encendido en el equipo en vivo de la banda.",
        },
        specificity: "artist_general",
        evidence_level: "likely",
        sources: [
          {
            url: "https://example.com/demo/glass-harbor-rig-tour",
            publisher: "Demo Rig Rundown (fictional)",
            title: "Glass Harbor rig tour",
            quote: "the compressor never comes off",
          },
          {
            url: "https://example.com/demo/pedalboard-forum-thread",
            publisher: "Demo Players Forum (fictional)",
            title: "What's on Glass Harbor's board?",
            quote: null,
          },
        ],
      },
      {
        id: "c3",
        role: "delay",
        item: "Digital delay, dotted eighths",
        statement: {
          en: "The main riff uses a dotted-eighth delay synced to the tempo — also clearly audible in the recording.",
          es: "El riff principal usa un delay de corchea con puntillo sincronizado al tempo — también se oye claramente en la grabación.",
        },
        specificity: "this_recording",
        evidence_level: "likely",
        sources: [
          {
            url: "https://example.com/demo/glass-harbor-tidelines-interview",
            publisher: "Demo Gear Weekly (fictional)",
            title: "Glass Harbor on the making of “Tidelines”",
            quote: "dotted eighths on everything, it's the whole song",
          },
        ],
      },
    ],
    summary: {
      en: "A glassy, bright clean tone: a black-panel style combo just below breakup, light compression, a chorus shimmer and a dotted-eighth delay that turns single notes into rhythm. The delay and chorus are measured; the amp comes from an interview.",
      es: "Un tono limpio, brillante y cristalino: un combo estilo black-panel justo antes de saturar, compresión ligera, un brillo de chorus y un delay de corchea con puntillo que convierte las notas sueltas en ritmo. El delay y el chorus están medidos; el ampli viene de una entrevista.",
    },
    explanation: {
      en: "Dark Twin is the GP-180's closest match to a black-panel clean, kept at low gain so it stays clean with single coils. COMP4 in the PRE slot adds the even sustain the sources describe. The delay time is set to the measured 375 ms (a dotted eighth at 120 BPM), and a slow C Chorus plus a medium Hall recreate the width without washing out the pick attack.",
      es: "Dark Twin es el modelo de la GP-180 más cercano a un limpio black-panel; se mantiene con poca ganancia para que siga limpio con bobinas simples. COMP4 en el bloque PRE aporta el sustain parejo que describen las fuentes. El tiempo de delay está en los 375 ms medidos (corchea con puntillo a 120 BPM), y un C Chorus lento más una Hall media recrean la amplitud sin tapar el ataque de la púa.",
    },
    device: chain([
      block("PRE", { key: "pre.comp4", name: "COMP4" }, [knob("sustain", "Sustain", 45), knob("attack", "Attack", 55), knob("volume", "Volume", 55), knob("clipping", "Clipping", 15)], { intent_block_id: "i1", confidence: 0.6, alternatives: [{ model_key: "pre.comp", name: "COMP" }] }),
      block("AMP", { key: "amp.dark_twin", name: "Dark Twin", based_on: "Fender Twin Reverb (black-panel)" }, [knob("gain", "Gain", 24), knob("volume", "Volume", 58), knob("bass", "Bass", 42), knob("middle", "Middle", 48), knob("treble", "Treble", 63)], { intent_block_id: "i2", confidence: 0.72, alternatives: [{ model_key: "amp.silver_twin", name: "Silver Twin" }, { model_key: "amp.foxy_30tb", name: "Foxy 30TB" }] }),
      block("CAB", { key: "cab.us_2x12", name: "US 2x12" }, [knob("volume", "Volume", 60), hz("low_cut", "Low Cut", 80, 20, 500), hz("high_cut", "High Cut", 9500, 1000, 20000)], { intent_block_id: "i3", confidence: 0.55 }),
      block("MOD", { key: "mod.c_chorus", name: "C Chorus" }, [knob("depth", "Depth", 35), hz("rate", "Rate", 1.2, 0.1, 10), knob("mix", "Mix", 40)], { intent_block_id: "i4", confidence: 0.78, alternatives: [{ model_key: "mod.g_chorus", name: "G Chorus" }] }),
      block("DLY", { key: "dly.digital_delay_s", name: "Digital Delay S" }, [knob("mix", "Mix", 28), ms("time", "Time", 375), knob("feedback", "Feedback", 34)], { intent_block_id: "i5", confidence: 0.9, alternatives: [{ model_key: "dly.pure", name: "Pure" }] }),
      block("RVB", { key: "rvb.hall", name: "Hall" }, [knob("mix", "Mix", 24), knob("decay", "Decay", 58), ms("pre_delay", "Pre-Delay", 18, 200)], { intent_block_id: "i6", confidence: 0.68, alternatives: [{ model_key: "rvb.plate", name: "Plate" }] }),
      volumeBlock(),
    ]),
    researchOnly: {
      summary: {
        en: "A glassy, bright clean tone built from documented gear: a black-panel style combo, an always-on compressor and a dotted-eighth delay. Without an excerpt, spectrum and effect settings are inferred rather than measured.",
        es: "Un tono limpio, brillante y cristalino construido a partir del equipo documentado: un combo estilo black-panel, un compresor siempre encendido y un delay de corchea con puntillo. Sin fragmento, el espectro y los ajustes de efectos se infieren en lugar de medirse.",
      },
      explanation: {
        en: "Dark Twin is the GP-180's closest match to the black-panel combo in the sources. The delay time assumes the song's documented dotted-eighth pattern at 120 BPM — upload an excerpt to measure it.",
        es: "Dark Twin es el modelo de la GP-180 más cercano al combo black-panel de las fuentes. El tiempo de delay asume el patrón de corchea con puntillo documentado a 120 BPM — sube un fragmento para medirlo.",
      },
    },
    patchVolume: 50,
    bpm: 120,
    mappingCandidates: 14,
  },
};

/* ------------------------------------------------------------------------------------------ */

const ironParade: Scenario = {
  key: "iron-parade",
  song: { id: "demo-iron-parade", title: "Iron Parade", artist: "Cinder Avenue", year: 2011, duration_s: 236 },
  research: { sources_read: 6, claims_kept: 3, claims_dropped: 2 },
  tone: {
    presetName: "IronParade",
    confidence: 0.69,
    gainClass: { value: "high_gain", p: 0.91 },
    guitarDominance: 0.71,
    spectrum: {
      bumps: [
        { hz: 120, db: 1.5, octaves: 0.6 },
        { hz: 400, db: -2.2, octaves: 0.8 },
        { hz: 1500, db: 4, octaves: 0.9 },
        { hz: 3000, db: 2, octaves: 0.6 },
      ],
      lowCut: { hz: 95, slope: 10 },
      highCut: { hz: 5200, slope: 13 },
    },
    ambience: { reverb: "low", delay: null, modulation: null },
    targets: {
      saturation: target(0.82, 0.9, "measured"),
      low_end: target(0.55, 0.65, "measured"),
      mid_emphasis: target(0.72, 0.7, "measured"),
      brightness: target(0.5, 0.6, "measured"),
      tightness: target(0.85, 0.6, "research"),
      compression: target(0.6, 0.45, "inferred"),
      ambience: target(0.12, 0.8, "measured"),
    },
    chain: [
      { id: "i1", role: "gate", archetype: "noise_gate", enabled: true, confidence: 0.7, evidence_level: "inferred", alternatives: [], claim_ids: [] },
      { id: "i2", role: "boost", archetype: "ts_style_boost", enabled: true, confidence: 0.64, evidence_level: "likely", alternatives: ["clean_boost"], claim_ids: ["c2"] },
      { id: "i3", role: "amp", archetype: "british_high_gain", enabled: true, confidence: 0.75, evidence_level: "reported", alternatives: ["american_high_gain_modern", "british_plexi"], claim_ids: ["c1"] },
      { id: "i4", role: "cab", archetype: "closed_back_4x12", enabled: true, confidence: 0.66, evidence_level: "likely", alternatives: [], claim_ids: ["c3"] },
      { id: "i5", role: "reverb", archetype: "room", enabled: true, confidence: 0.5, evidence_level: "inferred", alternatives: ["plate"], claim_ids: [] },
    ],
    claims: [
      {
        id: "c1",
        role: "amp",
        item: "100-watt British head",
        statement: {
          en: "The rhythm tracks were recorded with a 100-watt British head, according to the album's producer.",
          es: "Según el productor del disco, las guitarras rítmicas se grabaron con un cabezal británico de 100 vatios.",
        },
        specificity: "this_recording",
        evidence_level: "reported",
        sources: [
          {
            url: "https://example.com/demo/cinder-avenue-producer-notes",
            publisher: "Demo Studio Diaries (fictional)",
            title: "Producing “Iron Parade”",
            quote: "one hundred watts of British tube, pushed but not cooked",
          },
        ],
      },
      {
        id: "c2",
        role: "boost",
        item: "Green overdrive as a boost",
        statement: {
          en: "A green overdrive pedal with the gain almost off is used to tighten the amp.",
          es: "Un overdrive verde con la ganancia casi al mínimo se usa para apretar el ampli.",
        },
        specificity: "artist_general",
        evidence_level: "likely",
        sources: [
          {
            url: "https://example.com/demo/cinder-avenue-board",
            publisher: "Demo Rig Rundown (fictional)",
            title: "Cinder Avenue's pedalboard",
            quote: "gain at zero, level up — just to tighten the low end",
          },
          {
            url: "https://example.com/demo/cinder-avenue-qa",
            publisher: "Demo Players Forum (fictional)",
            title: "Q&A with Cinder Avenue",
            quote: null,
          },
        ],
      },
      {
        id: "c3",
        role: "cab",
        item: "Cabinet and microphone",
        statement: {
          en: "No source documents the cabinet or microphone used on this recording.",
          es: "Ninguna fuente documenta el gabinete o el micrófono usados en esta grabación.",
        },
        specificity: "this_recording",
        evidence_level: "unknown",
        sources: [],
      },
    ],
    summary: {
      en: "A tight, mid-forward British high-gain rhythm tone, dry and double-tracked. The amp comes from the producer's notes and the tightening boost from rig coverage; the cabinet is undocumented, so it's chosen from the measured spectrum.",
      es: "Un tono rítmico británico de alta ganancia, apretado y con medios adelante, seco y doblado. El ampli viene de las notas del productor y el boost que lo aprieta, de reportajes sobre su equipo; el gabinete no está documentado, así que se elige a partir del espectro medido.",
    },
    explanation: {
      en: "UK 800 is the device's British high-gain model; gain sits at 68 rather than maxed because the Green OD boost adds drive and tightness in front. Middle is pushed to match the measured 1.5 kHz hump. The 4x12 cab's high cut at 7.2 kHz tames the fizz the reference doesn't have, and Gate 2 keeps palm-mutes clean between hits.",
      es: "UK 800 es el modelo británico de alta ganancia del dispositivo; la ganancia está en 68 y no al máximo porque el boost Green OD delante añade saturación y definición. Los medios están subidos para igualar el pico medido en 1,5 kHz. El corte de agudos del gabinete 4x12 en 7,2 kHz doma el fizz que la referencia no tiene, y Gate 2 mantiene limpios los palm-mutes entre golpes.",
    },
    device: chain([
      block("NR", { key: "nr.gate_2", name: "Gate 2" }, [knob("threshold", "Threshold", 42)], { intent_block_id: "i1", confidence: 0.7 }),
      block("DST", { key: "dst.green_od", name: "Green OD" }, [knob("gain", "Gain", 8), knob("tone", "Tone", 62), knob("volume", "Volume", 82)], { intent_block_id: "i2", confidence: 0.64, alternatives: [{ model_key: "dst.od_9", name: "OD 9" }] }),
      block("AMP", { key: "amp.uk_800", name: "UK 800", based_on: "Marshall JCM800" }, [knob("gain", "Gain", 68), knob("volume", "Volume", 50), knob("bass", "Bass", 44), knob("middle", "Middle", 66), knob("treble", "Treble", 58), knob("presence", "Presence", 55)], { intent_block_id: "i3", confidence: 0.75, alternatives: [{ model_key: "amp.flagman_1", name: "Flagman 1" }, { model_key: "amp.uk_slp", name: "UK SLP" }] }),
      block("CAB", { key: "cab.uk_4x12", name: "UK 4x12" }, [knob("volume", "Volume", 60), hz("low_cut", "Low Cut", 85, 20, 500), hz("high_cut", "High Cut", 7200, 1000, 20000)], { intent_block_id: "i4", confidence: 0.6 }),
      block("RVB", { key: "rvb.room", name: "Room" }, [knob("mix", "Mix", 10), knob("decay", "Decay", 30), ms("pre_delay", "Pre-Delay", 5, 200)], { intent_block_id: "i5", confidence: 0.5 }),
      volumeBlock(),
    ]),
    researchOnly: {
      summary: {
        en: "A British high-gain rhythm tone with a tightening boost, based on the producer's notes and rig coverage. Without an excerpt, EQ and cabinet choices are inferred.",
        es: "Un tono rítmico británico de alta ganancia con un boost que lo aprieta, basado en las notas del productor y en reportajes de su equipo. Sin fragmento, la ecualización y el gabinete se infieren.",
      },
      explanation: {
        en: "UK 800 matches the documented British head and Green OD the documented boost. EQ values are typical starting points for this archetype, not measured.",
        es: "UK 800 corresponde al cabezal británico documentado y Green OD al boost documentado. Los valores de ecualización son puntos de partida típicos de este arquetipo, no medidos.",
      },
    },
    patchVolume: 48,
    bpm: null,
    mappingCandidates: 22,
  },
};

/* ------------------------------------------------------------------------------------------ */

const porchLight: Scenario = {
  key: "porch-light",
  song: { id: "demo-porch-light", title: "Porch Light", artist: "The Lowland Hymnal", year: 1998, duration_s: 312 },
  research: "unavailable",
  tone: {
    presetName: "PorchLight",
    confidence: 0.46,
    gainClass: { value: "edge_of_breakup", p: 0.66 },
    guitarDominance: 0.58,
    spectrum: {
      bumps: [
        { hz: 200, db: 2.2, octaves: 0.9 },
        { hz: 700, db: 2, octaves: 1 },
        { hz: 2500, db: 0.8, octaves: 0.8 },
      ],
      lowCut: { hz: 85, slope: 6 },
      highCut: { hz: 4200, slope: 10 },
    },
    ambience: { reverb: "medium", delay: null, modulation: null },
    targets: {
      saturation: target(0.4, 0.66, "measured"),
      low_end: target(0.6, 0.6, "measured"),
      mid_emphasis: target(0.6, 0.55, "measured"),
      brightness: target(0.35, 0.6, "measured"),
      tightness: target(0.35, 0.4, "inferred"),
      compression: target(0.35, 0.35, "inferred"),
      ambience: target(0.45, 0.6, "measured"),
    },
    chain: [
      { id: "i1", role: "drive", archetype: "klon_style", enabled: true, confidence: 0.35, evidence_level: "inferred", alternatives: ["ts_style_boost"], claim_ids: [] },
      { id: "i2", role: "amp", archetype: "fender_tweed", enabled: true, confidence: 0.55, evidence_level: "inferred", alternatives: ["boutique_edge", "vox_ac_topboost"], claim_ids: [] },
      { id: "i3", role: "cab", archetype: "open_back_1x12", enabled: true, confidence: 0.5, evidence_level: "inferred", alternatives: ["open_back_2x12"], claim_ids: [] },
      { id: "i4", role: "reverb", archetype: "spring", enabled: true, confidence: 0.6, evidence_level: "likely", alternatives: ["room"], claim_ids: [] },
    ],
    claims: [],
    summary: {
      en: "A warm, dark edge-of-breakup tone that cleans up with picking dynamics, with a noticeable spring-style reverb. We couldn't research this song's gear, so everything here is inferred from the audio and the style — treat it as a starting point.",
      es: "Un tono cálido y oscuro, al borde de la saturación, que se limpia según la fuerza de la púa, con una reverb de resorte notable. No pudimos investigar el equipo de esta canción, así que todo lo que ves aquí se infiere del audio y del estilo — tómalo como punto de partida.",
    },
    explanation: {
      en: "Without documented gear, the engine matched the measured spectrum: Tweedy at moderate gain gives the rounded low-mids and early breakup, and Blues OD adds a gentle push for the louder phrases. The spring reverb matches the measured decay.",
      es: "Sin equipo documentado, el motor se guió por el espectro medido: Tweedy con ganancia moderada da los medios-graves redondeados y la saturación temprana, y Blues OD añade un empuje suave para las frases más fuertes. La reverb de resorte coincide con la caída medida.",
    },
    device: chain([
      block("DST", { key: "dst.blues_od", name: "Blues OD" }, [knob("gain", "Gain", 30), knob("tone", "Tone", 55), knob("volume", "Volume", 65)], { intent_block_id: "i1", confidence: 0.35, alternatives: [{ model_key: "dst.green_od", name: "Green OD" }] }),
      block("AMP", { key: "amp.tweedy", name: "Tweedy", based_on: "Fender Tweed Deluxe" }, [knob("gain", "Gain", 46), knob("tone", "Tone", 57), knob("volume", "Volume", 52), knob("presence", "Presence", 50)], { intent_block_id: "i2", confidence: 0.55, alternatives: [{ model_key: "amp.bellman_59n", name: "Bellman 59N" }] }),
      block("CAB", { key: "cab.tweed_1x12", name: "Tweed 1x12" }, [knob("volume", "Volume", 60), hz("low_cut", "Low Cut", 70, 20, 500), hz("high_cut", "High Cut", 6500, 1000, 20000)], { intent_block_id: "i3", confidence: 0.5 }),
      block("RVB", { key: "rvb.spring", name: "Spring" }, [knob("mix", "Mix", 26), knob("decay", "Decay", 45), ms("pre_delay", "Pre-Delay", 0, 200)], { intent_block_id: "i4", confidence: 0.6 }),
      volumeBlock(),
    ]),
    patchVolume: 52,
    bpm: null,
    mappingCandidates: 11,
  },
};

/* ------------------------------------------------------------------------------------------ */

const plexiCrunch: ToneFixture = {
  presetName: "TapeHiss",
  confidence: 0.63,
  gainClass: { value: "crunch", p: 0.79 },
  guitarDominance: 0.6,
  spectrum: {
    bumps: [
      { hz: 140, db: 1, octaves: 0.7 },
      { hz: 1200, db: 4, octaves: 1 },
      { hz: 2800, db: 1.2, octaves: 0.6 },
    ],
    lowCut: { hz: 90, slope: 7 },
    highCut: { hz: 5000, slope: 11 },
  },
  ambience: { reverb: "low", delay: { time_ms: 320, subdivision: null }, modulation: null },
  targets: {
    saturation: target(0.58, 0.8, "measured"),
    low_end: target(0.45, 0.6, "measured"),
    mid_emphasis: target(0.78, 0.75, "measured"),
    brightness: target(0.55, 0.6, "measured"),
    tightness: target(0.5, 0.45, "inferred"),
    compression: target(0.4, 0.4, "inferred"),
    ambience: target(0.25, 0.65, "measured"),
  },
  chain: [
    { id: "i1", role: "boost", archetype: "clean_boost", enabled: true, confidence: 0.5, evidence_level: "inferred", alternatives: ["ts_style_boost"], claim_ids: [] },
    { id: "i2", role: "amp", archetype: "british_plexi", enabled: true, confidence: 0.7, evidence_level: "reported", alternatives: ["british_high_gain", "vox_ac_topboost"], claim_ids: ["c1"] },
    { id: "i3", role: "cab", archetype: "closed_back_4x12", enabled: true, confidence: 0.6, evidence_level: "likely", alternatives: [], claim_ids: [] },
    { id: "i4", role: "delay", archetype: "tape_delay", enabled: true, confidence: 0.5, evidence_level: "inferred", alternatives: ["analog_delay"], claim_ids: [] },
  ],
  claims: [
    {
      id: "c1",
      role: "amp",
      item: "Vintage British plexi head",
      statement: {
        en: "The band's guitarist is repeatedly reported playing a vintage British plexi-style head.",
        es: "Se reporta repetidamente que el guitarrista de la banda usa un cabezal británico vintage estilo plexi.",
      },
      specificity: "artist_general",
      evidence_level: "reported",
      sources: [
        {
          url: "https://example.com/demo/static-orchard-profile",
          publisher: "Demo Guitar Monthly (fictional)",
          title: "Static Orchard: loud, old and proud",
          quote: "the old plexi head he's dragged around since the first record",
        },
      ],
    },
  ],
  summary: {
    en: "A mid-heavy plexi crunch with a short tape-style slap. The amp family is reported in press coverage; the rest is measured or inferred from the audio.",
    es: "Un crunch estilo plexi cargado de medios con un eco corto tipo cinta. La familia del ampli aparece en la prensa; el resto está medido o se infiere del audio.",
  },
  explanation: {
    en: "UK SLP is the GP-180's plexi-style model. Middle at 70 reproduces the measured 1.2 kHz push; Micro Boost adds a little extra drive without changing the EQ. The Tape delay is kept low in the mix to add depth rather than repeats.",
    es: "UK SLP es el modelo estilo plexi de la GP-180. Los medios en 70 reproducen el empuje medido en 1,2 kHz; Micro Boost añade un poco más de saturación sin cambiar la ecualización. El delay Tape va bajo en la mezcla para dar profundidad más que repeticiones.",
  },
  device: chain([
    block("PRE", { key: "pre.micro_boost", name: "Micro Boost" }, [knob("gain", "Gain", 40)], { intent_block_id: "i1", confidence: 0.5 }),
    block("AMP", { key: "amp.uk_slp", name: "UK SLP", based_on: "Marshall Super Lead (plexi)" }, [knob("gain", "Gain", 62), knob("volume", "Volume", 50), knob("bass", "Bass", 50), knob("middle", "Middle", 70), knob("treble", "Treble", 60), knob("presence", "Presence", 52)], { intent_block_id: "i2", confidence: 0.7, alternatives: [{ model_key: "amp.uk_50_od", name: "UK50 OD" }, { model_key: "amp.uk_800", name: "UK 800" }] }),
    block("CAB", { key: "cab.uk_4x12", name: "UK 4x12" }, [knob("volume", "Volume", 60), hz("low_cut", "Low Cut", 80, 20, 500), hz("high_cut", "High Cut", 7800, 1000, 20000)], { intent_block_id: "i3", confidence: 0.6 }),
    block("DLY", { key: "dly.tape", name: "Tape" }, [knob("mix", "Mix", 15), ms("time", "Time", 320), knob("feedback", "Feedback", 20)], { intent_block_id: "i4", confidence: 0.5 }),
    volumeBlock(),
  ]),
  researchOnly: {
    summary: {
      en: "A plexi-style crunch based on press coverage of the guitarist's amp. Without an excerpt, gain, EQ and delay are inferred.",
      es: "Un crunch estilo plexi basado en la prensa sobre el ampli del guitarrista. Sin fragmento, la ganancia, la ecualización y el delay se infieren.",
    },
    explanation: {
      en: "UK SLP is the GP-180's plexi-style model, set to a typical crunch. Upload an excerpt to measure the mid push and delay.",
      es: "UK SLP es el modelo estilo plexi de la GP-180, ajustado a un crunch típico. Sube un fragmento para medir el empuje de medios y el delay.",
    },
  },
  patchVolume: 50,
  bpm: null,
  mappingCandidates: 17,
};

const tapeHiss: Scenario = {
  key: "tape-hiss",
  song: { id: "demo-tape-hiss", title: "Tape Hiss", artist: "Static Orchard", year: 2004, duration_s: 198 },
  research: { sources_read: 5, claims_kept: 1, claims_dropped: 1 },
  failure: { step: "draft_intent", code: "ai_unavailable", retryable: true, once: true },
  tone: plexiCrunch,
};

/* ------------------------------------------------------------------------------------------ */

const slowSignal: Scenario = {
  key: "slow-signal",
  song: { id: "demo-slow-signal", title: "Slow Signal", artist: "Night Wires", year: 2016, duration_s: 261 },
  research: { sources_read: 4, claims_kept: 1, claims_dropped: 0 },
  failure: { step: "map_to_device", code: "job_timeout", retryable: true, once: true },
  tone: {
    presetName: "SlowSignal",
    confidence: 0.61,
    gainClass: { value: "edge_of_breakup", p: 0.72 },
    guitarDominance: 0.62,
    spectrum: {
      bumps: [
        { hz: 250, db: -1.5, octaves: 0.8 },
        { hz: 2500, db: 4.2, octaves: 0.8 },
        { hz: 900, db: 1, octaves: 1 },
      ],
      lowCut: { hz: 110, slope: 8 },
      highCut: { hz: 6200, slope: 9 },
    },
    ambience: { reverb: "medium", delay: null, modulation: { kind: "tremolo", rate_hz: 4.5 } },
    targets: {
      saturation: target(0.35, 0.7, "measured"),
      low_end: target(0.35, 0.65, "measured"),
      mid_emphasis: target(0.55, 0.6, "measured"),
      brightness: target(0.78, 0.7, "measured"),
      tightness: target(0.45, 0.4, "inferred"),
      compression: target(0.3, 0.4, "inferred"),
      ambience: target(0.5, 0.7, "measured"),
    },
    chain: [
      { id: "i1", role: "amp", archetype: "vox_ac_topboost", enabled: true, confidence: 0.68, evidence_level: "reported", alternatives: ["fender_blackface_clean"], claim_ids: ["c1"] },
      { id: "i2", role: "cab", archetype: "open_back_2x12", enabled: true, confidence: 0.55, evidence_level: "inferred", alternatives: [], claim_ids: [] },
      { id: "i3", role: "modulation", archetype: "tremolo", enabled: true, confidence: 0.74, evidence_level: "likely", alternatives: [], claim_ids: [] },
      { id: "i4", role: "reverb", archetype: "plate", enabled: true, confidence: 0.6, evidence_level: "inferred", alternatives: ["spring"], claim_ids: [] },
    ],
    claims: [
      {
        id: "c1",
        role: "amp",
        item: "AC-style 2×12 combo",
        statement: {
          en: "Live photos and an interview mention an AC-style 2×12 combo with the top-boost channel.",
          es: "Fotos en vivo y una entrevista mencionan un combo 2×12 estilo AC con el canal top-boost.",
        },
        specificity: "artist_general",
        evidence_level: "reported",
        sources: [
          {
            url: "https://example.com/demo/night-wires-interview",
            publisher: "Demo Indie Weekly (fictional)",
            title: "Night Wires talk tone",
            quote: "it's always been the top-boost channel for me",
          },
        ],
      },
    ],
    summary: {
      en: "A chimey, bright top-boost tone just breaking up, with a steady tremolo and a plate reverb. The amp family is reported; the tremolo rate is measured at about 4.5 Hz.",
      es: "Un tono top-boost brillante y campanudo, justo empezando a saturar, con un trémolo constante y una reverb de placa. La familia del ampli está reportada; la velocidad del trémolo se midió en unos 4,5 Hz.",
    },
    explanation: {
      en: "Foxy 30TB is the device's top-boost model; Tone Cut is kept low so the measured 2.5 kHz chime comes through. Sine Trem at 4.5 Hz matches the measured pulse, and a Plate reverb adds space without muddying the low end.",
      es: "Foxy 30TB es el modelo top-boost del dispositivo; Tone Cut se mantiene bajo para que se escuche el brillo medido en 2,5 kHz. Sine Trem a 4,5 Hz iguala el pulso medido, y una reverb Plate añade espacio sin embarrar los graves.",
    },
    device: chain([
      block("AMP", { key: "amp.foxy_30tb", name: "Foxy 30TB", based_on: "Vox AC30 Top Boost" }, [knob("gain", "Gain", 45), knob("volume", "Volume", 55), knob("tone_cut", "Tone Cut", 30), knob("bright", "Bright", 60)], { intent_block_id: "i1", confidence: 0.68, alternatives: [{ model_key: "amp.dark_twin", name: "Dark Twin" }] }),
      block("CAB", { key: "cab.uk_2x12_blue", name: "UK 2x12 Blue" }, [knob("volume", "Volume", 60), hz("low_cut", "Low Cut", 100, 20, 500), hz("high_cut", "High Cut", 9000, 1000, 20000)], { intent_block_id: "i2", confidence: 0.55 }),
      block("MOD", { key: "mod.sine_trem", name: "Sine Trem" }, [knob("depth", "Depth", 38), hz("rate", "Rate", 4.5, 0.1, 10), knob("volume", "Volume", 50)], { intent_block_id: "i3", confidence: 0.74 }),
      block("RVB", { key: "rvb.plate", name: "Plate" }, [knob("mix", "Mix", 22), knob("decay", "Decay", 50), ms("pre_delay", "Pre-Delay", 12, 200)], { intent_block_id: "i4", confidence: 0.6 }),
      volumeBlock(),
    ]),
    researchOnly: {
      summary: {
        en: "A chimey top-boost tone based on interviews and live photos. Without an excerpt, the tremolo and reverb settings are inferred.",
        es: "Un tono top-boost campanudo basado en entrevistas y fotos en vivo. Sin fragmento, los ajustes de trémolo y reverb se infieren.",
      },
      explanation: {
        en: "Foxy 30TB is the device's top-boost model. Tremolo rate and reverb are typical values for this style — upload an excerpt to measure them.",
        es: "Foxy 30TB es el modelo top-boost del dispositivo. La velocidad del trémolo y la reverb son valores típicos de este estilo — sube un fragmento para medirlos.",
      },
    },
    patchVolume: 50,
    bpm: null,
    mappingCandidates: 12,
  },
};

/* ------------------------------------------------------------------------------------------ */

/** Excerpt uploaded without a song: no research; the tone is derived from the audio. */
const excerptOnly: Scenario = {
  key: "excerpt-only",
  song: null,
  research: "unavailable",
  tone: {
    ...plexiCrunch,
    presetName: "MyExcerpt",
    confidence: 0.52,
    claims: [],
    chain: plexiCrunch.chain.map((item) => ({ ...item, evidence_level: item.evidence_level === "reported" ? "inferred" : item.evidence_level, claim_ids: [] })),
    summary: {
      en: "A mid-heavy crunch tone measured from your excerpt, with a short slap delay. There's no song to research, so the amp family is inferred from the audio.",
      es: "Un tono crunch cargado de medios medido en tu fragmento, con un eco corto. No hay canción que investigar, así que la familia del ampli se infiere del audio.",
    },
  },
};

export const SCENARIOS: Scenario[] = [northernLights, ironParade, porchLight, tapeHiss, slowSignal];
export const EXCERPT_SCENARIO = excerptOnly;

export function scenarioForSong(songId: string | null | undefined): Scenario {
  if (!songId) return excerptOnly;
  return SCENARIOS.find((scenario) => scenario.song?.id === songId) ?? northernLights;
}

export function scenarioByKey(key: string): Scenario {
  return [...SCENARIOS, excerptOnly].find((scenario) => scenario.key === key) ?? northernLights;
}

export function localizeClaims(claims: ClaimFixture[], locale: Locale): Claim[] {
  return claims.map((claim) => ({
    ...claim,
    statement: claim.statement[locale],
    sources: claim.sources.map((source) => ({
      url: source.url,
      publisher: source.publisher,
      title: source.title,
      quote_excerpt: source.quote,
      retrieved_at: RETRIEVED_AT,
    })),
  }));
}
