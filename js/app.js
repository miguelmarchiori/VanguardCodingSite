/* =========================================================
   Vanguard Code · app principal
   Estado do aluno, rotas, mapa da trilha, lições, perfil.
   ========================================================= */
'use strict';

/* ---------- Estado salvo no navegador ---------- */
const DEFAULT_STATE = {
  xp: 0, streak: 0, lastDay: null, daily: { day: null, xp: 0 },
  done: {}, perfect: 0, lessons: 0, arena: {}, achievements: {},
  name: '', mentor: false, goal: 30
};
let S = Object.assign({}, DEFAULT_STATE, Store.get('vg_state', {}));
S.daily = S.daily || { day: null, xp: 0 };
S.arena = S.arena || {};
S.done = S.done || {};
S.achievements = S.achievements || {};

function save() { Store.set('vg_state', S); renderStats(); }

const dayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const yesterdayStr = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayStr(d); };
const currentStreak = () => (S.lastDay === dayStr() || S.lastDay === yesterdayStr()) ? S.streak : 0;
const dailyXP = () => (S.daily.day === dayStr() ? S.daily.xp : 0);

function addXP(n) {
  const t = dayStr();
  S.xp += n;
  if (S.daily.day !== t) S.daily = { day: t, xp: 0 };
  S.daily.xp += n;
  if (S.lastDay !== t) {
    const before = currentStreak();
    S.streak = S.lastDay === yesterdayStr() ? S.streak + 1 : 1;
    S.lastDay = t;
    if (S.streak > 1 && S.streak > before) setTimeout(() => toast(`🔥 Ofensiva de <b>${S.streak} dias</b>! Continue assim!`, 'fire'), 600);
  }
  save();
}

/* ---------- Trilhas ---------- */
const FLAT = {};
Object.keys(COURSES).forEach((cid) => {
  FLAT[cid] = [];
  COURSES[cid].units.forEach((u, ui) => u.lessons.forEach((l, li) => FLAT[cid].push(Object.assign({}, l, { unit: ui, li, last: li === u.lessons.length - 1 }))));
});
const totalLessons = (cid) => FLAT[cid].length;
const isDone = (cid, i) => !!S.done[cid + '-' + i];
const countDone = (cid) => cid ? FLAT[cid].filter((_, i) => isDone(cid, i)).length : countDone('python') + countDone('java');
const isUnlocked = (cid, i) => S.mentor || i === 0 || isDone(cid, i - 1);
const nextLesson = (cid) => FLAT[cid].findIndex((_, i) => !isDone(cid, i));
const arenaCount = () => ARENA_LEVELS.filter((_, i) => (S.arena['python-' + i] || S.arena['java-' + i])).length;

