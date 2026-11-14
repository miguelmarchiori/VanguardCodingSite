/* =========================================================
   Vanguard Code · utilidades
   (DOM, armazenamento, destaque de código, mascote, sons, confete)
   ========================================================= */
'use strict';

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Armazenamento local (protegido contra modo privado) ---------- */
const Store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* sem armazenamento: tudo bem */ }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }
};

/* ---------- Destaque de sintaxe (Python e Java) ---------- */
const HL_LANGS = {
  python: {
    kw: new Set(['def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'import', 'from', 'as', 'and', 'or', 'not', 'async', 'await', 'break', 'continue', 'pass', 'class', 'lambda', 'try', 'except', 'with', 'is', 'global']),
    consts: new Set(['True', 'False', 'None']),
    re: /(#[^\n]*)|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)|(@[A-Za-z]\w*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_À-ÿ][\wÀ-ÿ]*)/g
  },
  java: {
    kw: new Set(['public', 'private', 'protected', 'class', 'extends', 'implements', 'void', 'int', 'double', 'float', 'boolean', 'char', 'long', 'new', 'return', 'if', 'else', 'for', 'while', 'do', 'static', 'final', 'import', 'package', 'this', 'super', 'break', 'continue', 'try', 'catch', 'throw', 'throws', 'switch', 'case', 'default']),
    consts: new Set(['true', 'false', 'null']),
    re: /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)|(@[A-Za-z]\w*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_À-ÿ][\wÀ-ÿ]*)/g
  }
};

function highlight(code, lang = 'python') {
  const L = HL_LANGS[lang] || HL_LANGS.python;
  const re = new RegExp(L.re.source, 'g');
  let out = '', last = 0, m;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index));
    const [tok, com, str, ann, num, word] = m;
    let cls = '';
    if (com) cls = 'c';
    else if (str) cls = 's';
    else if (ann) cls = 'a';
    else if (num) cls = 'n';
    else if (word) {
      if (L.consts.has(word)) cls = 'k2';
      else if (L.kw.has(word)) cls = 'k';
      else if (/^\s*\(/.test(code.slice(re.lastIndex))) cls = 'f';
      else if (lang === 'java' && /^[A-Z]/.test(word)) cls = 't';
    }
    out += cls ? `<span class="tk-${cls}">${esc(tok)}</span>` : esc(tok);
    last = re.lastIndex;
  }
  return out + esc(code.slice(last));
}

function codeBlock(code, lang, extraClass = '') {
  return `<pre class="code ${extraClass}" data-lang-label="${lang === 'java' ? 'Java' : 'Python'}">${highlight(code, lang)}</pre>`;
}

/* ---------- Bip, o mascote (SVG original) ---------- */
function bipSVG(mood = 'happy', cls = '') {
  const C = '#5EF2D6';
  const eyes = {
    happy: `<path d="M37 64 q8 -11 16 0" stroke="${C}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M67 64 q8 -11 16 0" stroke="${C}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    normal: `<rect class="bip-eye" x="39" y="50" width="12" height="17" rx="6" fill="${C}"/><rect class="bip-eye" x="69" y="50" width="12" height="17" rx="6" fill="${C}"/>`,
    sad: `<path d="M37 50 l14 5" stroke="${C}" stroke-width="4" stroke-linecap="round"/><path d="M83 50 l-14 5" stroke="${C}" stroke-width="4" stroke-linecap="round"/><rect x="40" y="58" width="10" height="11" rx="5" fill="${C}"/><rect x="70" y="58" width="10" height="11" rx="5" fill="${C}"/>`,
    wow: `<circle cx="45" cy="59" r="8" fill="${C}"/><circle cx="75" cy="59" r="8" fill="${C}"/><circle cx="47" cy="56" r="2.5" fill="#fff"/><circle cx="77" cy="56" r="2.5" fill="#fff"/>`
  };
  const mouths = {
    happy: `<path d="M49 73 q11 10 22 0" stroke="${C}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`,
    normal: `<path d="M52 74 q8 6 16 0" stroke="${C}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    sad: `<path d="M52 79 q8 -7 16 0" stroke="${C}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    wow: `<ellipse cx="60" cy="77" rx="5" ry="6" fill="${C}"/>`
  };
  const m = eyes[mood] ? mood : 'happy';
  return `<svg class="bip bip-${m} ${cls}" viewBox="0 0 120 128" aria-hidden="true" focusable="false">
    <g class="bip-antenna"><line x1="60" y1="11" x2="60" y2="27" stroke="#4B32C9" stroke-width="5" stroke-linecap="round"/><circle class="bip-bulb" cx="60" cy="10" r="7.5" fill="#FFC93C" stroke="#E0A800" stroke-width="2"/></g>
    <rect x="6" y="50" width="14" height="28" rx="7" fill="#4B32C9"/>
    <rect x="100" y="50" width="14" height="28" rx="7" fill="#4B32C9"/>
    <rect x="38" y="94" width="44" height="28" rx="12" fill="#5B3FE0"/>
    <circle class="bip-heart" cx="60" cy="110" r="5" fill="#14C9B0"/>
    <rect x="14" y="24" width="92" height="76" rx="30" fill="#7B61FF"/>
    <path d="M30 36 q10 -7 24 -7" stroke="#fff" stroke-opacity=".4" stroke-width="5" stroke-linecap="round" fill="none"/>
    <rect x="25" y="38" width="70" height="50" rx="20" fill="#1E1B4B"/>
    ${eyes[m]}${mouths[m]}
    <circle cx="33" cy="80" r="5" fill="#FF6FAE" opacity=".75"/><circle cx="87" cy="80" r="5" fill="#FF6FAE" opacity=".75"/>
  </svg>`;
}

