import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const ROOT = path.resolve(process.cwd(), "..");
const RESULTS = path.join(ROOT, "results");
const RAW = path.join(RESULTS, "raw");
const SCENARIOS = path.join(ROOT, "dataset", "scenarios");

export const LANGS = ["en", "hing", "hi"] as const;
export type Lang = (typeof LANGS)[number];

export const DIMENSION_META: Record<string, { name: string; short: string; blurb: string }> = {
  indirectness: {
    name: "Indirect speech & face-saving",
    short: "Indirectness",
    blurb: "Hearing the no inside “dekhte hain” while protecting everyone’s face.",
  },
  hierarchy: {
    name: "Hierarchy & respect registers",
    short: "Hierarchy",
    blurb: "Upward disagreement, aap/tum, and elder dynamics beyond the Western direct feedback playbook.",
  },
  family: {
    name: "Family & the collective self",
    short: "Family",
    blurb: "Decisions made by families, not individuals; holding belonging and autonomy together.",
  },
  honor_shame: {
    name: "Honor, shame & reputation",
    short: "Honor & shame",
    blurb: "Treating izzat and “log kya kahenge” as real constraints to work with, not dismiss.",
  },
  code_mixing: {
    name: "Code-mixed emotional register",
    short: "Code-mixing",
    blurb: "A language switch mid-conversation is an emotional event. Does the model hear it?",
  },
  rituals: {
    name: "Ritual & life-event pragmatics",
    short: "Rituals",
    blurb: "Grief, weddings, festivals, and gifts, including what varies by community.",
  },
  money: {
    name: "Money, obligation & reciprocity",
    short: "Money",
    blurb: "Loans and obligation ledgers where a direct refusal has social cost.",
  },
  support: {
    name: "Support calibration (control)",
    short: "Support",
    blurb: "Venting instead of solving. This culture neutral anchor helps measure the cultural gap.",
  },
};

export interface DimScore {
  overall: number | null;
  by_lang: Record<Lang, number | null>;
}
export interface ItemScore {
  item_id: string;
  dimension: string;
  lang: Lang;
  score: number | null;
}
export interface ModelResult {
  model: string;
  slug: string;
  mock: boolean;
  overall: number;
  by_lang: Record<Lang, number | null>;
  dimensions: Record<string, DimScore>;
  language_gap_en_hi: number | null;
  language_gap_en_hing: number | null;
  refusal_rate: number | null;
  n_items_scored: number;
  n_refusals: number;
  n_errors: number;
  judges: string[];
  ci95: [number, number] | null;
  items: ItemScore[];
}
export interface Leaderboard {
  generated_at: string;
  dataset_hash: string;
  sample: boolean;
  dimensions: string[];
  langs: Lang[];
  models: ModelResult[];
  excluded?: { model: string; slug: string; n_items: number; reason: string }[];
}

export function getLeaderboard(): Leaderboard {
  return JSON.parse(fs.readFileSync(path.join(RESULTS, "leaderboard.json"), "utf8"));
}

import { prettyName } from "./names";

export const displayName = prettyName;

export interface Scenario {
  id: string;
  type: "roleplay" | "analysis";
  dimension: string;
  secondary?: string[];
  title: string;
  persona: Record<string, string | number>;
  situation: string;
  probe_note?: string;
  gold_rationale: string;
  variants: Record<string, { user_turns?: string[]; transcript?: string; questions?: string[] }>;
  variants_exempt?: boolean;
  review: { status: string };
}

export function getScenarios(): Scenario[] {
  const files: string[] = [];
  for (const sub of ["roleplay", "analysis"]) {
    for (const f of fs.readdirSync(path.join(SCENARIOS, sub))) {
      if (f.endsWith(".yaml")) files.push(path.join(SCENARIOS, sub, f));
    }
  }
  return files.map((f) => YAML.parse(fs.readFileSync(f, "utf8"))).sort((a, b) => a.id.localeCompare(b.id));
}

export interface Turn {
  role: "user" | "assistant";
  content: string;
}
export interface Judgment {
  judge: string;
  item_id: string;
  refused: boolean;
  criteria: Record<string, { justification: string; score: number | null }>;
}
export interface TranscriptRecord {
  item_id: string;
  scenario_id: string;
  lang: Lang;
  dimension: string;
  type: string;
  status: string;
  turns: Turn[];
}

export function getTranscript(slug: string, itemId: string): TranscriptRecord | null {
  const p = path.join(RAW, slug, "items", `${itemId}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export function getJudgments(slug: string, itemId: string): Judgment[] {
  const dir = path.join(RAW, slug, "judgments");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(itemId + "."))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

export function getScenarioById(id: string): Scenario | undefined {
  return getScenarios().find((s) => s.id === id);
}

export function fmt(n: number | null | undefined, digits = 2): string {
  return n == null ? "N/A" : n.toFixed(digits);
}

export const LANG_LABEL: Record<Lang | "all", string> = {
  all: "All",
  en: "English",
  hing: "Hinglish",
  hi: "हिंदी",
};
