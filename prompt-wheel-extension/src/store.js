/* Accès au stockage partagé (chrome.storage.sync avec repli sur local).
   Expose window.PromptWheelStore. */
(function (root) {
  const KEY = 'promptWheelData';
  const listeners = new Set();

  function area() {
    // sync est limité à ~100 Ko ; on bascule sur local si la bibliothèque déborde.
    return chrome.storage.sync || chrome.storage.local;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function freshData() {
    const d = root.PromptWheelDefaults;
    return {
      version: d.version,
      categories: clone(d.categories),
      settings: clone(d.settings),
      usage: {}
    };
  }

  function normalize(raw) {
    const base = freshData();
    if (!raw || typeof raw !== 'object') return base;
    const data = {
      version: raw.version || base.version,
      categories: Array.isArray(raw.categories) ? raw.categories : base.categories,
      settings: Object.assign({}, base.settings, raw.settings || {}),
      usage: raw.usage && typeof raw.usage === 'object' ? raw.usage : {}
    };
    data.settings.hotkey = Object.assign({}, base.settings.hotkey, (raw.settings || {}).hotkey || {});
    data.categories = data.categories
      .filter((c) => c && typeof c === 'object')
      .map((c, i) => ({
        id: c.id || 'cat-' + i,
        name: String(c.name || 'Sans nom'),
        color: c.color || '#e94560',
        prompts: (Array.isArray(c.prompts) ? c.prompts : [])
          .filter((p) => p && typeof p === 'object')
          .map((p, j) => ({
            id: p.id || c.id + '-' + j,
            title: String(p.title || 'Sans titre'),
            text: String(p.text || '')
          }))
      }));
    return data;
  }

  async function get() {
    const stored = await new Promise((resolve) => {
      area().get(KEY, (res) => resolve(res && res[KEY]));
    });
    if (!stored) {
      // Migration éventuelle depuis local si sync est vide.
      const local = await new Promise((resolve) => {
        chrome.storage.local.get(KEY, (res) => resolve(res && res[KEY]));
      });
      return normalize(local);
    }
    return normalize(stored);
  }

  async function set(data) {
    const payload = normalize(data);
    const json = JSON.stringify(payload);
    // chrome.storage.sync : 8 Ko par élément. Au-delà, on stocke en local.
    const tooBig = json.length > 7500;
    const target = tooBig ? chrome.storage.local : area();
    await new Promise((resolve, reject) => {
      target.set({ [KEY]: payload }, () => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve();
      });
    });
    if (tooBig && chrome.storage.sync) {
      // On évite de garder une copie périmée dans sync.
      chrome.storage.sync.remove(KEY, () => void chrome.runtime.lastError);
    }
    return payload;
  }

  async function reset() {
    return set(freshData());
  }

  async function recordUsage(promptId) {
    const data = await get();
    const entry = data.usage[promptId] || { count: 0, last: 0 };
    entry.count += 1;
    entry.last = Date.now();
    data.usage[promptId] = entry;
    return set(data);
  }

  function allPrompts(data) {
    const out = [];
    data.categories.forEach((cat) => {
      cat.prompts.forEach((p) => out.push(Object.assign({}, p, { categoryId: cat.id, categoryName: cat.name, color: cat.color })));
    });
    return out;
  }

  function recents(data, limit) {
    return allPrompts(data)
      .map((p) => Object.assign({}, p, { last: (data.usage[p.id] || {}).last || 0 }))
      .filter((p) => p.last > 0)
      .sort((a, b) => b.last - a.last)
      .slice(0, limit || 8);
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (!changes[KEY]) return;
    if (areaName !== 'sync' && areaName !== 'local') return;
    const next = normalize(changes[KEY].newValue);
    listeners.forEach((fn) => {
      try { fn(next); } catch (e) { console.error('[Prompt Wheel]', e); }
    });
  });

  root.PromptWheelStore = {
    get,
    set,
    reset,
    freshData,
    normalize,
    recordUsage,
    allPrompts,
    recents,
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  };
})(typeof window !== 'undefined' ? window : self);
