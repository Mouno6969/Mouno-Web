import "server-only";

import { prisma } from "./prisma";
import { promoterQuality, site, socialLinks } from "./constants";
import { pointRules } from "./twitter";

export const AI_SUPPORT_MAX_MESSAGE_LENGTH = 1200;
const MAX_SYSTEM_PROMPT_LENGTH = 12000;
const REQUEST_TIMEOUT_MS = 2000;

export const requiredWebsiteProviderPriority = ["groq", "nvidia_llama_8b", "nvidia_kimi"] as const;

export const defaultWebsiteProviderOrder = [
  "groq",
  "nvidia_llama_8b",
  "nvidia_kimi",
  "nvidia_qwen_7b",
  "nvidia_mistral_small",
  "nvidia_nemotron_nano",
  "nvidia_llama4_scout",
  "openrouter",
  "gemini",
  "huggingface",
  "cohere",
  "mistral",
  "nvidia_deepseek",
  "nvidia_gemma",
] as const;

export type AiProvider = (typeof defaultWebsiteProviderOrder)[number];
type KeyName = AiProvider | "nvidia";

type ProviderConfig = {
  label: string;
  kind: "openai" | "gemini" | "cohere";
  endpoint?: string;
  modelEnv: string;
  defaultModel: string;
  keyEnv: string[];
  sharedKeyName?: KeyName;
  extraPayload?: Record<string, unknown>;
};

export const adminAiProviderKeyFields: { name: KeyName; label: string; description: string }[] = [
  { name: "groq", label: "Groq", description: "Primary website AI provider." },
  { name: "nvidia", label: "NVIDIA shared key", description: "Fallback key for all NVIDIA-hosted models when a provider-specific key is not saved." },
  { name: "nvidia_llama_8b", label: "NVIDIA Llama 3.1 8B", description: "Second priority website AI provider." },
  { name: "nvidia_kimi", label: "NVIDIA Kimi K2.6", description: "Third priority website AI provider." },
  { name: "nvidia_qwen_7b", label: "NVIDIA Qwen 7B", description: "Normal fallback provider." },
  { name: "nvidia_mistral_small", label: "NVIDIA Mistral Small", description: "Normal fallback provider." },
  { name: "nvidia_nemotron_nano", label: "NVIDIA Nemotron Nano", description: "Normal fallback provider." },
  { name: "nvidia_llama4_scout", label: "NVIDIA Llama 4 Scout", description: "Normal fallback provider." },
  { name: "nvidia_deepseek", label: "NVIDIA DeepSeek", description: "Normal fallback provider." },
  { name: "nvidia_gemma", label: "NVIDIA Gemma", description: "Normal fallback provider." },
  { name: "openrouter", label: "OpenRouter", description: "Normal fallback provider." },
  { name: "gemini", label: "Gemini", description: "Normal fallback provider." },
  { name: "huggingface", label: "Hugging Face", description: "Normal fallback provider." },
  { name: "cohere", label: "Cohere", description: "Normal fallback provider." },
  { name: "mistral", label: "Mistral", description: "Normal fallback provider." },
];

