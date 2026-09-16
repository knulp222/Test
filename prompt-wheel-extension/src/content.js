/* Point d'entrée dans la page : suit le dernier champ actif, écoute le
   raccourci, ouvre la roue et délègue l'insertion. */
(function () {
  const Store = window.PromptWheelStore;
  const Insert = window.PromptWheelInsert;

  let data = null;
  let wheel = null;
  let lastEditable = null;
  let lastPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  // Le champ visé est mémorisé avant l'ouverture : une fois l'overlay affiché,
  // le focus est sur la recherche de la roue.
  document.addEventListener('focusin', (e) => {
    if (Insert.isEditable(e.target)) lastEditable = e.target;
  }, true);

  document.addEventListener('mousemove', (e) => {
    lastPointer = { x: e.clientX, y: e.clientY };
  }, { passive: true, capture: true });

  function matchesHotkey(e, hk) {
    if (!hk || e.code !== hk.key) return false;
    return !!hk.alt === e.altKey && !!hk.ctrl === e.ctrlKey && !!hk.shift === e.shiftKey && !!hk.meta === e.metaKey;
  }

  async function onPick(id, text, mods) {
    const res = await Insert.deliver(text, lastEditable, {
      alwaysCopy: data.settings.alwaysCopy,
      send: mods && mods.send,
      copyOnly: mods && mods.copyOnly
    });
    if (id) Store.recordUsage(id).catch((e) => console.error('[Prompt Wheel]', e));
    return res;
  }

  function toggle() {
    if (!data) return;
    if (!wheel) wheel = new window.PromptWheel.Wheel({ data, onPick });
    wheel.show(lastPointer);
  }

  window.addEventListener('keydown', (e) => {
    if (!data || !data.settings.hotkeyEnabled) return;
    if (wheel && wheel.open) return; // la roue gère ses propres touches
    if (matchesHotkey(e, data.settings.hotkey)) {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    }
  }, true);

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg) return false;
    if (msg.type === 'toggle-wheel') { toggle(); sendResponse({ ok: true }); return false; }
    if (msg.type === 'insert-prompt') {
      onPick(msg.id, msg.text, { copyOnly: msg.copyOnly, send: msg.send }).then(sendResponse);
      return true;
    }
    if (msg.type === 'ping') { sendResponse({ ok: true }); return false; }
    return false;
  });

  Store.get().then((d) => {
    data = d;
    Store.onChange((next) => {
      data = next;
      if (wheel) wheel.setData(next);
    });
  });
})();
