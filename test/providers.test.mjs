import { test } from "node:test";
import assert from "node:assert/strict";
import {
  requestPlan,
  validatePlan,
  defaultProviderSettings,
} from "../src/providers.mjs";
import { initialState } from "../src/domain.mjs";
const plan = {
  mode: "date",
  message: "Flowers. Definitely flowers.",
  itemIds: ["flowers", "umbrella"],
  budget: 50,
};
const options = {
  apiKey: "test-key-not-a-real-secret",
  model: "test-model",
  messages: [
    { role: "user", text: "A dragon quest" },
    { role: "assistant", text: "Bring an umbrella." },
  ],
  state: initialState(),
  prompt: "Actually, the dragon is my date.",
};
function response(json, status = 200) {
  return new Response(JSON.stringify(json), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
test("OpenAI uses bearer auth, JSON mode, and conversation history", async () => {
  let request;
  const result = await requestPlan(
    { ...options, provider: "openai" },
    async (url, init) => {
      request = { url, ...init, parsed: JSON.parse(init.body) };
      return response({
        choices: [
          { message: { content: JSON.stringify(plan) }, finish_reason: "stop" },
        ],
      });
    },
  );
  assert.equal(request.url, "https://api.openai.com/v1/chat/completions");
  assert.equal(request.headers.Authorization, "Bearer " + options.apiKey);
  assert.equal(request.parsed.response_format.type, "json_object");
  assert.equal(request.parsed.messages[0].role, "system");
  assert.equal(request.parsed.messages.at(-1).content, options.prompt);
  assert.equal(result.mode, "date");
  assert.equal(result.balance, 50);
});
test("Claude uses Messages API, browser-access header, and a forced structured tool", async () => {
  let request;
  const result = await requestPlan(
    { ...options, provider: "claude" },
    async (url, init) => {
      request = { url, ...init, parsed: JSON.parse(init.body) };
      return response({
        content: [
          { type: "thinking", thinking: "ignored" },
          { type: "tool_use", name: "present_market", input: plan },
        ],
        stop_reason: "tool_use",
      });
    },
  );
  assert.equal(request.url, "https://api.anthropic.com/v1/messages");
  assert.equal(request.headers["x-api-key"], options.apiKey);
  assert.equal(
    request.headers["anthropic-dangerous-direct-browser-access"],
    "true",
  );
  assert.equal(request.parsed.tool_choice.name, "present_market");
  assert.equal(request.parsed.tools[0].input_schema.type, "object");
  assert.ok(request.parsed.system.includes("Grimble"));
  assert.equal(request.parsed.messages[0].role, "user");
  assert.equal(request.headers.Authorization, undefined);
  assert.deepEqual(result.itemIds, plan.itemIds);
});
test("Gemini uses header auth, native history roles, and JSON schema output", async () => {
  let request;
  const result = await requestPlan(
    { ...options, provider: "gemini", model: "models/gemini-3.8-flash" },
    async (url, init) => {
      request = { url, ...init, parsed: JSON.parse(init.body) };
      return response({
        candidates: [
          {
            content: {
              parts: [
                { thought: true, text: "private thinking" },
                { text: JSON.stringify(plan) },
              ],
            },
            finishReason: "STOP",
          },
        ],
      });
    },
  );
  assert.equal(
    request.url,
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
  );
  assert.ok(!request.url.includes(options.apiKey));
  assert.equal(request.headers["x-goog-api-key"], options.apiKey);
  assert.equal(request.parsed.contents[1].role, "model");
  assert.equal(
    request.parsed.generationConfig.responseMimeType,
    "application/json",
  );
  assert.ok(
    request.parsed.generationConfig.responseJsonSchema.properties.itemIds,
  );
  assert.equal(result.mode, "date");
});
test("provider credentials never appear in request bodies", async () => {
  for (const provider of ["openai", "claude", "gemini"])
    await requestPlan({ ...options, provider }, async (url, init) => {
      assert.ok(!url.includes(options.apiKey));
      assert.ok(!init.body.includes(options.apiKey));
      return response(
        provider === "openai"
          ? { choices: [{ message: { content: JSON.stringify(plan) } }] }
          : provider === "claude"
            ? {
                content: [
                  { type: "tool_use", name: "present_market", input: plan },
                ],
              }
            : {
                candidates: [
                  { content: { parts: [{ text: JSON.stringify(plan) }] } },
                ],
              },
      );
    });
});
test("separate provider defaults do not share key storage", () => {
  const settings = defaultProviderSettings();
  settings.openai.key = "one";
  assert.equal(settings.claude.key, "");
  assert.equal(settings.gemini.key, "");
  assert.notEqual(settings.claude.model, settings.openai.model);
  assert.equal(defaultProviderSettings().openai.key, "");
});
test("provider API errors are surfaced with credentials redacted", async () => {
  await assert.rejects(
    requestPlan({ ...options, provider: "gemini" }, async () =>
      response({ error: { message: "Invalid key " + options.apiKey } }, 403),
    ),
    (error) =>
      error.message.includes("Gemini") &&
      error.message.includes("[redacted]") &&
      !error.message.includes(options.apiKey),
  );
});
test("Claude network errors explain required browser access", async () => {
  await assert.rejects(
    requestPlan({ ...options, provider: "claude" }, async () => {
      throw new TypeError("Failed to fetch");
    }),
    /Anthropic organization must allow browser requests/,
  );
});
test("missing credentials and unknown providers never make a request", async () => {
  const never = () => {
    assert.fail("Should not make a network call");
  };
  await assert.rejects(
    requestPlan({ ...options, provider: "unknown" }, never),
    /Choose OpenAI/,
  );
  await assert.rejects(
    requestPlan({ ...options, provider: "claude", apiKey: "" }, never),
    /API key/,
  );
});
test("blocked and truncated responses do not change the market", async () => {
  await assert.rejects(
    requestPlan({ ...options, provider: "gemini" }, async () =>
      response({ promptFeedback: { blockReason: "SAFETY" } }),
    ),
    /SAFETY/,
  );
  await assert.rejects(
    requestPlan({ ...options, provider: "claude" }, async () =>
      response({ stop_reason: "max_tokens" }),
    ),
    /stopped before finishing/,
  );
});
test("plan validation rejects unknown inventory and filters duplicates", () => {
  assert.throws(
    () => validatePlan({ ...plan, itemIds: ["invented"] }),
    /did not select/,
  );
  assert.throws(
    () => validatePlan({ ...plan, mode: "invalid" }),
    /invalid market plan/,
  );
  assert.deepEqual(
    validatePlan({ ...plan, itemIds: ["flowers", "flowers", "invented"] })
      .itemIds,
    ["flowers"],
  );
  assert.equal(validatePlan({ ...plan, budget: -1 }).balance, undefined);
});
