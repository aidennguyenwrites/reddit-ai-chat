(() => {
  if (window.__redditAiChatLoaded) return;
  window.__redditAiChatLoaded = true;

  const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Italian", "Hindi", "Vietnamese", "Japanese", "Korean", "Chinese"];
  const LANG_LABEL = { English: "🇬🇧", Spanish: "🇪🇸", French: "🇫🇷", German: "🇩🇪", Portuguese: "🇵🇹", Italian: "🇮🇹", Hindi: "🇮🇳", Vietnamese: "🇻🇳", Japanese: "🇯🇵", Korean: "🇰🇷", Chinese: "🇨🇳" };
  const escHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const CSS = `
  :host { all: initial; display: block; }
  * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  .wrap { width: 100%; margin: 8px 0 16px; color: #e6e8eb; }
  .controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
  select, button { font-size: 13px; }
  .controls select {
    background: #181c1f; color: #e6e8eb; border: 1px solid #34383d; border-radius: 999px;
    padding: 8px 14px; cursor: pointer; outline: none; appearance: none;
  }
  .controls select:hover { border-color: #5a6068; }
  .gear, .close, .newchat, .history, .copythread {
    background: #181c1f; color: #e6e8eb; border: 1px solid #34383d; border-radius: 999px;
    width: 36px; height: 36px; cursor: pointer;
  }
  .gear:hover, .close:hover, .newchat:hover, .history:hover, .copythread:hover { border-color: #5a6068; }
  .spacer { flex: 1; }
  .panel { background: #0f1214; border: 1px solid #23272b; border-radius: 16px; overflow: hidden; }
  .head { display: flex; align-items: center; gap: 10px; padding: 16px 18px; border-bottom: 1px solid #1c2024; }
  .head b { font-size: 16px; font-weight: 600; color: #f2f4f6; }
  .head .status { margin-left: auto; font-size: 12px; color: #7c848c; }
  .messages { max-height: 60vh; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 16px; }
  .messages-wrap { position: relative; }
  .nav { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 6px; z-index: 5; }
  .nav button {
    width: 30px; height: 30px; border-radius: 50%; font-size: 12px; line-height: 1; cursor: pointer;
    background: rgba(20, 24, 27, .92); border: 1px solid #2a2f34; color: #c8cdd2;
    opacity: .55; transition: opacity .15s, border-color .15s, color .15s;
  }
  .nav button:hover { opacity: 1; color: #e6e8eb; border-color: #5a6068; }
  .row.flash .bubble { outline: 2px solid #2f6bf0; outline-offset: 2px; }
  .row { display: flex; gap: 12px; align-items: flex-start; }
  .row.user { justify-content: flex-end; }
  .avatar { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; flex-shrink: 0; font-size: 18px; background: #1b1f23; }
  .bubble { border-radius: 14px; padding: 14px 16px; font-size: 15px; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word; max-width: 82%; }
  .row.assistant .bubble { background: #14181b; border: 1px solid #23272b; color: #e6e8eb; }
  .row.user .bubble { background: #2f6bf0; color: #fff; }
  .bubble h1,.bubble h2,.bubble h3 { margin: 12px 0 6px; font-size: 15px; }
  .bubble ul,.bubble ol { margin: 6px 0; padding-left: 20px; }
  .bubble code { background: #0b0d0f; padding: 1px 5px; border-radius: 4px; font-family: ui-monospace, Menlo, monospace; font-size: 13px; }
  .bubble pre { background: #0b0d0f; padding: 10px; border-radius: 8px; overflow-x: auto; }
  .thinking { color: #8a939c; font-style: italic; font-size: 13.5px; border-left: 2px solid #2a2f34; padding-left: 10px; margin-bottom: 10px; white-space: pre-wrap; }
  .composer { display: flex; gap: 10px; align-items: flex-end; padding: 14px; border-top: 1px solid #1c2024; }
  .input {
    flex: 1; resize: none; background: #16191c; color: #e6e8eb; border: 1px solid #2a2f34;
    border-radius: 12px; padding: 12px 14px; font-size: 15px; outline: none; max-height: 160px; line-height: 1.5;
  }
  .input:focus { border-color: #3a4046; }
  .send { width: 44px; height: 44px; border-radius: 50%; border: none; background: #2f6bf0; color: #fff; font-size: 18px; cursor: pointer; flex-shrink: 0; }
  .send:disabled { background: #2a2f34; color: #6b737b; cursor: default; }
  .send.stop { background: #e5484d; font-size: 14px; }
  .send.stop:hover { background: #f0575c; }
  .launcher {
    position: fixed; right: 20px; bottom: 20px; z-index: 2147483000;
    width: 52px; height: 52px; border-radius: 50%; border: 1px solid #34383d; background: #0f1214;
    color: #fff; font-size: 24px; cursor: pointer; box-shadow: 0 6px 24px rgba(0,0,0,.45);
  }
  .launcher:hover { border-color: #5a6068; }
  .hidden { display: none !important; }
  .err { color: #ff6b6b; font-size: 13.5px; }
  .copy {
    align-self: flex-start; margin-top: 6px; flex-shrink: 0;
    background: transparent; border: 1px solid #2a2f34; color: #7c848c;
    border-radius: 8px; width: 30px; height: 30px; font-size: 14px; cursor: pointer;
    opacity: 0; transition: opacity .15s, color .15s, border-color .15s;
  }
  .row:hover .copy { opacity: 1; }
  .copy:hover { color: #e6e8eb; border-color: #5a6068; }
  .copy.done { color: #4caf50; border-color: #4caf50; opacity: 1; }
  `;

  let shadow, wrapEl, panelEl, messagesEl, inputEl, sendBtn, statusEl, modelSel, langSel, modeSel, launcherEl, hostEl;
  let settings = { model: "deepseek-flash", language: "English", mode: "chat", provider: "deepseek", models: [], thinking: false };
  let history = [];
  let threadContext = "";
  let contextReady = false;
  let loadingContext = false;
  let streaming = false;
  let activePort = null;
  let userStopped = false;
  let persistTimer = null;

  const VERSION = "1.0";
  init();

  function init() {
    try {
      console.log("[Reddit AI Chat] " + VERSION + " loaded on", location.href);
      buildUI();
      watchForAnchor();
      installCopyHandler();
      chrome.runtime.onMessage.addListener((m) => {
        if (m?.type === "toggle") toggle(m.show === true ? true : undefined);
      });
      loadSettings().finally(() => maybeAutoLoad());
    } catch (e) {
      console.error("[Reddit AI Chat] init failed:", e);
    }
  }

  async function loadSettings() {
    try {
      const s = await chrome.runtime.sendMessage({ type: "getSettings" });
      if (s) applySettings(s);
    } catch (e) {
      console.warn("[Reddit AI Chat] could not load settings, using defaults:", e && e.message);
    }
  }

  function applySettings(s) {
    settings = { ...settings, ...s };
    if (!modelSel) return;
    if (settings.models && settings.models.length) {
      const cur = settings.model;
      const opts = settings.models.slice();
      if (cur && !opts.includes(cur)) opts.unshift(cur);
      modelSel.innerHTML = opts.map((m) => `<option value="${escHtml(m)}">${escHtml(m)}</option>`).join("");
    }
    if (settings.model) modelSel.value = settings.model;
    if (settings.language) langSel.value = settings.language;
    if (settings.mode) modeSel.value = settings.mode;
  }

  function onNavigate() {
    clearTimeout(persistTimer);
    contextReady = false;
    threadContext = "";
    history = [];
    if (messagesEl) messagesEl.innerHTML = "";
    if (panelEl) setStatus("");
    maybeAutoLoad();
  }

  let lastPath = location.pathname;
  setInterval(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      onNavigate();
    }
  }, 800);

  function maybeAutoLoad() {
    if (isRedditPage()) loadContext();
  }

  function isRedditPage() {
    return /\/comments\//.test(location.pathname) || /\/(r|user|search|best|popular|all)\b/.test(location.pathname);
  }

  // ---------- cache (chrome.storage.local) ----------
  const THREAD_TTL_MS = 30 * 60 * 1000;
  const CTX_VERSION = 2; // bump when the context format changes so stale/truncated caches are re-fetched

  function pageKey() {
    const id = getPostId();
    if (id) return "thread_" + id;
    return "page_" + location.pathname.replace(/[^\w]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 100);
  }

  async function storageGet(key) {
    try {
      const o = await chrome.storage.local.get(key);
      return o[key] || null;
    } catch {
      return null;
    }
  }
  async function storageSet(key, val) {
    try {
      await chrome.storage.local.set({ [key]: val });
    } catch (e) {
      console.warn("[Reddit AI Chat] cache write failed:", e && e.message);
    }
  }
  async function storageRemove(key) {
    try {
      await chrome.storage.local.remove(key);
    } catch {}
  }

  // ---------- UI ----------
  function buildUI() {
    let host = document.getElementById("reddit-ai-chat-host");
    if (host) host.remove();
    host = document.createElement("div");
    host.id = "reddit-ai-chat-host";
    hostEl = host;
    shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = CSS;
    shadow.appendChild(style);

    wrapEl = document.createElement("div");
    wrapEl.className = "wrap";
    wrapEl.innerHTML = `
      <div class="controls">
        <select class="model"></select>
        <select class="lang"></select>
        <select class="mode">
          <option value="chat">Chat</option>
          <option value="summary">Summary</option>
          <option value="eli5">ELI5</option>
          <option value="sentiment">Sentiment</option>
        </select>
        <span class="spacer"></span>
        <button class="history" title="Chat history">🕘</button>
        <button class="copythread" title="Copy the exact thread text the AI sees (paste into the verifier)">🧾</button>
        <button class="newchat" title="New chat (clears saved history for this page)">＋</button>
        <button class="gear" title="Settings">⚙</button>
        <button class="close" title="Hide (reopen with the floating button)">✕</button>
      </div>
      <div class="panel">
        <div class="head"><span>🧠</span><b>Chat with AI</b><span class="status"></span></div>
        <div class="messages-wrap">
          <div class="messages"></div>
          <div class="nav">
            <button class="nav-up" title="Jump to previous message">▲</button>
            <button class="nav-down" title="Jump to next message">▼</button>
            <button class="nav-latest" title="Jump to latest">⤓</button>
          </div>
        </div>
        <div class="composer">
          <textarea class="input" rows="1" placeholder="Ask a question about this page..."></textarea>
          <button class="send" title="Send">➤</button>
        </div>
      </div>`;
    shadow.appendChild(wrapEl);

    launcherEl = document.createElement("button");
    launcherEl.className = "launcher hidden";
    launcherEl.textContent = "🧠";
    launcherEl.title = "Reddit AI Chat";
    shadow.appendChild(launcherEl);

    const $ = (s) => shadow.querySelector(s);
    modelSel = $(".model");
    langSel = $(".lang");
    modeSel = $(".mode");
    messagesEl = $(".messages");
    inputEl = $(".input");
    sendBtn = $(".send");
    statusEl = $(".status");
    panelEl = $(".panel");

    modelSel.innerHTML = (settings.models && settings.models.length ? settings.models : [settings.model])
      .map((m) => `<option value="${escHtml(m)}">${escHtml(m)}</option>`)
      .join("");
    modelSel.value = settings.model;
    langSel.innerHTML = LANGUAGES.map((l) => `<option value="${l}">${LANG_LABEL[l] || ""} ${l}</option>`).join("");
    langSel.value = settings.language;
    modeSel.value = settings.mode || "chat";

    modelSel.addEventListener("change", () => { settings.model = modelSel.value; saveSettings({ model: modelSel.value }); });
    langSel.addEventListener("change", () => { settings.language = langSel.value; saveSettings({ language: langSel.value }); });
    modeSel.addEventListener("change", () => {
      settings.mode = modeSel.value;
      if (modeSel.value !== "chat") runMode(modeSel.value);
    });
    $(".gear").addEventListener("click", () => chrome.runtime.sendMessage({ type: "openOptions" }).catch(() => {}));
    $(".history").addEventListener("click", () => chrome.runtime.sendMessage({ type: "openHistory" }).catch(() => {}));
    $(".copythread").addEventListener("click", copyThreadText);
    $(".newchat").addEventListener("click", clearChat);
    $(".close").addEventListener("click", () => toggle(false));
    launcherEl.addEventListener("click", () => toggle(true));
    $(".nav-up").addEventListener("click", () => jumpMessage("up"));
    $(".nav-down").addEventListener("click", () => jumpMessage("down"));
    $(".nav-latest").addEventListener("click", jumpLatest);
    sendBtn.addEventListener("click", () => {
      if (streaming) stopStream();
      else onSend();
    });
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    });
    inputEl.addEventListener("input", () => {
      inputEl.style.height = "auto";
      inputEl.style.height = Math.min(inputEl.scrollHeight, 160) + "px";
    });

    injectPanel();
  }

  function saveSettings(patch) {
    chrome.storage.sync.get(null, (all) => chrome.storage.sync.set({ ...all, ...patch }));
  }

  function copyThreadText() {
    if (!threadContext) { setStatus("No thread loaded yet"); return; }
    const done = () => setStatus("Thread text copied — " + threadContext.length.toLocaleString() + " chars");
    const fail = () => setStatus("Copy failed — open the thread and try again");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(threadContext)
        .then(done)
        .catch(() => (fallbackCopy(threadContext) ? done() : fail()));
    } else {
      fallbackCopy(threadContext) ? done() : fail();
    }
  }

  function injectPanel() {
    const host = hostEl || document.getElementById("reddit-ai-chat-host");
    if (!host) return;
    makeFixed(host);
  }

  function makeFixed(host) {
    if (!host) return;
    if (host.parentNode !== document.body) document.body.appendChild(host);
    host.style.position = "fixed";
    host.style.top = "84px";
    host.style.right = "20px";
    host.style.width = "min(560px, calc(100vw - 40px))";
    host.style.zIndex = "2147483000";
    host.style.display = "block";
    if (wrapEl) wrapEl.style.margin = "0";
    if (messagesEl) messagesEl.style.maxHeight = "min(52vh, 560px)";
  }

  function findAnchor() {
    const candidates = [
      "shreddit-post",
      '[data-testid="post-container"]',
      "article",
      "#main-content",
      "#siteTable",
    ];
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (el && el.parentNode) return el.parentNode;
    }
    return document.querySelector("main#main") || document.querySelector("main") || document.body;
  }

  function watchForAnchor() {
    const obs = new MutationObserver(() => {
      if (hostEl && !hostEl.isConnected) document.body.appendChild(hostEl);
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  function toggle(force) {
    const show = typeof force === "boolean" ? force : wrapEl.classList.contains("hidden");
    wrapEl.classList.toggle("hidden", !show);
    launcherEl.classList.toggle("hidden", show);
    if (show && !contextReady && !loadingContext) maybeAutoLoad();
  }

  function setStatus(t) { statusEl.textContent = t || ""; }

  // ---------- Reddit context ----------
  function getPostId() {
    const m = location.pathname.match(/\/comments\/([a-z0-9]+)/i);
    return m ? m[1] : null;
  }

  async function loadContext() {
    if (contextReady || loadingContext) return;
    loadingContext = true;
    const key = "rca_thread_" + pageKey();

    const cached = await storageGet(key);
    if (cached && cached.ctx && cached.v === CTX_VERSION) {
      threadContext = cached.ctx;
      contextReady = true;
      setStatus("Ready · cached");
      await restoreChat();
      if (!history.length) seedIntro();
      loadingContext = false;
      if (Date.now() - (cached.savedAt || 0) > THREAD_TTL_MS) refreshContext(key);
      return;
    }

    setStatus("Loading thread…");
    try {
      await fetchAndStoreContext(key);
      setStatus("Ready");
      await restoreChat();
      if (!history.length) seedIntro();
    } catch (e) {
      setStatus("Load failed");
      appendAssistantError("Couldn't load this thread: " + (e.message || e) + ". Reddit may be rate-limiting; try reloading.");
    } finally {
      loadingContext = false;
    }
  }

  async function fetchAndStoreContext(key) {
    const postId = getPostId();
    const raw = postId ? await fetchThreadContext(postId) : gatherPageContext();
    threadContext = raw;
    contextReady = true;
    await storageSet(key, { ctx: threadContext, v: CTX_VERSION, savedAt: Date.now(), url: location.href, title: document.title });
  }

  async function refreshContext(key) {
    try {
      const postId = getPostId();
      if (!postId) return;
      const ctx = await fetchThreadContext(postId);
      if (ctx && ctx.length > 200) {
        threadContext = ctx;
        await storageSet(key, { ctx, v: CTX_VERSION, savedAt: Date.now(), url: location.href, title: document.title });
        setStatus("Refreshed");
      }
    } catch (e) {
      console.warn("[Reddit AI Chat] background refresh failed:", e && e.message);
    }
  }

  async function fetchThreadContext(postId) {
    const jsonUrl = `${location.origin}/comments/${postId}.json?limit=500&raw_json=1&sort=top`;
    const res = await fetch(jsonUrl, { credentials: "include", headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const post = data[0].data.children[0].data;
    const comments = [];
    const moreIds = [];
    walk(data[1].data.children, comments, moreIds, 0);

    let rounds = 0;
    while (moreIds.length && rounds < 200) {
      const batch = moreIds.splice(0, 100);
      try {
        const mr = await fetch(`${location.origin}/api/morechildren.json?api_type=json&link_id=t3_${postId}&raw_json=1&limit_children=false`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
          body: "children=" + batch.join(","),
        });
        if (!mr.ok) break;
        const md = await mr.json();
        walk(md.json?.data?.things || [], comments, moreIds, 0);
      } catch {
        break;
      }
      rounds++;
    }

    return formatThread(post, comments);
  }

  function walk(children, comments, moreIds, depth) {
    for (const c of children || []) {
      if (!c || !c.kind) continue;
      if (c.kind === "more") {
        if (Array.isArray(c.data?.children)) moreIds.push(...c.data.children);
        continue;
      }
      if (c.kind !== "t1") continue;
      const d = c.data;
      if (!d) continue;
      const body = (d.body || "").trim();
      const author = d.author || "";
      if (body && body !== "[deleted]" && body !== "[removed]" && author !== "AutoModerator") {
        comments.push({ author, score: d.score || 0, body, depth: depth || 0 });
      }
      const replies = d.replies;
      if (replies && replies.data && Array.isArray(replies.data.children)) {
        walk(replies.data.children, comments, moreIds, (depth || 0) + 1);
      }
    }
  }

  function formatThread(post, comments) {
    const seen = new Set();
    const clean = [];
    for (const c of comments) {
      const key = c.body;
      if (seen.has(key)) continue;
      seen.add(key);
      clean.push(c);
    }
    clean.sort((a, b) => b.score - a.score);
    const top = clean;

    const lines = [];
    lines.push(`SUBREDDIT: r/${post.subreddit}`);
    lines.push(`TITLE: ${post.title}`);
    lines.push(`POST AUTHOR: u/${post.author} | SCORE: ${post.score} | COMMENTS: ${post.num_comments}`);
    lines.push(`POST URL: https://reddit.com${post.permalink || ""}`);
    if (post.selftext) lines.push(`POST BODY:\n${post.selftext}`);
    if (post.is_video && post.media) lines.push(`[Media post]`);
    lines.push(`\n--- TOP COMMENTS (${top.length} shown, sorted by score) ---`);
    for (const c of top) {
      const indent = "  ".repeat(Math.min(c.depth, 3));
      lines.push(`${indent}[score ${c.score}] u/${c.author}: ${c.body.replace(/\n+/g, " ")}`);
    }
    return lines.join("\n");
  }

  function gatherPageContext() {
    const parts = [`PAGE: ${document.title}`, `URL: ${location.href}`];
    const posts = document.querySelectorAll("shreddit-post, [data-testid='post-container'], article");
    let i = 0;
    for (const p of posts) {
      const title = p.getAttribute("post-title") || p.querySelector("h1,h2,h3")?.textContent?.trim() || "";
      const body = p.querySelector("[slot='text-body'], .md")?.textContent?.trim() || "";
      if (title) parts.push(`- ${title}${body ? ": " + body : ""}`);
      if (++i >= 30) break;
    }
    return parts.join("\n");
  }

  function seedIntro() {
    if (!threadContext) return;
    const isThread = /\/comments\//.test(location.pathname);
    const count = (threadContext.match(/\[score /g) || []).length;
    const msg = isThread
      ? `I've loaded this thread — ${count} comments analyzed. Ask me anything about it, or switch the mode above to Summary / ELI5 / Sentiment.`
      : `I've loaded this page. Ask me anything about these posts.`;
    appendAssistant(msg, true);
  }

  async function restoreChat() {
    const saved = await storageGet("rca_chat_" + pageKey());
    if (!saved || !Array.isArray(saved.messages) || !saved.messages.length) return;
    history = saved.messages
      .filter((m) => m && m.role && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: m.content }));
    for (const m of history) {
      if (m.role === "user") appendUser(m.content);
      else if (m.role === "assistant") appendAssistant(m.content);
    }
    if (history.length) setStatus("Restored " + history.length + " messages");
  }

  function persistChat() {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      const postId = getPostId();
      storageSet("rca_chat_" + pageKey(), {
        messages: history,
        savedAt: Date.now(),
        url: location.href,
        title: document.title,
        postId: postId || null,
        subreddit: (location.pathname.match(/\/r\/([^/]+)/) || [])[1] || null,
      });
    }, 400);
  }

  async function clearChat() {
    clearTimeout(persistTimer);
    history = [];
    if (messagesEl) messagesEl.innerHTML = "";
    await storageRemove("rca_chat_" + pageKey());
    setStatus("New chat");
    seedIntro();
  }

  // ---------- Chat ----------
  function systemPrompt() {
    return (
      `You are "Reddit AI Chat", an assistant embedded in the user's browser with full access to the Reddit page they are viewing.\n\n` +
      `=== PAGE CONTEXT (ground truth) ===\n${threadContext}\n=== END CONTEXT ===\n\n` +
      `Guidelines: Base every answer on the context above. Be specific and reference usernames, scores, and concrete details when useful. ` +
      `Never invent comments that aren't present; if the answer isn't in the thread, say so plainly. ` +
      `Copy quotes verbatim from the context; never paraphrase, stitch, or invent text, IDs, or numbers. ` +
      `Use Markdown. When asked to summarize, structure as: TL;DR, Main consensus, Key disagreements, Best insights, Overall sentiment. ` +
      `Always respond in ${settings.language}.`
    );
  }

  function onSend() {
    const text = inputEl.value.trim();
    if (!text || streaming) return;
    if (!contextReady) {
      loadContext();
      appendAssistantError("Still loading the thread — try again in a moment.");
      return;
    }
    inputEl.value = "";
    inputEl.style.height = "auto";
    send(text);
  }

  function runMode(mode) {
    if (!contextReady) {
      loadContext().then(() => runMode(mode));
      return;
    }
    const prompts = {
      summary: "Summarize this entire thread for me.",
      eli5: "Explain what this thread is about like I'm 5 years old.",
      sentiment: "What is the overall sentiment of this thread, and what are the strongest opposing views?",
    };
    send(prompts[mode] || prompts.summary);
  }

  function send(text) {
    appendUser(text);
    history.push({ role: "user", content: text });
    persistChat();
    const node = appendAssistantStream();
    streaming = true;
    userStopped = false;
    sendBtn.disabled = false;
    sendBtn.classList.add("stop");
    sendBtn.textContent = "■";
    sendBtn.title = "Stop generating";
    setStatus("Thinking…");

    const port = chrome.runtime.connect({ name: "chat" });
    activePort = port;
    let acc = "";
    let reasoning = "";
    node.copyBtn.addEventListener("click", () => copyMessage(acc, node.copyBtn, true));
    port.onMessage.addListener((m) => {
      if (m.type === "delta") {
        acc += m.text;
        node.contentEl.innerHTML = renderMarkdown(acc);
        scrollDown();
      } else if (m.type === "reasoning") {
        if (settings.thinking) {
          reasoning += m.text;
          node.reasoningEl.textContent = reasoning;
          node.reasoningEl.classList.remove("hidden");
          scrollDown();
        }
      } else if (m.type === "done") {
        finish(acc);
      } else if (m.type === "error") {
        finish(acc, m.message);
      }
    });
    port.onDisconnect.addListener(() => {
      if (streaming) finish(acc);
    });
    port.postMessage({
      type: "chat",
      payload: {
        messages: [{ role: "system", content: systemPrompt() }, ...history],
        model: settings.model,
        provider: settings.provider,
        temperature: (typeof settings.temperature === "number" ? settings.temperature : 0.1),
      },
    });
  }

  function stopStream() {
    if (!streaming) return;
    userStopped = true;
    setStatus("Stopped");
    const port = activePort;
    activePort = null;
    if (port) {
      try { port.disconnect(); } catch {}
    } else {
      finish("");
    }
  }

  function finish(acc, error) {
    if (!streaming) return;
    const wasStopped = userStopped;
    streaming = false;
    userStopped = false;
    activePort = null;
    sendBtn.disabled = false;
    sendBtn.classList.remove("stop");
    sendBtn.textContent = "➤";
    sendBtn.title = "Send";
    setStatus(error ? "Error" : wasStopped ? "Stopped" : "Ready");
    if (acc) history.push({ role: "assistant", content: acc });
    persistChat();
    if (error) appendAssistantError("API error: " + error);
  }

  function scrollDown() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function jumpMessage(dir) {
    const rows = Array.from(messagesEl.querySelectorAll(".row"));
    if (!rows.length) return;
    const top = messagesEl.getBoundingClientRect().top;
    if (dir === "down") {
      const target = rows.find((r) => r.getBoundingClientRect().top > top + 4);
      if (!target) return jumpLatest();
      scrollRowToTop(target);
      flashRow(target);
    } else {
      const above = rows.filter((r) => r.getBoundingClientRect().top < top - 4);
      const target = above[above.length - 1];
      if (!target) return;
      scrollRowToTop(target);
      flashRow(target);
    }
  }

  function scrollRowToTop(row) {
    const delta = row.getBoundingClientRect().top - messagesEl.getBoundingClientRect().top;
    messagesEl.scrollTo({ top: messagesEl.scrollTop + delta, behavior: "smooth" });
  }

  function jumpLatest() {
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: "smooth" });
    const rows = messagesEl.querySelectorAll(".row");
    if (rows.length) flashRow(rows[rows.length - 1]);
  }

  let flashTimer = null;
  function flashRow(row) {
    messagesEl.querySelectorAll(".row.flash").forEach((r) => r.classList.remove("flash"));
    clearTimeout(flashTimer);
    row.classList.add("flash");
    flashTimer = setTimeout(() => row.classList.remove("flash"), 800);
  }

  function appendUser(text) {
    const row = document.createElement("div");
    row.className = "row user";
    row.innerHTML = `<button class="copy" title="Copy">⧉</button><div class="bubble"></div><div class="avatar">👤</div>`;
    row.querySelector(".bubble").textContent = text;
    const btn = row.querySelector(".copy");
    btn.addEventListener("click", () => copyMessage(text, btn, false));
    messagesEl.appendChild(row);
    scrollDown();
  }

  function appendAssistant(text, isIntro) {
    const node = appendAssistantStream();
    node.contentEl.innerHTML = renderMarkdown(text);
    if (isIntro) {
      node.contentEl.style.opacity = "0.85";
      node.copyBtn.style.display = "none";
    } else {
      node.copyBtn.addEventListener("click", () => copyMessage(text, node.copyBtn, true));
    }
    scrollDown();
    return node;
  }

  function appendAssistantStream() {
    const row = document.createElement("div");
    row.className = "row assistant";
    row.innerHTML = `<div class="avatar">🧠</div><div class="bubble"><div class="thinking hidden"></div><div class="content"></div></div><button class="copy" title="Copy">⧉</button>`;
    messagesEl.appendChild(row);
    scrollDown();
    return {
      contentEl: row.querySelector(".content"),
      reasoningEl: row.querySelector(".thinking"),
      copyBtn: row.querySelector(".copy"),
    };
  }

  // Strip every presentational attribute (colour, background, font, size) but keep
  // semantic tags, so Google Docs applies its OWN styles for headings/body — no highlight.
  function sanitizeRoot(root) {
    const KEEP = new Set(["H1", "H2", "H3", "H4", "H5", "H6", "P", "BR", "UL", "OL", "LI", "STRONG", "B", "EM", "I", "U", "CODE", "PRE", "BLOCKQUOTE", "HR", "A"]);
    root.querySelectorAll(".thinking,.copy,.avatar").forEach((n) => n.remove());
    const unwrap = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    let el = walker.nextNode();
    while (el) {
      for (const a of Array.from(el.attributes)) el.removeAttribute(a.name);
      if (!KEEP.has(el.tagName) && el.tagName !== "DIV") unwrap.push(el);
      el = walker.nextNode();
    }
    for (let i = unwrap.length - 1; i >= 0; i--) {
      const e = unwrap[i];
      if (!e.parentNode) continue;
      while (e.firstChild) e.parentNode.insertBefore(e.firstChild, e);
      e.remove();
    }
    return root;
  }

  function buildClipboard(text, isMarkdown) {
    const box = document.createElement("div");
    box.style.cssText = "position:fixed;left:-9999px;top:0;width:600px;";
    box.innerHTML = isMarkdown ? renderMarkdown(text || "") : escHtml(text || "").replace(/\n/g, "<br>");
    document.body.appendChild(box);
    const plain = box.innerText || box.textContent || "";
    sanitizeRoot(box);
    const html = box.innerHTML;
    box.remove();
    return { html, plain };
  }

  function copyMessage(text, btn, isMarkdown) {
    const done = () => {
      btn.textContent = "✓";
      btn.classList.add("done");
      setTimeout(() => { btn.textContent = "⧉"; btn.classList.remove("done"); }, 1200);
    };
    const fail = () => {
      btn.textContent = "✕";
      setTimeout(() => (btn.textContent = "⧉"), 1200);
    };
    const { html, plain } = buildClipboard(text, isMarkdown);
    const writeRich = () => {
      if (navigator.clipboard && window.ClipboardItem) {
        return navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([plain], { type: "text/plain" }),
          }),
        ]);
      }
      return Promise.reject(new Error("no clipboard.write"));
    };
    writeRich().then(done).catch(() => (fallbackCopy(plain) ? done() : fail()));
  }

  function fallbackCopy(text) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text || "";
      ta.style.cssText = "position:fixed;top:-9999px;";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }

  // Ctrl+C inside the panel: replace the browser's style-skinned HTML with clean semantic HTML.
  function installCopyHandler() {
    shadow.addEventListener("copy", (e) => {
      try {
        const sel = (shadow.getSelection && shadow.getSelection()) || window.getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        if (!shadow.contains(range.commonAncestorContainer)) return;
        const box = document.createElement("div");
        box.appendChild(range.cloneContents());
        const plain = sel.toString();
        sanitizeRoot(box);
        e.clipboardData.setData("text/html", box.innerHTML);
        e.clipboardData.setData("text/plain", plain);
        e.preventDefault();
      } catch {
        /* fall back to the browser's default copy */
      }
    });
  }

  function appendAssistantError(msg) {
    const row = document.createElement("div");
    row.className = "row assistant";
    row.innerHTML = `<div class="avatar">⚠️</div><div class="bubble"><span class="err"></span></div>`;
    row.querySelector(".err").textContent = msg;
    messagesEl.appendChild(row);
    scrollDown();
  }

  // Minimal markdown: headings, bold, italics, code, lists, paragraphs.
  function renderMarkdown(md) {
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let html = esc(md);
    html = html.replace(/```([\s\S]*?)```/g, (_, c) => `<pre><code>${c.trim()}</code></pre>`);
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>").replace(/^## (.*)$/gm, "<h2>$1</h2>").replace(/^# (.*)$/gm, "<h1>$1</h1>");
    html = html.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/(^|[^*])\*([^*]+)\*/g, "$1<i>$2</i>");
    html = html.replace(/^[-*] (.*)$/gm, "<li>$1</li>").replace(/(<li>[\s\S]*?<\/li>)(?![\s\S]*<li>)/, "$1");
    html = html.replace(/(<li>[\s\S]*<\/li>)/g, "<ul>$1</ul>");
    return html.replace(/\n{2,}/g, "<br><br>").replace(/\n/g, "<br>");
  }
})();