const providerConfigs: Record<AiProvider, ProviderConfig> = {
  groq: {
    label: "Groq",
    kind: "openai",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    modelEnv: "GROQ_MODEL",
    defaultModel: "llama-3.1-8b-instant",
    keyEnv: ["GROQ_API_KEY"],
  },
  nvidia_llama_8b: {
    label: "NVIDIA Llama 3.1 8B",
    kind: "openai",
    endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
    modelEnv: "NVIDIA_LLAMA_8B_MODEL",
    defaultModel: "meta/llama-3.1-8b-instruct",
    keyEnv: ["NVIDIA_LLAMA_8B_API_KEY", "NVIDIA_API_KEY"],
    sharedKeyName: "nvidia",
  },
  nvidia_kimi: {
    label: "NVIDIA Kimi K2.6",
    kind: "openai",
    endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
    modelEnv: "NVIDIA_KIMI_MODEL",
    defaultModel: "moonshotai/kimi-k2.6",
    keyEnv: ["NVIDIA_KIMI_API_KEY", "NVIDIA_API_KEY"],
    sharedKeyName: "nvidia",
    extraPayload: { chat_template_kwargs: { thinking: true } },
  },
  nvidia_qwen_7b: {
    label: "NVIDIA Qwen 7B",
    kind: "openai",
    endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
    modelEnv: "NVIDIA_QWEN_7B_MODEL",
    defaultModel: "qwen/qwen2-7b-instruct",
    keyEnv: ["NVIDIA_QWEN_7B_API_KEY", "NVIDIA_API_KEY"],
    sharedKeyName: "nvidia",
  },
  nvidia_mistral_small: {
    label: "NVIDIA Mistral Small",
    kind: "openai",
    endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
    modelEnv: "NVIDIA_MISTRAL_SMALL_MODEL",
    defaultModel: "mistralai/mistral-small-24b-instruct",
    keyEnv: ["NVIDIA_MISTRAL_SMALL_API_KEY", "NVIDIA_API_KEY"],
    sharedKeyName: "nvidia",
  },
  nvidia_nemotron_nano: {
    label: "NVIDIA Nemotron Nano",
    kind: "openai",
    endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
    modelEnv: "NVIDIA_NEMOTRON_NANO_MODEL",
    defaultModel: "nvidia/llama-3.1-nemotron-nano-8b-v1",
    keyEnv: ["NVIDIA_NEMOTRON_NANO_API_KEY", "NVIDIA_API_KEY"],
    sharedKeyName: "nvidia",
  },
  nvidia_llama4_scout: {
    label: "NVIDIA Llama 4 Scout",
    kind: "openai",
    endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
    modelEnv: "NVIDIA_LLAMA4_SCOUT_MODEL",
    defaultModel: "meta/llama-4-scout-17b-16e-instruct",
    keyEnv: ["NVIDIA_LLAMA4_SCOUT_API_KEY", "NVIDIA_API_KEY"],
    sharedKeyName: "nvidia",
  },
  nvidia_deepseek: {
    label: "NVIDIA DeepSeek",
    kind: "openai",
    endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
    modelEnv: "NVIDIA_DEEPSEEK_MODEL",
    defaultModel: "deepseek-ai/deepseek-v4-pro",
    keyEnv: ["NVIDIA_DEEPSEEK_API_KEY", "NVIDIA_API_KEY"],
    sharedKeyName: "nvidia",
  },
  nvidia_gemma: {
    label: "NVIDIA Gemma",
    kind: "openai",
    endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
    modelEnv: "NVIDIA_GEMMA_MODEL",
    defaultModel: "google/gemma-4-31b-it",
    keyEnv: ["NVIDIA_GEMMA_API_KEY", "NVIDIA_API_KEY"],
    sharedKeyName: "nvidia",
  },
  openrouter: {
    label: "OpenRouter",
    kind: "openai",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    modelEnv: "OPENROUTER_MODEL",
    defaultModel: "meta-llama/llama-3.1-8b-instruct:free",
    keyEnv: ["OPENROUTER_API_KEY"],
  },
  gemini: {
    label: "Gemini",
    kind: "gemini",
    modelEnv: "GEMINI_MODEL",
    defaultModel: "gemini-1.5-flash",
    keyEnv: ["GEMINI_API_KEY"],
  },
  huggingface: {
    label: "Hugging Face",
    kind: "openai",
    endpoint: "https://router.huggingface.co/v1/chat/completions",
    modelEnv: "HUGGINGFACE_MODEL",
    defaultModel: "HuggingFaceH4/zephyr-7b-beta",
    keyEnv: ["HUGGINGFACE_API_KEY", "HF_TOKEN"],
  },
  cohere: {
    label: "Cohere",
    kind: "cohere",
    endpoint: "https://api.cohere.com/v2/chat",
    modelEnv: "COHERE_MODEL",
    defaultModel: "command-r",
    keyEnv: ["COHERE_API_KEY"],
  },
  mistral: {
    label: "Mistral",
    kind: "openai",
    endpoint: "https://api.mistral.ai/v1/chat/completions",
    modelEnv: "MISTRAL_MODEL",
    defaultModel: "mistral-small-latest",
    keyEnv: ["MISTRAL_API_KEY"],
  },
};

function isSupportedProvider(value: string): value is AiProvider {
  return value in providerConfigs;
}

function parseOrder(value: string | undefined) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(isSupportedProvider);
}

function uniqueProviders(values: AiProvider[]) {
  return values.filter((value, index) => values.indexOf(value) === index);
}

export function getWebsiteAiProviderOrder() {
  const configuredOrder = parseOrder(process.env.WEBSITE_AI_PROVIDER_ORDER || process.env.AI_PROVIDER_ORDER);
  const baseOrder = configuredOrder.length ? configuredOrder : [...defaultWebsiteProviderOrder];
  return uniqueProviders([...requiredWebsiteProviderPriority, ...baseOrder, ...defaultWebsiteProviderOrder]);
}

function modelFor(provider: AiProvider) {
  const config = providerConfigs[provider];
  return process.env[config.modelEnv] || config.defaultModel;
}

function envKeyFor(provider: AiProvider) {
  for (const envName of providerConfigs[provider].keyEnv) {
    const value = process.env[envName]?.trim();
    if (value) return value;
  }
  return "";
}

