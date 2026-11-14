/* =========================================================
   VanCode · utilidades
   (DOM, armazenamento, destaque de código, mascote, ícones, sons, confete)
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

/* ---------- Ícones (SVG desenhados à mão, sem biblioteca) ---------- */
const ICONS = {
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  star: '<path class="fill" d="M12 3.2l2.7 5.5 6 .9-4.4 4.2 1.1 6L12 17l-5.4 2.8 1.1-6-4.4-4.2 6-.9z"/>',
  flame: '<path class="fill" d="M12 2.5c.6 3.2 4.9 5.4 4.9 10.3A4.9 4.9 0 0 1 12 21.6a4.9 4.9 0 0 1-4.9-4.9c0-2.4 1.3-3.8 2.4-4.9.3 1.6 1.1 2.5 2.1 2.7-.7-3.4-.4-7.9.4-12z"/>',
  bolt: '<path class="fill" d="M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6z"/>',
  heart: '<path class="fill" d="M12 20.5s-7.8-4.7-7.8-10.4A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.8 2.7c0 5.7-7.8 10.4-7.8 10.4z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
  users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M3 19.5a6 6 0 0 1 12 0M16 5.3a3.5 3.5 0 0 1 0 6.4M18.5 19.5a6 6 0 0 0-2.6-4.9"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3.2 4M16 6h3a3 3 0 0 1-3.2 4M12 13v4M8.5 20.5h7M10 17h4"/>',
  book: '<path d="M4 19V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0 0 4h14"/>',
  play: '<path class="fill" d="M7 4.5v15l12-7.5z"/>',
  reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2v.1h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  crown: '<path class="fill" d="M3.5 8l4.5 4 4-6.5 4 6.5 4.5-4-2 11h-13z"/>',
  shield: '<path d="M12 2.8l7.5 3v6c0 4.6-3.2 8-7.5 9.4-4.3-1.4-7.5-4.8-7.5-9.4v-6z"/>',
  code: '<path d="M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15"/>',
  gamepad: '<path d="M7 8h10a4.5 4.5 0 0 1 4.4 5.4l-.8 4a2.5 2.5 0 0 1-4.3 1.3L14.5 16h-5l-1.8 2.7a2.5 2.5 0 0 1-4.3-1.3l-.8-4A4.5 4.5 0 0 1 7 8zM8 10.5v3.5M6.25 12.25h3.5M15.5 11h.01M17.5 13h.01"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle class="fill" cx="12" cy="12" r="1.3"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  podium: '<path d="M9 20.5V9h6v11.5M3.5 20.5V13H9M15 15.5h5.5v5M2.5 20.5h19"/>',
  volume: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  logout: '<path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14M10 16.5L5.5 12 10 7.5M5.5 12H15"/>',
  forward: '<path class="fill" d="M4 6.5v11l7.5-5.5zM12.5 6.5v11l7.5-5.5z"/>',
  briefcase: '<rect x="3.5" y="7.5" width="17" height="12" rx="2"/><path d="M9 7.5V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5v2M3.5 12.5h17"/>',
  eye: '<path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  sparkle: '<path class="fill" d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z"/>',
  flag: '<path d="M5.5 21V4M5.5 4.5h11l-2.5 4 2.5 4h-11"/>',
  footprints: '<path d="M8 3.5c1.7 0 2.5 2 2.5 4.5S9.7 12 8 12 5.5 10.5 5.5 8 6.3 3.5 8 3.5zM6 14.5h4M16 8.5c1.7 0 2.5 2 2.5 4.5S17.7 17 16 17s-2.5-1.5-2.5-4 .8-4.5 2.5-4.5zM14 19.5h4"/>',
  hundred: '<path d="M4 7v10M8.5 9.5a2.5 3 0 1 1 5 0v5a2.5 3 0 1 1-5 0zM15.5 9.5a2.5 3 0 1 1 5 0v5a2.5 3 0 1 1-5 0z"/>',
  wave: '<path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V11M10 10.5V5a1.5 1.5 0 0 1 3 0v5.5M13 10.5V6.5a1.5 1.5 0 0 1 3 0v6M7 11c-1-1.2-3-1-3 .8 0 1 .8 2 1.8 3.6C8 19 9.5 21 13 21c3.5 0 4.5-2.5 4.5-6"/>'
};
const GOOGLE_G = '<svg class="g-logo" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.5z"/></svg>';