/* ---------- Conquistas ---------- */
const ACHIEVEMENTS = [
  { id: 'first', icon: '👣', name: 'Primeiro passo', desc: 'Complete sua primeira lição', test: () => countDone() >= 1 },
  { id: 'perfect', icon: '💯', name: 'Perfeição', desc: 'Termine uma lição sem errar nada', test: () => S.perfect >= 1 },
  { id: 'both', icon: '👋', name: 'Tchau, blocos!', desc: 'Complete uma lição de Python e uma de Java', test: () => countDone('python') >= 1 && countDone('java') >= 1 },
  { id: 'py3', icon: '🐍', name: 'Cobrinha esperta', desc: 'Complete 3 lições de Python', test: () => countDone('python') >= 3 },
  { id: 'java3', icon: '☕', name: 'Café quentinho', desc: 'Complete 3 lições de Java', test: () => countDone('java') >= 3 },
  { id: 'pyall', icon: '🏆', name: 'Mestre Python', desc: 'Complete toda a trilha de Python', test: () => countDone('python') >= totalLessons('python') },
  { id: 'javaall', icon: '🥇', name: 'Mestre Java', desc: 'Complete toda a trilha de Java', test: () => countDone('java') >= totalLessons('java') },
  { id: 'streak3', icon: '🔥', name: 'Pegando fogo', desc: 'Estude 3 dias seguidos', test: () => currentStreak() >= 3 },
  { id: 'xp100', icon: '⚡', name: 'Cem de energia', desc: 'Junte 100 XP', test: () => S.xp >= 100 },
  { id: 'arena3', icon: '🎮', name: 'Piloto de teste', desc: 'Passe 3 fases da Arena', test: () => arenaCount() >= 3 },
  { id: 'stars', icon: '🌟', name: 'Código enxuto', desc: 'Ganhe ⭐⭐ em uma fase da Arena', test: () => Object.values(S.arena).some((v) => v >= 2) },
  { id: 'arenaall', icon: '👑', name: 'Rei da Arena', desc: 'Passe todas as fases da Arena', test: () => arenaCount() >= ARENA_LEVELS.length }
];
function checkAchievements() {
  const got = [];
  ACHIEVEMENTS.forEach((a) => {
    if (!S.achievements[a.id] && a.test()) { S.achievements[a.id] = dayStr(); got.push(a); }
  });
  if (got.length) save();
  return got;
}
function afterReward() {
  checkAchievements().forEach((a, k) => setTimeout(() => toast(`<span class="t-ic">${a.icon}</span><span><small>Nova conquista!</small><b>${a.name}</b></span>`, 'ach'), 400 + k * 700));
}

/* ---------- Barra do topo ---------- */
function renderStats() {
  const st = currentStreak();
  $('#statStreak .sv').textContent = st;
  $('#statStreak').classList.toggle('off', st === 0);
  $('#statXp .sv').textContent = S.xp;
}

