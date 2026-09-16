/* Point d'entrée dans la page : suit le dernier champ actif, écoute le
   raccourci, ouvre la roue et délègue l'insertion. */
(function () {
  const Store = window.PromptWheelStore;
  const Insert = window.PromptWheelInsert;

  let data = null;
  let wheel = null;
  let lastEditable = null;
  let lastPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  // On mémorise le champ de saisie utilisé avant l'ouverture de la roue :
  // une fois l'overlay affiché, document.activeElement pointe sur la recherche.
  document.addEventListener('focusin', (e) => {
    if (Insert.isEditable(e.target)) lastEditable = e.target;
  }, true);

  document.addEventListener('mousemove', (e) => {
    lastPointer = { x: e.clientX, y: e.clientY };
  }, { passive: true, capture: true });

  function matchesHotkey(e, hk) {
    if (!hk) return false;
    if (e.code !== hk.key) return false;
    return !!hk.alt === e.altKey && !!hk.ctrl === e.ctrlKey && !!hk.shift === e.shiftKey && !!hk.meta === e.metaKey;
  }

  async function onPick(item, text) {
    const result = await Insert.deliver(text, lastEditable, {
      alwaysCopy: data.settings.alwaysCopy,
      autoSend: data.settings.autoSend
    });
    if (item && item.id) {
      Store.recordUsage(item.id).catch((e) => console.error('[Prompt Wheel]', e));
    }
    return result;
  }

  function ensureWheel() {
    if (!wheel) wheel = new window.PromptWheel.Wheel({ data, onPick });
    return wheel;
  }

  function toggle() {
    if (!data) return;
    ensureWheel().show(lastPointer);
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
    if (msg && msg.type === 'toggle-wheel') {
      toggle();
      sendResponse({ ok: true });
    } else if (msg && msg.type === 'insert-prompt') {
      // Insertion directe depuis le popup.
      onPick({ id: msg.promptId }, msg.text).then(sendResponse);
      return true;
    } else if (msg && msg.type === 'ping') {
      sendResponse({ ok: true });
    }
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
