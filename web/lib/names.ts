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
};

export function prettyName(model: string): string {
  if (NAME_MAP[model]) return NAME_MAP[model];
  return model
    .replace(/^mock:sample-/, "Sample ")
    .replace(/^mock:/, "Mock ")
    .replace(/^sarvam:/, "Sarvam ")
    .replace(/^[a-z-]+\//, "")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function labName(model: string): string {
  const org = model.split("/")[0];
  return LAB_MAP[org] ?? (model.startsWith("mock:") ? "Sample" : org);
}

// Open-weights vs closed API-only, keyed by org (override per-model when needed).
const OPEN_ORGS = new Set(["deepseek", "qwen", "meta-llama", "z-ai", "minimax", "moonshotai", "mistralai", "tencent", "sarvam"]);
const WEIGHTS_OVERRIDE: Record<string, "open" | "closed"> = {
  "qwen/qwen3.7-max": "closed",
  "qwen/qwen3.7-plus": "closed",
};

export function weightsClass(model: string): "open" | "closed" {
  if (WEIGHTS_OVERRIDE[model]) return WEIGHTS_OVERRIDE[model];
  return OPEN_ORGS.has(model.split("/")[0]) || model.startsWith("sarvam:") ? "open" : "closed";
}
