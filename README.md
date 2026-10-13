# Reddit AI Chat

**Ask AI questions about any Reddit thread — right on the page.**

Works in Google Chrome (and other Chromium browsers: Edge, Brave, Arc).

It's not on the Chrome Web Store, so you install it yourself. That takes about two minutes, and the exact steps are below.

---

## What it does

- Reads the whole thread you're looking at — the post **and** every comment.
- Lets you ask questions about it: *"What are the biggest pain points?"*, *"What are the biggest objections?"*, *"What are the biggest beliefs?"*
- Works with ChatGPT, Google Gemini, Claude, Grok, DeepSeek, or Groq — whichever you pick.
- Saves your chats per post. Come back later and the conversation is still there.

---

## What you need

1. **Chrome** (or Edge, Brave, or Arc — any Chromium browser).
2. **An API key** from one AI company. An API key is just a password you get from the AI's website, so the extension is allowed to ask it questions. You pay that company directly, and it's cheap — usually a fraction of a cent per question.

The easiest start is **Google Gemini** — free, no credit card. Steps below.

---

## Step 1 — Download

**[⬇ Download the extension](https://github.com/aidennguyenwrites/reddit-ai-chat/releases/latest)**

Click **`reddit-ai-chat-v1.6.0.zip`** on that page. You'll get a zip file.

**Unzip it** (double-click the file). You'll get a folder called `reddit-ai-chat`.

Keep this folder somewhere permanent — like your Documents folder. **Don't delete it later** — Chrome loads the extension from it.

---

## Step 2 — Add it to Chrome (one time)

1. Open Chrome and type **`chrome://extensions`** in the address bar, then press Enter.
2. Turn on **Developer mode** — the switch in the top-right corner.
3. Click **Load unpacked**.
4. Select the `reddit-ai-chat` folder you unzipped.

You'll see "Reddit AI Chat" appear in the list. That's it — installed.

> Chrome may warn that developer-mode extensions can be risky. This is normal for any extension installed outside the Web Store. Every line of this one's code is in the folder you downloaded, if you ever want to check.

---

## Step 3 — Get a free AI key (Google Gemini)

1. Go to **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)** and sign in with a Google account.
2. Click **Create API key**.
3. Copy the key that appears (click the copy icon).

No credit card needed. The free tier is plenty for normal use.

*(If you'd rather use a different company — ChatGPT, Claude, Grok, DeepSeek, Groq, OpenRouter — that works too. Each one has a "Get a key here" link in the settings page.)*

---

## Step 4 — Connect your key

1. Open any Reddit post. The **Chat with AI** panel appears at the top-right of the page.
   *(Don't see it? Check "Something not working?" below. Tip: click the puzzle-piece icon in Chrome's toolbar to pin **Reddit AI Chat** so you can show/hide the panel from there.)*
2. In the panel, click the **⚙ gear** icon. The settings page opens.
3. **AI provider** should be **Google Gemini** (it is by default).
4. Paste your key into the **API key** box.
5. Click **Save**, then **Test connection**.
6. You should see **"Connection OK"**. You're done.

---

## Use it

1. Open any Reddit post.
2. Wait a moment — the panel reads the thread and says **Ready**.
3. Type a question and press Enter. Good starters:
   - "What are the biggest pain points?"
   - "What are the biggest objections?"
   - "What are the biggest beliefs?"

**Handy things:**

- The dropdowns at the top switch the **model**, the **reply language**, and the **mode** (Chat / Summary / ELI5 / Sentiment).
- While the AI is writing, the send button becomes a red **■ Stop**. Click it to stop mid-answer.
- **🕘** opens your saved chats. **＋** starts a fresh chat. **✕** hides the panel — the floating 🧠 button brings it back.
- Hover any message and click **⧉** to copy it. Pasting into Google Docs or Word uses the document's own fonts — no weird colors, no highlights.

---

## Something not working?

| Problem | Fix |
|---|---|
| "No API key set" | Finish Steps 3 and 4. |
| "Connection failed" | Re-copy the key — make sure you got the whole thing and pasted it with no spaces. Check that the provider in settings matches where the key came from. |
| The panel doesn't appear | Make sure the tab is on **reddit.com**, then **refresh the page** (F5). The extension only starts on Reddit tabs that were opened or refreshed after installing. |
| "Couldn't load this thread" | Reddit is rate-limiting. Wait a minute, then refresh. |
| Chrome turned it off by itself one day | Chrome sometimes disables side-loaded extensions after a restart. Go to `chrome://extensions` and switch it back on. |

---

## Is it private?

- Your questions, and the text of the thread you're reading, are sent to **the one AI company you chose** — the same thing that happens when you type into their website.
- Your API key is stored **only in your browser, on this computer**. It's not synced to Google, and it never goes anywhere except your chosen AI company.
- The extension talks to Reddit (to read the thread, using your normal logged-in session) and to your chosen AI company. That's all. No tracking, no analytics, no servers run by the author.
- You can read every line of the code in the `src` folder.

---

## Which AI should I pick?

| Provider | Get a key here | Cost |
|---|---|---|
| **Google Gemini** | aistudio.google.com/apikey | **Free tier** — no credit card |
| **Groq** | console.groq.com/keys | **Free tier** — very fast |
| **ChatGPT** (OpenAI) | platform.openai.com/api-keys | Paid |
| **Claude** (Anthropic) | console.anthropic.com/settings/keys | Paid |
| **Grok** (xAI) | console.x.ai | Paid — add credits first |
| **DeepSeek** | platform.deepseek.com/api_keys | Very cheap |
| **OpenRouter** | openrouter.ai/keys | One key, hundreds of models |

> **Groq** and **Grok** sound alike but are different companies. Groq is the free one. Grok is the paid one from xAI.

---

## What's inside

```
manifest.json       tells Chrome what this is
src/background.js   connects to the AI company you chose
src/content.js      the chat panel + reads the Reddit thread
src/options.html    the settings page
src/options.js      settings logic
icons/              the app icon
```

Free and open source under the [MIT license](LICENSE). Not affiliated with Reddit or any AI company.

**Version 1.6.0**