/* ---------- Rotas ---------- */
function route() {
  const parts = (location.hash || '#/').replace(/^#\/?/, '').split('/');
  const page = parts[0] || '';
  $$('.view').forEach((v) => { v.hidden = true; });
  $$('.nav a').forEach((a) => a.classList.remove('on'));
  closePop();
  if (Arena.running) Arena.stop();

  if (page === 'trilha' && COURSES[parts[1]]) {
    showPath(parts[1]);
    $(`.nav a[data-nav="${parts[1]}"]`).classList.add('on');
    document.title = `Trilha ${COURSES[parts[1]].name} · Vanguard Code`;
    window.scrollTo(0, 0);
  } else if (page === 'arena') {
    $('#view-arena').hidden = false;
    Arena.show();
    $('.nav a[data-nav="arena"]').classList.add('on');
    document.title = 'Arena do Bip · Vanguard Code';
    window.scrollTo(0, 0);
  } else {
    showHome();
    document.title = 'Vanguard Code · Aprenda Python e Java para robôs';
    const target = { porque: '#porque', sobre: '#sobre', trilhas: '#trilhas' }[page];
    if (target) {
      $(`.nav a[data-nav="${page}"]`)?.classList.add('on');
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
    const l = FLAT[cid][i];
    cc.innerHTML = `<div class="continue card">
      <span class="cont-ic">${l.icon}</span>
      <div class="cont-text"><small>${S.name ? `Oi, ${esc(S.name)}! ` : ''}Continue de onde parou</small><b>${COURSES[cid].emoji} ${COURSES[cid].name} · Lição ${i + 1}: ${l.title}</b></div>
      <button class="btn btn-green" data-start="${cid}:${i}">Continuar</button>
    </div>`;
  } else cc.innerHTML = '';
}

/* ---------- Blocos x Código (página inicial) ---------- */
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
let bvcLang = 'python', bvcTimer = null, bvcStep = 0, bvcAuto = true;
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
    bvcTimer = setInterval(() => {
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
    let nodes = '';
    u.lessons.forEach((l) => {
      const i = gi++;
      const lesson = FLAT[cid][i];
      let st = isDone(cid, i) ? 'done' : (i === cur ? 'current' : (isUnlocked(cid, i) ? 'open' : 'locked'));
      const icon = st === 'locked' ? '🔒' : (st === 'done' ? (lesson.last ? '🏆' : '✓') : (lesson.last ? '🏆' : l.icon));
      nodes += `<div class="node-row" style="--off:${ZIGZAG[i % 8]}">
        ${st === 'current' ? '<div class="start-bubble">COMEÇAR</div>' : ''}
        <button class="node ${st} ${lesson.last ? 'boss' : ''}" data-i="${i}" aria-label="Lição ${i + 1}: ${esc(l.title)}${st === 'locked' ? ' (bloqueada)' : ''}">
          <span class="node-ic">${icon}</span>
        </button>
        <span class="node-label">${esc(l.title)}</span>
      </div>`;
    });
    units += `<section class="unit" style="--uc:${u.color}">
      <div class="unit-banner">
        <div><small>Unidade ${ui + 1}</small><h2>${u.name}</h2><p>${u.desc}</p></div>
        <button class="guide-btn" data-guide="${ui}" title="Resumo dos conceitos desta unidade">📖 <span>Guia</span></button>
      </div>
      <div class="nodes">${nodes}
        <div class="unit-bip ${ui % 2 ? 'left' : 'right'}" aria-hidden="true">${bipSVG(ui === 2 ? 'wow' : 'happy')}</div>
      </div>
    </section>`;
  });

  const goal = S.goal || 30, dxp = dailyXP();
  const pct = Math.min(1, dxp / goal);
  const R = 34, CIRC = 2 * Math.PI * R;

  v.innerHTML = `<div class="path-page wrap" style="--tc:${C.color}">
    <div class="path-main">
      <div class="course-hero ${cid}">
        <div class="ch-icon">${C.emoji}</div>
        <div class="ch-text">
          <small>Trilha</small>
          <h1>${C.name} <span>para ${C.robot}</span></h1>
          <p>${C.desc}</p>
          <div class="ch-prog"><div class="bar"><div style="width:${(done / tot) * 100}%"></div></div><span>${done}/${tot} lições</span></div>
        </div>
      </div>
      ${units}
      <div class="path-end">${done === tot ? `${bipSVG('happy', 'bip-md')}<h3>Trilha completa! 🎉</h3><p>Você é demais! Que tal tentar a trilha de ${COURSES[other].emoji} ${COURSES[other].name} ou os desafios da Arena?</p>` : `<span class="flag-end">🏁</span><p>Complete todas as lições para virar <b>Mestre ${C.name}</b>!</p>`}</div>
    </div>
    <aside class="path-side">
      <div class="card side-card goal-card">
        <svg viewBox="0 0 80 80" class="ring"><circle cx="40" cy="40" r="${R}" class="ring-bg"/><circle cx="40" cy="40" r="${R}" class="ring-fg" stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC * (1 - pct)}"/></svg>
        <div><h4>Meta diária</h4><p><b>${dxp}</b> / ${goal} XP hoje</p><small>${pct >= 1 ? 'Meta batida! 🎉' : 'Uma lição dá 10 a 15 XP'}</small></div>
      </div>
      <div class="card side-card streak-card ${currentStreak() ? '' : 'off'}">
        <span class="big-ic">🔥</span>
        <div><h4>${currentStreak()} dia${currentStreak() === 1 ? '' : 's'} de ofensiva</h4><small>${currentStreak() ? 'Volte amanhã para não perder!' : 'Faça uma lição hoje para começar!'}</small></div>
      </div>
      <a class="card side-card switch-card" href="#/trilha/${other}">
        <span class="big-ic">${COURSES[other].emoji}</span>
        <div><h4>Trilha ${COURSES[other].name}</h4><small>${countDone(other)}/${totalLessons(other)} lições · para ${COURSES[other].robot}</small></div>
        <span class="arrow">→</span>
      </a>
      <a class="card side-card arena-card" href="#/arena">
        <span class="big-ic">🎮</span>
        <div><h4>Arena do Bip</h4><small>Digite código e veja o robô andar!</small></div>
        <span class="arrow">→</span>
      </a>
    </aside>
  </div>`;

  // centraliza na lição atual
  const curNode = $('.node.current', v);
  if (curNode && cur > 0) setTimeout(() => curNode.scrollIntoView({ block: 'center', behavior: 'auto' }), 20);
}

/* popover da lição */
function closePop() { $$('.pop').forEach((p) => p.remove()); }
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
    ? `<b>${esc(l.title)}</b><small>🔒 Termine a lição anterior para liberar esta!</small>`
    : `<b>${esc(l.title)}</b><small>Lição ${i + 1} de ${totalLessons(cid)} · ${nEx} exercícios${l.last ? ' · 🏆 desafio' : ''}</small>
       <button class="btn ${st === 'done' ? 'btn-white' : 'btn-green'}" data-start="${cid}:${i}">${st === 'done' ? 'Revisar · +5 XP' : 'Começar · +15 XP'}</button>`;
  node.parentElement.appendChild(pop);
  Sound.play('tap');
}

