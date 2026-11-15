/* =========================================================
   VanCode · app principal
   Estado do aluno, contas, rotas, trilhas, lições, ranking.
   ========================================================= */
'use strict';

/* ---------- Trilhas ---------- */
const FLAT = {};
Object.keys(COURSES).forEach((cid) => {
  FLAT[cid] = [];
  COURSES[cid].units.forEach((u, ui) => u.lessons.forEach((l, li) => FLAT[cid].push(Object.assign({}, l, { unit: ui, li, last: li === u.lessons.length - 1 }))));
});
/* o progresso é guardado pelo id da lição ("python:py-print"), que nunca muda */
const lessonKey = (cid, i) => cid + ':' + FLAT[cid][i].id;
function migrateDone(done) {
  const out = {};
  Object.keys(done || {}).forEach((k) => {
    const m = /^(python|java)-(\d+)$/.exec(k);   // formato antigo: posição da lição
    if (m && FLAT[m[1]] && FLAT[m[1]][+m[2]]) out[lessonKey(m[1], +m[2])] = done[k];
    else out[k] = done[k];
  });
  return out;
}

/* ---------- Estado ---------- */
const DEFAULT_STATE = {
  xp: 0, streak: 0, lastDay: null, daily: { day: null, xp: 0 },
  done: {}, perfect: 0, lessons: 0, arena: {}, achievements: {},
  name: '', mentor: false, goal: 30, uid: null, erros: [], semana: { id: null, xp: 0 }
};
const freshState = () => JSON.parse(JSON.stringify(DEFAULT_STATE));
function normalizeState(x) {
  const s = Object.assign(freshState(), x || {});
  s.daily = s.daily || { day: null, xp: 0 };
  s.done = migrateDone(s.done);
  s.arena = s.arena || {};
  s.achievements = s.achievements || {};
  s.erros = Array.isArray(s.erros) ? s.erros : [];
  s.semana = s.semana && s.semana.id ? s.semana : { id: null, xp: 0 };
  return s;
}
let S = normalizeState(Store.get('vg_state', {}));

function saveLocal() { Store.set('vg_state', S); renderStats(); }
function save() { saveLocal(); Cloud.schedule(); }

const dayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const yesterdayStr = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayStr(d); };
const currentStreak = () => (S.lastDay === dayStr() || S.lastDay === yesterdayStr()) ? S.streak : 0;
const dailyXP = () => (S.daily.day === dayStr() ? S.daily.xp : 0);
/* semana no formato 2026-S46 (a semana começa na segunda-feira) */
function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const y = t.getUTCFullYear();
  return `${y}-S${String(Math.ceil(((t - Date.UTC(y, 0, 1)) / 86400000 + 1) / 7)).padStart(2, '0')}`;
}
const weekXP = () => (S.semana.id === isoWeek() ? S.semana.xp : 0);
const daysToMonday = () => { const d = new Date().getDay(); return d === 0 ? 1 : 8 - d; };
const cleanName = (n) => String(n || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
const firstName = (n) => cleanName(String(n || '').split(' ')[0]);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/* ---------- Apelidos: filtro básico de palavrões e ofensas ----------
   É uma barreira simples do lado do navegador; a moderação final é
   feita pela equipe no console do Firebase (Firestore → players). */
const NICK_RAIZES = ['porra', 'caralh', 'merda', 'merdinh', 'viadinh', 'bostinh', 'buceta', 'boceta', 'putaria', 'putinha', 'fodase', 'foder', 'fodido', 'arromba', 'cuzao', 'cuzinho',
  'vagabund', 'vadia', 'cacete', 'punheta', 'siririca', 'xoxota', 'xereca', 'bosta', 'viado', 'sapatao', 'traveco', 'retardad', 'mongoloide',
  'fuck', 'shit', 'bitch', 'cunt', 'nigg', 'porn', 'nazi', 'hitler', 'penis', 'vagina'];
const NICK_PALAVRAS = ['cu', 'puta', 'puto', 'foda', 'fdp', 'vsf', 'tnc', 'pqp', 'krl', 'bct', 'bicha', 'corno', 'dick', 'fag', 'sex'];
const squashLetters = (s) => s.replace(/(.)\1+/g, '$1');
function nickProibido(n) {
  const base = String(n || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[0]/g, 'o').replace(/[@4]/g, 'a').replace(/[1!]/g, 'i').replace(/3/g, 'e').replace(/[5$]/g, 's').replace(/7/g, 't');
  const compacto = squashLetters(base.replace(/[^a-z]/g, ''));
  const palavras = base.split(/[^a-z]+/).filter(Boolean).map(squashLetters);
  return NICK_RAIZES.some((r) => compacto.includes(squashLetters(r))) || palavras.some((p) => NICK_PALAVRAS.includes(p));
}
const safeName = (n) => (nickProibido(n) ? 'Cavaleiro' : (cleanName(n) || 'Cavaleiro'));

function addXP(n) {
  const t = dayStr();
  S.xp += n;
  if (S.daily.day !== t) S.daily = { day: t, xp: 0 };
  S.daily.xp += n;
  const w = isoWeek();
  if (S.semana.id !== w) S.semana = { id: w, xp: 0 };
  S.semana.xp += n;
  if (S.lastDay !== t) {
    const before = currentStreak();
    S.streak = S.lastDay === yesterdayStr() ? S.streak + 1 : 1;
    S.lastDay = t;
    if (S.streak > 1 && S.streak > before) setTimeout(() => toast(`${icon('flame', 'ic-fire')}<span>Ofensiva de <b>${S.streak} dias</b>! Continue assim.</span>`, 'fire'), 600);
  }
  save();
}

/* ---------- Progresso nas trilhas ---------- */
const totalLessons = (cid) => FLAT[cid].length;
const isDone = (cid, i) => !!S.done[lessonKey(cid, i)];
const isDoneId = (cid, id) => !!S.done[cid + ':' + id];
const unitDone = (cid, ui) => FLAT[cid].every((l, i) => l.unit !== ui || isDone(cid, i));
const countDone = (cid) => cid ? FLAT[cid].filter((_, i) => isDone(cid, i)).length : countDone('python') + countDone('java');
const isUnlocked = (cid, i) => S.mentor || i === 0 || isDone(cid, i - 1);
const nextLesson = (cid) => FLAT[cid].findIndex((_, i) => !isDone(cid, i));
const arenaCount = () => ARENA_LEVELS.filter((_, i) => (S.arena['python-' + i] || S.arena['java-' + i])).length;

/* ---------- Ligas (postos da cavalaria) ---------- */
const LEAGUES = [
  { min: 0, name: 'Escudeiro', color: '#8E84A8' },
  { min: 50, name: 'Cavaleiro', color: '#3776D6' },
  { min: 150, name: 'Paladino', color: '#0E9E8A' },
  { min: 300, name: 'Guardião', color: '#6A2BD9' },
  { min: 500, name: 'Lenda', color: '#D99A00' }
];
const leagueOf = (xp) => LEAGUES.slice().reverse().find((l) => xp >= l.min);
const nextLeague = (xp) => LEAGUES.find((l) => l.min > xp);
const leaguePill = (xp) => { const l = leagueOf(xp); return `<span class="league" style="--lc:${l.color}">${l.name}</span>`; };

/* ---------- Avatares ---------- */
const AV_COLORS = ['#6A2BD9', '#3776D6', '#0E9E8A', '#E5487A', '#F2792B', '#D99A00', '#2BA346', '#8B4DFF'];
function avatar(name, id, size = '', photo = '') {
  let inner;
  if (photo) inner = `<img class="avatar ${size}" src="${esc(photo)}" alt="" referrerpolicy="no-referrer">`;
  else {
    let h = 0;
    for (const ch of String(id || name || '?')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const letter = (cleanName(name) || '?').charAt(0).toUpperCase();
    inner = `<span class="avatar shield ${size}" style="--ac:${AV_COLORS[h % AV_COLORS.length]}">${esc(letter)}</span>`;
  }
  const c = cargoOf(id);
  return c ? `<span class="av-wrap ${size} ${c.estilo === 'purple' ? 'purple' : ''}">${inner}<span class="av-crown">${icon('crown')}</span></span>` : inner;
}

/* ---------- Cargos especiais (lista em js/cargos.js) ---------- */
const cargoOf = (id) => (typeof CARGOS !== 'undefined' && id && CARGOS[id]) || null;
function cargoBadge(id, cls = '') {
  const c = cargoOf(id);
  return c ? `<span class="role-badge ${c.estilo === 'purple' ? 'purple' : ''} ${cls}" title="${esc(c.descricao || c.titulo)}">${icon('crown')}${esc(c.titulo)}</span>` : '';
}

/* ---------- Conquistas ---------- */
const ACHIEVEMENTS = [
  { id: 'first', icon: 'footprints', name: 'Primeiro passo', desc: 'Complete sua primeira lição', test: () => countDone() >= 1 },
  { id: 'perfect', icon: 'target', name: 'Perfeição', desc: 'Termine uma lição sem errar nada', test: () => S.perfect >= 1 },
  { id: 'both', icon: 'wave', name: 'Tchau, blocos!', desc: 'Complete uma lição de Python e uma de Java', test: () => countDone('python') >= 1 && countDone('java') >= 1 },
  { id: 'py3', icon: 'code', name: 'Cobrinha esperta', desc: 'Complete 3 lições de Python', test: () => countDone('python') >= 3 },
  { id: 'java3', icon: 'code', name: 'Café quentinho', desc: 'Complete 3 lições de Java', test: () => countDone('java') >= 3 },
  { id: 'pyall', icon: 'trophy', name: 'Mestre Python', desc: 'Complete toda a trilha de Python', test: () => countDone('python') >= totalLessons('python') },
  { id: 'javaall', icon: 'trophy', name: 'Mestre Java', desc: 'Complete toda a trilha de Java', test: () => countDone('java') >= totalLessons('java') },
  { id: 'streak3', icon: 'flame', name: 'Pegando fogo', desc: 'Estude 3 dias seguidos', test: () => currentStreak() >= 3 },
  { id: 'xp100', icon: 'bolt', name: 'Cem de energia', desc: 'Junte 100 XP', test: () => S.xp >= 100 },
  { id: 'arena3', icon: 'gamepad', name: 'Piloto de teste', desc: 'Passe 3 missões da Arena', test: () => arenaCount() >= 3 },
  { id: 'stars', icon: 'star', name: 'Código enxuto', desc: 'Ganhe 2 estrelas em uma missão da Arena', test: () => Object.values(S.arena).some((v) => v >= 2) },
  { id: 'arenaall', icon: 'crown', name: 'Rei da Arena', desc: 'Passe todas as missões da Arena', test: () => arenaCount() >= ARENA_LEVELS.length },
  { id: 'robo', icon: 'bolt', name: 'Mão na massa', desc: 'Complete a unidade de robô (SPIKE ou FTC)', test: () => unitDone('python', 2) || unitDone('java', 2) },
  { id: 'controle', icon: 'target', name: 'Engenheiro(a) de controle', desc: 'Complete uma lição de controle P', test: () => isDoneId('python', 'spike-reto') || isDoneId('java', 'ftc-controle-p') },
  { id: 'avancado', icon: 'trophy', name: 'Nível competição', desc: 'Complete a unidade Robótica avançada de uma trilha', test: () => unitDone('python', COURSES.python.units.length - 1) || unitDone('java', COURSES.java.units.length - 1) }
];
const achHTML = (a, got) => `<div class="ach ${got ? 'got' : ''}" title="${esc(a.desc)}"><span class="ach-ic">${icon(a.icon)}</span><div><b>${a.name}</b><small>${a.desc}</small></div></div>`;
function checkAchievements() {
  const got = [];
  ACHIEVEMENTS.forEach((a) => {
    if (!S.achievements[a.id] && a.test()) { S.achievements[a.id] = dayStr(); got.push(a); }
  });
  if (got.length) save();
  return got;
}
function afterReward() {
  checkAchievements().forEach((a, k) => setTimeout(() => toast(`<span class="ach-ic">${icon(a.icon)}</span><span><small>Nova conquista</small><b>${a.name}</b></span>`, 'ach'), 400 + k * 700));
}

/* ---------- Conta (Google) ---------- */
function publicProfile() {
  return { name: safeName(S.name), xp: S.xp | 0, lessons: countDone(), arena: arenaCount(), streak: currentStreak() };
}

function mergeStates(a, b) {
  a = normalizeState(a); b = normalizeState(b);
  const m = normalizeState(a);
  m.xp = Math.max(a.xp, b.xp);
  m.done = Object.assign({}, a.done, b.done);
  m.achievements = Object.assign({}, b.achievements, a.achievements);
  m.arena = Object.assign({}, a.arena);
  for (const k in b.arena) m.arena[k] = Math.max(m.arena[k] || 0, b.arena[k]);
  m.perfect = Math.max(a.perfect, b.perfect);
  m.lessons = Math.max(a.lessons, b.lessons);
  const later = (a.lastDay || '') >= (b.lastDay || '') ? a : b;
  m.lastDay = later.lastDay;
  m.streak = a.lastDay === b.lastDay ? Math.max(a.streak, b.streak) : later.streak;
  m.daily = a.daily.day === b.daily.day ? { day: a.daily.day, xp: Math.max(a.daily.xp, b.daily.xp) } : ((a.daily.day || '') > (b.daily.day || '') ? a.daily : b.daily);
  m.name = a.name || b.name;
  m.mentor = a.mentor || b.mentor;
  m.erros = [...new Set(a.erros.concat(b.erros))].slice(-60);
  m.semana = a.semana.id === b.semana.id ? { id: a.semana.id, xp: Math.max(a.semana.xp, b.semana.xp) } : ((a.semana.id || '') > (b.semana.id || '') ? a.semana : b.semana);
  return m;
}

function askChoice(title, text, yes, no) {
  return new Promise((resolve) => {
    openModal(`<div class="center-modal"><div data-knight="wow" data-knight-class="knight-md"></div><h3>${title}</h3><p>${text}</p>
      <div class="modal-btns"><button class="btn btn-brand" id="chYes">${yes}</button><button class="btn btn-white" id="chNo">${no}</button></div></div>`, '', { locked: true });
    $('#chYes').onclick = () => { closeModal(); resolve(true); };
    $('#chNo').onclick = () => { closeModal(); resolve(false); };
  });
}

/* decide o que fazer com o progresso deste navegador quando alguém entra */
async function adoptCloudState(u, remote) {
  const localHas = S.xp > 0 || countDone() > 0;
  const guest = !S.uid;
  const isNew = !remote;
  if (remote) {
    if (S.uid === u.uid) S = mergeStates(S, remote);
    else if (guest && localHas) {
      const join = await askChoice('Juntar progresso?', `Este navegador tem <b>${S.xp} XP</b> feitos sem conta. Quer somar esse progresso à sua conta?`, 'Sim, juntar', 'Não, usar só a conta');
      S = join ? mergeStates(remote, S) : normalizeState(remote);
    } else S = normalizeState(remote);
  } else if (!guest && S.uid !== u.uid) {
    S = freshState();
  } else if (guest && localHas) {
    const keep = await askChoice('Levar seu progresso?', `Você já tem <b>${S.xp} XP</b> neste navegador. Quer levar esse progresso para a sua conta nova?`, 'Sim, levar', 'Começar do zero');
    if (!keep) S = freshState();
  }
  S.uid = u.uid;
  if (!cleanName(S.name) || nickProibido(S.name)) S.name = safeName(firstName(u.displayName));
  saveLocal();
  route();
  if (isNew) welcomeModal();
  else if (cargoOf(u.uid)) toast(`${icon('crown', 'ic-crown')}<span>Bem-vindo de volta, <b>${esc(S.name)}</b>! ${esc(cargoOf(u.uid).titulo)} da VanCode na área.</span>`, 'crown');
  else toast(`Bem-vindo(a) de volta, <b>${esc(S.name)}</b>!`);
}

function welcomeModal() {
  openModal(`<div class="center-modal">
    <div data-knight="happy" data-knight-class="knight-lg"></div>
    <h3>Conta criada!</h3>
    <p>Agora seu progresso fica salvo na nuvem e você aparece no <b>ranking</b>. Como quer ser chamado(a) lá?</p>
    <input class="text-in" id="wName" maxlength="20" value="${esc(S.name)}" aria-label="Apelido no ranking">
    <small class="muted" id="wHint">Dica: use um apelido. Não precisa ser seu nome completo.</small>
    <div class="modal-btns"><button class="btn btn-brand" id="wSave">Salvar e continuar</button></div>
    <p class="legal-note">Ao usar a conta, você concorda com a <a href="#/privacidade" data-close>política de privacidade</a>. Menores de 13 anos precisam da autorização de um responsável.</p>
  </div>`);
  $('#wSave').onclick = () => {
    const n = cleanName($('#wName').value);
    if (n && nickProibido(n)) {
      $('#wHint').innerHTML = '<b class="nick-err">Esse apelido não pode. Escolha outro, sem palavrões nem ofensas.</b>';
      return;
    }
    if (n) S.name = n;
    save();
    closeModal();
    confetti(1500);
  };
}

function onSignedOut() {
  S = freshState();
  saveLocal();
  route();
  if (Cloud.deleted) { Cloud.deleted = false; toast('Sua conta e seus dados foram apagados.'); }
  else toast('Você saiu da conta. Até a próxima!');
}

function askDeleteAccount() {
  openModal(`<div class="center-modal">
    ${knightSVG('sad', 'knight-md')}
    <h3>Apagar sua conta?</h3>
    <p>Isso apaga para sempre seu progresso salvo na nuvem, seu lugar no ranking e o seu login na VanCode. Não dá para desfazer.</p>
    <div class="modal-btns"><button class="btn btn-red" id="delYes">Apagar minha conta</button><button class="btn btn-white" data-close>Cancelar</button></div>
  </div>`);
  $('#delYes').onclick = async () => {
    $('#delYes').disabled = true;
    $('#delYes').textContent = 'Apagando...';
    await Cloud.deleteAccount();
    closeModal();
  };
}

function onCloudChange() {
  renderAccount();
  loadImpact();
  if (!$('#view-ranking').hidden) showRanking();
  if ($('#modal .profile')) showProfile();
}

/* ---------- Barra do topo ---------- */
function renderStats() {
  const st = currentStreak();
  $('#statStreak .sv').textContent = st;
  $('#statStreak').classList.toggle('off', st === 0);
  $('#statXp .sv').textContent = S.xp;
}
function renderAccount() {
  const u = Cloud.user;
  const box = $('#account'), hero = $('#heroAccount');
  if (u) {
    box.innerHTML = `<button class="avatar-btn" data-profile title="Meu perfil">${avatar(S.name || u.displayName, u.uid, 'sm', u.photoURL)}</button>`;
    hero.innerHTML = `<a class="hero-link" href="#/ranking">Ver o ranking ${icon('arrow')}</a>`;
  } else if (Cloud.busy) {
    box.innerHTML = '<span class="spinner" aria-label="Carregando"></span>';
  } else {
    box.innerHTML = `<button class="btn-google" data-login>${GOOGLE_G}<span>Entrar</span></button><button class="stat stat-profile" data-profile aria-label="Meu perfil">${icon('user')}</button>`;
    hero.innerHTML = `<button class="btn-google lg" data-login>${GOOGLE_G}<span>Entrar com Google</span></button>`;
  }
}

/* ---------- Rotas ---------- */
function route() {
  const parts = (location.hash || '#/').replace(/^#\/?/, '').split('/');
  const page = parts[0] || '';
  $$('.view').forEach((v) => { v.hidden = true; });
  $$('.nav a').forEach((a) => a.classList.remove('on'));
  closePop();
  if (Arena.running) Arena.stop();
  const nav = (k) => { const a = $(`.nav a[data-nav="${k}"]`); if (a) a.classList.add('on'); };

  if (page === 'trilha' && COURSES[parts[1]]) {
    showPath(parts[1]);
    nav(parts[1]);
    document.title = `Trilha ${COURSES[parts[1]].name} · VanCode`;
  } else if (page === 'arena') {
    $('#view-arena').hidden = false;
    Arena.show();
    nav('arena');
    document.title = 'Arena · VanCode';
    window.scrollTo(0, 0);
  } else if (page === 'impacto') {
    $('#view-impact').hidden = false;
    renderImpact();
    loadImpact();
    document.title = 'Impacto · VanCode';
    window.scrollTo(0, 0);
  } else if (page === 'privacidade') {
    $('#view-privacy').hidden = false;
    document.title = 'Privacidade · VanCode';
    window.scrollTo(0, 0);
  } else if (page === 'ranking') {
    $('#view-ranking').hidden = false;
    showRanking();
    nav('ranking');
    document.title = 'Ranking · VanCode';
    window.scrollTo(0, 0);
  } else {
    showHome();
    document.title = 'VanCode · Python e Java para robôs, by Vanguard #37520';
    const target = { porque: '#porque', sobre: '#sobre', trilhas: '#trilhas' }[page];
    if (target) {
      nav(page);
      setTimeout(() => $(target).scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' }), 30);
    } else window.scrollTo(0, 0);
  }
}

/* ---------- Início ---------- */
function showHome() {
  $('#view-home').hidden = false;
  ['python', 'java'].forEach((cid) => {
    const d = countDone(cid), t = totalLessons(cid);
    $(`[data-prog="${cid}"]`).innerHTML = `<div class="bar"><div style="width:${(d / t) * 100}%"></div></div><span>${d}/${t} lições</span>`;
  });
  const cc = $('#continueCard');
  const started = ['python', 'java'].filter((c) => countDone(c) > 0 && nextLesson(c) >= 0);
  if (started.length) {
    const cid = started[0];
    const i = nextLesson(cid);
    cc.innerHTML = `<div class="continue card">
      ${langBadge(cid, 'lg')}
      <div class="cont-text"><small>${S.name ? `Oi, ${esc(S.name)}! ` : ''}Continue de onde parou</small><b>${COURSES[cid].name} · Lição ${i + 1}: ${FLAT[cid][i].title}</b></div>
      <button class="btn btn-green" data-start="${cid}:${i}">Continuar</button>
    </div>`;
  } else cc.innerHTML = '';
}

/* Demo do hero: o código é digitado e o cavaleiro anda de verdade */
const HeroDemo = {
  progs: [
    { lang: 'python', file: 'missao.py', code: 'for i in range(2):\n    frente(2)\n    esquerda()' },
    { lang: 'java', file: 'Missao.java', code: 'for (int i = 0; i < 2; i++) {\n    guardinho.frente(2);\n    guardinho.esquerda();\n}' }
  ],
  cols: 5, rows: 3, start: { x: 0, y: 2, d: 1 }, coins: ['1,2', '2,1'], flag: '2,0',
  k: 0,
  init() {
    this.code = $('.demo-code');
    this.grid = $('.demo-grid');
    this.bot = $('.demo-bot');
    this.bot.innerHTML = boardKnightHTML();
    let cells = '';
    for (let y = 0; y < this.rows; y++) for (let x = 0; x < this.cols; x++) {
      const key = x + ',' + y;
      cells += `<div class="dcell ${(x + y) % 2 ? 'alt' : ''}" data-xy="${key}">${key === this.flag ? FLAG_SVG : ''}</div>`;
    }
    this.grid.innerHTML = cells;
    if (reducedMotion()) { this.static(); return; }
    this.loop();
  },
  sleep(ms) { return new Promise((r) => setTimeout(r, ms)); },
  async waitVisible() { while ($('#view-home').hidden || document.hidden) await this.sleep(500); },
  render(text, lang, active) {
    this.code.innerHTML = text.split('\n').map((ln, i) => `<span class="dl ${i + 1 === active ? 'on' : ''}">${highlight(ln, lang) || ' '}</span>`).join('\n');
  },
  reset() {
    this.st = Object.assign({}, this.start);
    this.angle = this.st.d * 90;
    $$('.dcell', this.grid).forEach((c) => {
      const key = c.dataset.xy;
      if (this.coins.includes(key)) c.innerHTML = COIN_SVG;
      else if (key !== this.flag) c.innerHTML = '';
    });
    this.place(true);
  },
  place(instant) {
    const b = this.bot;
    if (instant) b.classList.add('no-anim');
    b.style.setProperty('--x', this.st.x);
    b.style.setProperty('--y', this.st.y);
    $('.bot-dir', b).style.transform = `rotate(${this.angle}deg)`;
    if (instant) { void b.offsetWidth; b.classList.remove('no-anim'); }
  },
  step(act) {
    if (act.a === 'turn') { this.st.d = (this.st.d + act.dir + 4) % 4; this.angle += act.dir * 90; }
    if (act.a === 'move') {
      const [dx, dy] = DIRS[this.st.d];
      this.st.x += dx; this.st.y += dy;
      const cell = $(`.dcell[data-xy="${this.st.x},${this.st.y}"] .coin`, this.grid);
      if (cell) setTimeout(() => cell.classList.add('got'), 250);
    }
    this.place();
  },
  static() {
    const p = this.progs[0];
    $('.demo-file').textContent = p.file;
    this.render(p.code, p.lang, 0);
    this.reset();
    BipLang.flatten(BipLang.parse(p.code, p.lang)).forEach((a) => this.step(a));
    this.place(true);
  },
  async loop() {
    for (;;) {
      const p = this.progs[this.k++ % this.progs.length];
      await this.waitVisible();
      $('.demo-file').textContent = p.file;
      const run = $('.demo-run');
      run.className = 'demo-run';
      run.textContent = 'digitando';
      this.reset();
      for (let n = 0; n <= p.code.length; n++) {
        this.render(p.code.slice(0, n), p.lang, 0);
        await this.sleep(p.code[n - 1] === '\n' ? 260 : 45);
      }
      await this.sleep(500);
      run.textContent = 'rodando';
      run.classList.add('on');
      for (const act of BipLang.flatten(BipLang.parse(p.code, p.lang))) {
        await this.waitVisible();
        this.render(p.code, p.lang, act.line);
        this.step(act);
        await this.sleep(480);
      }
      this.render(p.code, p.lang, 0);
      run.textContent = 'missão cumprida';
      run.classList.add('done');
      await this.sleep(2200);
    }
  }
};

/* ---------- Blocos x Código ---------- */
const BVC = {
  python: {
    lines: ['async def main():', '    for i in range(4):', '        await motor_pair.move_for_degrees(motor_pair.PAIR_1, 360, 0)    # andar', '        await motor_pair.move_for_degrees(motor_pair.PAIR_1, 180, 100)  # virar'],
    map: [0, 1, 2, 3],
    note: 'Este é Python de verdade, do jeitinho que roda no LEGO SPIKE Prime (depois de juntar os motores com <code>motor_pair.pair</code>).'
  },
  java: {
    lines: ['waitForStart();', 'for (int i = 0; i < 4; i++) {', '    andarParaFrente();', '    virarDireita();', '}'],
    map: [0, 1, 2, 3, 1],
    note: 'No Java do FTC, <code>andarParaFrente()</code> e <code>virarDireita()</code> são métodos que você mesmo cria. Você aprende na trilha!'
  }
};
let bvcLang = 'python', bvcStep = 0, bvcAuto = true;
function renderBVC() {
  const d = BVC[bvcLang];
  $('#bvcPre').innerHTML = d.lines.map((l, i) => `<span class="bvc-line" data-b="${d.map[i]}">${highlight(l, bvcLang)}</span>`).join('\n');
  $('#bvcNote').innerHTML = d.note;
  $$('[data-bvc]').forEach((b) => b.classList.toggle('on', b.dataset.bvc === bvcLang));
}
function bvcLight(b) {
  $$('.bvc [data-b]').forEach((el) => el.classList.toggle('lit', b !== null && +el.dataset.b === b));
}
function initBVC() {
  renderBVC();
  $$('[data-bvc]').forEach((btn) => btn.addEventListener('click', () => { bvcLang = btn.dataset.bvc; renderBVC(); Sound.play('tap'); }));
  const blocks = $('.bvc-blocks');
  const onBlock = (e) => {
    const b = e.target.closest('[data-b]');
    if (!b) return;
    bvcAuto = false;
    bvcLight(+b.dataset.b);
  };
  blocks.addEventListener('mouseover', onBlock);
  blocks.addEventListener('click', onBlock);
  blocks.addEventListener('mouseleave', () => bvcLight(null));
  if (!reducedMotion()) {
    setInterval(() => {
      if (!bvcAuto || $('#view-home').hidden) return;
      bvcLight(bvcStep % 4);
      bvcStep++;
    }, 1300);
  }
}

/* ---------- Mapa da trilha ---------- */
const ZIGZAG = [0, 1, 1.5, 1, 0, -1, -1.5, -1];
let currentPathCid = null;

function showPath(cid) {
  const C = COURSES[cid];
  currentPathCid = cid;
  const v = $('#view-path');
  v.hidden = false;
  const done = countDone(cid), tot = totalLessons(cid), cur = nextLesson(cid);
  const other = cid === 'python' ? 'java' : 'python';
  let gi = 0;

  let units = '';
  C.units.forEach((u, ui) => {
    const firstIdx = gi;
    const canSkip = ui > 0 && !isUnlocked(cid, firstIdx);
    let nodes = '';
    u.lessons.forEach((l) => {
      const i = gi++;
      const lesson = FLAT[cid][i];
      const st = isDone(cid, i) ? 'done' : (i === cur ? 'current' : (isUnlocked(cid, i) ? 'open' : 'locked'));
      const ic = st === 'locked' ? 'lock' : (lesson.last ? 'trophy' : (st === 'done' ? 'check' : 'star'));
      nodes += `<div class="node-row" style="--off:${ZIGZAG[i % 8]}">
        ${st === 'current' ? '<div class="start-bubble">COMEÇAR</div>' : ''}
        <button class="node ${st} ${lesson.last ? 'boss' : ''}" data-i="${i}" aria-label="Lição ${i + 1}: ${esc(l.title)}${st === 'locked' ? ' (bloqueada)' : ''}">${icon(ic, 'node-ic')}</button>
        <span class="node-label">${esc(l.title)}</span>
      </div>`;
    });
    units += `<section class="unit" style="--uc:${u.color}">
      <div class="unit-banner">
        <div><small>Unidade ${ui + 1}</small><h2>${u.name}</h2><p>${u.desc}</p></div>
        <div class="unit-actions">
          ${canSkip ? `<button class="guide-btn skip-btn" data-skip="${cid}:${ui}" title="Faça um teste e pule para esta unidade">${icon('forward')}<span>Pular para cá</span></button>` : ''}
          <button class="guide-btn" data-guide="${ui}" title="Resumo dos conceitos desta unidade">${icon('book')}<span>Guia</span></button>
        </div>
      </div>
      <div class="nodes">${nodes}
        <div class="unit-knight ${ui % 2 ? 'left' : 'right'}" aria-hidden="true">${knightSVG(['happy', 'normal', 'wow'][ui % 3])}</div>
      </div>
    </section>`;
  });

  const goal = S.goal || 30, dxp = dailyXP();
  const pct = Math.min(1, dxp / goal);
  const R = 34, CIRC = 2 * Math.PI * R;
  const st = currentStreak();

  v.innerHTML = `<div class="path-page wrap" style="--tc:${C.color}">
    <div class="path-main">
      <div class="course-hero ${cid}">
        ${langBadge(cid, 'xl on-dark')}
        <div class="ch-text">
          <small>Trilha</small>
          <h1>${C.name} <span>para ${C.robot}</span></h1>
          <p>${C.desc}</p>
          <div class="ch-prog"><div class="bar"><div style="width:${(done / tot) * 100}%"></div></div><span>${done}/${tot} lições</span></div>
        </div>
      </div>
      ${units}
      <div class="path-end">${done === tot
        ? `${knightSVG('happy', 'knight-md')}<h3>Trilha completa!</h3><p>Você é demais. Que tal a trilha de ${COURSES[other].name} ou as missões da Arena?</p><button class="btn btn-gold" data-cert="${cid}">${icon('trophy')}Pegar meu certificado</button>`
        : `<span class="flag-end">${FLAG_SVG}</span><p>Complete todas as lições para virar <b>Mestre ${C.name}</b>.</p>`}</div>
    </div>
    <aside class="path-side">
      <div class="card side-card goal-card">
        <svg viewBox="0 0 80 80" class="ring"><circle cx="40" cy="40" r="${R}" class="ring-bg"/><circle cx="40" cy="40" r="${R}" class="ring-fg" stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC * (1 - pct)}"/></svg>
        <div><h4>Meta diária</h4><p><b>${dxp}</b> / ${goal} XP hoje</p><small>${pct >= 1 ? 'Meta batida!' : 'Uma lição dá de 10 a 15 XP'}</small></div>
      </div>
      <div class="card side-card streak-card ${st ? '' : 'off'}">
        <span class="side-ic fire">${icon('flame')}</span>
        <div><h4>${st} dia${st === 1 ? '' : 's'} de ofensiva</h4><small>${st ? 'Volte amanhã para não perder!' : 'Faça uma lição hoje para começar.'}</small></div>
      </div>
      ${errosDe(cid).length ? `<button class="card side-card link-card train-card" data-practice="${cid}">
        <span class="side-ic train">${icon('reset')}</span>
        <div><h4>Treinar erros</h4><small>${plural(errosDe(cid).length, 'pergunta', 'perguntas')} para revisar</small></div>
        ${icon('arrow', 'arrow')}
      </button>` : ''}
      <a class="card side-card link-card" href="#/ranking">
        <span class="side-ic">${icon('podium')}</span>
        <div><h4>Ranking</h4><small>${Cloud.user ? `Você é ${leagueOf(S.xp).name}` : 'Entre com Google para participar'}</small></div>
        ${icon('arrow', 'arrow')}
      </a>
      <a class="card side-card link-card" href="#/trilha/${other}">
        ${langBadge(other)}
        <div><h4>Trilha ${COURSES[other].name}</h4><small>${countDone(other)}/${totalLessons(other)} lições</small></div>
        ${icon('arrow', 'arrow')}
      </a>
      <a class="card side-card link-card" href="#/arena">
        <span class="side-ic">${icon('gamepad')}</span>
        <div><h4>Arena</h4><small>Digite código e veja o cavaleiro andar</small></div>
        ${icon('arrow', 'arrow')}
      </a>
    </aside>
  </div>`;

  const curNode = $('.node.current', v);
  if (curNode && cur > 0) setTimeout(() => curNode.scrollIntoView({ block: 'center', behavior: 'auto' }), 20);
  else window.scrollTo(0, 0);
}

function closePop() {
  $$('.pop').forEach((p) => p.remove());
  $$('.node-row.has-pop').forEach((r) => r.classList.remove('has-pop'));
}
function showPop(node) {
  const already = node.parentElement.querySelector('.pop');
  closePop();
  if (already) return;
  const cid = currentPathCid;
  const i = +node.dataset.i;
  const l = FLAT[cid][i];
  const st = isDone(cid, i) ? 'done' : (isUnlocked(cid, i) ? 'open' : 'locked');
  const nEx = l.steps.filter((s) => s.t !== 'teach').length;
  const pop = document.createElement('div');
  pop.className = 'pop ' + st;
  pop.innerHTML = st === 'locked'
    ? `<b>${esc(l.title)}</b><small>Termine a lição anterior para liberar esta.</small>`
    : `<b>${esc(l.title)}</b><small>Lição ${i + 1} de ${totalLessons(cid)} · ${nEx} exercícios${l.last ? ' · desafio' : ''}</small>
       <button class="btn ${st === 'done' ? 'btn-white' : 'btn-green'}" data-start="${cid}:${i}">${st === 'done' ? 'Revisar · +5 XP' : 'Começar · +15 XP'}</button>`;
  node.parentElement.appendChild(pop);
  node.parentElement.classList.add('has-pop');   // o balão fica por cima das próximas lições
  Sound.play('tap');
}

function showGuide(cid, ui) {
  const C = COURSES[cid];
  const u = C.units[ui];
  const cards = u.lessons.flatMap((l) => l.steps.filter((s) => s.t === 'teach').map((s) => `
    <div class="guide-item"><h4>${s.title}</h4><p>${s.text}</p>${s.code ? codeBlock(s.code, C.lang) : ''}${s.tip ? `<p class="guide-tip">${s.tip}</p>` : ''}</div>`)).join('');
  openModal(`<div class="guide" style="--uc:${u.color}"><small>Unidade ${ui + 1} · ${C.name}</small><h2>Guia: ${u.name}</h2><p class="guide-sub">Tudo que você aprende nesta unidade, num lugar só. Ótimo para consultar depois.</p>${cards}</div>`, 'modal-wide');
}

/* ---------- Lição ---------- */
const PRAISE = ['Mandou bem!', 'Isso aí!', 'Incrível!', 'Código perfeito!', 'Show de bola!', 'Você é fera!', 'Acertou!', 'Que programador(a)!'];
const OOPS = ['Quase lá!', 'Opa, não foi dessa vez!', 'Errar faz parte!', 'Hmm, quase!'];
const LS = {};

function startLesson(cid, i, quiz = null) {
  closePop();
  closeModal();
  const lesson = quiz ? quiz.lesson : FLAT[cid][i];
  const hearts = quiz && quiz.type === 'skip' ? 3 : 5;
  Object.assign(LS, {
    cid, i, lesson, quiz, lang: COURSES[cid].lang,
    queue: lesson.steps.map((s, k) => Object.assign({ k, lid: lesson.id }, s)),
    pos: 0, hearts, mistakes: 0, solved: 0, total: lesson.steps.length,
    t0: Date.now(), review: quiz ? false : isDone(cid, i), mode: 'answer', ok: false, answer: null
  });
  const el = $('#lesson');
  el.innerHTML = `
    <div class="ls-top">
      <button class="ls-close" aria-label="Sair da lição">${icon('x')}</button>
      <div class="ls-bar" role="progressbar" aria-label="Progresso da lição"><div class="ls-fill"></div></div>
      <div class="ls-hearts" title="Vidas">${icon('heart')}<span>${hearts}</span></div>
    </div>
    <div class="ls-body"><div class="ls-inner"></div></div>
    <div class="ls-foot"><div class="ls-foot-in"><div class="ls-fb" aria-live="polite"></div><button class="btn btn-green btn-lg ls-main" disabled>Verificar</button></div></div>`;
  el.hidden = false;
  document.body.classList.add('no-scroll');
  $('.ls-close', el).onclick = askQuit;
  $('.ls-main', el).onclick = mainAction;
  renderStep();
}

function askQuit() {
  if (LS.mode === 'result') return closeLesson();
  openModal(`<div class="center-modal">${knightSVG('sad', 'knight-md')}<h3>Espera! Quer mesmo sair?</h3><p>Se sair agora, você perde o progresso desta lição.</p>
    <div class="modal-btns"><button class="btn btn-green" data-close>Continuar aprendendo</button><button class="btn btn-white" id="quitYes">Sair</button></div></div>`);
  $('#quitYes').onclick = () => { closeModal(); closeLesson(); };
}

function closeLesson() {
  const el = $('#lesson');
  el.hidden = true;
  el.innerHTML = '';
  document.body.classList.remove('no-scroll');
  LS.mode = 'closed';
  route();
}

function setProgress() {
  $('.ls-fill').style.width = `${(LS.solved / LS.total) * 100}%`;
  $('.ls-hearts span').textContent = LS.hearts;
}

function setMain(text, enabled, cls = 'btn-green') {
  const b = $('.ls-main');
  b.textContent = text;
  b.disabled = !enabled;
  b.className = `btn btn-lg ls-main ${cls}`;
}

function renderStep() {
  const s = LS.queue[LS.pos];
  LS.cur = s;
  LS.answer = null;
  LS.mode = s.t === 'teach' ? 'teach' : 'answer';
  $('.ls-foot').className = 'ls-foot';
  $('.ls-fb').innerHTML = '';
  setProgress();
  const inner = $('.ls-inner');
  const lang = LS.lang;
  const retry = LS.pos >= LS.total ? `<span class="retry-tag">${icon('reset')}Vamos de novo</span>` : '';
  let html = '';

  if (s.t === 'teach') {
    html = `<div class="step teach">
      <span class="badge-new">Novo conceito</span>
      <h2 class="q">${s.title}</h2>
      <div class="teach-text">${s.text}</div>
      ${s.code ? codeBlock(s.code, lang) : ''}
      ${s.tip ? `<div class="knight-tip">${knightSVG('happy', 'knight-sm')}<div class="bubble">${s.tip}</div></div>` : ''}
    </div>`;
    setMain('Continuar', true);
  } else if (s.t === 'choice') {
    LS.order = shuffle(s.options.map((_, k) => k));
    html = `<div class="step">${retry}
      <h2 class="q">${s.q}</h2>
      ${s.code ? codeBlock(s.code, lang) : ''}
      <div class="opts ${s.co ? 'code-opts' : ''}">${LS.order.map((oi, k) => `<button class="opt" data-oi="${oi}"><kbd>${k + 1}</kbd><span>${s.co ? highlight(s.options[oi], lang) : esc(s.options[oi])}</span></button>`).join('')}</div>
    </div>`;
    setMain('Verificar', false);
  } else if (s.t === 'fill') {
    const [before, after] = s.code.split('___');
    html = `<div class="step">${retry}
      <h2 class="q">${s.q}</h2>
      <pre class="code fill-code">${highlight(before, lang)}<button class="slot" aria-label="Lacuna: toque para limpar"></button>${highlight(after, lang)}</pre>
      <div class="bank">${shuffle(s.options).map((o, k) => `<button class="chip" data-v="${esc(o)}"><kbd>${k + 1}</kbd>${highlight(o, lang)}</button>`).join('')}</div>
    </div>`;
    setMain('Verificar', false);
  } else if (s.t === 'order') {
    let sh = shuffle(s.lines);
    for (let tries = 0; tries < 10 && sh.join('\n') === s.lines.join('\n'); tries++) sh = shuffle(s.lines);
    LS.shuf = sh;
    LS.answer = [];
    html = `<div class="step">${retry}
      <h2 class="q">${s.q}</h2>
      <div class="answer-zone" aria-label="Seu código"><span class="az-ph">Toque nas linhas abaixo na ordem certa</span></div>
      <div class="bank lines">${sh.map((ln, k) => `<button class="chip line" data-k="${k}">${highlight(ln, lang)}</button>`).join('')}</div>
    </div>`;
    setMain('Verificar', false);
  } else if (s.t === 'type') {
    html = `<div class="step">${retry}
      <span class="badge-new badge-type">Digite o código</span>
      <h2 class="q">${s.q}</h2>
      ${s.code ? codeBlock(s.code, lang) : ''}
      <div class="type-wrap">${langBadge(lang, 'sm')}<input class="type-in" type="text" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" placeholder="${esc(s.ph || 'Digite aqui...')}" aria-label="Sua resposta"></div>
      <p class="type-hint">Aperte <kbd>Enter</kbd> para verificar. Espaços extras não tem problema.</p>
    </div>`;
    setMain('Verificar', false);
  }
  inner.innerHTML = html;
  inner.parentElement.scrollTop = 0;
  bindStep(s);
}

function bindStep(s) {
  const inner = $('.ls-inner');
  inner.onclick = null;
  if (s.t === 'choice') {
    inner.onclick = (e) => {
      const b = e.target.closest('.opt');
      if (!b || LS.mode !== 'answer') return;
      $$('.opt', inner).forEach((o) => o.classList.remove('sel'));
      b.classList.add('sel');
      LS.answer = +b.dataset.oi;
      setMain('Verificar', true);
      Sound.play('tap');
    };
  } else if (s.t === 'fill') {
    const slot = $('.slot', inner);
    inner.onclick = (e) => {
      if (LS.mode !== 'answer') return;
      const chip = e.target.closest('.chip');
      if (chip && !chip.classList.contains('used')) {
        $$('.chip', inner).forEach((c) => c.classList.remove('used'));
        chip.classList.add('used');
        LS.answer = chip.dataset.v;
        slot.innerHTML = highlight(LS.answer, LS.lang);
        slot.classList.add('filled');
        setMain('Verificar', true);
        Sound.play('tap');
      } else if (e.target.closest('.slot') && LS.answer != null) {
        LS.answer = null;
        slot.innerHTML = '';
        slot.classList.remove('filled');
        $$('.chip', inner).forEach((c) => c.classList.remove('used'));
        setMain('Verificar', false);
      }
    };
  } else if (s.t === 'order') {
    const zone = $('.answer-zone', inner);
    const redraw = () => {
      zone.innerHTML = LS.answer.length
        ? LS.answer.map((k, pos) => `<button class="chip line placed" data-pos="${pos}">${highlight(LS.shuf[k], LS.lang)}</button>`).join('')
        : '<span class="az-ph">Toque nas linhas abaixo na ordem certa</span>';
      $$('.bank .chip', inner).forEach((c) => c.classList.toggle('used', LS.answer.includes(+c.dataset.k)));
      setMain('Verificar', LS.answer.length === LS.shuf.length);
    };
    inner.onclick = (e) => {
      if (LS.mode !== 'answer') return;
      const placed = e.target.closest('.chip.placed');
      const chip = e.target.closest('.bank .chip');
      if (placed) { LS.answer.splice(+placed.dataset.pos, 1); redraw(); Sound.play('tap'); }
      else if (chip && !chip.classList.contains('used')) { LS.answer.push(+chip.dataset.k); redraw(); Sound.play('tap'); }
    };
  } else if (s.t === 'type') {
    const inp = $('.type-in', inner);
    inp.addEventListener('input', () => { LS.answer = inp.value; setMain('Verificar', inp.value.trim().length > 0); });
    setTimeout(() => inp.focus(), 50);
  }
}

const normCode = (t) => String(t).replace(/[“”]/g, '"').replace(/'/g, '"').replace(/\s+/g, '');

function mainAction() {
  if (LS.mode === 'teach') { LS.solved++; return advance(); }
  if (LS.mode === 'answer') return checkAnswer();
  if (LS.mode === 'feedback') {
    if (LS.ok || isSkip()) LS.solved++;          // no teste, pergunta errada não volta
    else LS.queue.push(LS.cur);
    if (LS.hearts <= 0) return failLesson();
    return advance();
  }
  if (LS.mode === 'result') return closeLesson();
  if (LS.mode === 'failed') return isSkip() ? startSkipTest(LS.cid, LS.quiz.unit) : LS.quiz ? startPractice(LS.cid) : startLesson(LS.cid, LS.i);
}

function advance() {
  LS.pos++;
  if (LS.pos >= LS.queue.length) return isSkip() ? finishSkipTest() : LS.quiz ? finishPractice() : finishLesson();
  renderStep();
}

function checkAnswer() {
  const s = LS.cur;
  const inner = $('.ls-inner');
  let ok = false, right = '', rightIsCode = true, extra = '';

  if (s.t === 'choice') {
    ok = LS.answer === s.a;
    right = s.options[s.a];
    rightIsCode = !!s.co;
    $$('.opt', inner).forEach((o) => {
      const oi = +o.dataset.oi;
      if (oi === s.a) o.classList.add('right');
      else if (oi === LS.answer) o.classList.add('wrong');
    });
  } else if (s.t === 'fill') {
    ok = LS.answer === s.a;
    right = s.code.replace('___', s.a);
    $('.slot', inner).classList.add(ok ? 'right' : 'wrong');
  } else if (s.t === 'order') {
    const ans = LS.answer.map((k) => LS.shuf[k]);
    ok = [s.lines].concat(s.alts || []).some((v) => v.length === ans.length && v.every((x, j) => x === ans[j]));
    right = s.lines.join('\n');
    $('.answer-zone', inner).classList.add(ok ? 'right' : 'wrong');
  } else if (s.t === 'type') {
    const n = normCode(LS.answer);
    ok = s.a.some((x) => normCode(x) === n);
    right = s.a[0];
    if (!ok && s.a.some((x) => normCode(x) === n + ';')) extra = 'Faltou só o <code>;</code> no final! Em Java, todo comando termina com ponto e vírgula.';
    else if (!ok && s.a.some((x) => normCode(x).toLowerCase() === n.toLowerCase())) extra = 'Cuidado com as MAIÚSCULAS e minúsculas: para o computador, <code>A</code> e <code>a</code> são diferentes!';
    $('.type-in', inner).readOnly = true;
    $('.type-wrap', inner).classList.add(ok ? 'right' : 'wrong');
  }

  LS.ok = ok;
  LS.mode = 'feedback';
  const foot = $('.ls-foot');
  const fb = $('.ls-fb');
  if (ok) {
    foot.classList.add('ok');
    fb.innerHTML = `<div class="fb-title">${knightSVG('happy', 'knight-xs')} ${pick(PRAISE)}</div>${s.why ? `<div class="fb-why">${s.why}</div>` : ''}`;
    setMain('Continuar', true, 'btn-green');
    Sound.play('ok');
  } else {
    LS.hearts--;
    LS.mistakes++;
    if (s.lid != null) noteErro(LS.cid, s.lid, s.k);
    foot.classList.add('bad');
    fb.innerHTML = `<div class="fb-title">${knightSVG('sad', 'knight-xs')} ${pick(OOPS)}</div>
      ${extra ? `<div class="fb-why">${extra}</div>` : ''}
      <div class="fb-right"><small>Resposta certa:</small>${rightIsCode ? `<pre class="code mini">${highlight(right, LS.lang)}</pre>` : `<b>${esc(right)}</b>`}</div>
      ${s.why ? `<div class="fb-why">${s.why}</div>` : ''}
      ${LS.hearts > 0 ? `<div class="fb-small">${isSkip() ? `No teste, cada erro custa uma vida. Restam ${LS.hearts}.` : 'Essa pergunta volta no final para você tentar de novo.'}</div>` : ''}`;
    setMain(LS.hearts > 0 ? 'Entendi' : 'Ver resultado', true, 'btn-red');
    Sound.play('bad');
    const h = $('.ls-hearts');
    h.classList.remove('hit'); void h.offsetWidth; h.classList.add('hit');
    setProgress();
    $('.ls-body').classList.add('shake');
    setTimeout(() => $('.ls-body') && $('.ls-body').classList.remove('shake'), 450);
  }
}

function finishLesson() {
  LS.mode = 'result';
  const perfect = LS.mistakes === 0;
  const xp = LS.review ? 5 : 10 + (perfect ? 5 : 0);
  const key = lessonKey(LS.cid, LS.i);
  const firstTime = !S.done[key];
  const leagueBefore = leagueOf(S.xp).name;
  S.done[key] = true;
  S.lessons = (S.lessons || 0) + 1;
  if (perfect) S.perfect = (S.perfect || 0) + 1;
  addXP(xp);
  const newAch = checkAchievements();
  const leagueNow = leagueOf(S.xp);
  const secs = Math.max(1, Math.round((Date.now() - LS.t0) / 1000));
  const graded = LS.lesson.steps.filter((s) => s.t !== 'teach').length;
  const acc = Math.round((100 * graded) / (graded + LS.mistakes));
  const C = COURSES[LS.cid];
  const nextI = LS.i + 1 < totalLessons(LS.cid) ? LS.i + 1 : -1;
  const unitFinished = LS.lesson.last && firstTime;

  $('.ls-top').classList.add('hide');
  $('.ls-fill').style.width = '100%';
  $('.ls-inner').innerHTML = `<div class="result">
    <div class="res-knight">${knightSVG('happy', 'knight-lg')}</div>
    <h1>${unitFinished ? 'Unidade completa!' : 'Lição completa!'}</h1>
    <p class="res-sub">${S.name ? `Mandou bem, ${esc(S.name)}!` : 'Mandou muito bem!'} ${perfect ? 'Nenhum erro, uau.' : 'Cada erro te deixou mais esperto(a).'}</p>
    <div class="res-cards">
      <div class="rc rc-xp"><small>XP ganho</small><b>${icon('bolt')}${xp}</b></div>
      <div class="rc rc-acc"><small>${perfect ? 'Perfeito' : 'Precisão'}</small><b>${icon('target')}${acc}%</b></div>
      <div class="rc rc-time"><small>Tempo</small><b>${icon('clock')}${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</b></div>
    </div>
    ${leagueNow.name !== leagueBefore ? `<p class="res-league">Você subiu para a liga ${leaguePill(S.xp)}</p>` : ''}
    ${newAch.length ? `<div class="res-ach"><h3>Nova${newAch.length > 1 ? 's' : ''} conquista${newAch.length > 1 ? 's' : ''}</h3>${newAch.map((a) => achHTML(a, true)).join('')}</div>` : ''}
    ${nextI >= 0 && firstTime ? `<p class="res-next">Próxima: <b>${FLAT[LS.cid][nextI].title}</b> foi desbloqueada.</p>` : ''}
    ${nextI < 0 && firstTime ? `<p class="res-next">Você completou a trilha de ${C.name}! Agora você é <b>Mestre ${C.name}</b>.</p>` : ''}
    ${!Cloud.user && Cloud.configured() ? `<p class="res-login">Quer aparecer no ranking? <button class="link-btn" data-login>Entre com Google</button> e seu XP fica salvo.</p>` : ''}
  </div>`;
  $('.ls-foot').className = 'ls-foot';
  $('.ls-fb').innerHTML = nextI >= 0 && firstTime ? '<button class="btn btn-white" id="goNext">Próxima lição</button>'
    : trackDone(LS.cid) ? `<button class="btn btn-gold" data-cert="${LS.cid}">${icon('trophy')}Pegar meu certificado</button>` : '';
  setMain('Continuar', true);
  const goNext = $('#goNext');
  if (goNext) goNext.onclick = () => startLesson(LS.cid, nextI);
  Sound.play('win');
  confetti();
}

function failLesson() {
  LS.mode = 'failed';
  $('.ls-inner').innerHTML = isSkip()
    ? `<div class="result fail">
    <div class="res-knight">${knightSVG('sad', 'knight-lg')}</div>
    <h1>Não foi dessa vez</h1>
    <p class="res-sub">Sem problema! Você pode fazer as lições das unidades anteriores, ou tentar o teste de novo com outras perguntas.</p>
  </div>`
    : `<div class="result fail">
    <div class="res-knight">${knightSVG('sad', 'knight-lg')}</div>
    <h1>Acabaram as vidas</h1>
    <p class="res-sub">Tudo bem! Até programadores profissionais erram todo dia. O segredo é tentar de novo, e agora você já sabe mais do que antes.</p>
  </div>`;
  $('.ls-foot').className = 'ls-foot';
  $('.ls-fb').innerHTML = '<button class="btn btn-white" id="failExit">Sair</button>';
  $('#failExit').onclick = closeLesson;
  setMain('Tentar de novo', true);
  Sound.play('fail');
}

/* ---------- Treino de erros ---------- */
const isSkip = () => !!(LS.quiz && LS.quiz.type === 'skip');
const erroKey = (cid, lid, k) => `${cid}|${lid}|${k}`;
function noteErro(cid, lid, k) {
  const key = erroKey(cid, lid, k);
  S.erros = S.erros.filter((e) => e !== key).concat(key).slice(-60);
  save();
}
function errosDe(cid) {
  return S.erros.filter((e) => e.startsWith(cid + '|')).map((e) => {
    const [, lid, k] = e.split('|');
    const lesson = FLAT[cid].find((l) => l.id === lid);
    const step = lesson && lesson.steps[+k];
    return step && step.t !== 'teach' ? Object.assign({ lid, k: +k, key: e }, step) : null;
  }).filter(Boolean);
}
function startPractice(cid) {
  const itens = errosDe(cid).reverse().slice(0, 10);
  if (!itens.length) { toast('Você não tem erros para treinar nesta trilha. Mandou bem!'); return; }
  startLesson(cid, 0, { type: 'treino', lesson: { id: '__treino', title: 'Treino de erros', steps: shuffle(itens) } });
}
function finishPractice() {
  LS.mode = 'result';
  const treinados = new Set(LS.lesson.steps.map((s) => s.key));
  S.erros = S.erros.filter((e) => !treinados.has(e));
  addXP(5);
  const newAch = checkAchievements();
  const restam = errosDe(LS.cid).length;
  $('.ls-top').classList.add('hide');
  $('.ls-inner').innerHTML = `<div class="result">
    <div class="res-knight">${knightSVG('happy', 'knight-lg')}</div>
    <h1>Treino completo!</h1>
    <p class="res-sub">Você corrigiu <b>${plural(treinados.size, 'erro', 'erros')}</b>. ${restam ? `Ainda ${restam === 1 ? 'falta 1' : `faltam ${restam}`} para treinar.` : 'Nenhum erro pendente nesta trilha!'}</p>
    <div class="res-cards"><div class="rc rc-xp"><small>XP ganho</small><b>${icon('bolt')}5</b></div></div>
    ${newAch.length ? `<div class="res-ach"><h3>Nova conquista</h3>${newAch.map((a) => achHTML(a, true)).join('')}</div>` : ''}
  </div>`;
  $('.ls-foot').className = 'ls-foot';
  $('.ls-fb').innerHTML = restam ? '<button class="btn btn-white" id="moreTrain">Treinar mais</button>' : '';
  const more = $('#moreTrain');
  if (more) more.onclick = () => startPractice(LS.cid);
  setMain('Continuar', true);
  Sound.play('win');
  confetti(1500);
}

/* ---------- Teste para pular unidades ---------- */
const SKIP_QUESTIONS = 12;
function buildSkipTest(cid, ui) {
  const prev = COURSES[cid].units.slice(0, ui);
  const per = Math.max(2, Math.ceil(SKIP_QUESTIONS / prev.length));
  let pool = [];
  prev.forEach((u) => {
    const exercises = u.lessons.flatMap((l) => l.steps.map((s, k) => Object.assign({ lid: l.id, k }, s)).filter((s) => s.t === 'choice' || s.t === 'fill' || s.t === 'order'));
    pool = pool.concat(shuffle(exercises).slice(0, per));
  });
  return { title: `Teste: pular para a Unidade ${ui + 1}`, steps: shuffle(pool).slice(0, SKIP_QUESTIONS) };
}
function confirmSkip(cid, ui) {
  const u = COURSES[cid].units[ui];
  openModal(`<div class="center-modal">
    ${knightSVG('wow', 'knight-md')}
    <h3>Pular para a Unidade ${ui + 1}?</h3>
    <p>Já sabe o conteúdo das unidades 1 a ${ui}? Faça um teste de <b>${SKIP_QUESTIONS} perguntas</b> com <b>3 vidas</b>. Se passar, todas as lições antes de <b>${esc(u.name)}</b> ficam concluídas.</p>
    <div class="modal-btns"><button class="btn btn-brand" id="skipGo">${icon('forward')}Começar o teste</button><button class="btn btn-white" data-close>Agora não</button></div>
  </div>`);
  $('#skipGo').onclick = () => startSkipTest(cid, ui);
}
function startSkipTest(cid, ui) {
  startLesson(cid, 0, { type: 'skip', unit: ui, lesson: buildSkipTest(cid, ui) });
}
function finishSkipTest() {
  LS.mode = 'result';
  const { cid } = LS;
  const ui = LS.quiz.unit;
  let liberadas = 0;
  FLAT[cid].forEach((l, i) => {
    if (l.unit < ui && !isDone(cid, i)) { S.done[lessonKey(cid, i)] = 'teste'; liberadas++; }
  });
  const xp = liberadas ? 20 : 5;
  addXP(xp);
  const newAch = checkAchievements();
  const secs = Math.max(1, Math.round((Date.now() - LS.t0) / 1000));
  const acc = Math.round((100 * (LS.total - LS.mistakes)) / LS.total);
  $('.ls-top').classList.add('hide');
  $('.ls-inner').innerHTML = `<div class="result">
    <div class="res-knight">${knightSVG('happy', 'knight-lg')}</div>
    <h1>Unidade ${ui + 1} liberada!</h1>
    <p class="res-sub">Você mostrou que já domina o começo da trilha${liberadas ? `: ${plural(liberadas, 'lição foi marcada', 'lições foram marcadas')} como concluída${liberadas > 1 ? 's' : ''}` : ''}. Agora é com <b>${esc(COURSES[cid].units[ui].name)}</b>!</p>
    <div class="res-cards">
      <div class="rc rc-xp"><small>XP ganho</small><b>${icon('bolt')}${xp}</b></div>
      <div class="rc rc-acc"><small>Acertos</small><b>${icon('target')}${acc}%</b></div>
      <div class="rc rc-time"><small>Tempo</small><b>${icon('clock')}${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</b></div>
    </div>
    ${newAch.length ? `<div class="res-ach"><h3>Nova${newAch.length > 1 ? 's' : ''} conquista${newAch.length > 1 ? 's' : ''}</h3>${newAch.map((a) => achHTML(a, true)).join('')}</div>` : ''}
  </div>`;
  $('.ls-foot').className = 'ls-foot';
  $('.ls-fb').innerHTML = '';
  setMain('Continuar', true);
  Sound.play('win');
  confetti();
}

/* ---------- Ranking ---------- */
const newRank = () => ({ at: 0, rows: null, err: null, loading: false });
const rankAll = { geral: newRank(), semana: newRank(), semanaOff: false };
let rankTab = Store.get('vg_rank_tab', 'semana');
const currentTab = () => (rankAll.semanaOff ? 'geral' : rankTab);

async function showRanking(force) {
  renderRanking();
  const tab = currentTab();
  const c = rankAll[tab];
  if (!Cloud.enabled || c.loading) return;
  if (!force && c.rows && Date.now() - c.at < 30000) return;
  c.loading = true;
  renderRanking();
  try {
    c.rows = tab === 'semana' ? await Cloud.topWeek(50) : await Cloud.top(50);
    c.err = null;
  } catch (e) {
    console.warn('[VanCode] ranking:', e);
    c.err = e;
    // regras do ranking semanal ainda não publicadas: mostra só o geral
    if (tab === 'semana' && e.code === 'permission-denied') { rankAll.semanaOff = true; c.loading = false; return showRanking(); }
  }
  c.at = Date.now();
  c.loading = false;
  if (!$('#view-ranking').hidden) renderRanking();
}

function renderRanking() {
  const v = $('#view-ranking');
  const u = Cloud.user;
  const tab = currentTab();
  const semanal = tab === 'semana';
  const rankCache = rankAll[tab];
  let rows = (rankCache.rows || []).slice();
  const myXP = semanal ? weekXP() : S.xp;
  if (u) {
    // o seu cartão sempre com o XP mais atual
    rows = rows.filter((r) => r.id !== u.uid);
    if (!semanal || myXP > 0) rows.push(Object.assign({ id: u.uid }, publicProfile(), { xp: myXP }));
    rows.sort((a, b) => b.xp - a.xp);
    if (rows.length > 50 && rows.findIndex((r) => r.id === u.uid) >= 50) rows = rows.slice(0, 50);
  }
  const myPos = u ? rows.findIndex((r) => r.id === u.uid) + 1 : 0;

  let main;
  if (!Cloud.configured()) {
    main = `<div class="card rank-note">${knightSVG('normal', 'knight-md')}<div><h3>O ranking online está chegando</h3><p>A equipe ainda está ligando o login com Google. Enquanto isso, continue juntando XP: ele fica salvo neste navegador e vai com você quando as contas abrirem.</p></div></div>`;
  } else if (Cloud.failed) {
    main = `<div class="card rank-note">${knightSVG('sad', 'knight-md')}<div><h3>Não consegui conectar</h3><p>Confira sua internet e recarregue a página.</p></div></div>`;
  } else if (rankCache.err) {
    main = `<div class="card rank-note">${knightSVG('sad', 'knight-md')}<div><h3>Não consegui carregar o ranking</h3><p>Tente de novo daqui a pouco.</p><button class="btn btn-white btn-sm" data-rank-reload>Tentar de novo</button></div></div>`;
  } else if (!rankCache.rows && (rankCache.loading || !Cloud.enabled)) {
    main = `<div class="rank-list skeleton">${'<div class="rank-row"></div>'.repeat(6)}</div>`;
  } else if (!rows.length) {
    main = semanal
      ? `<div class="card rank-note">${knightSVG('wow', 'knight-md')}<div><h3>A semana está começando</h3><p>Ninguém ganhou XP ainda. Faça uma lição agora e comece a semana em primeiro!</p></div></div>`
      : `<div class="card rank-note">${knightSVG('wow', 'knight-md')}<div><h3>Ninguém aqui ainda</h3><p>Entre com sua conta Google e seja o primeiro cavaleiro do ranking!</p></div></div>`;
  } else {
    const top3 = rows.slice(0, 3);
    const order = [1, 0, 2].filter((k) => top3[k]);
    const podium = `<div class="podium">${order.map((k) => {
      const r = top3[k];
      return `<div class="pod pod-${k + 1} ${u && r.id === u.uid ? 'me' : ''} ${cargoOf(r.id) ? 'staff' : ''}">
        ${k === 0 && !cargoOf(r.id) ? `<span class="pod-crown">${icon('crown')}</span>` : ''}
        ${avatar(safeName(r.name), r.id, 'lg')}
        <b class="pod-name">${esc(safeName(r.name))}</b>
        ${cargoBadge(r.id)}${semanal ? '' : leaguePill(r.xp)}
        <div class="pod-base"><span class="pod-n">${k + 1}</span><span class="pod-xp">${r.xp} XP</span></div>
      </div>`;
    }).join('')}</div>`;
    const list = rows.slice(3).map((r, k) => `<li class="rank-row ${u && r.id === u.uid ? 'me' : ''} ${cargoOf(r.id) ? 'staff' : ''}">
      <span class="rk">${k + 4}</span>${avatar(safeName(r.name), r.id)}
      <span class="rn"><span class="rn-top"><b>${esc(safeName(r.name))}</b>${cargoBadge(r.id)}</span><small>${semanal ? 'XP nesta semana' : `${plural(r.lessons || 0, 'lição', 'lições')} · ${plural(r.arena || 0, 'missão', 'missões')}`}</small></span>
      ${semanal ? '' : leaguePill(r.xp)}<span class="rx">${r.xp} XP</span>
    </li>`).join('');
    main = podium + (list ? `<ol class="rank-list">${list}</ol>` : '');
  }

  const nl = nextLeague(S.xp);
  const lg = leagueOf(S.xp);
  const prog = nl ? Math.round(((S.xp - lg.min) / (nl.min - lg.min)) * 100) : 100;
  const me = u
    ? `<div class="card me-card">
        <div class="me-top">${avatar(S.name, u.uid, 'lg', u.photoURL)}<div><b>${esc(S.name || 'Cavaleiro')}</b><span class="me-pills">${cargoBadge(u.uid)}${leaguePill(S.xp)}</span></div></div>
        ${cargoOf(u.uid) ? `<p class="cargo-line">${esc(cargoOf(u.uid).descricao || '')}</p>` : ''}
        <div class="me-stats"><div><b>${S.xp}</b><small>XP</small></div><div><b>${myPos ? '#' + myPos : '-'}</b><small>posição</small></div><div><b>${currentStreak()}</b><small>ofensiva</small></div></div>
        <div class="me-next"><div class="bar"><div style="width:${prog}%;--tc:${lg.color}"></div></div><small>${nl ? `Faltam <b>${nl.min - S.xp} XP</b> para ${nl.name}` : 'Você chegou ao topo: Lenda!'}</small></div>
      </div>`
    : `<div class="card me-card guest">
        <h4>Entre no ranking</h4>
        <p>Crie sua conta com o Google em um clique. Seu progresso fica salvo e você aparece aqui com um apelido.</p>
        <button class="btn-google lg" data-login>${GOOGLE_G}<span>Entrar com Google</span></button>
        <small class="muted">Você tem ${S.xp} XP neste navegador.</small>
        <p class="legal-note">Menores de 13 anos: peça para um responsável. <a href="#/privacidade">Privacidade</a></p>
      </div>`;

  v.innerHTML = `<div class="rank-page wrap">
    <div class="rank-head">
      <div>
        <span class="eyebrow">Ranking</span>
        <h1>Os cavaleiros da VanCode</h1>
        <p>${semanal ? `Quem ganhar mais XP nesta semana fica no topo. Zera toda segunda-feira (${daysToMonday() === 1 ? 'falta 1 dia' : `faltam ${daysToMonday()} dias`}).` : 'Ganhe XP nas lições e na Arena para subir de posto: de Escudeiro até Lenda.'}</p>
        ${Cloud.enabled && !rankAll.semanaOff ? `<div class="rank-tabs" role="tablist"><button role="tab" data-rtab="semana" class="${semanal ? 'on' : ''}">Esta semana</button><button role="tab" data-rtab="geral" class="${semanal ? '' : 'on'}">Geral</button></div>` : ''}
      </div>
      ${Cloud.enabled ? `<button class="btn btn-white btn-sm" data-rank-reload>${icon('reset')}Atualizar</button>` : ''}
    </div>
    <div class="rank-grid">
      <div class="rank-main">${main}</div>
      <aside class="rank-side">
        ${me}
        <div class="card leagues">
          <h4>Ligas</h4>
          ${LEAGUES.map((l, k) => `<div class="lg-row ${l.name === lg.name ? 'cur' : ''}"><span class="lg-dot" style="--lc:${l.color}">${icon('shield')}</span><b>${l.name}</b><small>${LEAGUES[k + 1] ? `${l.min} a ${LEAGUES[k + 1].min - 1} XP` : `${l.min}+ XP`}</small></div>`).join('')}
        </div>
      </aside>
    </div>
  </div>`;
}

/* ---------- Certificado de conclusão ---------- */
const TRACK_NAME = { python: 'Python para LEGO® SPIKE™ Prime', java: 'Java para FIRST® Tech Challenge' };
const trackDone = (cid) => countDone(cid) >= totalLessons(cid);
const loadImg = (src) => new Promise((ok, bad) => { const im = new Image(); im.onload = () => ok(im); im.onerror = bad; im.src = src; });
function knightStandalone(mood) {
  const defs = KNIGHT_DEFS.match(/<defs>[\s\S]*<\/defs>/)[0];
  return knightSVG(mood).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="324" ').replace(/(<svg[^>]*>)/, `$1${defs}`);
}
async function drawCertificate(cid, nome) {
  await Promise.all(['800 90px "Baloo 2"', '900 30px Nunito', '700 30px Nunito'].map((f) => document.fonts.load(f).catch(() => null)));
  const W = 1600, H = 1131;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = '#FFFDF6'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#4A1A9E'; g.lineWidth = 28; g.strokeRect(14, 14, W - 28, H - 28);
  g.strokeStyle = '#FFC21A'; g.lineWidth = 4; g.strokeRect(48, 48, W - 96, H - 96);
  const [logo, knight, lang] = await Promise.all([
    loadImg('img/vanguard-logo-sm.png'),
    loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(knightStandalone('happy'))),
    loadImg(`img/${cid}.svg`)
  ]);
  g.drawImage(logo, W / 2 - 150, 78, 300, (300 * logo.height) / logo.width);
  g.textAlign = 'center';
  if ('letterSpacing' in g) g.letterSpacing = '8px';
  g.fillStyle = '#6A2BD9'; g.font = '900 30px Nunito';
  g.fillText('CERTIFICADO DE CONCLUSÃO', W / 2, 420);
  if ('letterSpacing' in g) g.letterSpacing = '0px';
  g.fillStyle = '#6C6488'; g.font = '700 30px Nunito';
  g.fillText('A equipe FTC Vanguard #37520 certifica que', W / 2, 480);
  let size = 96;
  g.font = `800 ${size}px "Baloo 2"`;
  while (g.measureText(nome).width > 1150 && size > 40) { size -= 4; g.font = `800 ${size}px "Baloo 2"`; }
  g.fillStyle = '#24183F';
  g.fillText(nome, W / 2, 592);
  g.strokeStyle = '#FFC21A'; g.lineWidth = 5;
  g.beginPath(); g.moveTo(W / 2 - 420, 622); g.lineTo(W / 2 + 420, 622); g.stroke();
  g.fillStyle = '#3F375C'; g.font = '700 32px Nunito';
  g.fillText(`concluiu a trilha ${TRACK_NAME[cid]} na VanCode,`, W / 2, 690);
  g.fillText(`com ${totalLessons(cid)} lições, do básico à robótica avançada.`, W / 2, 738);
  // data
  g.fillStyle = '#24183F'; g.font = '800 30px Nunito';
  g.fillText(new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }), 380, 930);
  g.strokeStyle = '#CFC8E3'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(220, 950); g.lineTo(540, 950); g.stroke();
  g.fillStyle = '#6C6488'; g.font = '700 22px Nunito';
  g.fillText('Data de conclusão', 380, 984);
  // selo dourado com o logo da linguagem
  const grad = g.createLinearGradient(0, 800, 0, 1000);
  grad.addColorStop(0, '#FFE27A'); grad.addColorStop(1, '#E5A300');
  g.fillStyle = grad; g.beginPath(); g.arc(W / 2, 900, 96, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(W / 2, 900, 72, 0, Math.PI * 2); g.fill();
  g.drawImage(lang, W / 2 - 46, 854, 92, 92);
  // Guardinho
  g.drawImage(knight, 1160, 760, 150, 162);
  g.fillStyle = '#24183F'; g.font = '800 28px "Baloo 2"';
  g.fillText('Guardinho', 1235, 958);
  g.fillStyle = '#6C6488'; g.font = '700 22px Nunito';
  g.fillText('mascote da VanCode', 1235, 988);
  g.fillStyle = '#A39CBC'; g.font = '700 20px Nunito';
  g.fillText(location.host || 'vancode-khaki.vercel.app', W / 2, H - 74);
  return cv;
}
function showCertificate(cid) {
  if (!trackDone(cid)) { toast('Complete todas as lições da trilha para ganhar o certificado!'); return; }
  const sugestao = S.name || (Cloud.user && Cloud.user.displayName) || '';
  openModal(`<div class="center-modal cert-modal">
    ${langBadge(cid, 'lg')}
    <h3>Certificado: ${COURSES[cid].name}</h3>
    <p>Como seu nome deve aparecer no certificado? (Ele não fica salvo em lugar nenhum.)</p>
    <input class="text-in" id="certName" maxlength="40" value="${esc(sugestao)}" aria-label="Nome no certificado">
    <div class="modal-btns"><button class="btn btn-gold" id="certGo">${icon('trophy')}Gerar certificado</button></div>
    <div id="certOut"></div>
  </div>`, 'modal-wide');
  $('#certGo').onclick = async () => {
    const nome = String($('#certName').value).replace(/\s+/g, ' ').trim().slice(0, 40) || 'Cavaleiro da VanCode';
    if (nickProibido(nome)) { toast('Esse nome não pode. Escolha outro, sem palavrões nem ofensas.', 'err'); return; }
    const btn = $('#certGo');
    btn.disabled = true;
    try {
      const cv = await drawCertificate(cid, nome);
      const blob = await new Promise((r) => cv.toBlob(r, 'image/png'));
      const url = URL.createObjectURL(blob);
      const arquivo = `certificado-vancode-${cid}.png`;
      const file = new File([blob], arquivo, { type: 'image/png' });
      const podeCompartilhar = navigator.canShare && navigator.canShare({ files: [file] });
      $('#certOut').innerHTML = `<img class="cert-preview" src="${url}" alt="Seu certificado da VanCode">
        <div class="modal-btns"><a class="btn btn-green" href="${url}" download="${arquivo}">Baixar imagem</a>${podeCompartilhar ? '<button class="btn btn-white" id="certShare">Compartilhar</button>' : ''}</div>`;
      const sh = $('#certShare');
      if (sh) sh.onclick = () => navigator.share({ files: [file], title: 'Meu certificado da VanCode' }).catch(() => {});
      confetti(1500);
    } catch (e) {
      console.warn('[VanCode] certificado:', e);
      toast('Não consegui gerar o certificado agora.', 'err');
    }
    btn.disabled = false;
  };
}

/* ---------- Painel de impacto (números para o portfólio da equipe) ---------- */
const impact = { data: null, loading: false, err: null };
const fmt = (n) => Number(n || 0).toLocaleString('pt-BR');
async function loadImpact(force) {
  if (!Cloud.enabled || impact.loading || (!force && impact.data)) return;
  impact.loading = true;
  try { impact.data = await Cloud.stats(); impact.err = null; }
  catch (e) { console.warn('[VanCode] impacto:', e); impact.err = e; }
  impact.loading = false;
  renderImpactBand();
  if (!$('#view-impact').hidden) renderImpact();
}
function renderImpactBand() {
  const el = $('#impactBand');
  const d = impact.data;
  if (!el) return;
  if (!d || !d.contas) { el.innerHTML = ''; return; }
  el.innerHTML = `<div class="impact card">
    <div class="imp-head"><span class="eyebrow">Impacto</span><h3>A VanCode até agora</h3></div>
    <div class="imp-nums">
      <div><b>${fmt(d.contas)}</b><small>cavaleiros com conta</small></div>
      <div><b>${fmt(d.licoes)}</b><small>lições concluídas</small></div>
      <div><b>${fmt(d.missoes)}</b><small>missões na Arena</small></div>
      <div><b>${fmt(d.xp)}</b><small>XP conquistado</small></div>
    </div>
    <a class="imp-link" href="#/impacto">Ver o painel completo ${icon('arrow')}</a>
  </div>`;
}
function impactText(d) {
  const dia = d.em.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  return `Até ${dia}, a VanCode, plataforma gratuita criada pela equipe FTC Vanguard #37520 para ensinar Python (LEGO SPIKE) e Java (FTC), já tinha ${fmt(d.contas)} estudantes cadastrados, que concluíram ${fmt(d.licoes)} lições e ${fmt(d.missoes)} missões de programação, somando ${fmt(d.xp)} XP.`;
}
function renderImpact() {
  const v = $('#view-impact');
  const d = impact.data;
  let corpo;
  if (!Cloud.configured() || Cloud.failed) corpo = '<div class="card rank-note"><div><h3>Sem conexão com o Firebase</h3><p>Os números aparecem aqui quando o login com Google estiver funcionando.</p></div></div>';
  else if (impact.err) corpo = '<div class="card rank-note"><div><h3>Não consegui carregar os números</h3><p>Tente de novo daqui a pouco.</p></div></div>';
  else if (!d) corpo = '<div class="rank-list skeleton"><div class="rank-row"></div><div class="rank-row"></div><div class="rank-row"></div></div>';
  else {
    const maxLiga = Math.max(1, ...d.ligas);
    corpo = `<div class="imp-big">
        <div class="card"><b>${fmt(d.contas)}</b><small>cavaleiros com conta</small></div>
        <div class="card"><b>${fmt(d.licoes)}</b><small>lições concluídas</small></div>
        <div class="card"><b>${fmt(d.missoes)}</b><small>missões na Arena</small></div>
        <div class="card"><b>${fmt(d.xp)}</b><small>XP conquistado</small></div>
      </div>
      <div class="card imp-ligas"><h3>Cavaleiros por liga</h3>
        ${LEAGUES.map((l, k) => `<div class="imp-liga"><span class="lg-dot" style="--lc:${l.color}">${icon('shield')}</span><b>${l.name}</b>
          <div class="bar"><div style="width:${(d.ligas[k] / maxLiga) * 100}%;--tc:${l.color}"></div></div><span class="imp-n">${fmt(d.ligas[k])}</span></div>`).join('')}
      </div>
      <div class="card imp-text"><h3>Para o portfólio de engenharia</h3>
        <p id="impText">${esc(impactText(d))}</p>
        <button class="btn btn-brand btn-sm" id="impCopy">Copiar texto</button>
        <p class="muted">Conta só quem entrou com Google: quem usa sem conta não aparece aqui. Números de ${d.em.toLocaleString('pt-BR')}.</p>
      </div>`;
  }
  v.innerHTML = `<div class="rank-page wrap">
    <div class="rank-head"><div><span class="eyebrow">Impacto</span><h1>A VanCode em números</h1>
      <p>Dados reais do Firebase. Ótimos para o portfólio e para os prêmios de divulgação do FTC (Reach, Connect e Inspire).</p></div>
      ${Cloud.enabled ? `<button class="btn btn-white btn-sm" id="impReload">${icon('reset')}Atualizar</button>` : ''}
    </div>
    ${corpo}
  </div>`;
  const cp = $('#impCopy');
  if (cp) cp.onclick = () => { navigator.clipboard.writeText(impactText(d)).then(() => toast('Texto copiado!'), () => toast('Não consegui copiar.', 'err')); };
  const rl = $('#impReload');
  if (rl) rl.onclick = () => { impact.data = null; renderImpact(); loadImpact(true); };
}

/* ---------- Instalar como app ---------- */
let installPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installPrompt = e; });
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone;

/* ---------- Perfil ---------- */
function showProfile() {
  const u = Cloud.user;
  const got = ACHIEVEMENTS.filter((a) => S.achievements[a.id]).length;
  const account = u
    ? `<div class="pf-account">
        ${avatar(S.name, u.uid, 'lg', u.photoURL)}
        <div class="pf-acc-text">
          <label for="pfName">Apelido no ranking</label>
          <input class="text-in" id="pfName" maxlength="20" value="${esc(S.name || '')}">
          <small class="muted">Conectado como ${esc(u.email || u.displayName || 'conta Google')} · ${leaguePill(S.xp)}</small>
        </div>
        <button class="btn btn-white btn-sm" id="pfLogout">${icon('logout')}Sair</button>
      </div>
      ${cargoOf(u.uid) ? `<div class="cargo-card ${cargoOf(u.uid).estilo === 'purple' ? 'purple' : ''}"><span class="cargo-ic">${icon('crown')}</span><div><small>Cargo especial</small><b>${esc(cargoOf(u.uid).titulo)}</b><p>${esc(cargoOf(u.uid).descricao || '')}</p></div></div>` : ''}`
    : `<div class="pf-account guest">
        ${knightSVG('happy', 'knight-md')}
        <div class="pf-acc-text">
          <h3>Crie sua conta</h3>
          <p>Entre com o Google para salvar seu progresso na nuvem, usar em qualquer computador e aparecer no ranking.</p>
          <button class="btn-google lg" data-login>${GOOGLE_G}<span>Entrar com Google</span></button>
        </div>
      </div>
      <label class="pf-local" for="pfName">Seu nome (só neste navegador) <input class="text-in" id="pfName" maxlength="20" placeholder="Seu nome ou apelido" value="${esc(S.name || '')}"></label>`;

  openModal(`<div class="profile">
    ${account}
    <div class="pf-stats">
      <div>${icon('bolt')}<b>${S.xp}</b><small>XP total</small></div>
      <div>${icon('flame')}<b>${currentStreak()}</b><small>dias de ofensiva</small></div>
      <div>${langBadge('python', 'mini')}<b>${countDone('python')}/${totalLessons('python')}</b><small>lições Python</small></div>
      <div>${langBadge('java', 'mini')}<b>${countDone('java')}/${totalLessons('java')}</b><small>lições Java</small></div>
      <div>${icon('gamepad')}<b>${arenaCount()}/${ARENA_LEVELS.length}</b><small>missões da Arena</small></div>
      <div>${icon('target')}<b>${dailyXP()}/${S.goal || 30}</b><small>meta de hoje</small></div>
    </div>
    <h3>Conquistas <small>${got}/${ACHIEVEMENTS.length}</small></h3>
    <div class="ach-grid">${ACHIEVEMENTS.map((a) => achHTML(a, !!S.achievements[a.id])).join('')}</div>
    ${['python', 'java'].some(trackDone) ? `<h3>Certificados</h3><div class="pf-certs">${['python', 'java'].filter(trackDone).map((c) => `<button class="btn btn-gold btn-sm" data-cert="${c}">${icon('trophy')}Certificado de ${COURSES[c].name}</button>`).join('')}</div>` : ''}
    <h3>Configurações</h3>
    <div class="pf-settings">
      ${installPrompt ? `<button class="btn btn-brand btn-sm" id="pfInstall">${icon('play')}Instalar a VanCode como app</button>` : (isIOS() ? '<p class="muted">No iPhone: toque em Compartilhar e depois em <b>Adicionar à Tela de Início</b> para ter a VanCode como app.</p>' : '')}
      <label class="switch"><input type="checkbox" id="pfSound" ${Sound.muted ? '' : 'checked'}><span></span>Sons</label>
      <label class="switch"><input type="checkbox" id="pfMentor" ${S.mentor ? 'checked' : ''}><span></span>Modo mentor <small>libera todas as lições, para professores e apresentações</small></label>
      <button class="btn btn-white btn-sm" id="pfReset">Apagar meu progresso</button>
      ${u ? '<button class="btn btn-white btn-sm danger" id="pfDelete">Apagar minha conta</button>' : ''}
    </div>
    <p class="legal-note"><a href="#/privacidade" data-close>Política de privacidade</a></p>
  </div>`, 'modal-wide');

  $('#pfName').addEventListener('change', (e) => {
    const n = cleanName(e.target.value);
    if (u && !n) { e.target.value = S.name; return; }
    if (nickProibido(n)) { e.target.value = S.name; toast('Esse apelido não pode. Escolha outro, sem palavrões nem ofensas.', 'err'); return; }
    S.name = n;
    save();
    renderAccount();
  });
  $('#pfSound').addEventListener('change', () => { Sound.toggle(); Sound.play('tap'); });
  $('#pfMentor').addEventListener('change', (e) => { S.mentor = e.target.checked; save(); route(); });
  const lo = $('#pfLogout');
  if (lo) lo.addEventListener('click', () => { closeModal(); Cloud.signOut(); });
  const inst = $('#pfInstall');
  if (inst) inst.onclick = async () => { installPrompt.prompt(); await installPrompt.userChoice.catch(() => null); installPrompt = null; closeModal(); };
  const del = $('#pfDelete');
  if (del) del.addEventListener('click', askDeleteAccount);
  $('#pfReset').addEventListener('click', () => {
    if (!confirm('Tem certeza? Isso apaga XP, lições e conquistas.')) return;
    const keep = { uid: S.uid, name: S.name };
    S = Object.assign(freshState(), keep);
    save();
    Store.remove('vg_arena_code');
    closeModal();
    route();
    toast('Progresso apagado. Bora começar de novo!');
  });
}

/* ---------- Eventos globais ---------- */
function initEvents() {
  window.addEventListener('hashchange', route);

  document.addEventListener('click', (e) => {
    const t = e.target;
    const start = t.closest('[data-start]');
    if (start) {
      const [cid, i] = start.dataset.start.split(':');
      if (isUnlocked(cid, +i)) startLesson(cid, +i);
      return;
    }
    if (t.closest('[data-login]')) { Cloud.signIn(); return; }
    if (t.closest('[data-profile]') || t.closest('#statStreak') || t.closest('#statXp')) { showProfile(); return; }
    if (t.closest('[data-rank-reload]')) { showRanking(true); return; }
    const rt = t.closest('[data-rtab]');
    if (rt) { rankTab = rt.dataset.rtab; Store.set('vg_rank_tab', rankTab); showRanking(); return; }
    const cert = t.closest('[data-cert]');
    if (cert) { showCertificate(cert.dataset.cert); return; }
    const node = t.closest('.node');
    if (node) { showPop(node); return; }
    const practice = t.closest('[data-practice]');
    if (practice) { startPractice(practice.dataset.practice); return; }
    const skip = t.closest('[data-skip]');
    if (skip) { const [cid, ui] = skip.dataset.skip.split(':'); confirmSkip(cid, +ui); return; }
    const guide = t.closest('[data-guide]');
    if (guide) { showGuide(currentPathCid, +guide.dataset.guide); return; }
    if (t.closest('[data-close]')) { closeModal(); return; }
    const myth = t.closest('.myth');
    if (myth) { myth.classList.toggle('flip'); Sound.play('tap'); return; }
    if (!t.closest('.pop')) closePop();
  });

  document.addEventListener('keydown', (e) => {
    const modal = $('#modal');
    if (!modal.hidden) {
      if (e.key === 'Escape' && !modal.dataset.locked) closeModal();
      return;
    }
    if ($('#lesson').hidden) return;
    if (e.key === 'Escape') { askQuit(); return; }
    if (e.key === 'Enter') {
      const b = $('.ls-main');
      if (b && !b.disabled) { e.preventDefault(); b.click(); }
      return;
    }
    if (/^[1-9]$/.test(e.key) && LS.mode === 'answer' && !(e.target && e.target.matches('input, textarea'))) {
      const n = +e.key - 1;
      const items = LS.cur.t === 'choice' ? $$('.opt') : (LS.cur.t === 'fill' || LS.cur.t === 'order') ? $$('.bank .chip') : [];
      if (items[n]) items[n].click();
    }
  });
}

/* ---------- Início do app ---------- */
function init() {
  fillArt();
  $$('pre.code[data-lang]').forEach((pre) => { pre.innerHTML = highlight(pre.textContent, pre.dataset.lang); });
  $$('[data-count="lessons"]').forEach((el) => { el.textContent = totalLessons('python') + totalLessons('java'); });
  $$('[data-count="arena"]').forEach((el) => { el.textContent = ARENA_LEVELS.length; });
  initBVC();
  initEvents();
  renderStats();
  renderAccount();
  route();
  HeroDemo.init();
  Cloud.init();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => null);
}

init();
