/* Réglages : éditeur à onglets (un par jeu), import/export et dialogue IA. */
(function () {
  const Store = window.PromptWheelStore;
  const el = (id) => document.getElementById(id);
  let data = null;
  let tab = 0;          // index du jeu affiché, ou 'builder'
  let saveTimer = null;

  /* ---------- utilitaires ---------- */

  function toast(msg) {
    const t = el('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { t.hidden = true; }, 1900);
  }

  // Écriture différée : on tape dans un champ sans une écriture par frappe.
  function save(msg) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { await Store.set(data); if (msg) toast(msg); }
      catch (e) { toast("Échec de l'enregistrement : " + e.message); }
    }, 250);
  }

  function counts() {
    const n = Store.allPrompts(data).length;
    el('counts').textContent = data.sets.length + (data.sets.length > 1 ? ' jeux · ' : ' jeu · ') + n + ' prompts';
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
    let k = hk.key.replace(/^Key/, '').replace(/^Digit/, '');
    parts.push(KEY_LABELS[k] || k);
    return parts.join(' + ');
  }

  function fillSettings() {
    const sel = el('startSet');
    sel.innerHTML = '';
    data.sets.forEach((s, i) => {
      const o = document.createElement('option');
      o.value = String(i);
      o.textContent = (i + 1) + ' · ' + s.name;
      sel.appendChild(o);
    });
    sel.value = String(Math.min(data.settings.startSet || 0, data.sets.length - 1));
    el('openAt').value = data.settings.openAt;
    ['hotkeyEnabled', 'alwaysCopy', 'showRecents'].forEach((k) => { el(k).checked = !!data.settings[k]; });
    el('hotkey').textContent = hotkeyLabel(data.settings.hotkey);
  }

  function bindSettings() {
    el('startSet').addEventListener('change', (e) => { data.settings.startSet = Number(e.target.value); save(); });
    el('openAt').addEventListener('change', (e) => { data.settings.openAt = e.target.value; save(); });
    ['hotkeyEnabled', 'alwaysCopy', 'showRecents'].forEach((k) => {
      el(k).addEventListener('change', () => { data.settings[k] = el(k).checked; save(); });
    });

    const btn = el('hotkey');
    btn.addEventListener('click', () => {
      btn.classList.add('is-rec');
      btn.textContent = 'Appuie sur la combinaison…';
      const onKey = (e) => {
        e.preventDefault();
        if (/^(Control|Alt|Shift|Meta)(Left|Right)$/.test(e.code)) return;
        window.removeEventListener('keydown', onKey, true);
        btn.classList.remove('is-rec');
        if (e.code === 'Escape') { btn.textContent = hotkeyLabel(data.settings.hotkey); return; }
        data.settings.hotkey = { alt: e.altKey, ctrl: e.ctrlKey, shift: e.shiftKey, meta: e.metaKey, key: e.code };
        btn.textContent = hotkeyLabel(data.settings.hotkey);
        save('Raccourci mis à jour');
      };
      window.addEventListener('keydown', onKey, true);
    });

    el('shortcuts-link').addEventListener('click', (e) => {
      e.preventDefault();
      // Un lien ne peut pas ouvrir une page chrome:// : il faut l'API onglets.
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });
  }

  /* ---------- éditeur ---------- */

  function renderTabs() {
    const box = el('tabs');
    box.innerHTML = '';
    data.sets.forEach((s, i) => {
      const b = document.createElement('button');
      b.className = 'tab' + (tab === i ? ' is-on' : '');
      b.textContent = (i + 1) + ' · ' + s.name;
      b.addEventListener('click', () => { tab = i; renderTabs(); renderEditor(); });
      box.appendChild(b);
    });
    const b = document.createElement('button');
    b.className = 'tab' + (tab === 'builder' ? ' is-on' : '');
    b.textContent = '🧩 Constructeur';
    b.addEventListener('click', () => { tab = 'builder'; renderTabs(); renderEditor(); });
    box.appendChild(b);
  }

  function renderEditor() {
    const box = el('editor');
    box.innerHTML = '';
    if (tab === 'builder') { box.appendChild(builderEditor()); return; }
    const set = data.sets[tab];
    if (!set) { tab = 0; renderTabs(); renderEditor(); return; }

    const head = document.createElement('div');
    head.className = 'set-head';
    const name = document.createElement('input');
    name.type = 'text';
    name.value = set.name;
    name.addEventListener('input', () => { set.name = name.value; renderTabs(); fillSettings(); save(); });
    const addCat = iconBtn('+ Catégorie', 'Ajouter une catégorie', () => {
      set.categories.push({ name: 'Nouvelle catégorie', short: 'Nouvelle', icon: '•', color: '#5b6cff', items: [] });
      save('Catégorie ajoutée'); renderEditor();
    });
    const delSet = iconBtn('✕ Jeu', 'Supprimer ce jeu', () => {
      if (data.sets.length < 2) { toast('Il faut au moins un jeu.'); return; }
      if (!confirm('Supprimer le jeu « ' + set.name +' » et tous ses prompts ?')) return;
      data.sets.splice(tab, 1);
      tab = 0;
      save('Jeu supprimé'); fillSettings(); renderTabs(); renderEditor(); counts();
    });
    head.append(name, addCat, delSet);
    box.appendChild(head);

    if (set.categories.length > 8) {
      const w = document.createElement('p');
      w.className = 'warn';
      w.textContent = set.categories.length + ' catégories : au-delà de 7, la roue devient difficile à lire.';
      box.appendChild(w);
    }

    set.categories.forEach((cat, ci) => box.appendChild(categoryCard(set, cat, ci)));
  }

  function categoryCard(set, cat, index) {
    const wrap = document.createElement('div');
    wrap.className = 'category';

    const head = document.createElement('div');
    head.className = 'cat-head';

    const color = document.createElement('input');
    color.type = 'color';
    color.value = cat.color;
    color.title = 'Couleur du secteur';
    color.addEventListener('input', () => { cat.color = color.value; save(); });

    const icon = document.createElement('input');
    icon.type = 'text';
    icon.className = 'ic';
    icon.value = cat.icon;
    icon.maxLength = 4;
    icon.title = 'Emoji affiché sur la roue';
    icon.addEventListener('input', () => { cat.icon = icon.value; save(); });

    const name = document.createElement('input');
    name.type = 'text';
    name.className = 'nm';
    name.value = cat.name;
    name.placeholder = 'Nom complet';
    name.addEventListener('input', () => { cat.name = name.value; save(); });

    const short = document.createElement('input');
    short.type = 'text';
    short.className = 'sh';
    short.value = cat.short;
    short.placeholder = 'Nom court (roue)';
    short.addEventListener('input', () => { cat.short = short.value; save(); });

    head.append(color, icon, name, short);

    if (cat.kind !== 'builder') {
      head.append(
        iconBtn('+ Prompt', 'Ajouter un prompt', () => {
          cat.items.push({ num: cat.items.length + 1, title: 'Nouveau prompt', text: '' });
          save('Prompt ajouté'); renderEditor();
        }),
        iconBtn('▲', 'Monter', () => move(set.categories, index, -1)),
        iconBtn('▼', 'Descendre', () => move(set.categories, index, 1)),
        iconBtn('✕', 'Supprimer la catégorie', () => {
          if (!confirm('Supprimer « ' + cat.name + ' » et ses ' + cat.items.length + ' prompts ?')) return;
          set.categories.splice(index, 1);
          save('Catégorie supprimée'); renderEditor();
        })
      );
    }

    const body = document.createElement('div');
    if (cat.kind === 'builder') {
      body.className = 'builder-note';
      body.textContent = 'Secteur « Construire » : son contenu se règle dans l\'onglet Constructeur.';
    } else {
      body.className = 'cat-body';
      if (cat.items.length > 7) {
        const w = document.createElement('p');
        w.className = 'warn';
        w.textContent = cat.items.length + ' prompts : au-delà de 7, les libellés deviennent illisibles sur la roue.';
        body.appendChild(w);
      }
      if (!cat.items.length) {
        const p = document.createElement('p');
        p.className = 'muted small';
        p.textContent = 'Catégorie vide — elle apparaîtra sur la roue sans contenu.';
        body.appendChild(p);
      }
      cat.items.forEach((it, ii) => body.appendChild(promptCard(cat, it, ii)));
    }

    wrap.append(head, body);
    return wrap;
  }

  function promptCard(cat, item, index) {
    const wrap = document.createElement('div');
    wrap.className = 'prompt';

    const head = document.createElement('div');
    head.className = 'prompt-head';

    const num = document.createElement('span');
    num.className = 'num';
    num.textContent = index + 1;

    const title = document.createElement('input');
    title.type = 'text';
    title.className = 'ti';
    title.value = item.title;
    title.placeholder = 'Titre court (45 caractères maximum)';

    const warn = document.createElement('span');
    warn.className = 'warn';
    const check = () => { warn.textContent = title.value.length > 45 ? title.value.length + ' car.' : ''; };
    title.addEventListener('input', () => { item.title = title.value; check(); save(); });
    check();

    head.append(num, title, warn,
      iconBtn('⧉', 'Dupliquer', () => {
        cat.items.splice(index + 1, 0, { num: index + 2, title: item.title + ' (copie)', text: item.text });
        renumber(cat); save('Prompt dupliqué'); renderEditor();
      }),
      iconBtn('▲', 'Monter', () => { move(cat.items, index, -1); renumber(cat); }),
      iconBtn('▼', 'Descendre', () => { move(cat.items, index, 1); renumber(cat); }),
      iconBtn('✕', 'Supprimer', () => {
        if (!confirm('Supprimer « ' + item.title + ' » ?')) return;
        cat.items.splice(index, 1); renumber(cat); save('Prompt supprimé'); renderEditor();
      })
    );

    const text = document.createElement('textarea');
    text.value = item.text;
    text.placeholder = "Texte du prompt, tel qu'il sera inséré. Les repères entre crochets — [À COMPLÉTER], [coller ici] — restent dans le texte et sont surlignés dans la roue.";
    text.addEventListener('input', () => { item.text = text.value; save(); });

    wrap.append(head, text);
    return wrap;
  }

  function builderEditor() {
    const box = document.createElement('div');
    const p = document.createElement('p');
    p.className = 'muted small';
    p.textContent = "Les briques du secteur « Construire », commun à tous les jeux. Une ligne par ingrédient, les options se séparent par un retour à la ligne au format « libellé | texte inséré ».";
    box.appendChild(p);

    data.builder.ingredients.forEach((ing, i) => {
      const card = document.createElement('div');
      card.className = 'category';

      const head = document.createElement('div');
      head.className = 'cat-head';
      const name = document.createElement('input');
      name.type = 'text';
      name.className = 'nm';
      name.value = ing.name;
      name.addEventListener('input', () => { ing.name = name.value; save(); });
      head.append(name,
        iconBtn('▲', 'Monter', () => move(data.builder.ingredients, i, -1)),
        iconBtn('▼', 'Descendre', () => move(data.builder.ingredients, i, 1)),
        iconBtn('✕', 'Supprimer', () => {
          if (!confirm('Supprimer l\'ingrédient « ' + ing.name + ' » ?')) return;
          data.builder.ingredients.splice(i, 1); save('Ingrédient supprimé'); renderEditor();
        })
      );

      const body = document.createElement('div');
      body.className = 'cat-body';
      const ta = document.createElement('textarea');
      ta.value = ing.options.map((o) => o.label + ' | ' + o.text).join('\n');
      ta.addEventListener('input', () => {
        ing.options = ta.value.split('\n').filter((l) => l.trim()).map((line) => {
          const i2 = line.indexOf('|');
          return i2 === -1
            ? { label: line.trim().slice(0, 24), text: line.trim() }
            : { label: line.slice(0, i2).trim(), text: line.slice(i2 + 1).trim() };
        });
        save();
      });
      body.appendChild(ta);

      card.append(head, body);
      box.appendChild(card);
    });

    const add = document.createElement('button');
    add.className = 'btn btn-ghost';
    add.textContent = '+ Ingrédient';
    add.addEventListener('click', () => {
      data.builder.ingredients.push({ name: 'Nouvel ingrédient', options: [{ label: 'Option', text: 'Texte inséré.' }] });
      save('Ingrédient ajouté'); renderEditor();
    });
    box.appendChild(add);
    return box;
  }

  function iconBtn(label, title, onClick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'icon-btn';
    b.textContent = label;
    b.title = title;
    b.addEventListener('click', onClick);
    return b;
  }

  function move(arr, index, delta) {
    const next = index + delta;
    if (next < 0 || next >= arr.length) return;
    arr.splice(next, 0, arr.splice(index, 1)[0]);
    save(); renderEditor();
  }

  function renumber(cat) { cat.items.forEach((it, i) => { it.num = i + 1; }); }

  /* ---------- import / export / réinitialisation ---------- */

  el('add-set').addEventListener('click', () => {
    data.sets.push({
      name: 'Nouveau jeu',
      categories: [{ name: 'Construire', short: 'Construire', icon: '🧩', color: '#8b5cf6', kind: 'builder', items: [] }]
    });
    tab = data.sets.length - 1;
    save('Jeu ajouté'); fillSettings(); renderTabs(); renderEditor(); counts();
  });

  el('export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(Store.exportable(data), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompts-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  el('import').addEventListener('click', () => el('import-file').click());

  el('import-file').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      const check = Store.validate(raw);
      if (!check.ok) throw new Error(check.errors.slice(0, 4).join('\n'));
      const merge = confirm('Ajouter les jeux importés aux tiens ?\n\nOK = ajouter · Annuler = remplacer');
      await Store.backup();
      const next = check.data;
      data.sets = merge ? data.sets.concat(next.sets) : next.sets;
      if (next.builder) data.builder = next.builder;
      await Store.set(data);
      data = await Store.get();
      tab = 0;
      refreshAll();
      toast('Import terminé' + (check.warnings.length ? ' · ' + check.warnings.length + ' avertissement(s)' : ''));
    } catch (err) {
      alert('Import impossible :\n\n' + err.message);
    } finally {
      e.target.value = '';
    }
  });

  el('restore').addEventListener('click', async () => {
    try {
      const b = await Store.getBackup();
      if (!b) { toast('Aucune sauvegarde enregistrée.'); return; }
      const when = new Date(b.at).toLocaleString('fr-BE');
      if (!confirm('Revenir à la version sauvegardée du ' + when + ' ?')) return;
      data = await Store.restoreBackup();
      tab = 0;
      refreshAll();
      toast('Version restaurée');
    } catch (e) { alert('Restauration impossible : ' + e.message); }
  });

  el('reset').addEventListener('click', async () => {
    if (!confirm('Revenir aux 4 jeux et aux réglages d\'origine ? Tes modifications seront perdues.')) return;
    await Store.backup();
    data = await Store.reset();
    tab = 0;
    refreshAll();
    toast('Réinitialisé');
  });

  /* ---------- dialogue « Modifier les prompts avec une IA » ---------- */

  const AI_INSTRUCTIONS = [
    "Tu vas modifier le fichier de configuration d'une « roue des prompts » utilisée en formation IA",
    "par des formateur·rices en insertion socio-professionnelle, alphabétisation et FLE (Belgique).",
    "",
    "Structure du JSON ci-dessous :",
    '- "sets" : liste de jeux de prompts. Chaque jeu a "name" et "categories".',
    '- Une catégorie a : "name", "short" (2 mots max, affiché sur la roue), "icon" (un seul emoji),',
    '  "color" (hexadécimal, ex. "#5B6CFF") et "items". La catégorie avec "kind": "builder" doit rester telle quelle.',
    '- Un item a : "num", "title" (titre court, 45 caractères max) et "text" (le prompt, tel qu\'il sera inséré).',
    '- "builder" : les ingrédients du constructeur de prompt, chacun avec des "options" (briques de texte).',
    "",
    "Règles :",
    "- Les prompts doivent être simples, concrets, autonomes (pas de texte à coller, sauf mention [Joindre …]).",
    "- Garde 7 catégories maximum par jeu et 7 prompts maximum par catégorie (lisibilité de la roue).",
    "- Réponds UNIQUEMENT avec le JSON complet, valide, dans un bloc ```json … ```, sans commentaire.",
    "",
    "MA DEMANDE : [décris ici ce que tu veux changer, ajouter ou supprimer]",
    "",
    "FICHIER ACTUEL :"
  ].join('\n');

  function aiPayload() {
    return AI_INSTRUCTIONS + '\n' + JSON.stringify(Store.exportable(data), null, 2);
  }

  function openAi() {
    el('ai-out').value = aiPayload();
    el('ai-in').value = '';
    el('ai-report').hidden = true;
    el('ai-apply').disabled = true;
    aiTab(0);
    el('ai-modal').hidden = false;
  }

  function aiTab(i) {
    document.querySelectorAll('.modal-tab').forEach((b) => b.classList.toggle('is-on', Number(b.dataset.tab) === i));
    document.querySelectorAll('.modal-pane').forEach((p) => { p.hidden = Number(p.dataset.pane) !== i; });
  }

  // L'IA renvoie souvent le JSON entouré d'un bloc ```json … ``` ou de texte.
  function extractJson(raw) {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    let body = fenced ? fenced[1] : raw;
    body = body.trim();
    if (body[0] !== '{') {
      const start = body.indexOf('{');
      const end = body.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error("Aucun objet JSON trouvé dans ce que tu as collé.");
      body = body.slice(start, end + 1);
    }
    return JSON.parse(body);
  }

  let aiCandidate = null;

  function aiCheck() {
    const report = el('ai-report');
    report.hidden = false;
    aiCandidate = null;
    el('ai-apply').disabled = true;
    let raw;
    try { raw = extractJson(el('ai-in').value); }
    catch (e) {
      report.className = 'report is-error';
      report.innerHTML = '<strong>JSON illisible.</strong><p>' + e.message + '</p>';
      return;
    }
    const check = Store.validate(raw);
    if (!check.ok) {
      report.className = 'report is-error';
      report.innerHTML = '<strong>Structure invalide — rien n\'a été modifié.</strong><ul>' +
        check.errors.slice(0, 12).map((x) => '<li>' + escapeHtml(x) + '</li>').join('') + '</ul>';
      return;
    }
    aiCandidate = check.data;
    const n = Store.allPrompts(check.data).length;
    report.className = 'report is-ok';
    report.innerHTML = '<strong>Structure valide.</strong><p>' + check.data.sets.length + ' jeu(x), ' + n + ' prompts.</p>' +
      (check.warnings.length
        ? '<p>Avertissements :</p><ul>' + check.warnings.slice(0, 10).map((x) => '<li>' + escapeHtml(x) + '</li>').join('') + '</ul>'
        : '');
    el('ai-apply').disabled = false;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  el('ai').addEventListener('click', openAi);
  el('ai-close').addEventListener('click', () => { el('ai-modal').hidden = true; });
  el('ai-modal').addEventListener('mousedown', (e) => { if (e.target === el('ai-modal')) el('ai-modal').hidden = true; });
  document.querySelectorAll('.modal-tab').forEach((b) => b.addEventListener('click', () => aiTab(Number(b.dataset.tab))));
  el('ai-reload').addEventListener('click', async () => { data = await Store.get(); el('ai-out').value = aiPayload(); toast('Fichier rechargé'); });
  el('ai-copy').addEventListener('click', async () => {
    await navigator.clipboard.writeText(el('ai-out').value).catch(() => {});
    toast('Copié — colle-le dans ChatGPT, Claude ou Gemini');
    aiTab(1);
  });
  el('ai-check').addEventListener('click', aiCheck);
  el('ai-apply').addEventListener('click', async () => {
    if (!aiCandidate) return;
    await Store.backup();
    aiCandidate.settings = data.settings;
    aiCandidate.usage = data.usage;
    data = await Store.set(aiCandidate);
    tab = 0;
    refreshAll();
    el('ai-modal').hidden = true;
    toast('Prompts mis à jour · « Restaurer » annule');
  });

  /* ---------- démarrage ---------- */

  function refreshAll() { counts(); fillSettings(); renderTabs(); renderEditor(); }

  Store.get().then(async (d) => {
    data = d;
    bindSettings();
    refreshAll();
    if (new URLSearchParams(location.search).get('welcome')) {
      el('welcome').hidden = false;
      try {
        const cmds = await chrome.commands.getAll();
        const c = cmds.find((x) => x.name === 'toggle-wheel');
        if (c && c.shortcut) el('welcome-shortcut').textContent = c.shortcut;
      } catch (e) { /* on garde la valeur affichée */ }
    }
  });
})();