/* guia da unidade */
function showGuide(cid, ui) {
  const C = COURSES[cid];
  const u = C.units[ui];
  const cards = u.lessons.flatMap((l) => l.steps.filter((s) => s.t === 'teach').map((s) => `
    <div class="guide-item"><h4>${s.title}</h4><p>${s.text}</p>${s.code ? codeBlock(s.code, C.lang) : ''}${s.tip ? `<p class="guide-tip">💡 ${s.tip}</p>` : ''}</div>`)).join('');
  openModal(`<div class="guide" style="--uc:${u.color}"><small>Unidade ${ui + 1} · ${C.emoji} ${C.name}</small><h2>📖 Guia: ${u.name}</h2><p class="guide-sub">Tudo que você aprende nesta unidade, num lugar só. Ótimo para consultar depois!</p>${cards}</div>`, 'modal-wide');
}

/* ---------- Lição ---------- */
const PRAISE = ['Mandou bem!', 'Isso aí!', 'Incrível!', 'Código perfeito!', 'Show de bola!', 'Você é fera!', 'Uhul! Acertou!', 'Que programador(a)!'];
const OOPS = ['Quase lá!', 'Opa, não foi dessa vez!', 'Errar faz parte!', 'Hmm, quase!'];
const LS = {};

function startLesson(cid, i) {
  closePop();
  closeModal();
  const lesson = FLAT[cid][i];
  Object.assign(LS, {
    cid, i, lesson, lang: COURSES[cid].lang,
    queue: lesson.steps.map((s, k) => Object.assign({ k }, s)),
    pos: 0, hearts: 5, mistakes: 0, solved: 0, total: lesson.steps.length,
    t0: Date.now(), review: isDone(cid, i), mode: 'answer', ok: false, answer: null
  });
  const el = $('#lesson');
  el.innerHTML = `
    <div class="ls-top">
      <button class="ls-close" aria-label="Sair da lição">✕</button>
      <div class="ls-bar" role="progressbar" aria-label="Progresso da lição"><div class="ls-fill"></div></div>
      <div class="ls-hearts" title="Vidas">❤️ <span>5</span></div>
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
  openModal(`<div class="quit">${bipSVG('sad', 'bip-md')}<h3>Espera! Quer mesmo sair?</h3><p>Se sair agora, você perde o progresso desta lição.</p>
    <div class="quit-btns"><button class="btn btn-green" data-close>Continuar aprendendo</button><button class="btn btn-white" id="quitYes">Sair</button></div></div>`);
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
  const foot = $('.ls-foot');
  foot.className = 'ls-foot';
  $('.ls-fb').innerHTML = '';
  setProgress();
  const inner = $('.ls-inner');
  const lang = LS.lang;
  const retry = LS.pos >= LS.total ? '<span class="retry-tag">🔁 Vamos de novo!</span>' : '';
  let html = '';

  if (s.t === 'teach') {
    html = `<div class="step teach">
      <span class="badge-new">✨ Novo conceito</span>
      <h2 class="q">${s.title}</h2>
      <div class="teach-text">${s.text}</div>
      ${s.code ? codeBlock(s.code, lang) : ''}
      ${s.tip ? `<div class="bip-tip">${bipSVG('happy', 'bip-sm')}<div class="bubble">${s.tip}</div></div>` : ''}
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
      <div class="answer-zone" aria-label="Seu código"><span class="az-ph">Toque nas linhas abaixo na ordem certa 👇</span></div>
      <div class="bank lines">${sh.map((ln, k) => `<button class="chip line" data-k="${k}">${highlight(ln, lang)}</button>`).join('')}</div>
    </div>`;
    setMain('Verificar', false);
  } else if (s.t === 'type') {
    html = `<div class="step">${retry}
      <span class="badge-new badge-type">⌨️ Digite o código</span>
      <h2 class="q">${s.q}</h2>
      ${s.code ? codeBlock(s.code, lang) : ''}
      <div class="type-wrap"><span class="type-prompt">${lang === 'java' ? '☕' : '🐍'}</span><input class="type-in" type="text" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" placeholder="${esc(s.ph || 'Digite aqui...')}" aria-label="Sua resposta"></div>
      <p class="type-hint">Dica: aperte <kbd>Enter</kbd> para verificar. Espaços extras não tem problema!</p>
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
        : '<span class="az-ph">Toque nas linhas abaixo na ordem certa 👇</span>';
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
    if (!LS.ok) LS.queue.push(LS.cur);
    else LS.solved++;
    if (LS.hearts <= 0) return failLesson();
    return advance();
  }
  if (LS.mode === 'result') return closeLesson();
  if (LS.mode === 'failed') return startLesson(LS.cid, LS.i);
}

