/* Insertion d'un prompt dans la page + copie presse-papiers.
   Expose window.PromptWheelInsert. */
(function (root) {
  // Champs de saisie connus des principaux assistants, essayés si aucun champ
  // n'était actif au moment de l'ouverture de la roue.
  const KNOWN_INPUTS = [
    '#prompt-textarea',                         // ChatGPT
    'div[contenteditable="true"].ProseMirror',  // Claude, ChatGPT
    'rich-textarea .ql-editor',                 // Gemini
    'textarea[name="q"]',
    'main textarea',
    'form textarea',
    'textarea'
  ];

  function isEditable(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.disabled || el.readOnly) return false;
    const tag = el.tagName;
    if (tag === 'TEXTAREA') return true;
    if (tag === 'INPUT') {
      return /^(text|search|url|email|tel|number|password|)$/i.test(el.type || 'text');
    }
    return el.isContentEditable === true;
  }

  function findTarget(preferred) {
    if (isEditable(preferred) && preferred.isConnected) return preferred;
    const active = document.activeElement;
    if (isEditable(active)) return active;
    for (const sel of KNOWN_INPUTS) {
      const el = document.querySelector(sel);
      if (isEditable(el) && el.offsetParent !== null) return el;
    }
    return null;
  }

  // React/Vue remplacent le setter de value : il faut passer par le setter natif
  // pour que le framework voie bien la nouvelle valeur.
  function setNativeValue(el, value) {
    const proto = el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    if (desc && desc.set) desc.set.call(el, value);
    else el.value = value;
  }

  function insertInField(el, text) {
    el.focus();
    const start = el.selectionStart == null ? el.value.length : el.selectionStart;
    const end = el.selectionEnd == null ? el.value.length : el.selectionEnd;
    const next = el.value.slice(0, start) + text + el.value.slice(end);
    setNativeValue(el, next);
    const caret = start + text.length;
    try { el.setSelectionRange(caret, caret); } catch (e) { /* input type sans sélection */ }
    el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function insertInContentEditable(el, text) {
    el.focus();
    const sel = window.getSelection();
    if (!sel.rangeCount || !el.contains(sel.anchorNode)) {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    // execCommand est déprécié mais reste le seul chemin qui traverse
    // correctement ProseMirror / Lexical / Quill.
    let ok = false;
    try { ok = document.execCommand('insertText', false, text); } catch (e) { ok = false; }
    if (!ok) {
      const range = window.getSelection().getRangeAt(0);
      range.deleteContents();
      const frag = document.createDocumentFragment();
      text.split('\n').forEach((line, i) => {
        if (i > 0) frag.appendChild(document.createElement('br'));
        frag.appendChild(document.createTextNode(line));
      });
      range.insertNode(frag);
      range.collapse(false);
    }
    el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    return true;
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // clipboard API refusée (page non focus, permission) : repli execCommand.
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
      } catch (err) {
        return false;
      }
    }
  }

  function send(el) {
    const opts = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true };
    el.dispatchEvent(new KeyboardEvent('keydown', opts));
    el.dispatchEvent(new KeyboardEvent('keypress', opts));
    el.dispatchEvent(new KeyboardEvent('keyup', opts));
  }

  /**
   * Insère `text` dans `preferred` (ou le meilleur champ trouvé) et copie.
   * Renvoie { inserted, copied }.
   */
  async function deliver(text, preferred, options) {
    const opts = options || {};
    const target = findTarget(preferred);
    let inserted = false;
    if (target) {
      try {
        inserted = target.isContentEditable
          ? insertInContentEditable(target, text)
          : insertInField(target, text);
      } catch (e) {
        console.error('[Prompt Wheel] insertion impossible', e);
        inserted = false;
      }
    }
    const copied = (!inserted || opts.alwaysCopy) ? await copy(text) : false;
    if (inserted && opts.autoSend && target) send(target);
    return { inserted, copied };
  }

  root.PromptWheelInsert = { deliver, copy, findTarget, isEditable };
})(typeof window !== 'undefined' ? window : self);
