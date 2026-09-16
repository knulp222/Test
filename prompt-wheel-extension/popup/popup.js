/* Popup : recherche rapide + insertion sans passer par la roue. */
(function () {
  const Store = window.PromptWheelStore;
  const listEl = document.getElementById('list');
  const searchEl = document.getElementById('search');
  const shortcutEl = document.getElementById('shortcut');

  let data = null;
  let visible = [];
  let active = 0;

  function render() {
    const q = searchEl.value.trim().toLowerCase();
    const all = Store.allPrompts(data);
    visible = q
      ? all.filter((p) => (p.title + ' ' + p.text + ' ' + p.categoryName).toLowerCase().includes(q))
      : all;
    active = 0;
    listEl.innerHTML = '';

    if (!visible.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = q ? 'Aucun prompt ne correspond.' : 'Aucun prompt enregistré.';
      listEl.appendChild(empty);
      return;
    }

    if (!q && data.settings.showRecents) {
      const rec = Store.recents(data, 5);
      if (rec.length) {
        addGroup('Récents', rec);
        addGroup('Tous les prompts', all);
        return;
      }
    }
    addGroup(q ? 'Résultats' : 'Tous les prompts', visible);
  }

  function addGroup(title, items) {
    const h = document.createElement('div');
    h.className = 'group-title';
    h.textContent = title;
    listEl.appendChild(h);
    items.forEach((p) => listEl.appendChild(buildItem(p)));
  }

  function buildItem(p) {
    const btn = document.createElement('button');
    btn.className = 'item';
    btn.type = 'button';
    btn.title = p.text;
    btn.innerHTML = '<span class="dot"></span><span class="title"></span><span class="cat"></span>';
    btn.querySelector('.dot').style.background = p.color;
    btn.querySelector('.title').textContent = p.title;
    btn.querySelector('.cat').textContent = p.categoryName;
    btn.addEventListener('click', () => insert(p));
    return btn;
  }

  function highlight() {
    const items = Array.from(listEl.querySelectorAll('.item'));
    items.forEach((el, i) => el.classList.toggle('is-active', i === active));
    if (items[active]) items[active].scrollIntoView({ block: 'nearest' });
  }

  async function insert(prompt) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;
    try {
      const res = await chrome.tabs.sendMessage(tab.id, {
        type: 'insert-prompt',
        promptId: prompt.id,
        text: prompt.text
      });
      if (res && (res.inserted || res.copied)) window.close();
    } catch (e) {
      // Pas de content script sur cet onglet : on se contente de copier.
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
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'toggle-wheel' });
      window.close();
    } catch (e) {
      alert("La roue n'est pas disponible sur cet onglet. Recharge la page puis réessaie.");
    }
  });

  chrome.commands.getAll().then((cmds) => {
    const cmd = cmds.find((c) => c.name === 'toggle-wheel');
    shortcutEl.textContent = cmd && cmd.shortcut ? 'Raccourci : ' + cmd.shortcut : 'Aucun raccourci défini';
  }).catch(() => {});

  Store.get().then((d) => {
    data = d;
    render();
    highlight();
    searchEl.focus();
  });
})();