function advance() {
  LS.pos++;
  if (LS.pos >= LS.queue.length) return finishLesson();
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
    fb.innerHTML = `<div class="fb-title">${bipSVG('happy', 'bip-xs')} ${pick(PRAISE)}</div>${s.why ? `<div class="fb-why">${s.why}</div>` : ''}`;
    setMain('Continuar', true, 'btn-green');
    Sound.play('ok');
  } else {
    LS.hearts--;
    LS.mistakes++;
    foot.classList.add('bad');
    fb.innerHTML = `<div class="fb-title">${bipSVG('sad', 'bip-xs')} ${pick(OOPS)}</div>
      ${extra ? `<div class="fb-why">${extra}</div>` : ''}
      <div class="fb-right"><small>Resposta certa:</small>${rightIsCode ? `<pre class="code mini">${highlight(right, LS.lang)}</pre>` : `<b>${esc(right)}</b>`}</div>
      ${s.why ? `<div class="fb-why">${s.why}</div>` : ''}
      ${LS.hearts > 0 ? '<div class="fb-small">Essa pergunta vai voltar no final para você tentar de novo. 😉</div>' : ''}`;
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
  const key = LS.cid + '-' + LS.i;
  const firstTime = !S.done[key];
  S.done[key] = true;
  S.lessons = (S.lessons || 0) + 1;
  if (perfect) S.perfect = (S.perfect || 0) + 1;
  addXP(xp);
  const newAch = checkAchievements();
  const secs = Math.max(1, Math.round((Date.now() - LS.t0) / 1000));
  const graded = LS.lesson.steps.filter((s) => s.t !== 'teach').length;
  const acc = Math.round((100 * graded) / (graded + LS.mistakes));
  const C = COURSES[LS.cid];
  const nextI = LS.i + 1 < totalLessons(LS.cid) ? LS.i + 1 : -1;
  const unitDone = LS.lesson.last && firstTime;

  $('.ls-top').classList.add('hide');
  $('.ls-fill').style.width = '100%';
  $('.ls-inner').innerHTML = `<div class="result">
    <div class="res-bip">${bipSVG('happy', 'bip-lg')}</div>
    <h1>${unitDone ? 'Unidade completa! 🏆' : 'Lição completa! 🎉'}</h1>
    <p class="res-sub">${S.name ? `Mandou bem, ${esc(S.name)}!` : 'Mandou muito bem!'} ${perfect ? 'Nenhum erro, uau! 🤩' : 'Cada erro te deixou mais esperto(a). 🧠'}</p>
    <div class="res-cards">
      <div class="rc rc-xp"><small>XP ganho</small><b>⚡ ${xp}</b></div>
      <div class="rc rc-acc"><small>${perfect ? 'Perfeito!' : 'Precisão'}</small><b>🎯 ${acc}%</b></div>
      <div class="rc rc-time"><small>Tempo</small><b>⏱️ ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</b></div>
    </div>
    ${newAch.length ? `<div class="res-ach"><h3>Nova${newAch.length > 1 ? 's' : ''} conquista${newAch.length > 1 ? 's' : ''}!</h3>${newAch.map((a) => `<div class="ach got"><span>${a.icon}</span><div><b>${a.name}</b><small>${a.desc}</small></div></div>`).join('')}</div>` : ''}
    ${nextI >= 0 && firstTime ? `<p class="res-next">Próxima: <b>${FLAT[LS.cid][nextI].icon} ${FLAT[LS.cid][nextI].title}</b> foi desbloqueada!</p>` : ''}
    ${nextI < 0 && firstTime ? `<p class="res-next">Você completou a trilha de ${C.emoji} ${C.name}! Você é oficialmente <b>Mestre ${C.name}</b>! 👑</p>` : ''}
  </div>`;
  $('.ls-foot').className = 'ls-foot';
  $('.ls-fb').innerHTML = nextI >= 0 && firstTime ? `<button class="btn btn-white" id="goNext">Próxima lição →</button>` : '';
  setMain('Continuar', true);
  const goNext = $('#goNext');
  if (goNext) goNext.onclick = () => startLesson(LS.cid, nextI);
  Sound.play('win');
  confetti();
}