function maskSecret(value: string | null | undefined) {
  if (!value) return "";
  if (value.length <= 8) return `${value.slice(0, 2)}…${value.slice(-2)}`;
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

export async function getAiProviderKeyStatuses() {
  const settings = await prisma.aiProviderSetting.findMany({ select: { provider: true, apiKey: true, updatedAt: true } });
  const settingsByProvider = new Map(settings.map((setting) => [setting.provider, setting]));
  return adminAiProviderKeyFields.map((field) => {
    const saved = settingsByProvider.get(field.name);
    const directProvider = field.name !== "nvidia" && isSupportedProvider(field.name) ? field.name : null;
    const envConfigured = directProvider
      ? Boolean(envKeyFor(directProvider))
      : Boolean(process.env.NVIDIA_API_KEY?.trim());
    return {
      ...field,
      configured: Boolean(saved?.apiKey || envConfigured),
      source: saved?.apiKey ? "Admin database" : envConfigured ? "Environment fallback" : "Not configured",
      masked: saved?.apiKey ? maskSecret(saved.apiKey) : envConfigured ? "configured in env" : "",
      updatedAt: saved?.updatedAt || null,
    };
  });
}

async function getSavedApiKeys() {
  const settings = await prisma.aiProviderSetting.findMany({ select: { provider: true, apiKey: true } });
  return new Map(settings.map((setting) => [setting.provider, setting.apiKey]));
}

function keyFor(provider: AiProvider, savedKeys: Map<string, string>) {
  const config = providerConfigs[provider];
  return savedKeys.get(provider) || (config.sharedKeyName ? savedKeys.get(config.sharedKeyName) : "") || envKeyFor(provider);
}

function timeoutSignal() {
  if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
    return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  if (typeof timeout === "object" && "unref" in timeout && typeof timeout.unref === "function") timeout.unref();
  return controller.signal;
}

function readOpenAiText(response: unknown) {
  const data = response as { choices?: { message?: { content?: unknown }; text?: unknown }[] };
  const content = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text;
  return typeof content === "string" ? content.trim() : "";
}

function readGeminiText(response: unknown) {
  const data = response as { candidates?: { content?: { parts?: { text?: unknown }[] } }[] };
  return data.candidates?.[0]?.content?.parts?.map((part) => (typeof part.text === "string" ? part.text : "")).join(" ").trim() || "";
}

function readCohereText(response: unknown) {
  const data = response as { message?: { content?: { text?: unknown }[] } };
  return data.message?.content?.map((part) => (typeof part.text === "string" ? part.text : "")).join(" ").trim() || "";
}

async function postJson(url: string, headers: Record<string, string>, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: timeoutSignal(),
  });
  if (!response.ok) throw new Error(`AI provider failed with ${response.status}`);
  return response.json() as Promise<unknown>;
}

async function callProvider(provider: AiProvider, apiKey: string, systemPrompt: string, message: string) {
  const config = providerConfigs[provider];
  const model = modelFor(provider);
  if (config.kind === "gemini") {
    const json = await postJson(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {},
      {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 850 },
      },
    );
    return readGeminiText(json);
  }
  if (config.kind === "cohere") {
    const json = await postJson(config.endpoint || "", { Authorization: `Bearer ${apiKey}` }, {
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.2,
      max_tokens: 850,
    });
    return readCohereText(json);
  }
  const headers: Record<string, string> = { Authorization: `Bearer ${apiKey}` };
  if (provider === "openrouter") {
    headers["HTTP-Referer"] = site.publicUrl;
    headers["X-Title"] = site.name;
  }
  const json = await postJson(config.endpoint || "", headers, {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ],
    temperature: 0.2,
    max_tokens: 850,
    ...config.extraPayload,
  });
  return readOpenAiText(json);
}

async function buildRewardPoolContext() {
  const rewardPool = await prisma.rewardPool.findUnique({ where: { id: 1 } });
  if (!rewardPool) return "Current reward pool facts: no reward pool record is configured yet; public pages should treat reward terms as inactive/not announced.";
  const campaignWindow = rewardPool.campaignStartAt || rewardPool.campaignEndAt
    ? `${rewardPool.campaignStartAt ? rewardPool.campaignStartAt.toISOString() : "open start"} to ${rewardPool.campaignEndAt ? rewardPool.campaignEndAt.toISOString() : "open end"}`
    : "not configured";
  return [
    "Current reward pool facts from the website database:",
    `- Status: ${rewardPool.active ? "Active" : "Inactive"}.`,
    `- Display amount: ${rewardPool.amount || "not announced"}.`,
    `- Description: ${rewardPool.description || "not configured"}.`,
    `- Points-to-SOL rate: ${rewardPool.pointsToSolRate || "inactive / not announced yet"}.`,
    `- Minimum withdrawal: ${rewardPool.minimumWithdrawal || "inactive / not announced yet"}.`,
    `- Payment cycle: ${rewardPool.paymentCycle || "manual / not active yet"}.`,
    `- Campaign window: ${campaignWindow}.`,
    `- Last updated: ${rewardPool.updatedAt.toISOString()}.`,
    "Do not expose admin notes, secrets, or any non-public database details.",
  ].join("\n");
}