/* Robô visto de cima, usado no tabuleiro da Arena (a "frente" aponta para cima) */
function botTopSVG() {
  return `<svg viewBox="0 0 60 60" aria-hidden="true" focusable="false">
    <rect x="3" y="13" width="10" height="34" rx="4" fill="#2A2550"/>
    <rect x="47" y="13" width="10" height="34" rx="4" fill="#2A2550"/>
    <rect x="9" y="8" width="42" height="46" rx="15" fill="#7B61FF" stroke="#4B32C9" stroke-width="2.5"/>
    <rect x="16" y="14" width="28" height="19" rx="8" fill="#1E1B4B"/>
    <rect x="21" y="18" width="6" height="9" rx="3" fill="#5EF2D6"/>
    <rect x="33" y="18" width="6" height="9" rx="3" fill="#5EF2D6"/>
    <circle cx="30" cy="5" r="4.5" fill="#FFC93C" stroke="#E0A800" stroke-width="1.5"/>
    <circle cx="30" cy="44" r="4" fill="#14C9B0"/>
  </svg>`;
}

function fillBips(root = document) {
  $$('[data-bip]', root).forEach((el) => {
    if (el.dataset.bipDone) return;
    el.innerHTML = bipSVG(el.dataset.bip || 'happy', el.dataset.bipClass || '');
    el.dataset.bipDone = '1';
  });
}

/* ---------- Sons (Web Audio, sem arquivos) ---------- */
const Sound = {
  ctx: null,
  muted: Store.get('vg_muted', false),
  seqs: {
    ok: [[660, 0, 0.12, 'triangle', 0.18], [990, 0.09, 0.2, 'triangle', 0.18]],
    bad: [[220, 0, 0.16, 'sawtooth', 0.05], [160, 0.13, 0.24, 'sawtooth', 0.05]],
    tap: [[540, 0, 0.05, 'sine', 0.07]],
    win: [[523, 0, 0.14, 'triangle', 0.16], [659, 0.12, 0.14, 'triangle', 0.16], [784, 0.24, 0.14, 'triangle', 0.16], [1047, 0.36, 0.35, 'triangle', 0.18]],
    fail: [[392, 0, 0.2, 'triangle', 0.14], [330, 0.18, 0.2, 'triangle', 0.14], [262, 0.36, 0.4, 'triangle', 0.14]],
    move: [[440, 0, 0.06, 'square', 0.025]],
    turn: [[330, 0, 0.06, 'square', 0.025]],
    coin: [[880, 0, 0.07, 'square', 0.045], [1320, 0.06, 0.12, 'square', 0.045]],
    crash: [[140, 0, 0.3, 'sawtooth', 0.09], [90, 0.1, 0.3, 'sawtooth', 0.07]],
    say: [[700, 0, 0.05, 'sine', 0.08], [930, 0.07, 0.06, 'sine', 0.08]]
  },
  _ctx() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  play(name) {
    if (this.muted || !this.seqs[name]) return;
    try {
      const c = this._ctx();
      if (!c) return;
      this.seqs[name].forEach(([freq, start, dur, type, vol]) => {
        const o = c.createOscillator();
        const g = c.createGain();
        const t = c.currentTime + start;
        o.type = type;
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(c.destination);
        o.start(t);
        o.stop(t + dur + 0.05);
      });
    } catch (e) { /* sem som: tudo bem */ }
  },
  toggle() {
    this.muted = !this.muted;
    Store.set('vg_muted', this.muted);
    return this.muted;
  }
};

/* ---------- Confete ---------- */
function confetti(duration = 2600) {
  if (reducedMotion()) return;
  const cv = $('#confetti');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = window.innerWidth, H = window.innerHeight, dpr = window.devicePixelRatio || 1;
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.scale(dpr, dpr);
  cv.style.display = 'block';
  const colors = ['#6C4DF6', '#14C9B0', '#FFC93C', '#FF6FAE', '#3CCB5A', '#3776D6', '#F2792B'];
  const parts = Array.from({ length: 150 }, () => ({
    x: Math.random() * W, y: -20 - Math.random() * H * 0.6,
    w: 6 + Math.random() * 7, h: 9 + Math.random() * 8,
    vx: -2 + Math.random() * 4, vy: 2 + Math.random() * 4,
    r: Math.random() * 6, vr: -0.2 + Math.random() * 0.4, c: pick(colors)
  }));
  const t0 = performance.now();
  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    parts.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (t - t0 < duration) requestAnimationFrame(frame);
    else { ctx.clearRect(0, 0, W, H); cv.style.display = 'none'; }
  }
  requestAnimationFrame(frame);
}

/* ---------- Avisos rápidos (toasts) ---------- */
function toast(html, kind = '') {
  const box = $('#toasts');
  if (!box) return;
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.innerHTML = html;
  box.appendChild(el);
  setTimeout(() => el.classList.add('out'), 3200);
  setTimeout(() => el.remove(), 3700);
}

/* ---------- Modal ---------- */
function openModal(html, cls = '') {
  const m = $('#modal');
  m.innerHTML = `<div class="modal-back" data-close></div><div class="modal-box ${cls}" role="dialog" aria-modal="true"><button class="modal-x" data-close aria-label="Fechar">✕</button>${html}</div>`;
  m.hidden = false;
  fillBips(m);
  const first = $('.modal-box button:not(.modal-x), .modal-box input', m);
  if (first) setTimeout(() => first.focus(), 30);
  return m;
}
function closeModal() {
  const m = $('#modal');
  m.hidden = true;
  m.innerHTML = '';
}
