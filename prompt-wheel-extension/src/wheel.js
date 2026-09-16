/* Menu radial. Rendu dans un shadow root : la page hôte ne peut ni le restyler
   ni voir ses styles. Expose window.PromptWheel. */
(function (root) {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const SIZE = 460;
  const C = SIZE / 2;
  const HUB_R = 74;      // disque central
  const INNER_R = 84;    // bord interne des secteurs
  const OUTER_R = 206;   // bord externe
  const LABEL_R = 148;   // rayon du texte
  const GAP = 2.4;       // demi-écart blanc entre deux secteurs, en degrés

  function polar(r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) };
  }

  function donut(r1, r2, a0, a1) {
    const large = a1 - a0 > 180 ? 1 : 0;
    const p1 = polar(r2, a0), p2 = polar(r2, a1), p3 = polar(r1, a1), p4 = polar(r1, a0);
    return `M ${p1.x} ${p1.y} A ${r2} ${r2} 0 ${large} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${r1} ${r1} 0 ${large} 0 ${p4.x} ${p4.y} Z`;
  }

  function arc(r, a0, a1) {
    const large = a1 - a0 > 180 ? 1 : 0;
    const p1 = polar(r, a0), p2 = polar(r, a1);
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`;
  }

  // Mélange une couleur avec du blanc : 0 = couleur pleine, 1 = blanc.
  function tint(hex, amount) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    if (!m) return hex;
    const out = [1, 2, 3].map((i) => {
      const v = parseInt(m[i], 16);
      return Math.round(v + (255 - v) * amount);
    });
    return '#' + out.map((v) => v.toString(16).padStart(2, '0')).join('');
  }

  function wrap(text, maxChars, maxLines) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let cur = '';
    words.forEach((w) => {
      const next = cur ? cur + ' ' + w : w;
      if (next.length <= maxChars) cur = next;
      else {
        if (cur) lines.push(cur);
        cur = w.length > maxChars ? w.slice(0, maxChars - 1) + '…' : w;
      }
    });
    if (cur) lines.push(cur);
    if (lines.length > maxLines) {
      const kept = lines.slice(0, maxLines);
      kept[maxLines - 1] = kept[maxLines - 1].slice(0, maxChars - 1) + '…';
      return kept;
    }
    return lines;
  }

  class Wheel {
    constructor(options) {
      this.onPick = options.onPick;
      this.data = options.data;
      this.open = false;
      this.setIndex = 0;
      this.catIndex = -1;   // -1 = niveau des catégories
      this.hover = -1;      // -2 = moyeu
      this.query = '';
      this.mode = 'wheel';  // 'wheel' | 'builder'
      this._onKeyDown = this._onKeyDown.bind(this);
    }

    setData(data) {
      this.data = data;
      if (this.setIndex >= data.sets.length) this.setIndex = 0;
      if (this.open) this.render();
    }

    /* ---------- DOM ---------- */

    _build() {
      this.host = document.createElement('div');
      this.host.id = 'prompt-wheel-host';
      this.host.style.cssText = 'all:initial;position:fixed;inset:0;z-index:2147483647;';
      this.shadow = this.host.attachShadow({ mode: 'open' });

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = chrome.runtime.getURL('src/wheel.css');
      this.shadow.appendChild(link);

      const overlay = document.createElement('div');
      overlay.className = 'pw-overlay';
      overlay.innerHTML = `
        <div class="pw-stage">
          <div class="pw-topbar">
            <input type="text" class="pw-search" placeholder="Rechercher un prompt…" autocomplete="off" spellcheck="false">
            <span class="pw-sethint"></span>
          </div>
          <div class="pw-body">
            <div class="pw-wheelcol">
              <svg class="pw-svg" viewBox="0 0 ${SIZE} ${SIZE}" aria-hidden="true"></svg>
            </div>
            <aside class="pw-panel">
              <div class="pw-panel-scroll">
                <div class="pw-panel-title"></div>
                <div class="pw-panel-body"></div>
              </div>
              <div class="pw-panel-foot">Clic : insérer &nbsp;·&nbsp; Maj + clic : insérer et envoyer &nbsp;·&nbsp; Ctrl + clic : copier</div>
            </aside>
          </div>
          <form class="pw-builder" hidden></form>
        </div>
      `;
      this.shadow.appendChild(overlay);

      this.overlay = overlay;
      this.stage = overlay.querySelector('.pw-stage');
      this.svg = overlay.querySelector('.pw-svg');
      this.searchEl = overlay.querySelector('.pw-search');
      this.setHintEl = overlay.querySelector('.pw-sethint');
      this.panelTitle = overlay.querySelector('.pw-panel-title');
      this.panelBody = overlay.querySelector('.pw-panel-body');
      this.builderEl = overlay.querySelector('.pw-builder');

      overlay.addEventListener('mousedown', (e) => {
        if (!e.composedPath().includes(this.stage)) this.close();
      });
      this.svg.addEventListener('mousemove', (e) => this._onMove(e));
      this.svg.addEventListener('mouseleave', () => { this.hover = -1; this._paint(); });
      this.svg.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.hover === -2) this._hubClick();
        else if (this.hover >= 0) this.choose(this.hover, { shift: e.shiftKey, ctrl: e.ctrlKey || e.metaKey });
      });
      this.searchEl.addEventListener('input', () => {
        this.query = this.searchEl.value.trim();
        this.hover = this.query ? 0 : -1;
        this.render();
      });

      document.documentElement.appendChild(this.host);
    }

    /* ---------- niveaux ---------- */

    get set() { return this.data.sets[this.setIndex] || { name: '', categories: [] }; }

    _items() {
      if (this.query) {
        const q = this.query.toLowerCase();
        return root.PromptWheelStore.allPrompts(this.data)
          .filter((p) => (p.title + ' ' + p.text + ' ' + p.categoryName + ' ' + p.setName).toLowerCase().includes(q))
          .slice(0, 12)
          .map((p) => ({ kind: 'prompt', label: p.title, num: p.num, color: p.color, icon: p.icon, text: p.text, id: p.id, sub: p.setName + ' › ' + p.categoryName }));
      }
      if (this.catIndex >= 0) {
        const cat = this.set.categories[this.catIndex];
        if (!cat) return [];
        return cat.items.map((it) => ({ kind: 'prompt', label: it.title, num: it.num, color: cat.color, icon: cat.icon, text: it.text, id: it.id, sub: cat.name }));
      }
      const items = this.set.categories.map((c, i) => ({
        kind: c.kind === 'builder' ? 'builder' : 'category',
        label: c.short || c.name, icon: c.icon, color: c.color, index: i,
        count: c.items.length
      }));
      if (this.data.settings.showRecents) {
        const rec = root.PromptWheelStore.recents(this.data, 7);
        if (rec.length) items.push({ kind: 'recents', label: 'Récents', icon: '🕘', color: '#6B7280', items: rec });
      }
      return items;
    }

    _hub() {
      if (this.query) return { icon: '🔍', title: 'Recherche', sub: '‹ retour', color: '#E63946' };
      if (this.catIndex >= 0) {
        const cat = this.set.categories[this.catIndex];
        return { icon: cat ? cat.icon : '', title: cat ? cat.name : '', sub: '‹ retour', color: cat ? cat.color : '#5B6CFF' };
      }
      if (this.recentsLevel) return { icon: '🕘', title: 'Récents', sub: '‹ retour', color: '#6B7280' };
      const n = this.data.sets.length;
      return {
        title: this.set.name,
        sub: (this.setIndex + 1) + '/' + n + (n > 1 ? ' · clic : autre jeu' : ''),
        color: '#4B5563'
      };
    }

    /* ---------- rendu ---------- */

    render() {
      if (this.mode === 'builder') { this._renderBuilder(); return; }
      this.stage.classList.remove('is-builder');
      this.builderEl.hidden = true;

      const items = this.recentsLevel
        ? this.recentsLevel.map((p) => ({ kind: 'prompt', label: p.title, num: p.num, color: p.color, icon: p.icon, text: p.text, id: p.id, sub: p.setName + ' › ' + p.categoryName }))
        : this._items();
      this.viewItems = items;

      const n = this.data.sets.length;
      this.setHintEl.textContent = n > 1 ? 'Tab : jeu suivant (' + (this.setIndex + 1) + '/' + n + ')' : '';

      while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);

      if (!items.length) {
        const t = document.createElementNS(SVG_NS, 'text');
        t.setAttribute('x', C); t.setAttribute('y', C - 110);
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('class', 'pw-none');
        t.textContent = this.query ? 'Aucun résultat' : 'Catégorie vide';
        this.svg.appendChild(t);
      }

      const step = items.length ? 360 / items.length : 0;
      this.sectors = [];

      items.forEach((item, i) => {
        const a0 = i * step + (items.length > 1 ? GAP : 0);
        const a1 = (i + 1) * step - (items.length > 1 ? GAP : 0);
        const mid = i * step + step / 2;

        const g = document.createElementNS(SVG_NS, 'g');
        g.setAttribute('class', 'pw-sec');

        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', donut(INNER_R, OUTER_R, a0, a1));
        path.setAttribute('class', 'pw-sec-fill');
        path.dataset.base = tint(item.color, 0.88);
        path.dataset.hot = tint(item.color, 0.55);
        path.setAttribute('fill', path.dataset.base);
        g.appendChild(path);

        const ring = document.createElementNS(SVG_NS, 'path');
        ring.setAttribute('d', arc(OUTER_R - 1.5, a0, a1));
        ring.setAttribute('class', 'pw-sec-ring');
        ring.setAttribute('stroke', item.color);
        g.appendChild(ring);

        const isTop = item.kind !== 'prompt';
        const lines = wrap(item.label, items.length > 7 ? 13 : 17, isTop ? 2 : 3);
        const lp = polar(LABEL_R, mid);

        // Numéro / emoji toujours juste au-dessus du libellé à l'écran, comme
        // dans la version d'origine : un placement radial les ferait se croiser.
        const b = document.createElementNS(SVG_NS, 'text');
        b.setAttribute('x', lp.x);
        b.setAttribute('y', lp.y - (lines.length - 1) * 8 - (isTop ? 20 : 16));
        b.setAttribute('text-anchor', 'middle');
        b.setAttribute('class', isTop ? 'pw-sec-icon' : 'pw-sec-num');
        if (!isTop) b.setAttribute('fill', item.color);
        b.textContent = isTop ? item.icon : String(item.num || i + 1);
        g.appendChild(b);
        const label = document.createElementNS(SVG_NS, 'text');
        label.setAttribute('x', lp.x);
        label.setAttribute('y', lp.y + 6);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('class', isTop ? 'pw-sec-label pw-strong' : 'pw-sec-label');
        lines.forEach((line, li) => {
          const ts = document.createElementNS(SVG_NS, 'tspan');
          ts.setAttribute('x', lp.x);
          ts.setAttribute('dy', li === 0 ? -((lines.length - 1) * 8) : 16);
          ts.textContent = line;
          label.appendChild(ts);
        });
        g.appendChild(label);

        this.svg.appendChild(g);
        this.sectors.push({ g, path });
      });

      this._renderHub();
      this._paint();
    }

    _renderHub() {
      const info = this._hub();
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('class', 'pw-hub');

      const disc = document.createElementNS(SVG_NS, 'circle');
      disc.setAttribute('cx', C); disc.setAttribute('cy', C); disc.setAttribute('r', HUB_R);
      disc.setAttribute('class', 'pw-hub-disc');
      g.appendChild(disc);

      let y = C - (info.icon ? 12 : 4);
      if (info.icon) {
        const ic = document.createElementNS(SVG_NS, 'text');
        ic.setAttribute('x', C); ic.setAttribute('y', y);
        ic.setAttribute('text-anchor', 'middle');
        ic.setAttribute('class', 'pw-hub-icon');
        ic.textContent = info.icon;
        g.appendChild(ic);
        y += 22;
      }

      const title = document.createElementNS(SVG_NS, 'text');
      title.setAttribute('x', C); title.setAttribute('y', y);
      title.setAttribute('text-anchor', 'middle');
      title.setAttribute('class', 'pw-hub-title');
      title.setAttribute('fill', info.color);
      const tl = wrap(info.title, 18, 2);
      tl.forEach((line, i) => {
        const ts = document.createElementNS(SVG_NS, 'tspan');
        ts.setAttribute('x', C);
        ts.setAttribute('dy', i === 0 ? 0 : 15);
        ts.textContent = line;
        title.appendChild(ts);
      });
      g.appendChild(title);

      const sub = document.createElementNS(SVG_NS, 'text');
      sub.setAttribute('x', C);
      sub.setAttribute('y', y + 15 * tl.length + 3);
      sub.setAttribute('text-anchor', 'middle');
      sub.setAttribute('class', 'pw-hub-sub');
      sub.textContent = info.sub;
      g.appendChild(sub);

      this.svg.appendChild(g);
      this.hubG = g;
    }

    _paint() {
      if (!this.sectors) return;
      this.sectors.forEach((s, i) => {
        const on = i === this.hover;
        s.g.classList.toggle('is-hover', on);
        s.path.setAttribute('fill', on ? s.path.dataset.hot : s.path.dataset.base);
      });
      if (this.hubG) this.hubG.classList.toggle('is-hover', this.hover === -2);
      this._panel(this.hover >= 0 && this.viewItems ? this.viewItems[this.hover] : null);
    }

    _panel(item) {
      if (!item) {
        this.panelTitle.textContent = '';
        this.panelBody.innerHTML = '<span class="pw-dim">Survole un secteur pour lire le prompt.</span>';
        return;
      }
      if (item.kind === 'category') {
        this.panelTitle.textContent = item.label;
        this.panelBody.innerHTML = '';
        const p = document.createElement('p');
        p.className = 'pw-dim';
        p.textContent = item.count + (item.count > 1 ? ' prompts' : ' prompt') + ' dans cette catégorie.';
        this.panelBody.appendChild(p);
        return;
      }
      if (item.kind === 'builder') {
        this.panelTitle.textContent = 'Construire';
        this.panelBody.innerHTML = '<p class="pw-dim">Assemble un prompt brique par brique : rôle, tâche, public, ton, format, garde-fous.</p>';
        return;
      }
      if (item.kind === 'recents') {
        this.panelTitle.textContent = 'Récents';
        this.panelBody.innerHTML = '<p class="pw-dim">Les derniers prompts utilisés, tous jeux confondus.</p>';
        return;
      }
      this.panelTitle.textContent = item.label;
      this.panelBody.innerHTML = '';
      if (item.sub) {
        const s = document.createElement('div');
        s.className = 'pw-panel-sub';
        s.textContent = item.sub;
        this.panelBody.appendChild(s);
      }
      this.panelBody.appendChild(this._markup(item.text));
    }

    // Met en évidence les repères [À COMPLÉTER], [coller ici], [Joindre le PDF]…
    _markup(text) {
      const pre = document.createElement('pre');
      pre.className = 'pw-text';
      const re = /\[[^\]\n]{1,40}\]/g;
      let last = 0, m;
      while ((m = re.exec(text))) {
        if (m.index > last) pre.appendChild(document.createTextNode(text.slice(last, m.index)));
        const mark = document.createElement('mark');
        mark.textContent = m[0];
        pre.appendChild(mark);
        last = m.index + m[0].length;
      }
      if (last < text.length) pre.appendChild(document.createTextNode(text.slice(last)));
      return pre;
    }

    /* ---------- interactions ---------- */

    _onMove(e) {
      const rect = this.svg.getBoundingClientRect();
      const scale = SIZE / rect.width;
      const dx = (e.clientX - rect.left) * scale - C;
      const dy = (e.clientY - rect.top) * scale - C;
      const d = Math.hypot(dx, dy);
      let next = -1;
      if (d <= HUB_R) next = -2;
      else if (d >= INNER_R && d <= OUTER_R && this.viewItems && this.viewItems.length) {
        let a = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        a = ((a % 360) + 360) % 360;
        next = Math.min(this.viewItems.length - 1, Math.floor(a / (360 / this.viewItems.length)));
      }
      if (next !== this.hover) { this.hover = next; this._paint(); }
    }

    _hubClick() {
      if (this.query || this.catIndex >= 0 || this.recentsLevel) { this.back(); return; }
      this.cycleSet(1);
    }

    cycleSet(delta) {
      const n = this.data.sets.length;
      if (n < 2) return;
      this.setIndex = (this.setIndex + delta + n) % n;
      this.catIndex = -1;
      this.recentsLevel = null;
      this.hover = -1;
      this.render();
    }

    back() {
      if (this.query) { this.query = ''; this.searchEl.value = ''; }
      else if (this.recentsLevel) this.recentsLevel = null;
      else if (this.catIndex >= 0) this.catIndex = -1;
      else { this.close(); return; }
      this.hover = -1;
      this.render();
      this.searchEl.focus();
    }

    choose(index, mods) {
      const item = this.viewItems && this.viewItems[index];
      if (!item) return;
      if (item.kind === 'category') {
        this.catIndex = item.index;
        this.hover = -1;
        this.render();
        return;
      }
      if (item.kind === 'builder') {
        this.mode = 'builder';
        this.builderPick = {};
        this.render();
        return;
      }
      if (item.kind === 'recents') {
        this.recentsLevel = item.items;
        this.hover = -1;
        this.render();
        return;
      }
      this._deliver(item.id, item.text, mods || {});
    }

    _onKeyDown(e) {
      if (!this.open) return;
      const stop = () => { e.preventDefault(); e.stopPropagation(); };

      if (this.mode === 'builder') {
        if (e.key === 'Escape') { stop(); this.mode = 'wheel'; this.render(); this.searchEl.focus(); }
        return;
      }

      const n = this.viewItems ? this.viewItems.length : 0;
      if (e.key === 'Escape') { stop(); this.close(); return; }
      if (e.key === 'Tab') { stop(); this.cycleSet(e.shiftKey ? -1 : 1); return; }
      if (e.key === 'Enter') {
        stop();
        const idx = this.hover >= 0 ? this.hover : 0;
        if (n) this.choose(idx, { shift: e.shiftKey, ctrl: e.ctrlKey || e.metaKey });
        return;
      }
      if (e.key === 'Backspace' && !this.searchEl.value) { stop(); this.back(); return; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (!n) return; stop();
        this.hover = this.hover < 0 ? 0 : (this.hover + 1) % n; this._paint(); return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (!n) return; stop();
        this.hover = this.hover <= 0 ? n - 1 : this.hover - 1; this._paint(); return;
      }
      if (/^[1-9]$/.test(e.key) && !this.searchEl.value) {
        const i = Number(e.key) - 1;
        if (i < n) { stop(); this.choose(i, { shift: e.shiftKey, ctrl: e.ctrlKey || e.metaKey }); }
      }
    }

    /* ---------- constructeur ---------- */

    _renderBuilder() {
      this.stage.classList.add('is-builder');
      this.builderEl.hidden = false;
      this.builderEl.innerHTML = '';

      const head = document.createElement('div');
      head.className = 'pw-builder-head';
      head.innerHTML = '<span class="pw-builder-title">🧩 ' + this.data.builder.name + '</span>';
      const hint = document.createElement('p');
      hint.className = 'pw-dim';
      hint.textContent = this.data.builder.hint;
      this.builderEl.appendChild(head);
      this.builderEl.appendChild(hint);

      const preview = document.createElement('pre');
      preview.className = 'pw-text pw-builder-preview';

      const update = () => {
        const parts = [];
        this.data.builder.ingredients.forEach((ing) => {
          const chosen = this.builderPick[ing.name];
          if (chosen != null) parts.push(ing.options[chosen].text);
        });
        preview.textContent = parts.length ? parts.join(' ') : 'Choisis au moins une brique.';
        this.builderText = parts.join(' ');
      };

      this.data.builder.ingredients.forEach((ing) => {
        const row = document.createElement('div');
        row.className = 'pw-builder-row';
        const label = document.createElement('span');
        label.className = 'pw-builder-label';
        label.textContent = ing.name;
        row.appendChild(label);
        const chips = document.createElement('div');
        chips.className = 'pw-chips';
        ing.options.forEach((opt, oi) => {
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = 'pw-chip';
          chip.textContent = opt.label;
          chip.title = opt.text;
          chip.addEventListener('click', () => {
            this.builderPick[ing.name] = this.builderPick[ing.name] === oi ? undefined : oi;
            chips.querySelectorAll('.pw-chip').forEach((c, ci) => c.classList.toggle('is-on', ci === this.builderPick[ing.name]));
            update();
          });
          chips.appendChild(chip);
        });
        row.appendChild(chips);
        this.builderEl.appendChild(row);
      });

      this.builderEl.appendChild(preview);
      update();

      const actions = document.createElement('div');
      actions.className = 'pw-builder-actions';
      const back = document.createElement('button');
      back.type = 'button'; back.className = 'pw-btn pw-btn-ghost'; back.textContent = 'Retour';
      back.addEventListener('click', () => { this.mode = 'wheel'; this.render(); this.searchEl.focus(); });
      const copy = document.createElement('button');
      copy.type = 'button'; copy.className = 'pw-btn pw-btn-ghost'; copy.textContent = 'Copier';
      copy.addEventListener('click', () => { if (this.builderText) this._deliver(null, this.builderText, { ctrl: true }); });
      const insert = document.createElement('button');
      insert.type = 'submit'; insert.className = 'pw-btn'; insert.textContent = 'Insérer';
      actions.append(back, copy, insert);
      this.builderEl.appendChild(actions);

      this.builderEl.onsubmit = (e) => {
        e.preventDefault();
        if (this.builderText) this._deliver(null, this.builderText, {});
      };
    }

    /* ---------- livraison ---------- */

    async _deliver(id, text, mods) {
      const res = await this.onPick(id, text, {
        copyOnly: !!mods.ctrl,
        send: !!mods.shift
      });
      let msg;
      if (res.copyOnly) msg = res.copied ? 'Copié dans le presse-papiers' : 'Copie impossible';
      else if (res.inserted && res.sent) msg = 'Inséré et envoyé';
      else if (res.inserted && res.copied) msg = 'Inséré dans la page · copié';
      else if (res.inserted) msg = 'Inséré dans la page';
      else if (res.copied) msg = 'Aucun champ trouvé · copié dans le presse-papiers';
      else msg = "Impossible d'insérer ou de copier";
      this.close(msg);
    }

    _toast(message) {
      const host = document.createElement('div');
      host.style.cssText = 'all:initial;position:fixed;inset:auto 0 26px 0;z-index:2147483647;pointer-events:none;';
      const sh = host.attachShadow({ mode: 'open' });
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = chrome.runtime.getURL('src/wheel.css');
      const el = document.createElement('div');
      el.className = 'pw-toast';
      el.textContent = message;
      sh.append(link, el);
      document.documentElement.appendChild(host);
      setTimeout(() => el.classList.add('is-out'), 1700);
      setTimeout(() => host.remove(), 2200);
    }

    /* ---------- ouverture / fermeture ---------- */

    show(anchor) {
      if (this.open) { this.close(); return; }
      if (!this.host) this._build();
      this.open = true;
      this.mode = 'wheel';
      this.setIndex = Math.min(this.data.settings.startSet || 0, this.data.sets.length - 1);
      this.catIndex = -1;
      this.recentsLevel = null;
      this.query = '';
      this.hover = -1;
      this.searchEl.value = '';
      this.host.style.display = '';
      this._position(anchor);
      this.render();
      window.addEventListener('keydown', this._onKeyDown, true);
      setTimeout(() => this.searchEl.focus({ preventScroll: true }), 0);
    }

    _position(anchor) {
      this.stage.classList.remove('is-centered');
      if (this.data.settings.openAt !== 'cursor' || !anchor) {
        this.stage.classList.add('is-centered');
        this.stage.style.left = this.stage.style.top = '';
        return;
      }
      const w = this.stage.offsetWidth || 860;
      const h = this.stage.offsetHeight || 560;
      const left = Math.max(12, Math.min(window.innerWidth - w - 12, anchor.x - w / 2));
      const top = Math.max(12, Math.min(window.innerHeight - h - 12, anchor.y - h / 2));
      this.stage.style.left = left + 'px';
      this.stage.style.top = top + 'px';
    }

    close(toast) {
      if (!this.open) return;
      this.open = false;
      window.removeEventListener('keydown', this._onKeyDown, true);
      if (this.host) this.host.style.display = 'none';
      if (toast) this._toast(toast);
    }
  }

  root.PromptWheel = { Wheel };
})(typeof window !== 'undefined' ? window : self);
