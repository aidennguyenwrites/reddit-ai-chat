// The provider list (names, models, key links) comes from the background script,
// so there is exactly one place to keep it up to date: src/background.js.
let presets = {};
const $ = (id) => document.getElementById(id);
function clampTemp(v) {
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return 0.1;
  return Math.min(1, Math.max(0, n));
}
const msg = $("msg");
const hmsg = $("hmsg");

function show(el, text, isErr) {
  el.textContent = text;
  el.className = isErr ? "err" : "save";
  setTimeout(() => (el.textContent = ""), 4000);
}

// ---------- tabs ----------
function activateTab(name) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
  $("panel-settings").style.display = name === "settings" ? "" : "none";
  $("panel-history").style.display = name === "history" ? "" : "none";
  if (name === "history") renderHistory();
}
document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => activateTab(t.dataset.tab)));

// ---------- provider picker ----------
const GROUP_LABELS = { free: "Free to try — no credit card", paid: "Paid — you add credits at the AI company" };

function populateProviders() {
  const sel = $("provider");
  sel.innerHTML = "";
  for (const kind of ["free", "paid"]) {
    const ids = Object.keys(presets).filter((id) => (presets[id].kind || "paid") === kind);
    if (!ids.length) continue;
    const og = document.createElement("optgroup");
    og.label = GROUP_LABELS[kind];
    for (const id of ids) {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = presets[id].label || id;
      og.appendChild(opt);
    }
    sel.appendChild(og);
  }
}

function applyProviderHints(id) {
  const p = presets[id];
  $("providerHint").textContent = p ? "Models: " + p.models.join(", ") : "";
  const kh = $("keyHint");
  kh.textContent = "";
  if (!p) return;
  if (p.keyHint) kh.append(p.keyHint + " ");
  if (p.keyUrl) {
    const a = document.createElement("a");
    a.href = p.keyUrl;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "Get a key here →";
    a.style.color = "#5b8cff";
    kh.appendChild(a);
  }
}

$("provider").addEventListener("change", () => {
  const p = presets[$("provider").value];
  if (p) {
    $("baseUrl").value = p.baseUrl;
    $("model").value = p.models[0] || "";
  }
  applyProviderHints($("provider").value);
});

// ---------- settings ----------
chrome.runtime.sendMessage({ type: "getSettings" }, (s) => {
  if (!s) return;
  presets = s.presets || {};
  populateProviders();
  $("provider").value = s.provider;
  $("baseUrl").value = s.baseUrl;
  $("model").value = s.model;
  $("language").value = s.language;
  $("temperature").value = s.temperature != null ? s.temperature : 0.1;
  $("thinking").checked = !!s.thinking;
  applyProviderHints(s.provider);
});
chrome.storage.local.get({ apiKey: "" }, (l) => {
  $("apiKey").value = l.apiKey || "";
});
$("version").textContent = "Reddit AI Chat v" + chrome.runtime.getManifest().version;

$("save").addEventListener("click", () => {
  if (!$("provider").value) return show(msg, "Still loading — try again in a second", true);
  const data = {
    provider: $("provider").value,
    baseUrl: $("baseUrl").value.trim(),
    model: $("model").value.trim(),
    language: $("language").value.trim() || "English",
    temperature: clampTemp($("temperature").value),
    thinking: $("thinking").checked,
  };
  chrome.storage.sync.set(data);
  chrome.storage.local.set({ apiKey: $("apiKey").value.trim() }, () => show(msg, "Saved — key stored locally on this device"));
});

$("test").addEventListener("click", () => {
  if (!$("provider").value) return show(msg, "Still loading — try again in a second", true);
  const data = {
    provider: $("provider").value,
    baseUrl: $("baseUrl").value.trim(),
    apiKey: $("apiKey").value.trim(),
    model: $("model").value.trim(),
  };
  show(msg, "Testing…");
  chrome.runtime.sendMessage({ type: "testKey", settings: data }, (r) => {
    if (r && r.ok) show(msg, "Connection OK");
    else show(msg, "Failed: " + ((r && r.error) || "unknown"), true);
  });
});

// ---------- history ----------
function fmtDate(ts) {
  if (!ts) return "unknown date";
  const d = new Date(ts);
  return d.toLocaleString();
}

async function renderHistory() {
  const box = $("convs");
  const all = await chrome.storage.local.get(null);
  const items = Object.entries(all)
    .filter(([k]) => k.startsWith("rca_chat_"))
    .map(([key, v]) => ({ key, v: v || {} }))
    .filter(({ v }) => Array.isArray(v.messages) && v.messages.length)
    .sort((a, b) => (b.v.savedAt || 0) - (a.v.savedAt || 0));

  if (!items.length) {
    box.innerHTML = '<div class="empty">No saved chats yet. Ask something in the panel on a Reddit post and it will show up here.</div>';
    return;
  }

  box.innerHTML = "";
  for (const { key, v } of items) {
    const keyPost = key.startsWith("rca_chat_thread_") ? key.slice("rca_chat_thread_".length) : null;
    const postId = v.postId || keyPost;
    const url = v.url || (postId ? "https://www.reddit.com/comments/" + postId : "https://www.reddit.com");
    const title = (v.title || "Reddit thread").replace(/\s*:\s*r\/.*$/, "");    const sub = v.subreddit ? "r/" + v.subreddit : "reddit";
    const count = v.messages.length;

    const el = document.createElement("div");
    el.className = "conv";
    el.innerHTML = `<h3></h3><div class="meta"></div>
      <div class="actions"><button class="open">Open</button><button class="del secondary">Delete</button></div>`;
    el.querySelector("h3").textContent = title;
    el.querySelector(".meta").textContent = `${sub} · ${count} messages · ${fmtDate(v.savedAt)}`;
    el.querySelector(".open").addEventListener("click", () => chrome.tabs.create({ url }));
    el.querySelector(".del").addEventListener("click", async () => {
      await chrome.storage.local.remove(key);
      renderHistory();
    });
    box.appendChild(el);
  }
}

$("clearAll").addEventListener("click", async () => {
  if (!confirm("Delete all saved chat history? This cannot be undone.")) return;
  const all = await chrome.storage.local.get(null);
  const keys = Object.keys(all).filter((k) => k.startsWith("rca_chat_"));
  if (keys.length) await chrome.storage.local.remove(keys);
  show(hmsg, "Cleared");
  renderHistory();
});

// ---------- boot ----------
if (location.hash === "#history") activateTab("history");