export async function buildWebsiteAiSupportPrompt() {
  const rewardPoolFacts = await buildRewardPoolContext();
  const prompt = `You are the read-only AI support assistant for the RefundYourSOL Promo website / Mouno-Web. This support is only for the RefundYourSOL Promo website experience at ${site.publicUrl}; it is not official RefundYourSOL platform support and it is not a bot support channel.

Hard language rule: answer only in English. If the user writes in Bengali, Bangla, or any other language, still reply in English only.

Safety and scope rules:
- Be read-only. You cannot approve applications, approve posts, approve withdrawals, change points, verify X posts, make payouts, access admin notes, access secrets, or guarantee live X tracking.
- Refuse to discuss or use bot internals, bKash automation, Telegram Stars, crypto-selling bot flows, private Mouno systems, private keys, seed phrases, or unrelated private project details.
- Never ask users for private keys, seed phrases, admin passwords, API keys, or wallet secrets.
- You may mention only the public community links from this website when asked about social links, including the public community link at ${socialLinks.telegram}; do not describe any bot-specific behavior.
- Direct users to official platform actions at ${site.publicUrl}. Direct website flows to /promoters/apply, /promoters/posts, /status, /withdraw, and /admin/login only for admins.

Website A-Z facts:
- RefundYourSOL Promo is an unofficial promotional community portal for RefundYourSOL at ${site.brandUrl}. It is not official, not a replacement, and not impersonation.
- Purpose: community promotion, promoter applications, Twitter/X hashtag post submissions, admin-reviewed points, and withdrawal review.
- Public social links: official site ${site.publicUrl}; community link ${socialLinks.telegram}; Discord ${socialLinks.discord}; Twitter/X ${socialLinks.twitter}.
- Promoter requirements: ${promoterQuality.minimumFollowersLabel} followers, established Twitter/X account, Crypto/Solana audience preferred, no bot/fake engagement, posts require ${promoterQuality.requiredHashtags.join(" or ")}, and no impersonation of ${promoterQuality.officialHandle}.
- Apply page /promoters/apply fields: display name, X profile URL or handle, follower count, optional SOL wallet.
- Post submission page /promoters/posts fields: X identifier, post URL, optional post text/evidence. Duplicate post URLs are rejected. The user must apply first.
- Point rules: Like = ${pointRules.like}, Comment = ${pointRules.comment}, Repost = ${pointRules.repost}, with a maximum of ${pointRules.maxEligibleCommentsPerUser} eligible comments per commenter per post.
- Version 1 has no live X tracking and no official X API requirement. It uses admin/manual review and is API-ready for future authorized sync.
- Status lookup /status requires X handle/profile plus a SOL wallet used on the profile or withdrawal. No-match responses are generic. It shows recent submitted posts, reviewed points, withdrawal status, and payout transaction hash when paid. It never shows admin notes.
- Withdrawal page /withdraw requires X identifier, SOL wallet, requested amount, and optional message. Requests are manually reviewed. Admin checks status, posts, points, reward pool, and details. Payments happen outside the app.
- Reward pool terms are admin-managed and can be inactive. Active/inactive status, amount, description, points-to-SOL rate, minimum withdrawal, payment cycle, and campaign dates are controlled from admin. Example 100 points = 0.05 SOL is only an example unless admin saves it and activates the pool.
- Admin dashboard is protected by username/password. Admins manage reward pool, promoters, posts, comment engagement, withdrawals, and CSV exports. Admin notes are internal only.
- Data privacy and safety: no promoter auth in v1; public status lookup uses wallet as an additional factor; admin secrets and env vars are not exposed.

${rewardPoolFacts}

Answer style: be concise, practical, and accurate. If something requires admin review or live account status, explain the limitation and point to the correct page. If outside scope, refuse briefly and redirect to website support topics.`;
  return prompt.slice(0, MAX_SYSTEM_PROMPT_LENGTH);
}

export async function askWebsiteAiSupport(input: string) {
  const message = input.trim().slice(0, AI_SUPPORT_MAX_MESSAGE_LENGTH);
  if (!message) return null;
  const [savedKeys, systemPrompt] = await Promise.all([getSavedApiKeys(), buildWebsiteAiSupportPrompt()]);
  const order = getWebsiteAiProviderOrder();
  for (const provider of order) {
    const apiKey = keyFor(provider, savedKeys);
    if (!apiKey) continue;
    try {
      const answer = (await callProvider(provider, apiKey, systemPrompt, message)).trim();
      if (answer) return { answer, provider };
    } catch {
      continue;
    }
  }
  return null;
}