function icon(name, cls = '') {
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
}
function langBadge(lang, cls = '') {
  return `<span class="lang-badge ${lang} ${cls}">${lang === 'java' ? 'Java' : 'Py'}</span>`;
}

/* ---------- Guardinho, o cavaleiro mascote (SVG original) ---------- */
/* Degradês compartilhados por todos os cavaleiros da página (um único <defs>, fora de qualquer elemento escondido) */
const KNIGHT_DEFS = `<svg class="knight-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">
  <defs>
    <linearGradient id="kgMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FAFBFE"/><stop offset=".55" stop-color="#DCE1EB"/><stop offset="1" stop-color="#AEB7C9"/></linearGradient>
    <linearGradient id="kgMetalD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4E8F0"/><stop offset="1" stop-color="#A3ACBF"/></linearGradient>
    <linearGradient id="kgPurple" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8F55FF"/><stop offset="1" stop-color="#5A21C4"/></linearGradient>
    <linearGradient id="kgPlume" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B07CFF"/><stop offset=".6" stop-color="#7B3BEA"/><stop offset="1" stop-color="#5A21C4"/></linearGradient>
    <linearGradient id="kgGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFDD66"/><stop offset="1" stop-color="#E5A300"/></linearGradient>
    <linearGradient id="kgVisor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E1858"/><stop offset="1" stop-color="#140826"/></linearGradient>
    <linearGradient id="kgBlade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#E3E8F1"/><stop offset=".51" stop-color="#BCC5D5"/><stop offset="1" stop-color="#D3D9E4"/></linearGradient>
  </defs>
</svg>`;