function failLesson() {
  LS.mode = 'failed';
  $('.ls-inner').innerHTML = `<div class="result fail">
    <div class="res-bip">${bipSVG('sad', 'bip-lg')}</div>
    <h1>Acabaram as vidas 💔</h1>
    <p class="res-sub">Tudo bem! Até programadores profissionais erram todo dia. O segredo é tentar de novo, e agora você já sabe mais do que antes. 💪</p>
  </div>`;
  $('.ls-foot').className = 'ls-foot';
  $('.ls-fb').innerHTML = '<button class="btn btn-white" id="failExit">Sair</button>';
  $('#failExit').onclick = closeLesson;
  setMain('Tentar de novo', true);
  Sound.play('fail');
}

/* ---------- Perfil ---------- */
function showProfile() {
  const got = ACHIEVEMENTS.filter((a) => S.achievements[a.id]).length;
  openModal(`<div class="profile">
    <div class="pf-head">
      ${bipSVG('happy', 'bip-md')}
      <div>
        <label for="pfName">Como você se chama?</label>
        <input id="pfName" maxlength="20" placeholder="Seu nome ou apelido" value="${esc(S.name || '')}">
      </div>
    </div>
    <div class="pf-stats">
      <div><span>⚡</span><b>${S.xp}</b><small>XP total</small></div>
      <div><span>🔥</span><b>${currentStreak()}</b><small>dias de ofensiva</small></div>
      <div><span>🐍</span><b>${countDone('python')}/${totalLessons('python')}</b><small>lições Python</small></div>
      <div><span>☕</span><b>${countDone('java')}/${totalLessons('java')}</b><small>lições Java</small></div>
      <div><span>🎮</span><b>${arenaCount()}/${ARENA_LEVELS.length}</b><small>fases da Arena</small></div>
      <div><span>🎯</span><b>${dailyXP()}/${S.goal || 30}</b><small>meta de hoje</small></div>
    </div>
    <h3>Conquistas <small>${got}/${ACHIEVEMENTS.length}</small></h3>
    <div class="ach-grid">${ACHIEVEMENTS.map((a) => `<div class="ach ${S.achievements[a.id] ? 'got' : ''}" title="${esc(a.desc)}"><span>${a.icon}</span><div><b>${a.name}</b><small>${a.desc}</small></div></div>`).join('')}</div>
    <h3>Configurações</h3>
    <div class="pf-settings">
      <label class="switch"><input type="checkbox" id="pfSound" ${Sound.muted ? '' : 'checked'}><span></span> 🔊 Sons</label>
      <label class="switch"><input type="checkbox" id="pfMentor" ${S.mentor ? 'checked' : ''}><span></span> 🧑‍🏫 Modo mentor <small>(libera todas as lições, para professores e apresentações)</small></label>
      <button class="btn btn-white btn-sm" id="pfReset">🗑️ Apagar meu progresso</button>
    </div>
  </div>`, 'modal-wide');
  $('#pfName').addEventListener('input', (e) => { S.name = e.target.value.trim().slice(0, 20); save(); });
  $('#pfSound').addEventListener('change', () => { Sound.toggle(); Sound.play('tap'); });
  $('#pfMentor').addEventListener('change', (e) => { S.mentor = e.target.checked; save(); route(); });
  $('#pfReset').addEventListener('click', () => {
    if (!confirm('Tem certeza? Isso apaga XP, lições e conquistas deste navegador.')) return;
    S = JSON.parse(JSON.stringify(DEFAULT_STATE));
    save();
    Store.remove('vg_arena_code');
    closeModal();
    route();
    toast('Progresso apagado. Bora começar de novo! 🚀');
  });
}

