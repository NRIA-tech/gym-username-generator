/**
 * Namewave — username generator
 * Pure client-side; works on GitHub Pages and locally (file:// or http).
 */

(function () {
  "use strict";

  /** @type {Record<string, string[]>} */
  const TOPIC_SEEDS = {
    fitness: ["fit", "gym", "lift", "iron", "pulse", "nova", "apex", "grind", "core", "flex", "vital", "prime"],
    crypto: ["chain", "ledger", "sats", "vault", "node", "hash", "block", "mint", "coin", "alpha", "yield"],
    girl: ["luna", "rose", "ivy", "aria", "nova", "sky", "bloom", "velvet", "pearl", "ember"],
    boy: ["jax", "rex", "ace", "kai", "blaze", "storm", "hawk", "neo", "zen"],
    dark: ["void", "noir", "shadow", "eclipse", "raven", "onyx", "midnight", "obsidian", "ash"],
    aesthetic: ["soft", "haze", "dream", "ethereal", "lumen", "velvet", "pastel", "muse", "aura"],
    gamer: ["frag", "clutch", "raid", "pixel", "loot", "crit", "sniper", "quest", "buff", "gg"],
    luxury: ["velvet", "aurum", "noir", "opal", "atlas", "regent", "cipher", "maison", "vogue"],
    minimal: ["mono", "line", "bare", "null", "void", "arc", "form", "axis", "grid"],
    music: ["wave", "tempo", "echo", "vinyl", "beat", "synth", "chord", "groove"],
    art: ["canvas", "stroke", "muse", "palette", "studio", "frame", "sketch"],
    tech: ["byte", "sync", "stack", "kernel", "flux", "vector", "signal", "codec"],
    nature: ["river", "pine", "ember", "frost", "sol", "terra", "bloom", "mist"],
    food: ["sage", "cocoa", "honey", "basil", "mocha", "fig", "matcha"],
    travel: ["atlas", "voyage", "drift", "compass", "nomad", "horizon", "summit"],
    instagram: ["insta", "gram", "feed", "reel", "story", "grid", "aesthetic"],
    tiktok: ["tok", "viral", "trend", "loop", "clip", "byte"],
    twitter: ["tweet", "bird", "thread", "blue", "post"],
    youtube: ["tube", "vlog", "channel", "prime", "frame", "cut"],
  };

  /** Keyword → topic keys (first match wins for flavor). */
  const KEYWORD_MAP = [
    { keys: ["fitness", "gym", "workout", "muscle", "lift", "crossfit", "yoga", "run", "running"], topics: ["fitness"] },
    { keys: ["crypto", "bitcoin", "btc", "eth", "nft", "defi", "blockchain", "web3"], topics: ["crypto"] },
    { keys: ["girl", "she", "her", "woman", "female", "feminine"], topics: ["girl", "aesthetic"] },
    { keys: ["boy", "he", "him", "male", "guy"], topics: ["boy"] },
    { keys: ["dark", "goth", "emo", "noir"], topics: ["dark"] },
    { keys: ["aesthetic", "soft", "cottagecore", "pastel"], topics: ["aesthetic"] },
    { keys: ["game", "gamer", "gaming", "esport", "fps", "valorant", "fortnite"], topics: ["gamer"] },
    { keys: ["luxury", "premium", "rich", "gold"], topics: ["luxury"] },
    { keys: ["minimal", "clean", "simple"], topics: ["minimal"] },
    { keys: ["music", "dj", "band", "rap", "song"], topics: ["music"] },
    { keys: ["art", "design", "draw", "paint"], topics: ["art"] },
    { keys: ["tech", "code", "dev", "software", "ai"], topics: ["tech"] },
    { keys: ["nature", "plant", "forest", "ocean"], topics: ["nature"] },
    { keys: ["food", "cook", "chef", "kitchen"], topics: ["food"] },
    { keys: ["travel", "trip", "wander"], topics: ["travel"] },
    { keys: ["instagram", "insta", "ig"], topics: ["instagram", "aesthetic"] },
    { keys: ["tiktok", "tik tok"], topics: ["tiktok"] },
    { keys: ["twitter", "x.com", "tweet"], topics: ["twitter"] },
    { keys: ["youtube", "yt", "vlog"], topics: ["youtube"] },
  ];

  const VOWELS = "aeiou";
  const CONSONANTS = "bcdfghjklmnpqrstvwxyz";

  const ADJECTIVES = {
    aesthetic: ["soft", "lunar", "velvet", "dreamy", "hazy", "ethereal", "pastel", "gentle"],
    dark: ["void", "noir", "grim", "cold", "bleak", "cryptic", "silent", "hollow"],
    luxury: ["royal", "velvet", "gilded", "prime", "noble", "regal", "grand", "elite"],
    cool: ["alpha", "prime", "nova", "apex", "bold", "swift", "sharp", "raw"],
    minimal: ["bare", "mono", "null", "pure", "clean", "flat", "thin", "mute"],
    gamer: ["clutch", "epic", "pro", "raid", "buff", "toxic", "sweaty", "glitch"],
    random: ["neo", "prime", "nova", "zen", "arc", "flux", "echo", "vibe"],
  };

  const SUFFIXES = {
    aesthetic: ["a", "ia", "ie", "xo", "ly", "elle"],
    dark: ["x", "666", "void", "noir", "13"],
    luxury: ["e", "gold", "prime", "lux", "noir"],
    cool: ["x", "hq", "io", "fy", "pro"],
    minimal: ["io", "hq", "app", "co", "dev"],
    gamer: ["gg", "tv", "fps", "pro", "exe", "lol"],
    random: ["x", "hq", "io", "ly", "fy"],
  };

  /**
   * @param {string} text
   * @returns {string[]}
   */
  function tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1);
  }

  /**
   * @param {string} prompt
   * @returns {{ topics: Set<string>, seeds: string[] }}
   */
  function analyzePrompt(prompt) {
    const raw = prompt.toLowerCase();
    const tokens = tokenize(prompt);
    const topics = new Set();

    for (const { keys, topics: t } of KEYWORD_MAP) {
      for (const k of keys) {
        if (raw.includes(k)) {
          t.forEach((x) => topics.add(x));
        }
      }
    }

    const tokenTopicHints = { fit: "fitness", gym: "fitness", run: "fitness", art: "art", code: "tech", dev: "tech" };
    for (const t of tokens) {
      if (TOPIC_SEEDS[t]) topics.add(t);
      const hint = tokenTopicHints[t];
      if (hint) topics.add(hint);
    }

    const seeds = [];
    for (const t of topics) {
      const list = TOPIC_SEEDS[t];
      if (list) seeds.push(...list);
    }
    for (const w of tokens) {
      if (w.length >= 3 && w.length <= 12) seeds.push(w);
    }

    return { topics, seeds: [...new Set(seeds)] };
  }

  function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  /**
   * @param {string} style
   * @returns {keyof typeof ADJECTIVES}
   */
  function resolveStyleKey(style) {
    if (style === "random") {
      const keys = ["aesthetic", "dark", "luxury", "cool", "minimal", "gamer"];
      return /** @type {keyof typeof ADJECTIVES} */ (randomItem(keys));
    }
    if (style === "aesthetic") return "aesthetic";
    if (style === "dark") return "dark";
    if (style === "luxury") return "luxury";
    return "random";
  }

  /**
   * @param {string} style
   */
  function getStyleKeyForUsername(style) {
    return resolveStyleKey(style);
  }

  function slugify(s) {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 18);
  }

  function blend(a, b) {
    const maxLen = 14;
    const cut = Math.ceil(a.length / 2);
    const left = a.slice(0, cut);
    const right = b.slice(Math.floor(b.length / 2));
    let out = (left + right).toLowerCase().replace(/[^a-z0-9]/g, "");
    if (out.length > maxLen) out = out.slice(0, maxLen);
    return out || a + b;
  }

  function syllable() {
    const len = randomInt(2, 4);
    let s = "";
    let useV = Math.random() > 0.5;
    for (let i = 0; i < len; i++) {
      s += useV ? randomItem(VOWELS.split("")) : randomItem(CONSONANTS.split(""));
      useV = !useV;
    }
    return s;
  }

  /**
   * @param {string[]} seeds
   * @param {string} styleKey
   */
  function pickSeed(seeds, styleKey) {
    if (seeds.length) return randomItem(seeds);
    const fallback = TOPIC_SEEDS[randomItem(Object.keys(TOPIC_SEEDS))];
    return randomItem(fallback);
  }

  /**
   * @param {string} styleKey
   * @param {string[]} seeds
   */
  function generateOne(styleKey, seeds) {
    const adj = randomItem(ADJECTIVES[styleKey] || ADJECTIVES.random);
    const seed = pickSeed(seeds, styleKey);
    const suf = randomItem(SUFFIXES[styleKey] || SUFFIXES.random);
    const roll = Math.random();

    if (roll < 0.22) {
      const a = slugify(seed) || syllable();
      const b = slugify(adj) || syllable();
      return (a + b).slice(0, 18);
    }
    if (roll < 0.38) {
      const left = slugify(seed).slice(0, 8) || syllable();
      const right = slugify(adj).slice(0, 6) || syllable();
      return `${left}.${right}`.slice(0, 22);
    }
    if (roll < 0.52) {
      const base = slugify(blend(seed, adj)) || syllable() + syllable();
      return (base + suf).replace(/\./g, "").slice(0, 20);
    }
    if (roll < 0.68) {
      const core = slugify(seed) || syllable();
      const n = randomInt(0, 999);
      return `${core}${n}`.slice(0, 18);
    }
    if (roll < 0.82) {
      const x = slugify(seed) || syllable();
      const y = slugify(adj) || syllable();
      return `${x}_${y}`.slice(0, 20);
    }
    const core = slugify(seed + adj) || syllable() + syllable();
    return core.slice(0, 16);
  }

  /**
   * @param {string} prompt
   * @param {string} style aesthetic | dark | luxury | random
   * @param {number} count
   */
  function generateUsernames(prompt, style, count) {
    const { seeds } = analyzePrompt(prompt);
    const pool = seeds.length ? seeds : ["nova", "vibe", "pulse", "arc", "zen"];

    const out = [];
    const seen = new Set();
    let guard = 0;
    while (out.length < count && guard < count * 80) {
      guard++;
      const styleKey = getStyleKeyForUsername(style);
      let u = generateOne(styleKey, pool);
      u = u.toLowerCase().replace(/[^a-z0-9._]/g, "");
      if (u.length < 3) u = syllable() + randomInt(10, 99);
      if (!seen.has(u)) {
        seen.add(u);
        out.push(u);
      }
    }
    return out;
  }

  // --- DOM ---

  const form = document.getElementById("gen-form");
  const promptEl = document.getElementById("prompt");
  const styleEl = document.getElementById("style");
  const btnGenerate = document.getElementById("btn-generate");
  const btnMore = document.getElementById("btn-more");
  const loadingWrap = document.getElementById("loading-wrap");
  const loadingText = document.getElementById("loading-text");
  const resultsSection = document.getElementById("results-section");
  const usernameList = document.getElementById("username-list");
  const toast = document.getElementById("toast");

  const LOADING_MESSAGES = [
    "Parsing your prompt…",
    "Matching vibes…",
    "Mixing keywords…",
    "Polishing handles…",
  ];

  let toastTimer = null;

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.hidden = true;
      }, 300);
    }, 2200);
  }

  function setLoading(on) {
    btnGenerate.disabled = on;
    btnMore.disabled = on;
    loadingWrap.hidden = !on;
    if (on) {
      let i = 0;
      loadingText.textContent = LOADING_MESSAGES[0];
      const id = setInterval(() => {
        if (loadingWrap.hidden) {
          clearInterval(id);
          return;
        }
        i = (i + 1) % LOADING_MESSAGES.length;
        loadingText.textContent = LOADING_MESSAGES[i];
      }, 400);
      loadingWrap.dataset.intervalId = String(id);
    } else {
      const id = loadingWrap.dataset.intervalId;
      if (id) clearInterval(Number(id));
    }
  }

  function renderList(names) {
    usernameList.innerHTML = "";
    names.forEach((name) => {
      const li = document.createElement("li");
      li.className = "username-item";

      const span = document.createElement("span");
      span.className = "username-text";
      span.textContent = name;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-copy";
      btn.textContent = "Copy";
      btn.setAttribute("aria-label", `Copy ${name}`);

      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(name);
          btn.textContent = "Copied";
          btn.classList.add("copied");
          showToast("Copied to clipboard");
          setTimeout(() => {
            btn.textContent = "Copy";
            btn.classList.remove("copied");
          }, 2000);
        } catch {
          const ta = document.createElement("textarea");
          ta.value = name;
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand("copy");
            btn.textContent = "Copied";
            showToast("Copied to clipboard");
          } catch {
            showToast("Copy failed — select manually");
          }
          document.body.removeChild(ta);
        }
      });

      li.appendChild(span);
      li.appendChild(btn);
      usernameList.appendChild(li);
    });
    resultsSection.hidden = false;
  }

  function runGenerate() {
    const text = promptEl.value.trim() || "creative username";
    const style = styleEl.value;

    setLoading(true);

    const delay = randomInt(480, 900);
    setTimeout(() => {
      const names = generateUsernames(text, style, 10);
      renderList(names);
      setLoading(false);
    }, delay);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    runGenerate();
  });

  btnMore.addEventListener("click", () => {
    runGenerate();
  });
})();