function knightSVG(mood = 'happy', cls = '') {
  const G = '#FFC21A', INK = '#1C0D33', LINE = '#7C8599';
  const faces = {
    happy: `<path d="M46 60 q9 -12 18 0" stroke="${G}" stroke-width="5.5" fill="none" stroke-linecap="round"/><path d="M76 60 q9 -12 18 0" stroke="${G}" stroke-width="5.5" fill="none" stroke-linecap="round"/>
      <path d="M63 70 q7 7 14 0" stroke="${G}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    normal: `<g class="k-eye"><ellipse cx="55" cy="58" rx="8.5" ry="10" fill="#fff"/><circle cx="57" cy="60" r="5" fill="${INK}"/><circle cx="59.5" cy="56.5" r="2" fill="#fff"/></g>
      <g class="k-eye"><ellipse cx="85" cy="58" rx="8.5" ry="10" fill="#fff"/><circle cx="87" cy="60" r="5" fill="${INK}"/><circle cx="89.5" cy="56.5" r="2" fill="#fff"/></g>
      <path d="M65 72 q5 4 10 0" stroke="${G}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
    wow: `<circle cx="55" cy="58" r="10" fill="#fff"/><circle cx="55" cy="59" r="5.5" fill="${INK}"/><circle cx="57.5" cy="55.5" r="2.2" fill="#fff"/>
      <circle cx="85" cy="58" r="10" fill="#fff"/><circle cx="85" cy="59" r="5.5" fill="${INK}"/><circle cx="87.5" cy="55.5" r="2.2" fill="#fff"/>
      <ellipse cx="70" cy="73" rx="4" ry="4.5" fill="${G}"/>`,
    sad: `<path d="M45 54 l13 -5" stroke="${G}" stroke-width="4" stroke-linecap="round"/><path d="M95 54 l-13 -5" stroke="${G}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="55" cy="62" rx="6" ry="7" fill="#fff"/><circle cx="55" cy="64.5" r="3.5" fill="${INK}"/>
      <ellipse cx="85" cy="62" rx="6" ry="7" fill="#fff"/><circle cx="85" cy="64.5" r="3.5" fill="${INK}"/><path d="M95 66 q-3 5 0 7 q3 -2 0 -7z" fill="#7DD3FC"/>
      <path d="M64 75 q6 -5 12 0" stroke="${G}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
  };
  const m = faces[mood] ? mood : 'happy';
  return `<svg class="knight knight-${m} ${cls}" viewBox="0 -4 150 162" aria-hidden="true" focusable="false">
    <ellipse cx="72" cy="153" rx="36" ry="4.5" fill="#000" opacity=".14"/>

    <!-- pernas e botas -->
    <rect x="56" y="124" width="11" height="22" rx="5" fill="url(#kgMetalD)" stroke="${LINE}" stroke-width="2"/>
    <rect x="73" y="124" width="11" height="22" rx="5" fill="url(#kgMetalD)" stroke="${LINE}" stroke-width="2"/>
    <path d="M51 150 q0 -9 9 -9 h4 q5 0 5 5 v4 z" fill="#3A2160" stroke="#24123F" stroke-width="2" stroke-linejoin="round"/>
    <path d="M89 150 q0 -9 -9 -9 h-4 q-5 0 -5 5 v4 z" fill="#3A2160" stroke="#24123F" stroke-width="2" stroke-linejoin="round"/>

    <!-- corpo: cota de malha + túnica roxa -->
    <rect x="48" y="96" width="44" height="36" rx="15" fill="url(#kgMetalD)" stroke="${LINE}" stroke-width="2"/>
    <path d="M52 98 H88 V124 L70 134 L52 124 Z" fill="url(#kgPurple)" stroke="#45168F" stroke-width="2" stroke-linejoin="round"/>
    <path d="M62 102 L70 113 L78 102" stroke="url(#kgGold)" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="49" y="119" width="42" height="6" rx="3" fill="#3A2160"/>
    <circle cx="58" cy="122" r="1.8" fill="#FFC21A"/><circle cx="82" cy="122" r="1.8" fill="#FFC21A"/>

    <!-- braço e espada -->
    <path d="M93 104 Q101 110 106 119" stroke="${LINE}" stroke-width="13" stroke-linecap="round" fill="none"/>
    <path d="M93 104 Q101 110 106 119" stroke="url(#kgMetalD)" stroke-width="9" stroke-linecap="round" fill="none"/>
    <g class="k-sword" transform="translate(107 121) rotate(28)">
      <path d="M-4.5 -12 V-60 L0 -69 L4.5 -60 V-12 Z" fill="url(#kgBlade)" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M0 -16 V-58" stroke="#fff" stroke-width="1.2" opacity=".7"/>
      <rect x="-13" y="-13" width="26" height="6" rx="3" fill="url(#kgGold)" stroke="#B07A00" stroke-width="1.5"/>
      <rect x="-3" y="-7" width="6" height="13" rx="2" fill="#3A2160"/>
      <circle cx="0" cy="9" r="4" fill="url(#kgGold)" stroke="#B07A00" stroke-width="1.2"/>
      <circle cx="0" cy="0" r="7.5" fill="url(#kgMetal)" stroke="${LINE}" stroke-width="2"/>
    </g>

    <!-- ombreiras -->
    <path d="M34 108 a13 11 0 0 1 26 -6 l-2 8 z" fill="url(#kgMetal)" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M106 108 a13 11 0 0 0 -26 -6 l2 8 z" fill="url(#kgMetal)" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>

    <!-- escudo -->
    <g class="k-shield">
      <path d="M21 103 H57 V117 C57 132 48 140 39 145 C30 140 21 132 21 117 Z" fill="url(#kgPurple)" stroke="url(#kgGold)" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M29 111 L39 127 L49 111" stroke="url(#kgGold)" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M26 108 H34" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".45"/>
    </g>

    <!-- pluma (atrás do elmo) -->
    <g class="k-plume">
      <path d="M66 22 C60 6 76 -3 94 1 C110 5 120 18 118 34 C113 26 105 21 96 23 C106 27 111 36 107 45 C100 35 90 30 79 28 C73 27 69 25 66 22 Z" fill="url(#kgPlume)" stroke="#45168F" stroke-width="2" stroke-linejoin="round"/>
      <path d="M72 14 C83 6 99 8 109 19" stroke="#D9C2FF" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".85"/>
      <path d="M80 23 C90 22 99 26 104 33" stroke="#D9C2FF" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/>
    </g>

    <!-- elmo -->
    <path d="M70 15 C99 15 115 36 115 62 V77 C115 92 103 102 88 102 H52 C37 102 25 92 25 77 V62 C25 36 41 15 70 15 Z" fill="url(#kgMetal)" stroke="${LINE}" stroke-width="2.5"/>
    <path d="M113 60 V77 C113 91 102 100 88 100 H80 C96 98 106 88 106 74 V60 C106 44 100 30 90 22 C104 29 113 43 113 60 Z" fill="#A3ACBF" opacity=".45"/>
    <path d="M65 16.5 Q70 13 75 16.5 V36 Q70 39 65 36 Z" fill="url(#kgGold)" stroke="#B07A00" stroke-width="1.5"/>
    <path d="M30 48 Q70 26 110 48" stroke="url(#kgGold)" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M38 38 Q46 25 58 21" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".9"/>
    <circle cx="35" cy="47" r="2.2" fill="#fff" opacity=".9"/>
    <!-- viseira -->
    <path d="M34 54 C34 48 39 45 45 45 H95 C101 45 106 48 106 54 V65 C106 75 98 81 88 81 H52 C42 81 34 75 34 65 Z" fill="url(#kgVisor)" stroke="#5E667A" stroke-width="2"/>
    <path d="M40 50 H100" stroke="#000" stroke-width="3" stroke-linecap="round" opacity=".25"/>
    <ellipse cx="44" cy="72" rx="5.5" ry="3.2" fill="#FF7AB8" opacity=".85"/>
    <ellipse cx="96" cy="72" rx="5.5" ry="3.2" fill="#FF7AB8" opacity=".85"/>
    ${faces[m]}
    <!-- respiros e rebites -->
    <path d="M60 87 v6 M66 88 v6 M74 88 v6 M80 87 v6" stroke="${LINE}" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="31" cy="72" r="2.3" fill="#9AA3B6"/><circle cx="109" cy="72" r="2.3" fill="#9AA3B6"/>
  </svg>`;
}
if (document.body && !document.querySelector('.knight-defs')) document.body.insertAdjacentHTML('afterbegin', KNIGHT_DEFS);

/* Cavaleiro no tabuleiro: sempre de frente, com uma seta dourada que gira e mostra a direção */
function boardKnightHTML() {
  return `<div class="bot-dir"></div><div class="bot-in">${knightSVG('happy')}</div>`;
}
const COIN_SVG = '<svg class="coin" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="15" fill="#FFC21A" stroke="#D99A00" stroke-width="3"/><circle cx="20" cy="20" r="9.5" fill="none" stroke="#FFE38A" stroke-width="2"/><path d="M15.5 15 l4.5 10 l4.5 -10" stroke="#B07A00" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const FLAG_SVG = '<svg class="flag" viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="12.5" cy="36" rx="7" ry="2" fill="rgba(0,0,0,.15)"/><rect x="10.5" y="5" width="3.5" height="31" rx="1.5" fill="#4A3B63"/><path d="M14 6 h18 l-5 6.5 l5 6.5 h-18z" fill="#6A2BD9" stroke="#4A1A9E" stroke-width="1.5" stroke-linejoin="round"/><path d="M18 9.5 l2.5 5 l2.5 -5" stroke="#FFC21A" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12.25" cy="5" r="2.6" fill="#FFC21A"/></svg>';

function fillArt(root = document) {
  $$('[data-knight]', root).forEach((el) => {
    if (el.dataset.done) return;
    el.innerHTML = knightSVG(el.dataset.knight || 'happy', el.dataset.knightClass || '');
    el.dataset.done = '1';
  });
  $$('[data-icon]', root).forEach((el) => {
    if (el.dataset.done) return;
    el.innerHTML = icon(el.dataset.icon);
    el.dataset.done = '1';
  });
  $$('[data-art]', root).forEach((el) => {
    if (el.dataset.done) return;
    el.innerHTML = { coin: COIN_SVG, flag: FLAG_SVG, bot: knightSVG('happy') }[el.dataset.art] || '';
    el.dataset.done = '1';
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
  const colors = ['#6A2BD9', '#FFC21A', '#8B4DFF', '#FF7AB8', '#3CCB5A', '#3776D6', '#FFFFFF'];
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
  setTimeout(() => el.classList.add('out'), 3400);
  setTimeout(() => el.remove(), 3900);
}

/* ---------- Modal ---------- */
function openModal(html, cls = '', opts = {}) {
  const m = $('#modal');
  const locked = !!opts.locked;
  m.dataset.locked = locked ? '1' : '';
  m.innerHTML = `<div class="modal-back" ${locked ? '' : 'data-close'}></div><div class="modal-box ${cls}" role="dialog" aria-modal="true">${locked ? '' : `<button class="modal-x" data-close aria-label="Fechar">${icon('x')}</button>`}${html}</div>`;
  m.hidden = false;
  fillArt(m);
  const first = $('.modal-box input, .modal-box button:not(.modal-x)', m);
  if (first) setTimeout(() => first.focus(), 30);
  return m;
}
function closeModal() {
  const m = $('#modal');
  m.hidden = true;
  m.innerHTML = '';
}