/* ---------- Eventos globais ---------- */
function initEvents() {
  window.addEventListener('hashchange', route);

  document.addEventListener('click', (e) => {
    const start = e.target.closest('[data-start]');
    if (start) {
      const [cid, i] = start.dataset.start.split(':');
      if (isUnlocked(cid, +i)) startLesson(cid, +i);
      return;
    }
    const node = e.target.closest('.node');
    if (node) { showPop(node); return; }
    const guide = e.target.closest('[data-guide]');
    if (guide) { showGuide(currentPathCid, +guide.dataset.guide); return; }
    if (e.target.closest('[data-close]')) { closeModal(); return; }
    const myth = e.target.closest('.myth');
    if (myth) { myth.classList.toggle('flip'); Sound.play('tap'); return; }
    if (!e.target.closest('.pop')) closePop();
  });

  $('#btnProfile').addEventListener('click', showProfile);
  $('#statStreak').addEventListener('click', showProfile);
  $('#statXp').addEventListener('click', showProfile);

  document.addEventListener('keydown', (e) => {
    if (!$('#modal').hidden) {
      if (e.key === 'Escape') closeModal();
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
      const items = LS.cur.t === 'choice' ? $$('.opt') : LS.cur.t === 'fill' ? $$('.bank .chip') : LS.cur.t === 'order' ? $$('.bank .chip') : [];
      if (items[n]) items[n].click();
    }
  });
}

/* ---------- Início do app ---------- */
function init() {
  fillBips();
  $$('pre.code[data-lang]').forEach((pre) => { pre.innerHTML = highlight(pre.textContent, pre.dataset.lang); });
  $('[data-count="lessons"]').textContent = totalLessons('python') + totalLessons('java');
  $('[data-count="arena"]').textContent = ARENA_LEVELS.length;
  $('[data-count="ach"]').textContent = ACHIEVEMENTS.length;
  initBVC();
  initEvents();
  renderStats();
  route();
}

init();
