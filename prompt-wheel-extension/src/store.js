/* Stockage partagé. Schéma identique au prompts.json de la version Python,
   ce qui permet d'importer le fichier existant sans conversion.
   Expose window.PromptWheelStore. */
(function (root) {
  const KEY = 'promptWheelData';
  const BACKUP_KEY = 'promptWheelBackup';
  const listeners = new Set();

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function freshData() {
    const d = root.PromptWheelDefaults;
    return {
      version: d.version,
      sets: clone(d.sets),
      builder: clone(d.builder),
      settings: clone(d.settings),
      usage: {}
    };
  }

  // Identifiant stable d'un prompt : les fichiers Python n'en portent pas,
  // on le dérive de sa position pour pouvoir suivre les récents.
  function itemId(setIndex, catIndex, itemIndex) {
    return 's' + setIndex + 'c' + catIndex + 'i' + itemIndex;
  }

  function normalize(raw) {
    const base = freshData();
    if (!raw || typeof raw !== 'object') return base;

    const settings = Object.assign({}, base.settings, raw.settings || {});
    settings.hotkey = Object.assign({}, base.settings.hotkey, (raw.settings || {}).hotkey || {});

    let sets = Array.isArray(raw.sets) ? raw.sets : null;
    // Un fichier ne contenant qu'une roue (pas de "sets") est accepté aussi.
    if (!sets && Array.isArray(raw.categories)) sets = [{ name: raw.name || 'Prompts', categories: raw.categories }];
    if (!sets) sets = base.sets;

    sets = sets.filter((s) => s && typeof s === 'object').map((s, si) => ({
      name: String(s.name || 'Jeu ' + (si + 1)),
      categories: (Array.isArray(s.categories) ? s.categories : [])
        .filter((c) => c && typeof c === 'object')
        .map((c, ci) => {
          const cat = {
            name: String(c.name || 'Sans nom'),
            short: String(c.short || c.name || 'Sans nom'),
            icon: String(c.icon || '•'),
            color: /^#[0-9a-f]{6}$/i.test(c.color || '') ? c.color : '#5B6CFF',
            items: (Array.isArray(c.items) ? c.items : [])
              .filter((it) => it && typeof it === 'object')
              .map((it, ii) => ({
                num: Number(it.num) || ii + 1,
                title: String(it.title || 'Sans titre'),
                text: String(it.text || ''),
                id: itemId(si, ci, ii)
              }))
          };
          if (c.kind === 'builder') cat.kind = 'builder';
          return cat;
        })
    }));

    const builder = raw.builder && Array.isArray(raw.builder.ingredients) ? raw.builder : base.builder;

    if (settings.startSet >= sets.length) settings.startSet = 0;

    return {
      version: raw.version || base.version,
      sets,
      builder,
      settings,
      usage: raw.usage && typeof raw.usage === 'object' ? raw.usage : {}
    };
  }

  function area(payloadSize) {
    // sync plafonne à 8 Ko par élément : une bibliothèque complète va en local.
    if (!chrome.storage.sync || payloadSize > 7500) return chrome.storage.local;
    return chrome.storage.sync;
  }

  async function readFrom(store) {
    return new Promise((resolve) => store.get(KEY, (res) => {
      void chrome.runtime.lastError;
      resolve(res && res[KEY]);
    }));
  }

  async function get() {
    const local = await readFrom(chrome.storage.local);
    if (local) return normalize(local);
    if (chrome.storage.sync) {
      const synced = await readFrom(chrome.storage.sync);
      if (synced) return normalize(synced);
    }
    return freshData();
  }

  async function set(data) {
    const payload = normalize(data);
    const json = JSON.stringify(payload);
    const target = area(json.length);
    await new Promise((resolve, reject) => {
      target.set({ [KEY]: payload }, () => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve();
      });
    });
    if (target === chrome.storage.local && chrome.storage.sync) {
      chrome.storage.sync.remove(KEY, () => void chrome.runtime.lastError);
    }
    return payload;
  }

  /* Sauvegarde de l'état courant avant un remplacement (équivalent de
     prompts.backup.json côté Python). */
  async function backup() {
    const current = await get();
    await new Promise((resolve) => {
      chrome.storage.local.set({ [BACKUP_KEY]: { at: Date.now(), data: current } }, () => {
        void chrome.runtime.lastError;
        resolve();
      });
    });
    return current;
  }

  async function getBackup() {
    return new Promise((resolve) => chrome.storage.local.get(BACKUP_KEY, (res) => {
      void chrome.runtime.lastError;
      resolve(res && res[BACKUP_KEY]);
    }));
  }

  async function restoreBackup() {
    const b = await getBackup();
    if (!b || !b.data) throw new Error('aucune sauvegarde disponible');
    return set(b.data);
  }

  async function reset() { return set(freshData()); }

  async function recordUsage(id) {
    if (!id) return null;
    const data = await get();
    const entry = data.usage[id] || { count: 0, last: 0 };
    entry.count += 1;
    entry.last = Date.now();
    data.usage[id] = entry;
    return set(data);
  }

  /* Tous les prompts, à plat, enrichis de leur jeu et de leur catégorie. */
  function allPrompts(data) {
    const out = [];
    data.sets.forEach((s, si) => {
      s.categories.forEach((c) => {
        if (c.kind === 'builder') return;
        c.items.forEach((it) => out.push(Object.assign({}, it, {
          setIndex: si, setName: s.name,
          categoryName: c.name, short: c.short, icon: c.icon, color: c.color
        })));
      });
    });
    return out;
  }

  function recents(data, limit) {
    return allPrompts(data)
      .map((p) => Object.assign({}, p, { last: (data.usage[p.id] || {}).last || 0 }))
      .filter((p) => p.last > 0)
      .sort((a, b) => b.last - a.last)
      .slice(0, limit || 7);
  }

  /* Contrôle de structure d'un fichier importé ou produit par une IA.
     Renvoie { ok, errors[], warnings[], data }. */
  function validate(raw) {
    const errors = [];
    const warnings = [];
    if (!raw || typeof raw !== 'object') {
      return { ok: false, errors: ['Le contenu n\'est pas un objet JSON.'], warnings, data: null };
    }
    if (!Array.isArray(raw.sets)) errors.push('Clé "sets" absente ou non liste.');
    else {
      raw.sets.forEach((s, si) => {
        const where = 'sets[' + si + ']';
        if (!s || typeof s !== 'object') { errors.push(where + ' n\'est pas un objet.'); return; }
        if (!s.name) errors.push(where + ' : "name" manquant.');
        if (!Array.isArray(s.categories)) { errors.push(where + ' : "categories" absent ou non liste.'); return; }
        if (s.categories.length > 8) warnings.push(where + ' : ' + s.categories.length + ' catégories (7 recommandé pour la lisibilité).');
        const hasBuilder = s.categories.some((c) => c && c.kind === 'builder');
        if (!hasBuilder) warnings.push(where + ' : pas de secteur "Construire".');
        s.categories.forEach((c, ci) => {
          const cw = where + '.categories[' + ci + ']';
          if (!c || typeof c !== 'object') { errors.push(cw + ' n\'est pas un objet.'); return; }
          if (!c.name) errors.push(cw + ' : "name" manquant.');
          if (!c.short) warnings.push(cw + ' : "short" manquant, le nom complet sera affiché sur la roue.');
          if (c.color && !/^#[0-9a-f]{6}$/i.test(c.color)) warnings.push(cw + ' : couleur "' + c.color + '" invalide, remplacée par le bleu.');
          if (c.kind === 'builder') return;
          if (!Array.isArray(c.items)) { errors.push(cw + ' : "items" absent ou non liste.'); return; }
          if (c.items.length > 7) warnings.push(cw + ' : ' + c.items.length + ' prompts (7 maximum recommandé).');
          c.items.forEach((it, ii) => {
            const iw = cw + '.items[' + ii + ']';
            if (!it || typeof it !== 'object') { errors.push(iw + ' n\'est pas un objet.'); return; }
            if (!it.title) errors.push(iw + ' : "title" manquant.');
            else if (String(it.title).length > 45) warnings.push(iw + ' : titre de ' + it.title.length + ' caractères (45 maximum recommandé).');
            if (!it.text) errors.push(iw + ' : "text" manquant.');
          });
        });
      });
    }
    return { ok: errors.length === 0, errors, warnings, data: errors.length ? null : normalize(raw) };
  }

  /* Le fichier exporté / soumis à une IA : sans usage ni réglages. */
  function exportable(data) {
    return {
      version: data.version,
      sets: data.sets.map((s) => ({
        name: s.name,
        categories: s.categories.map((c) => {
          const out = { name: c.name, short: c.short, icon: c.icon, color: c.color };
          if (c.kind === 'builder') { out.kind = 'builder'; out.items = []; }
          else out.items = c.items.map((it) => ({ num: it.num, title: it.title, text: it.text }));
          return out;
        })
      })),
      builder: data.builder
    };
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (!changes[KEY] || (areaName !== 'sync' && areaName !== 'local')) return;
    const next = normalize(changes[KEY].newValue);
    listeners.forEach((fn) => {
      try { fn(next); } catch (e) { console.error('[Prompt Wheel]', e); }
    });
  });

  root.PromptWheelStore = {
    get, set, reset, freshData, normalize, recordUsage,
    allPrompts, recents, validate, exportable,
    backup, getBackup, restoreBackup,
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  };
})(globalThis);
