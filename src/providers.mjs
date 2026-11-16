import { ITEMS } from "./domain.mjs";

export const PROVIDERS = {
  openai: {
    label: "OpenAI",
    defaultModel: "gpt-4.1-mini",
    placeholder: "sk-…",
    host: "api.openai.com",
  },
  claude: {
    label: "Claude",
    defaultModel: "claude-sonnet-5-5",
    placeholder: "sk-ant-…",
    host: "api.anthropic.com",
  },
  gemini: {
    label: "Gemini",
    defaultModel: "gemini-3.8-flash",
    placeholder: "AIza…",
    host: "generativelanguage.googleapis.com",
  },
};

export function defaultProviderSettings() {
  return Object.fromEntries(
    Object.entries(PROVIDERS).map(([id, p]) => [
      id,
      { key: "", model: p.defaultModel },
    ]),
  );
}

const PLAN_SCHEMA = {
  type: "object",
  properties: {
    mode: { type: "string", enum: ["battle", "date", "stealth", "rain"] },
    message: { type: "string" },
    itemIds: {
      type: "array",
      items: { type: "string", enum: ITEMS.map((i) => i.id) },
      minItems: 1,
      maxItems: 8,
    },
    budget: { type: "integer", minimum: 0, maximum: 9999 },
  },
  required: ["mode", "message", "itemIds", "budget"],
  additionalProperties: false,
};

function systemPrompt(state) {
  return `You are Grimble, a witty but helpful goblin shopkeeper. Help equip people for absurd quests. Return a JSON plan only: mode (battle, date, stealth, rain), message (under 65 words), itemIds (1-8 relevant inventory IDs), budget (integer gold). Never invent items or prices. Respect allergies, budgets, and conversation context. A trusted adapter compiles your selection into an A2UI 1.0 component tree. Inventory: ${JSON.stringify(ITEMS)}. Current mode: ${state.mode}. Current gold: ${state.balance}. Leather allergy: ${!!state.allergy}. Exclude boots when a leather allergy applies. Preserve current gold unless the user explicitly changes their budget.`;
}

export function validatePlan(result) {
  if (
    !result ||
    !["battle", "date", "stealth", "rain"].includes(result.mode) ||
    typeof result.message !== "string" ||
    !result.message.trim() ||
    result.message.length > 1500 ||
    !Array.isArray(result.itemIds)
  ) {
    throw new Error(
      "The model returned an invalid market plan. Please try again.",
    );
  }
  const itemIds = [
    ...new Set(
      result.itemIds.filter(
        (id) => typeof id === "string" && ITEMS.some((i) => i.id === id),
      ),
    ),
  ].slice(0, 8);
  if (!itemIds.length)
    throw new Error(
      "The model did not select any items from the market. Please try again.",
    );
  return {
    mode: result.mode,
    message: result.message.trim(),
    itemIds,
    ...(Number.isInteger(result.budget) &&
    result.budget >= 0 &&
    result.budget <= 9999
      ? { budget: result.budget, balance: result.budget }
      : {}),
  };
}

function parseJson(text) {
  if (typeof text !== "string" || !text.trim())
    throw new Error("The model returned no market plan. Please try again.");
  try {
    return JSON.parse(
      text
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, ""),
    );
  } catch {
    throw new Error(
      "The model returned incomplete or invalid JSON. Please try again.",
    );
  }
}

// Credentials are passed only to the selected provider, in request headers.
// This module never writes credentials to storage, chat messages or logs.
export async function requestPlan(
  { provider, apiKey, model, messages, state, prompt },
  fetchImpl = globalThis.fetch,
) {
  const config = Object.hasOwn(PROVIDERS, provider)
    ? PROVIDERS[provider]
    : null;
  if (!config) throw new Error("Choose OpenAI, Claude, or Gemini.");
  if (!apiKey?.trim() || !model?.trim())
    throw new Error(`Enter your ${config.label} API key and model first.`);
  const key = apiKey.trim();
  const turns = [
    ...messages
      .slice(-8)
      .filter((m) => ["user", "assistant"].includes(m.role))
      .map((m) => ({ role: m.role, content: m.text })),
    { role: "user", content: prompt },
  ];
  const system = systemPrompt(state);
  let url, body;
  const headers = { "Content-Type": "application/json" };
  if (provider === "openai") {
    url = "https://api.openai.com/v1/chat/completions";
    headers.Authorization = `Bearer ${key}`;
    body = {
      model: model.trim(),
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, ...turns],
    };
  } else if (provider === "claude") {
    url = "https://api.anthropic.com/v1/messages";
    headers["x-api-key"] = key;
    headers["anthropic-version"] = "2023-06-01";
    headers["anthropic-dangerous-direct-browser-access"] = "true";
    body = {
      model: model.trim(),
      max_tokens: 2048,
      system,
      messages: turns,
      tools: [
        {
          name: "present_market",
          description:
            "Present the selected equipment and quest plan to the shopper.",
          input_schema: PLAN_SCHEMA,
        },
      ],
      tool_choice: { type: "tool", name: "present_market" },
    };
  } else {
    const modelId = model.trim().replace(/^models\//, "");
    url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent`;
    headers["x-goog-api-key"] = key;
    body = {
      systemInstruction: { parts: [{ text: system }] },
      contents: turns.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: PLAN_SCHEMA,
        maxOutputTokens: 4096,
      },
    };
  }
  let response;
  try {
    response = await fetchImpl(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(45000),
    });
  } catch (error) {
    if (["TimeoutError", "AbortError"].includes(error.name))
      throw new Error(
        `${config.label} took too long to respond. Your satchel is unchanged. Please try again.`,
      );
    throw new Error(
      `Could not reach ${config.label}. Check your connection and API access${provider === "claude" ? "; your Anthropic organization must allow browser requests" : ""}.`,
    );
  }
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      typeof json?.error?.message === "string"
        ? json.error.message.split(key).join("[redacted]")
        : `Request failed (${response.status}).`;
    throw new Error(`${config.label}: ${detail}`);
  }
  let result;
  if (provider === "openai") {
    if (json?.choices?.[0]?.finish_reason === "length")
      throw new Error(
        "OpenAI stopped before finishing the plan. Please try again.",
      );
    result = parseJson(json?.choices?.[0]?.message?.content);
  } else if (provider === "claude") {
    if (json?.stop_reason === "max_tokens")
      throw new Error(
        "Claude stopped before finishing the plan. Please try again.",
      );
    const tool = json?.content?.find(
      (b) => b.type === "tool_use" && b.name === "present_market",
    );
    result = tool
      ? tool.input
      : parseJson(
          json?.content
            ?.filter((b) => b.type === "text")
            .map((b) => b.text)
            .join(""),
        );
  } else {
    const candidate = json?.candidates?.[0];
    if (
      json?.promptFeedback?.blockReason ||
      (candidate?.finishReason && !["STOP"].includes(candidate.finishReason))
    ) {
      throw new Error(
        `Gemini could not complete this quest (${json?.promptFeedback?.blockReason || candidate.finishReason}). Try rephrasing your request.`,
      );
    }
    result = parseJson(
      candidate?.content?.parts
        ?.filter((p) => !p.thought && typeof p.text === "string")
        .map((p) => p.text)
        .join(""),
    );
  }
  return validatePlan(result);
}
