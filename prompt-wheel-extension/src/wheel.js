/* Menu radial. Tout est rendu dans un shadow root pour ne pas hériter du CSS
   de la page hôte. Expose window.PromptWheel. */
(function (root) {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const SIZE = 460;          // côté du SVG
  const CENTER = SIZE / 2;
  const HUB_R = 58;          // rayon du moyeu central
  const INNER_R = 70;        // rayon interne des secteurs
  const OUTER_R = 212;       // rayon externe des secteurs
  const LABEL_R = (INNER_R + OUTER_R) / 2;
  const MAX_SECTORS = 12;    // au-delà, on pagine

  function polar(r, angleDeg) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
  }

  function donutPath(r1, r2, a0, a1) {
    const large = a1 - a0 > 180 ? 1 : 0;
    const p1 = polar(r2, a0);
    const p2 = polar(r2, a1);
    const p3 = polar(r1, a1);
    const p4 = polar(r1, a0);
    return [
      'M', p1.x, p1.y,
      'A', r2, r2, 0, large, 1, p2.x, p2.y,
      'L', p3.x, p3.y,
      'A', r1, r1, 0, large, 0, p4.x, p4.y,
      'Z'
    ].join(' ');
  }

  function fullRingPath(r1, r2) {
    // Un arc de 360° est dégénéré : on le dessine en deux moitiés.
    return donutPath(r1, r2, 0, 180) + ' ' + donutPath(r1, r2, 180, 360);
  }

  function wrapLabel(text, maxChars, maxLines) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let current = '';
    words.forEach((w) => {
      const candidate = current ? current + ' ' + w : w;
      if (candidate.length <= maxChars) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = w.length > maxChars ? w.slice(0, maxChars - 1) + '…' : w;
      }
    });
    if (current) lines.push(current);
    if (lines.length > maxLines) {
      const kept = lines.slice(0, maxLines);
      kept[maxLines - 1] = kept[maxLines - 1].replace(/.{0,1}$/, '…');
      return kept;
    }
    return lines;
  }

  function shade(hex, amount) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    if (!m) return hex;
    const rgb = [1, 2, 3].map((i) => parseInt(m[i], 16));
    const out = rgb.map((v) => Math.max(0, Math.min(255, Math.round(v + (amount > 0 ? (255 - v) * amount : v * amount)))));
    return '#' + out.map((v) => v.toString(16).padStart(2, '0')).join('');
  }

  function extractVariables(text) {
    const found = [];
    const re = /\{\{\s*([^}]+?)\s*\}\}/g;
    let m;
    while ((m = re.exec(text))) {
      if (!found.includes(m[1])) found.push(m[1]);
    }
    return found;
  }

  function fillVariables(text, values) {
    return text.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (full, name) => {
      const v = values[name];
      return v == null || v === '' ? full : v;
    });
  }

  class Wheel {
    constructor(options) {
      this.onPick = options.onPick;
      this.data = options.data;
      this.host = null;
      this.shadow = null;
      this.open = false;
      this.stack = [];       // pile de niveaux : { title, items }
      this.hover = -1;
      this.query = '';
      this.page = 0;
      this._onKeyDown = this._onKeyDown.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
    }

    setData(data) {
      this.data = data;
      if (this.open) this.render();
    }

    /* ---------- construction du DOM ---------- */

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
        <div class="pw-stage" part="stage">
          <div class="pw-search">
            <input type="text" class="pw-search-input" placeholder="Rechercher un prompt…" autocomplete="off" spellcheck="false" />
            <span class="pw-hint">↑ ↓ naviguer · Entrée insérer · Retour arrière remonter · Échap fermer</span>
          </div>
          <div class="pw-wheel-wrap">
            <svg class="pw-svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}" aria-hidden="true"></svg>
          </div>
          <div class="pw-preview"><span class="pw-preview-empty">Survole un secteur pour voir le prompt.</span></div>
          <form class="pw-vars" hidden></form>
        </div>
      `;
      this.shadow.appendChild(overlay);

      this.overlay = overlay;
      this.stage = overlay.querySelector('.pw-stage');
      this.svg = overlay.querySelector('.pw-svg');
      this.searchInput = overlay.querySelector('.pw-search-input');
      this.preview = overlay.querySelector('.pw-preview');
      this.varsForm = overlay.querySelector('.pw-vars');

      overlay.addEventListener('mousedown', (e) => {
        // Clic en dehors du plateau : on ferme.
        if (!e.composedPath().includes(this.stage)) this.close();
      });
      this.svg.addEventListener('mousemove', this._onMouseMove);
      this.svg.addEventListener('mouseleave', () => { this.hover = -1; this._paintHover(); });
      this.svg.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.hover === -2) this.back();
        else if (this.hover >= 0) this.choose(this.hover);
      });
      this.searchInput.addEventListener('input', () => {
        this.query = this.searchInput.value.trim();
        this.page = 0;
        this.hover = this.query ? 0 : -1;
        this.render();
      });
      this.varsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this._submitVars();
      });

      document.documentElement.appendChild(this.host);
    }

    /* ---------- niveaux ---------- */

    _rootItems() {
      const items = [];
      if (this.data.settings.showRecents) {
        const rec = root.PromptWheelStore.recents(this.data, 8);
        if (rec.length) {
          items.push({
            kind: 'category',
            id: '__recents__',
            label: 'Récents',
            color: '#6c757d',
            children: rec.map((p) => ({ kind: 'prompt', id: p.id, label: p.title, text: p.text, color: p.color }))
          });
        }
      }
      this.data.categories.forEach((cat) => {
        if (!cat.prompts.length) return;
        items.push({
          kind: 'category',
          id: cat.id,
          label: cat.name,
          color: cat.color,
          children: cat.prompts.map((p) => ({ kind: 'prompt', id: p.id, label: p.title, text: p.text, color: cat.color }))
        });
      });
      return items;
    }

    _searchItems() {
      const q = this.query.toLowerCase();
      return root.PromptWheelStore.allPrompts(this.data)
        .filter((p) => (p.title + ' ' + p.text + ' ' + p.categoryName).toLowerCase().includes(q))
        .slice(0, 24)
        .map((p) => ({ kind: 'prompt', id: p.id, label: p.title, text: p.text, color: p.color, sub: p.categoryName }));
    }

    _currentLevel() {
      if (this.query) return { title: 'Recherche', items: this._searchItems() };
      if (this.stack.length) return this.stack[this.stack.length - 1];
      return { title: 'Prompts', items: this._rootItems() };
    }

    _visibleItems(level) {
      const items = level.items;
      if (items.length <= MAX_SECTORS) return { items, paged: false };
      const perPage = MAX_SECTORS - 1;
      const pages = Math.ceil(items.length / perPage);
      this.page = ((this.page % pages) + pages) % pages;
      const slice = items.slice(this.page * perPage, this.page * perPage + perPage);
      slice.push({ kind: 'more', label: 'Suite ▸', color: '#495057' });
      return { items: slice, paged: true };
    }

    /* ---------- rendu ---------- */

    render() {
      const level = this._currentLevel();
      const view = this._visibleItems(level);
      this.viewItems = view.items;
      const n = view.items.length;
      while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);

      if (!n) {
        const txt = document.createElementNS(SVG_NS, 'text');
        txt.setAttribute('x', CENTER);
        txt.setAttribute('y', CENTER);
        txt.setAttribute('class', 'pw-empty');
        txt.setAttribute('text-anchor', 'middle');
        txt.textContent = this.query ? 'Aucun résultat' : 'Aucun prompt';
        this.svg.appendChild(txt);
        this._renderHub(level);
        this._paintPreview(null);
        return;
      }

      const step = 360 / n;
      this.sectors = [];
      view.items.forEach((item, i) => {
        const a0 = i * step;
        const a1 = a0 + step;
        const g = document.createElementNS(SVG_NS, 'g');
        g.setAttribute('class', 'pw-sector');
        g.dataset.index = String(i);

        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', n === 1 ? fullRingPath(INNER_R, OUTER_R) : donutPath(INNER_R, OUTER_R, a0 + 0.6, a1 - 0.6));
        // On alterne la luminosité d'un secteur à l'autre : dans une catégorie,
        // tous les prompts partagent la même couleur et resteraient sinon indistincts.
        const tint = item.kind === 'category' ? -0.22 + (i % 2) * 0.12 : -0.52 + (i % 3) * 0.13;
        path.setAttribute('fill', shade(item.color, tint));
        path.setAttribute('class', 'pw-sector-path');
        g.appendChild(path);

        const mid = a0 + step / 2;
        const pos = polar(LABEL_R, mid);
        const lines = wrapLabel(item.label, n > 8 ? 12 : 16, 2);
        const text = document.createElementNS(SVG_NS, 'text');
        text.setAttribute('class', 'pw-sector-label');
        text.setAttribute('x', pos.x);
        text.setAttribute('y', pos.y);
        text.setAttribute('text-anchor', 'middle');
        lines.forEach((line, li) => {
          const tspan = document.createElementNS(SVG_NS, 'tspan');
          tspan.setAttribute('x', pos.x);
          tspan.setAttribute('dy', li === 0 ? -((lines.length - 1) * 7) : 15);
          tspan.textContent = line;
          text.appendChild(tspan);
        });
        g.appendChild(text);

        if (i < 9) {
          const numPos = polar(OUTER_R - 16, mid);
          const num = document.createElementNS(SVG_NS, 'text');
          num.setAttribute('class', 'pw-sector-num');
          num.setAttribute('x', numPos.x);
          num.setAttribute('y', numPos.y + 4);
          num.setAttribute('text-anchor', 'middle');
          num.textContent = String(i + 1);
          g.appendChild(num);
        }

        if (item.kind === 'category') {
          const dotPos = polar(INNER_R + 14, mid);
          const dot = document.createElementNS(SVG_NS, 'circle');
          dot.setAttribute('class', 'pw-sector-dot');
          dot.setAttribute('cx', dotPos.x);
          dot.setAttribute('cy', dotPos.y);
          dot.setAttribute('r', 3.5);
          g.appendChild(dot);
        }

        this.svg.appendChild(g);
        this.sectors.push(g);
      });

      this._renderHub(level);
      this._paintHover();
    }

    _renderHub(level) {
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('class', 'pw-hub');
      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('cx', CENTER);
      circle.setAttribute('cy', CENTER);
      circle.setAttribute('r', HUB_R);
      circle.setAttribute('class', 'pw-hub-bg');
      g.appendChild(circle);

      const canGoBack = this.stack.length > 0 || !!this.query;
      const title = document.createElementNS(SVG_NS, 'text');
      title.setAttribute('class', 'pw-hub-title');
      title.setAttribute('x', CENTER);
      title.setAttribute('y', CENTER - 4);
      title.setAttribute('text-anchor', 'middle');
      wrapLabel(level.title, 12, 2).forEach((line, i) => {
        const tspan = document.createElementNS(SVG_NS, 'tspan');
        tspan.setAttribute('x', CENTER);
        tspan.setAttribute('dy', i === 0 ? 0 : 14);
        tspan.textContent = line;
        title.appendChild(tspan);
      });
      g.appendChild(title);

      const sub = document.createElementNS(SVG_NS, 'text');
      sub.setAttribute('class', 'pw-hub-sub');
      sub.setAttribute('x', CENTER);
      sub.setAttribute('y', CENTER + 24);
      sub.setAttribute('text-anchor', 'middle');
      sub.textContent = canGoBack ? '← retour' : '✕ fermer';
      g.appendChild(sub);

      this.svg.appendChild(g);
      this.hubGroup = g;
    }

    _paintHover() {
      if (!this.sectors) return;
      this.sectors.forEach((g, i) => g.classList.toggle('is-hover', i === this.hover));
      if (this.hubGroup) this.hubGroup.classList.toggle('is-hover', this.hover === -2);
      const item = this.hover >= 0 && this.viewItems ? this.viewItems[this.hover] : null;
      this._paintPreview(item);
    }

    _paintPreview(item) {
      if (!item || item.kind === 'more') {
        this.preview.innerHTML = '<span class="pw-preview-empty">Survole un secteur pour voir le prompt.</span>';
        return;
      }
      if (item.kind === 'category') {
        this.preview.innerHTML = '';
        const t = document.createElement('div');
        t.className = 'pw-preview-title';
        t.textContent = item.label + ' · ' + item.children.length + ' prompts';
        this.preview.appendChild(t);
        return;
      }
      this.preview.innerHTML = '';
      const t = document.createElement('div');
      t.className = 'pw-preview-title';
      t.textContent = item.sub ? item.label + ' · ' + item.sub : item.label;
      const body = document.createElement('div');
      body.className = 'pw-preview-body';
      body.textContent = item.text.length > 400 ? item.text.slice(0, 400) + '…' : item.text;
      this.preview.appendChild(t);
      this.preview.appendChild(body);
    }

    /* ---------- interactions ---------- */

    _onMouseMove(e) {
      const rect = this.svg.getBoundingClientRect();
      const scale = SIZE / rect.width;
      const x = (e.clientX - rect.left) * scale;
      const y = (e.clientY - rect.top) * scale;
      const dx = x - CENTER;
      const dy = y - CENTER;
      const dist = Math.hypot(dx, dy);
      let next = -1;
      if (dist <= HUB_R) {
        next = -2;
      } else if (dist >= INNER_R && dist <= OUTER_R && this.viewItems && this.viewItems.length) {
        let ang = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        ang = ((ang % 360) + 360) % 360;
        next = Math.min(this.viewItems.length - 1, Math.floor(ang / (360 / this.viewItems.length)));
      }
      if (next !== this.hover) {
        this.hover = next;
        this._paintHover();
      }
    }

    _onKeyDown(e) {
      if (!this.open) return;
      if (!this.varsForm.hidden) {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          this._cancelVars();
        }
        return;
      }
      const n = this.viewItems ? this.viewItems.length : 0;
      const stop = () => { e.preventDefault(); e.stopPropagation(); };

      if (e.key === 'Escape') { stop(); this.close(); return; }
      if (e.key === 'Enter') {
        stop();
        if (this.hover >= 0) this.choose(this.hover);
        else if (n) this.choose(0);
        return;
      }
      if (e.key === 'Backspace' && !this.searchInput.value) { stop(); this.back(); return; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        if (!n) return;
        stop();
        this.hover = this.hover < 0 ? 0 : (this.hover + 1) % n;
        this._paintHover();
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        if (!n) return;
        stop();
        this.hover = this.hover <= 0 ? n - 1 : this.hover - 1;
        this._paintHover();
        return;
      }
      if (/^[1-9]$/.test(e.key) && (e.altKey || !this.searchInput.value)) {
        const idx = Number(e.key) - 1;
        if (idx < n) { stop(); this.choose(idx); }
      }
    }

    choose(index) {
      const item = this.viewItems && this.viewItems[index];
      if (!item) return;
      if (item.kind === 'more') {
        this.page += 1;
        this.hover = 0;
        this.render();
        return;
      }
      if (item.kind === 'category') {
        this.stack.push({ title: item.label, items: item.children });
        this.query = '';
        this.searchInput.value = '';
        this.page = 0;
        this.hover = -1;
        this.render();
        return;
      }
      const vars = extractVariables(item.text);
      if (vars.length) this._askVars(item, vars);
      else this._deliver(item, item.text);
    }

    back() {
      if (this.query) {
        this.query = '';
        this.searchInput.value = '';
        this.page = 0;
        this.hover = -1;
        this.render();
        this.searchInput.focus();
        return;
      }
      if (this.stack.length) {
        this.stack.pop();
        this.page = 0;
        this.hover = -1;
        this.render();
        return;
      }
      this.close();
    }

    /* ---------- variables {{...}} ---------- */

    _askVars(item, vars) {
      this.pendingItem = item;
      this.varsForm.innerHTML = '';
      const title = document.createElement('div');
      title.className = 'pw-vars-title';
      title.textContent = item.label;
      this.varsForm.appendChild(title);

      const hint = document.createElement('p');
      hint.className = 'pw-vars-hint';
      hint.textContent = 'Complète les champs (laisse vide pour garder le repère).';
      this.varsForm.appendChild(hint);

      vars.forEach((name, i) => {
        const wrap = document.createElement('label');
        wrap.className = 'pw-vars-field';
        const span = document.createElement('span');
        span.textContent = name;
        const input = document.createElement('textarea');
        input.rows = 2;
        input.dataset.var = name;
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || !e.shiftKey)) {
            e.preventDefault();
            this._submitVars();
          }
        });
        wrap.appendChild(span);
        wrap.appendChild(input);
        this.varsForm.appendChild(wrap);
        if (i === 0) setTimeout(() => input.focus(), 0);
      });

      const actions = document.createElement('div');
      actions.className = 'pw-vars-actions';
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'pw-btn pw-btn-ghost';
      cancel.textContent = 'Retour';
      cancel.addEventListener('click', () => this._cancelVars());
      const ok = document.createElement('button');
      ok.type = 'submit';
      ok.className = 'pw-btn';
      ok.textContent = 'Insérer';
      actions.appendChild(cancel);
      actions.appendChild(ok);
      this.varsForm.appendChild(actions);

      this.stage.classList.add('is-vars');
      this.varsForm.hidden = false;
    }

    _cancelVars() {
      this.varsForm.hidden = true;
      this.stage.classList.remove('is-vars');
      this.pendingItem = null;
      this.searchInput.focus();
    }

    _submitVars() {
      const values = {};
      this.varsForm.querySelectorAll('textarea[data-var]').forEach((el) => {
        values[el.dataset.var] = el.value;
      });
      const item = this.pendingItem;
      this._cancelVars();
      if (item) this._deliver(item, fillVariables(item.text, values));
    }

    /* ---------- livraison ---------- */

    async _deliver(item, text) {
      const result = await this.onPick(item, text);
      let msg;
      if (result.inserted && result.copied) msg = 'Inséré dans la page · copié';
      else if (result.inserted) msg = 'Inséré dans la page';
      else if (result.copied) msg = 'Copié dans le presse-papiers';
      else msg = "Impossible d'insérer ou de copier";
      this.close(msg);
    }

    _showToast(message) {
      // Le toast survit à la fermeture de la roue : il vit dans son propre hôte.
      const host = document.createElement('div');
      host.style.cssText = 'all:initial;position:fixed;inset:auto 0 24px 0;z-index:2147483647;pointer-events:none;';
      const sh = host.attachShadow({ mode: 'open' });
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = chrome.runtime.getURL('src/wheel.css');
      const el = document.createElement('div');
      el.className = 'pw-toast pw-toast-standalone';
      el.textContent = message;
      sh.appendChild(link);
      sh.appendChild(el);
      document.documentElement.appendChild(host);
      setTimeout(() => el.classList.add('is-out'), 1600);
      setTimeout(() => host.remove(), 2100);
    }

    /* ---------- ouverture / fermeture ---------- */

    show(anchor) {
      if (this.open) { this.close(); return; }
      if (!this.host) this._build();
      this.open = true;
      this.stack = [];
      this.query = '';
      this.page = 0;
      this.hover = -1;
      this.searchInput.value = '';
      this.host.style.display = '';
      this._position(anchor);
      this.render();
      window.addEventListener('keydown', this._onKeyDown, true);
      setTimeout(() => this.searchInput.focus({ preventScroll: true }), 0);
    }

    _position(anchor) {
      const mode = this.data.settings.openAt;
      this.stage.classList.remove('is-centered');
      if (mode !== 'cursor' || !anchor) {
        this.stage.classList.add('is-centered');
        this.stage.style.left = '';
        this.stage.style.top = '';
        return;
      }
      const w = Math.min(SIZE + 40, window.innerWidth - 24);
      const h = SIZE + 190;
      let left = anchor.x - w / 2;
      let top = anchor.y - SIZE / 2 - 70;
      left = Math.max(12, Math.min(window.innerWidth - w - 12, left));
      top = Math.max(12, Math.min(window.innerHeight - h - 12, top));
      if (h > window.innerHeight - 24) top = 12;
      this.stage.style.left = left + 'px';
      this.stage.style.top = top + 'px';
    }

    close(toastMessage) {
      if (!this.open) return;
      this.open = false;
      window.removeEventListener('keydown', this._onKeyDown, true);
      if (this.varsForm) this._cancelVars();
      if (this.host) this.host.style.display = 'none';
      if (toastMessage) this._showToast(toastMessage);
    }
  }

  root.PromptWheel = { Wheel, extractVariables, fillVariables };
})(typeof window !== 'undefined' ? window : self);
