/* Page de réglages : bibliothèque de prompts, options, import/export. */
(function () {
  const Store = window.PromptWheelStore;
  let data = null;
  let saveTimer = null;

  const el = (id) => document.getElementById(id);
  const categoriesEl = el('categories');
  const toastEl = el('toast');

  function toast(message) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toastEl.hidden = true; }, 1800);
  }

  // Écriture différée : on tape dans un champ sans déclencher une écriture par frappe.
  function save(message) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        await Store.set(data);
        toast(message || 'Enregistré');
      } catch (e) {
        toast('Échec de l\'enregistrement : ' + e.message);
      }
    }, 250);
  }

  function uid(prefix) {
    return prefix + '-' + Math.random().toString(36).slice(2, 9);
  }

  /* ---------- réglages ---------- */

  const KEY_LABELS = { Space: 'Espace', Escape: 'Échap' };

  function hotkeyLabel(hk) {
    if (!hk || !hk.key) return 'Aucun';
    const parts = [];
    if (hk.ctrl) parts.push('Ctrl');
    if (hk.alt) parts.push('Alt');
    if (hk.shift) parts.push('Maj');
    if (hk.meta) parts.push('Meta');
    let key = hk.key.replace(/^Key/, '').replace(/^Digit/, '');
    key = KEY_LABELS[key] || key;
    parts.push(key);
    return parts.join(' + ');
  }

  function bindSettings() {
    el('openAt').value = data.settings.openAt;
    el('openAt').addEventListener('change', (e) => {
      data.settings.openAt = e.target.value;
      save();
    });

    ['hotkeyEnabled', 'alwaysCopy', 'autoSend', 'showRecents'].forEach((key) => {
      const input = el(key);
      input.checked = !!data.settings[key];
      input.addEventListener('change', () => {
        data.settings[key] = input.checked;
        save();
      });
    });

    const hkBtn = el('hotkey');
    hkBtn.textContent = hotkeyLabel(data.settings.hotkey);
    hkBtn.addEventListener('click', () => {
      hkBtn.classList.add('is-recording');
      hkBtn.textContent = 'Appuie sur la combinaison…';
      const onKey = (e) => {
        e.preventDefault();
        if (['ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'ShiftLeft', 'ShiftRight', 'MetaLeft', 'MetaRight'].includes(e.code)) return;
        if (e.code === 'Escape') {
          hkBtn.classList.remove('is-recording');
          hkBtn.textContent = hotkeyLabel(data.settings.hotkey);
          window.removeEventListener('keydown', onKey, true);
          return;
        }
        data.settings.hotkey = { alt: e.altKey, ctrl: e.ctrlKey, shift: e.shiftKey, meta: e.metaKey, key: e.code };
        hkBtn.classList.remove('is-recording');
        hkBtn.textContent = hotkeyLabel(data.settings.hotkey);
        window.removeEventListener('keydown', onKey, true);
        save('Raccourci mis à jour');
      };
      window.addEventListener('keydown', onKey, true);
    });

    el('shortcuts-link').addEventListener('click', (e) => {
      e.preventDefault();
      // Une page chrome:// ne peut pas être ouverte par un lien : il faut passer par l'API.
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });
  }

  /* ---------- bibliothèque ---------- */

  function renderCategories() {
    categoriesEl.innerHTML = '';
    if (!data.categories.length) {
      const p = document.createElement('p');
      p.className = 'muted small';
      p.textContent = 'Aucune catégorie. Clique sur « + Catégorie » pour commencer.';
      categoriesEl.appendChild(p);
      return;
    }
    data.categories.forEach((cat, index) => categoriesEl.appendChild(buildCategory(cat, index)));
  }

  function buildCategory(cat, index) {
    const wrap = document.createElement('div');
    wrap.className = 'category';

    const head = document.createElement('div');
    head.className = 'category-head';

    const color = document.createElement('input');
    color.type = 'color';
    color.value = cat.color;
    color.title = 'Couleur du secteur';
    color.addEventListener('input', () => { cat.color = color.value; save(); });

    const name = document.createElement('input');
    name.type = 'text';
    name.className = 'cat-name';
    name.value = cat.name;
    name.addEventListener('input', () => { cat.name = name.value; save(); });

    const up = iconButton('▲', 'Monter', () => move(data.categories, index, -1));
    const down = iconButton('▼', 'Descendre', () => move(data.categories, index, 1));
    const add = iconButton('+ Prompt', 'Ajouter un prompt', () => {
      cat.prompts.push({ id: uid(cat.id), title: 'Nouveau prompt', text: '' });
      save('Prompt ajouté');
      renderCategories();
    });
    const del = iconButton('✕', 'Supprimer la catégorie', () => {
      if (!confirm('Supprimer la catégorie « ' + cat.name + ' » et ses ' + cat.prompts.length + ' prompts ?')) return;
      data.categories.splice(index, 1);
      save('Catégorie supprimée');
      renderCategories();
    });

    head.append(color, name, add, up, down, del);

    const body = document.createElement('div');
    body.className = 'category-body';
    if (!cat.prompts.length) {
      const p = document.createElement('p');
      p.className = 'muted small';
      p.textContent = 'Catégorie vide — elle n\'apparaîtra pas dans la roue.';
      body.appendChild(p);
    }
    cat.prompts.forEach((prompt, pi) => body.appendChild(buildPrompt(cat, prompt, pi)));

    wrap.append(head, body);
    return wrap;
  }

  function buildPrompt(cat, prompt, index) {
    const wrap = document.createElement('div');
    wrap.className = 'prompt';

    const head = document.createElement('div');
    head.className = 'prompt-head';

    const title = document.createElement('input');
    title.type = 'text';
    title.className = 'prompt-title';
    title.value = prompt.title;
    title.placeholder = 'Titre affiché dans la roue';
    title.addEventListener('input', () => { prompt.title = title.value; save(); });

    const badge = document.createElement('span');
    badge.className = 'vars-badge';

    const up = iconButton('▲', 'Monter', () => move(cat.prompts, index, -1));
    const down = iconButton('▼', 'Descendre', () => move(cat.prompts, index, 1));
    const dup = iconButton('⧉', 'Dupliquer', () => {
      cat.prompts.splice(index + 1, 0, { id: uid(cat.id), title: prompt.title + ' (copie)', text: prompt.text });
      save('Prompt dupliqué');
      renderCategories();
    });
    const del = iconButton('✕', 'Supprimer', () => {
      if (!confirm('Supprimer « ' + prompt.title + ' » ?')) return;
      cat.prompts.splice(index, 1);
      save('Prompt supprimé');
      renderCategories();
    });

    head.append(title, badge, dup, up, down, del);

    const text = document.createElement('textarea');
    text.value = prompt.text;
    text.placeholder = 'Texte du prompt. Utilise {{variable}} pour les parties à compléter.';
    const refreshBadge = () => {
      const vars = (text.value.match(/\{\{\s*[^}]+?\s*\}\}/g) || []).length;
      badge.textContent = vars ? vars + ' variable' + (vars > 1 ? 's' : '') : '';
    };
    text.addEventListener('input', () => { prompt.text = text.value; refreshBadge(); save(); });
    refreshBadge();

    wrap.append(head, text);
    return wrap;
  }

  function iconButton(label, title, onClick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn-icon';
    b.textContent = label;
    b.title = title;
    b.addEventListener('click', onClick);
    return b;
  }

  function move(arr, index, delta) {
    const next = index + delta;
    if (next < 0 || next >= arr.length) return;
    const [item] = arr.splice(index, 1);
    arr.splice(next, 0, item);
    save();
    renderCategories();
  }

  /* ---------- import / export ---------- */

  el('add-category').addEventListener('click', () => {
    const id = uid('cat');
    data.categories.push({ id, name: 'Nouvelle catégorie', color: '#e94560', prompts: [] });
    save('Catégorie ajoutée');
    renderCategories();
  });

  el('export').addEventListener('click', () => {
    const payload = { version: data.version, categories: data.categories, settings: data.settings };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompt-wheel-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  el('import').addEventListener('click', () => el('import-file').click());

  el('import-file').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      if (!raw || !Array.isArray(raw.categories)) throw new Error('fichier invalide');
      const merge = data.categories.length
        ? confirm('Ajouter les prompts importés à ta bibliothèque actuelle ?\n\nOK = ajouter · Annuler = remplacer')
        : false;
      const imported = Store.normalize(raw);
      data.categories = merge ? data.categories.concat(imported.categories) : imported.categories;
      if (raw.settings) data.settings = Object.assign({}, data.settings, imported.settings);
      await Store.set(data);
      data = await Store.get();
      bindSettingsValues();
      renderCategories();
      toast('Import terminé');
    } catch (err) {
      alert("Import impossible : " + err.message);
    } finally {
      e.target.value = '';
    }
  });

  el('reset').addEventListener('click', async () => {
    if (!confirm('Revenir à la bibliothèque et aux réglages par défaut ? Tes prompts personnalisés seront perdus.')) return;
    data = await Store.reset();
    bindSettingsValues();
    renderCategories();
    toast('Réinitialisé');
  });

  function bindSettingsValues() {
    el('openAt').value = data.settings.openAt;
    ['hotkeyEnabled', 'alwaysCopy', 'autoSend', 'showRecents'].forEach((k) => { el(k).checked = !!data.settings[k]; });
    el('hotkey').textContent = hotkeyLabel(data.settings.hotkey);
  }

  /* ---------- démarrage ---------- */

  Store.get().then(async (d) => {
    data = d;
    bindSettings();
    renderCategories();

    if (new URLSearchParams(location.search).get('welcome')) {
      el('welcome').hidden = false;
      try {
        const cmds = await chrome.commands.getAll();
        const cmd = cmds.find((c) => c.name === 'toggle-wheel');
        if (cmd && cmd.shortcut) el('welcome-shortcut').textContent = cmd.shortcut;
      } catch (e) { /* liste indisponible : on garde la valeur par défaut */ }
    }
  });
})();
