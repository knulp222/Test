/* Popup : recherche rapide dans tous les jeux, insertion en un clic. */
(function () {
  const Store = window.PromptWheelStore;
  const listEl = document.getElementById('list');
  const searchEl = document.getElementById('search');
  let data = null;
  let active = 0;

  function render() {
    const q = searchEl.value.trim().toLowerCase();
    const all = Store.allPrompts(data);
    listEl.innerHTML = '';
    active = 0;

    const matches = q
      ? all.filter((p) => (p.title + ' ' + p.text + ' ' + p.categoryName + ' ' + p.setName).toLowerCase().includes(q))
      : null;

    if (matches) {
      if (!matches.length) {
        listEl.innerHTML = '<div class="empty">Aucun prompt ne correspond.</div>';
        return;
      }
      group('Résultats · ' + matches.length, matches);
      return;
    }

    const rec = Store.recents(data, 5);
    if (rec.length) group('Récents', rec);
    data.sets.forEach((s, si) => group(s.name, all.filter((p) => p.setIndex === si)));
  }

  function group(title, items) {
    if (!items.length) return;
    const h = document.createElement('div');
    h.className = 'group';
    h.textContent = title;
    listEl.appendChild(h);
    items.forEach((p) => listEl.appendChild(item(p)));
  }

  function item(p) {
    const b = document.createElement('button');
    b.className = 'item';
    b.type = 'button';
    b.title = p.text;
    b.innerHTML = '<span class="ic"></span><span class="title"></span><span class="cat"></span>';
    b.querySelector('.ic').textContent = p.icon;
    b.querySelector('.title').textContent = p.title;
    b.querySelector('.cat').textContent = p.short;
    b.addEventListener('click', (e) => insert(p, { copyOnly: e.ctrlKey || e.metaKey, send: e.shiftKey }));
    return b;
  }

  function highlight() {
    const items = Array.from(listEl.querySelectorAll('.item'));
    items.forEach((el, i) => el.classList.toggle('is-active', i === active));
    if (items[active]) items[active].scrollIntoView({ block: 'nearest' });
  }

  async function insert(prompt, mods) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;
    try {
      const res = await chrome.tabs.sendMessage(tab.id, {
        type: 'insert-prompt', id: prompt.id, text: prompt.text,
        copyOnly: mods.copyOnly, send: mods.send
      });
      if (res && (res.inserted || res.copied)) window.close();
    } catch (e) {
      // Onglet sans content script : on se contente de copier.
      await navigator.clipboard.writeText(prompt.text).catch(() => {});
      Store.recordUsage(prompt.id).catch(() => {});
      window.close();
    }
  }

  searchEl.addEventListener('input', () => { render(); highlight(); });
  searchEl.addEventListener('keydown', (e) => {
    const items = Array.from(listEl.querySelectorAll('.item'));
    if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(items.length - 1, active + 1); highlight(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(0, active - 1); highlight(); }
    else if (e.key === 'Enter' && items[active]) { e.preventDefault(); items[active].click(); }
  });

  document.getElementById('open-options').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('open-wheel').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;
    try { await chrome.tabs.sendMessage(tab.id, { type: 'toggle-wheel' }); window.close(); }
    catch (e) { alert("La roue n'est pas disponible sur cet onglet. Recharge la page puis réessaie."); }
  });

  chrome.commands.getAll().then((cmds) => {
    const c = cmds.find((x) => x.name === 'toggle-wheel');
    document.getElementById('shortcut').textContent = c && c.shortcut ? 'Raccourci : ' + c.shortcut : 'Ctrl+Alt+P dans la page';
  }).catch(() => {});

  Store.get().then((d) => { data = d; render(); highlight(); searchEl.focus(); });
})();
