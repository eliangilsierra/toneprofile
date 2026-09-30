import type { FeedbackCreate, GenerationCreate, TimeWindow } from "@/lib/api/types";

export interface UploadRecord {
  id: string;
  purpose: "reference" | "recording";
  filename: string;
  sizeBytes: number;
  createdAt: number;
  completedAt: number | null;
}

export interface AttemptRecord {
  startedAt: number;
  /** Index into the run plan where this attempt starts (0 for the first attempt). */
  startIndex: number;
}

export interface GenerationRecord {
  id: string;
  scenarioKey: string;
  createdAt: number;
  request: GenerationCreate;
  referenceWindow: TimeWindow | null;
  /** Hints derived from the uploaded file name (demo only): e.g. "noguitar", "multi", "lowq". */
  audioFlags: string[];
  attempts: AttemptRecord[];
  cancelledAt: number | null;
  feedback: Record<number, FeedbackCreate>;
}

interface StoreShape {
  version: 1;
  uploads: Record<string, UploadRecord>;
  generations: Record<string, GenerationRecord>;
}

const STORAGE_KEY = "toneprofile-demo-v1";

const empty = (): StoreShape => ({ version: 1, uploads: {}, generations: {} });

let memory: StoreShape = empty();

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function load(): StoreShape {
  const local = storage();
  if (!local) return memory;
  try {
    const raw = local.getItem(STORAGE_KEY);
    if (!raw) return memory;
    const parsed = JSON.parse(raw) as StoreShape;
    return parsed.version === 1 ? parsed : empty();
  } catch {
    return memory;
  }
}

function save(next: StoreShape): void {
  memory = next;
  const local = storage();
  if (!local) return;
  try {
    local.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked: the demo keeps working in memory.
  }
}

/** Demo persistence: localStorage when available (so reloads keep history), memory otherwise. */
export const store = {
  getUpload: (id: string) => load().uploads[id],
  putUpload(record: UploadRecord) {
    const state = load();
    save({ ...state, uploads: { ...state.uploads, [record.id]: record } });
  },
  getGeneration: (id: string) => load().generations[id],
  listGenerations: () => Object.values(load().generations).sort((a, b) => b.createdAt - a.createdAt),
  putGeneration(record: GenerationRecord) {
    const state = load();
    save({ ...state, generations: { ...state.generations, [record.id]: record } });
  },
  reset() {
    save(empty());
  },
};

export function newId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replaceAll("-", "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `${prefix}_${random}`;
}
