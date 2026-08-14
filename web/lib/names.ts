// Client-safe pretty names for model specs (no fs imports here).
const NAME_MAP: Record<string, string> = {
  "anthropic/claude-haiku-4.5": "Claude Haiku 4.5",
  "openai/gpt-5.6-luna": "GPT-5.6 Luna",
  "openai/gpt-5-mini": "GPT-5 Mini",
  "google/gemini-3.1-flash-lite": "Gemini 3.1 Flash Lite",
  "deepseek/deepseek-v4-flash": "DeepSeek V4 Flash",
  "deepseek/deepseek-v4-pro": "DeepSeek V4 Pro",
  "qwen/qwen3.6-flash": "Qwen3.6 Flash",
  "qwen/qwen3.7-plus": "Qwen3.7 Plus",
  "meta-llama/llama-4-maverick": "Llama 4 Maverick",
  "mistralai/mistral-large-2512": "Mistral Large 2512",
  "z-ai/glm-4.7": "GLM-4.7",
  "minimax/minimax-m3": "MiniMax M3",
  "x-ai/grok-4.3": "Grok 4.3",
  "anthropic/claude-fable-5": "Claude Fable 5",
  "anthropic/claude-opus-5": "Claude Opus 5",
  "anthropic/claude-sonnet-5": "Claude Sonnet 5",
  "openai/gpt-5.6-sol": "GPT-5.6 Sol",
  "moonshotai/kimi-k3": "Kimi K3",
  "x-ai/grok-4.5": "Grok 4.5",
  "z-ai/glm-5.2": "GLM-5.2",
  "google/gemini-3.5-flash": "Gemini 3.5 Flash",
  "google/gemini-3.6-flash": "Gemini 3.6 Flash",
  "qwen/qwen3.7-max": "Qwen3.7 Max",
  "meta/muse-spark-1.1": "Muse Spark 1.1",
  "nex-agi/nex-n2-pro": "Nex N2 Pro",
  "thinkingmachines/inkling": "Inkling",
  "xiaomi/mimo-v2.5-pro": "MiMo V2.5 Pro",
  "tencent/hy3": "Hy3",
  "x-ai/grok-4.6": "Grok 4.6",
  "sarvam:sarvam-30b": "Sarvam 30B",
  "sarvam:sarvam-105b": "Sarvam 105B",
  "sarvam:sarvam-30b:high": "Sarvam 30B (high reasoning)",
  "sarvam:sarvam-105b:high": "Sarvam 105B (high reasoning)",
};

const LAB_MAP: Record<string, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  google: "Google",
  deepseek: "DeepSeek",
  qwen: "Alibaba",
  "meta-llama": "Meta",
  mistralai: "Mistral",
  "z-ai": "Zhipu",
  minimax: "MiniMax",
  "x-ai": "xAI",
  moonshotai: "Moonshot",
  meta: "Meta",
  "nex-agi": "Nex AGI",
  thinkingmachines: "Thinking Machines",
  xiaomi: "Xiaomi",
  tencent: "Tencent",
};

export function prettyName(model: string): string {
  if (NAME_MAP[model]) return NAME_MAP[model];
  return model
    .replace(/^mock:sample-/, "Sample ")
    .replace(/^mock:/, "Mock ")
    .replace(/^sarvam:/, "Sarvam ")
    .replace(/^[a-z-]+\//, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function labName(model: string): string {
  if (model.startsWith("sarvam:")) return "Sarvam AI";
  const org = model.split("/")[0];
  return LAB_MAP[org] ?? (model.startsWith("mock:") ? "Sample" : org);
}

// Open-weights vs closed API-only, keyed by org (override per-model when needed).
const OPEN_ORGS = new Set(["deepseek", "qwen", "meta-llama", "z-ai", "minimax", "moonshotai", "mistralai", "tencent", "sarvam", "xiaomi", "nex-agi", "thinkingmachines"]);
const WEIGHTS_OVERRIDE: Record<string, "open" | "closed"> = {
  "qwen/qwen3.7-max": "closed",
  "qwen/qwen3.7-plus": "closed",
  "meta/muse-spark-1.1": "closed",
};

export function weightsClass(model: string): "open" | "closed" {
  if (WEIGHTS_OVERRIDE[model]) return WEIGHTS_OVERRIDE[model];
  return OPEN_ORGS.has(model.split("/")[0]) || model.startsWith("sarvam:") ? "open" : "closed";
}

// Reasoning-token policy per model, shown on the board for fairness transparency.
// Uniform rule: reasoning-capable models run with effort capped to "low"
// (budget + comparability); labeled variants run higher effort explicitly.
const NON_REASONING = new Set([
  "meta-llama/llama-4-maverick",
  "mistralai/mistral-large-2512",
  "deepseek/deepseek-v4-flash",
  "openai/gpt-5-mini",
]);

export function reasoningInfo(model: string): string {
  if (model.endsWith(":high")) return "reasoning: high";
  if (NON_REASONING.has(model)) return "no hidden reasoning";
  return "reasoning: capped low";
}
