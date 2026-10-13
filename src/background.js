const DEFAULTS = {
  provider: "gemini",
  baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
  model: "gemini-3.8-flash",
  language: "English",
  temperature: 0.1,
  thinking: false,
};

const PROVIDERS = {
  gemini: {
    label: "Google Gemini (free option)",
    kind: "free",
    style: "openai",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    models: ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite"],
    keyUrl: "https://aistudio.google.com/apikey",
    keyHint: "Free, no credit card. Sign in → Create API key → copy it.",
  },
  groq: {
    label: "Groq (free, fast — not Grok)",
    kind: "free",
    style: "openai",
    baseUrl: "https://api.groq.com/openai/v1",
    models: ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"],
    keyUrl: "https://console.groq.com/keys",
    keyHint: "Free tier. Sign in → API Keys → Create API Key.",
  },
  openai: {
    label: "ChatGPT (OpenAI)",
    kind: "paid",
    style: "openai",
    baseUrl: "https://api.openai.com/v1",
    models: ["gpt-6-astra", "gpt-6.1-sol", "gpt-6-luna"],
    keyUrl: "https://platform.openai.com/api-keys",
    keyHint: "Add a payment method first, then create a key.",
  },
  anthropic: {
    label: "Claude (Anthropic)",
    kind: "paid",
    style: "anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    models: ["claude-sonnet-5-5", "claude-haiku-5-5", "claude-opus-5-5"],
    keyUrl: "https://console.anthropic.com/settings/keys",
    keyHint: "Add credits first, then create a key.",
  },
  xai: {
    label: "Grok (xAI)",
    kind: "paid",
    style: "openai",
    baseUrl: "https://api.x.ai/v1",
    models: ["grok-4.7"],
    keyUrl: "https://console.x.ai",
    keyHint: "Add credits first, then create a key.",
  },
  deepseek: {
    label: "DeepSeek (cheap)",
    kind: "paid",
    style: "openai",
    baseUrl: "https://api.deepseek.com",
    models: ["deepseek-flash", "deepseek-v4-pro"],
    keyUrl: "https://platform.deepseek.com/api_keys",
    keyHint: "Add a small credit, then create a key. Cheapest paid option.",
  },
  openrouter: {
    label: "OpenRouter (many models)",
    kind: "paid",
    style: "openai",
    baseUrl: "https://openrouter.ai/api/v1",
    models: [
      "anthropic/claude-sonnet-5.5",
      "openai/gpt-6-astra",
      "google/gemini-3.8-flash",
      "x-ai/grok-4.7",
      "deepseek/deepseek-v4.1-flash",
    ],
    keyUrl: "https://openrouter.ai/keys",
    keyHint: "One key works with hundreds of models — some are free.",
  },
};

// Settings page reads labels, models and key links from here so the list
// lives in exactly one place.
function providerPresets() {
  const out = {};
  for (const [id, p] of Object.entries(PROVIDERS)) {
    out[id] = {
      label: p.label,
      kind: p.kind || "paid",
      baseUrl: p.baseUrl,
      models: p.models,
      keyUrl: p.keyUrl,
      keyHint: p.keyHint,
    };
  }
  return out;
}

async function getSettings() {
  const [stored, local] = await Promise.all([
    chrome.storage.sync.get(DEFAULTS),
    chrome.storage.local.get({ apiKey: "" }),
  ]);
  return { ...DEFAULTS, ...stored, apiKey: local.apiKey || "" };
}

