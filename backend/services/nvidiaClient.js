require("dotenv").config();

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

/**
 * Core fetch wrapper with a client-side timeout using AbortSignal.
 * @param {object} body       - The request body to send.
 * @param {number} timeoutMs  - How long to wait before aborting.
 */
async function _callNvidia(body, timeoutMs = 45000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(NVIDIA_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`NVIDIA API error ${res.status}: ${text}`);
    }
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`NVIDIA API timeout after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Simple text-response LLM call (used by existing relatedAi route & MCP tool).
 * Unchanged interface — fully backward-compatible.
 */
async function callNvidiaLLM(
  messages,
  {
    model = "meta/llama-3.1-8b-instruct",
    temperature = 0.2,
    max_tokens = 300,
  } = {}
) {
  const data = await _callNvidia({ model, messages, temperature, max_tokens });
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Full-message LLM call that supports tool/function calling.
 * Returns the entire message object so the agent can inspect tool_calls.
 *
 * Primary model gets PRIMARY_TIMEOUT_MS before being aborted;
 * the fallback (llama-3.1-8b-instruct) gets FALLBACK_TIMEOUT_MS.
 */
const PRIMARY_TIMEOUT_MS = 20000;  // 20 s — fast-fail the large model
const FALLBACK_TIMEOUT_MS = 45000; // 45 s — give the small model more runway
const FALLBACK_MODEL = "meta/llama-3.1-8b-instruct";

async function callNvidiaLLMFull(
  messages,
  {
    model = "meta/llama-3.3-70b-instruct",
    temperature = 0.1,
    max_tokens = 1000,
    tools = undefined,
  } = {}
) {
  const body = { model, messages, temperature, max_tokens, parallel_tool_calls: false };
  if (tools && tools.length > 0) body.tools = tools;

  // Try primary model with a short timeout
  try {
    const data = await _callNvidia(body, PRIMARY_TIMEOUT_MS);
    return data.choices?.[0]?.message || { role: "assistant", content: "" };
  } catch (primaryErr) {
    if (model === FALLBACK_MODEL) throw primaryErr; // already using fallback

    console.warn(
      `[NVIDIA] Primary model "${model}" failed (${primaryErr.message}). ` +
      `Switching to fallback "${FALLBACK_MODEL}"...`
    );
    const fallbackBody = { ...body, model: FALLBACK_MODEL };
    const data = await _callNvidia(fallbackBody, FALLBACK_TIMEOUT_MS);
    return data.choices?.[0]?.message || { role: "assistant", content: "" };
  }
}

module.exports = { callNvidiaLLM, callNvidiaLLMFull };