// Move any API key previously saved in synced storage into local-only storage.
async function migrateApiKey() {
  try {
    const sync = await chrome.storage.sync.get({ apiKey: "" });
    if (sync.apiKey) {
      const local = await chrome.storage.local.get({ apiKey: "" });
      if (!local.apiKey) await chrome.storage.local.set({ apiKey: sync.apiKey });
      await chrome.storage.sync.remove("apiKey");
      console.log("[Reddit AI Chat] API key moved from sync to local storage");
    }
  } catch {}
}
chrome.runtime.onInstalled.addListener(migrateApiKey);
chrome.runtime.onStartup.addListener(migrateApiKey);
migrateApiKey();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg?.type === "getSettings") {
      const s = await getSettings();
      const p = PROVIDERS[s.provider];
      sendResponse({
        ...s,
        apiKey: undefined,
        style: p ? p.style : "openai",
        models: p ? p.models : [],
        providers: Object.keys(PROVIDERS),
        presets: providerPresets(),
      });
      return;
    }
    if (msg?.type === "testKey") {
      try {
        const s = { ...(await getSettings()), ...(msg.settings || {}) };
        await callOnce(s, [
          { role: "user", content: "Reply with exactly: OK" },
        ]);
        sendResponse({ ok: true });
      } catch (e) {
        sendResponse({ ok: false, error: String(e.message || e) });
      }
      return;
    }
    if (msg?.type === "openOptions") {
      chrome.runtime.openOptionsPage();
      sendResponse({ ok: true });
      return;
    }
    if (msg?.type === "openHistory") {
      chrome.tabs.create({ url: chrome.runtime.getURL("src/options.html#history") });
      sendResponse({ ok: true });
      return;
    }
    sendResponse({});
  })();
  return true;
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "toggle" });
  } catch (e) {
    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["src/content.js"] });
      await new Promise((r) => setTimeout(r, 150));
      await chrome.tabs.sendMessage(tab.id, { type: "toggle", show: true });
    } catch (e2) {
      console.warn("[Reddit AI Chat] cannot inject here:", e2 && e2.message);
    }
  }
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "chat") return;
  let controller = null;
  port.onDisconnect.addListener(() => {
    if (controller) controller.abort();
  });
  port.onMessage.addListener(async (msg) => {
    if (msg?.type !== "chat") return;
    controller = new AbortController();
    try {
      const settings = { ...(await getSettings()), ...(msg.payload || {}) };
      await streamChat(settings, port, controller.signal);
    } catch (e) {
      if (e.name === "AbortError") return;
      try {
        port.postMessage({ type: "error", message: String(e.message || e) });
      } catch {}
    }
  });
});

// "Test connection" must speak the right protocol per provider: the OpenAI-style
// /chat/completions call is wrong for Anthropic. No token cap either — modern
// OpenAI models reject max_tokens, and the test reply is a few tokens anyway.
async function callOnce(settings, messages) {
  const style = PROVIDERS[settings.provider]?.style || "openai";
  const base = String(settings.baseUrl || "").replace(/\/+$/, "");
  let url, headers, body;
  if (style === "anthropic") {
    const system = messages.find((m) => m.role === "system")?.content || "";
    const msgs = messages.filter((m) => m.role !== "system");
    url = base + "/messages";
    headers = {
      "Content-Type": "application/json",
      "x-api-key": settings.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    };
    body = { model: settings.model, system, messages: msgs, max_tokens: 256 };
  } else {
    url = base + "/chat/completions";
    headers = { "Content-Type": "application/json", Authorization: "Bearer " + settings.apiKey };
    body = { model: settings.model, messages };
  }
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error("API " + res.status + ": " + (await res.text()).slice(0, 300));
  return res.json();
}

async function streamChat(settings, port, signal) {
  if (!settings.apiKey) throw new Error("No API key set. Click the gear icon or open extension options.");
  const style = PROVIDERS[settings.provider]?.style || "openai";

  let url, headers, body;
  if (style === "anthropic") {
    const system = settings.messages.find((m) => m.role === "system")?.content || "";
    const msgs = settings.messages.filter((m) => m.role !== "system");
    url = settings.baseUrl.replace(/\/+$/, "") + "/messages";
    headers = {
      "Content-Type": "application/json",
      "x-api-key": settings.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    };
    body = { model: settings.model, system, messages: msgs, max_tokens: 4096, stream: true };
  } else {
    url = settings.baseUrl.replace(/\/+$/, "") + "/chat/completions";
    headers = { "Content-Type": "application/json", Authorization: "Bearer " + settings.apiKey };
    body = {
      model: settings.model,
      messages: settings.messages,
      stream: true,
    };
    if (typeof settings.temperature === "number") body.temperature = settings.temperature;
    // DeepSeek enables chain-of-thought thinking by default; keep it off unless asked.
    if (settings.provider === "deepseek") {
      body.thinking = { type: settings.thinking ? "enabled" : "disabled" };
    }
  }

  let res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal });
  if (!res.ok) {
    const text = await res.text();
    // The newest reasoning models (OpenAI's gpt-6 family and some OpenRouter
    // models) reject `temperature`. Retry once without it instead of failing.
    if (res.status === 400 && "temperature" in body && /temperature/i.test(text)) {
      delete body.temperature;
      res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal });
      if (!res.ok) throw new Error("API " + res.status + ": " + (await res.text()).slice(0, 400));
    } else {
      throw new Error("API " + res.status + ": " + text.slice(0, 400));
    }
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      let json;
      try {
        json = JSON.parse(data);
      } catch {
        continue;
      }
      if (style === "anthropic") {
        if (json.type === "content_block_delta") {
          const t = json.delta?.text;
          if (t) port.postMessage({ type: "delta", text: t });
        }
      } else {
        const delta = json.choices?.[0]?.delta || {};
        if (delta.reasoning_content) port.postMessage({ type: "reasoning", text: delta.reasoning_content });
        if (delta.content) port.postMessage({ type: "delta", text: delta.content });
      }
    }
  }
  port.postMessage({ type: "done" });
}
