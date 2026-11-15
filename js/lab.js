/* =========================================================
   VanCode · Laboratório de Python
   Roda Python 3 de verdade no navegador (Pyodide), dentro de
   um web worker: se o código travar num loop infinito, a página
   continua respondendo e o botão Parar funciona.
   ========================================================= */
'use strict';

const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
const LAB_TIMEOUT = 15000;        // para o programa depois de 15 s
const LAB_MAX_LINES = 3000;       // e se imprimir linhas demais

const LAB_WORKER_SRC = `
importScripts('${PYODIDE_URL}pyodide.js');
let py = null, linhas = 0, estourou = false, buf = [], ultimo = 0;
/* junta as linhas e manda em pacotes (bem mais rápido que uma mensagem por linha) */
const envia = () => { ultimo = Date.now(); if (buf.length) { postMessage({ t: 'out', s: buf.join('\\n') + '\\n' }); buf = []; } };
const escreve = (s) => {
  if (estourou) throw new Error('VANCODE_LIMITE');
  if (++linhas > ${LAB_MAX_LINES}) { estourou = true; throw new Error('VANCODE_LIMITE'); }
  buf.push(s);
  if (buf.length >= 200 || Date.now() - ultimo > 60) envia();
};
const pronto = loadPyodide({ indexURL: '${PYODIDE_URL}' }).then((p) => {
  py = p;
  py.setStdout({ batched: escreve });
  py.setStderr({ batched: escreve });
  py.runPython([
    'import builtins',
    '_vc_fila = []',
    'def _vc_input(msg=""):',
    '    if not _vc_fila:',
    '        raise EOFError("VANCODE_SEM_ENTRADA")',
    '    r = str(_vc_fila.pop(0))',
    '    print(str(msg) + r)',
    '    return r',
    'builtins.input = _vc_input'
  ].join('\\n'));
  postMessage({ t: 'ready' });
}).catch((e) => postMessage({ t: 'falha', msg: String(e) }));

onmessage = async (e) => {
  await pronto;
  if (!py) return;
  linhas = 0; estourou = false; buf = []; ultimo = Date.now();
  py.globals.set('_vc_novas', py.toPy(e.data.entradas));
  py.runPython('_vc_fila[:] = list(_vc_novas)');
  const g = py.runPython('dict(__name__="__main__")');
  try {
    py.runPython(e.data.code, { globals: g, filename: 'laboratorio.py' });
    py.runPython('import sys; sys.stdout.flush(); sys.stderr.flush()');
    envia();
    postMessage(estourou ? { t: 'erro', msg: 'VANCODE_LIMITE' } : { t: 'fim' });
  } catch (err) {
    try { py.runPython('import sys; sys.stdout.flush()'); } catch (x) { /* ignore */ }
    envia();
    postMessage({ t: 'erro', msg: estourou ? 'VANCODE_LIMITE' : String((err && err.message) || err) });
  } finally {
    g.destroy();
  }
};
`;

/* explicações em português para os erros mais comuns */
const LAB_ERROS = {
  SyntaxError: 'Tem algo escrito errado nesta linha: confira os dois pontos <code>:</code>, os parênteses e as aspas.',
  IndentationError: 'Os espaços no começo da linha estão errados. Dentro de um <code>if</code>, <code>for</code>, <code>while</code> ou <code>def</code>, use 4 espaços.',
  NameError: 'Esse nome não existe. Confira se digitou certinho (maiúsculas contam!) ou se criou a variável antes de usar.',
  TypeError: 'Você misturou tipos, como texto + número. Use <code>str()</code>, <code>int()</code> ou uma f-string: <code>f"Pontos: {pontos}"</code>.',
  ZeroDivisionError: 'Dividir por zero não pode!',
  IndexError: 'Esse índice não existe na lista. Lembre: começa no 0 e vai até <code>len(lista) - 1</code>.',
  KeyError: 'Essa chave não existe no dicionário. Confira o nome (com as aspas).',
  ValueError: 'O valor não serve para essa conta. Por exemplo: <code>int("abc")</code> não vira número.',
  AttributeError: 'Esse objeto não tem esse método. Confira o nome depois do ponto.',
  ModuleNotFoundError: 'Esse módulo não existe aqui. Os módulos do robô (motor, hub, motor_pair...) só funcionam no LEGO SPIKE.',
  RecursionError: 'A função chamou ela mesma vezes demais. Falta uma condição de parada?'
};

const LAB_EXEMPLOS = [
  { nome: 'Olá', code: 'nome = "Vanguard"\nprint(f"Olá, {nome}!")\nprint("Bora programar de verdade!")\n' },
  { nome: 'Tabuada', code: 'n = 7\nfor i in range(1, 11):\n    print(f"{n} x {i} = {n * i}")\n' },
  { nome: 'Escadinha', code: 'for degrau in range(1, 6):\n    print("#" * degrau)\n' },
  { nome: 'Adivinhe o número', entradas: '5\n3\n8', code: 'import random\n\nsegredo = random.randint(1, 10)\nfor tentativa in range(3):\n    chute = int(input("Seu chute (1 a 10): "))\n    if chute == segredo:\n        print("Acertou!")\n        break\n    elif chute < segredo:\n        print("É maior!")\n    else:\n        print("É menor!")\nelse:\n    print(f"Acabaram as chances. Era {segredo}.")\n' },
  { nome: 'Média das notas', code: 'notas = [7.5, 9, 6, 10]\nmedia = sum(notas) / len(notas)\nprint(f"Média: {media:.1f}")\nif media >= 7:\n    print("Aprovado!")\nelse:\n    print("Recuperação")\n' },
  { nome: 'Graus do SPIKE', code: 'import math\n\nDIAMETRO = 5.6   # roda do SPIKE, em cm\nfor cm in [10, 30, 50]:\n    graus = int(cm / (math.pi * DIAMETRO) * 360)\n    print(f"{cm} cm = {graus} graus de motor")\n' },
  { nome: 'Controle P', code: '# simulando um giro com controle proporcional\nalvo = 90\nangulo = 0\nKP = 0.3\nfor passo in range(10):\n    erro = alvo - angulo\n    angulo = angulo + KP * erro\n    print(f"passo {passo}: ângulo = {angulo:.1f}")\n' }
];

const Lab = {
  built: false,
  worker: null,
  ready: false,
  running: false,
  timer: null,
  saida: 0,

  show() {
    if (!this.built) this.build();
    this.boot();
    this.sync();
  },

  build() {
    const v = $('#view-lab');
    v.innerHTML = `
    <div class="lab-page wrap">
      <div class="arena-head">
        <div>
          <span class="eyebrow">Laboratório</span>
          <h1>Laboratório de Python</h1>
          <p>Escreva <b>qualquer</b> código Python e rode de verdade, aqui no navegador. Sem tabuleiro e sem limites: só você e o Python.</p>
        </div>
      </div>
      <div class="lab-examples"><span class="snips-label">Exemplos:</span>${LAB_EXEMPLOS.map((e, k) => `<button class="snip" data-ex="${k}">${esc(e.nome)}</button>`).join('')}</div>
      <div class="lab-main">
        <div class="card editor-card">
          <div class="ed-top"><span class="ed-file">${langBadge('python', 'mini')}laboratorio.py</span><span class="lab-lines muted"></span></div>
          <div class="editor">
            <div class="ed-gutter" aria-hidden="true"></div>
            <div class="ed-area">
              <div class="ed-hl err" hidden></div>
              <pre class="ed-pre" aria-hidden="true"></pre>
              <textarea class="ed-ta" spellcheck="false" wrap="off" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Seu código Python"></textarea>
            </div>
          </div>
          <details class="lab-in">
            <summary>Respostas para o <code>input()</code></summary>
            <textarea class="lab-stdin text-in" rows="3" spellcheck="false" placeholder="Uma resposta por linha"></textarea>
            <small class="muted">Cada <code>input()</code> do seu código usa a próxima linha daqui.</small>
          </details>
          <div class="ed-actions">
            <button class="btn btn-green lab-run">${icon('play')}Rodar</button>
            <button class="btn btn-white lab-clear">${icon('reset')}Limpar saída</button>
          </div>
        </div>
        <div class="card lab-out-card">
          <div class="ed-top"><span>Saída</span><span class="lab-status muted"></span></div>
          <pre class="lab-out" aria-live="polite"></pre>
          <div class="arena-say lab-say" hidden><div class="say-knight">${knightSVG('wow')}</div><div class="say-bubble err"></div></div>
        </div>
      </div>
      <p class="ref-note">No laboratório roda Python 3 de verdade (Pyodide). Os módulos do robô, como <code>motor</code>, <code>hub</code> e <code>motor_pair</code>, só existem no LEGO SPIKE. Para o FTC, o Java roda no Android Studio ou no OnBot Java.</p>
    </div>`;
    this.built = true;
    this.ta = $('.ed-ta', v);
    this.pre = $('.ed-pre', v);
    this.gutter = $('.ed-gutter', v);
    this.hl = $('.ed-hl', v);
    this.out = $('.lab-out', v);
    this.stdin = $('.lab-stdin', v);
    this.ta.value = Store.get('vg_lab_code', LAB_EXEMPLOS[0].code);
    this.ta.addEventListener('input', () => { this.hl.hidden = true; this.sync(); Store.set('vg_lab_code', this.ta.value); });
    this.ta.addEventListener('scroll', () => this.syncScroll());
    this.ta.addEventListener('keydown', (e) => this.onKey(e));
    $('.lab-run', v).addEventListener('click', () => (this.running ? this.stop('Programa parado.') : this.run()));
    $('.lab-clear', v).addEventListener('click', () => { this.out.textContent = ''; $('.lab-say', v).hidden = true; });
    $('.lab-examples', v).addEventListener('click', (e) => {
      const b = e.target.closest('[data-ex]');
      if (!b || this.running) return;
      const ex = LAB_EXEMPLOS[+b.dataset.ex];
      this.ta.value = ex.code;
      this.stdin.value = ex.entradas || '';
      if (ex.entradas) $('.lab-in', v).open = true;
      this.hl.hidden = true;
      this.sync();
      Store.set('vg_lab_code', this.ta.value);
      Sound.play('tap');
    });
  },

  /* carrega o Python em segundo plano assim que a página abre */
  boot() {
    if (this.worker) return;
    this.ready = false;
    this.status('Carregando o Python (só demora na primeira vez)...');
    const url = URL.createObjectURL(new Blob([LAB_WORKER_SRC], { type: 'text/javascript' }));
    this.worker = new Worker(url);
    this.worker.onmessage = (e) => this.onMsg(e.data);
    this.worker.onerror = () => this.status('Não consegui carregar o Python. Confira sua internet.');
  },

  onMsg(m) {
    if (m.t === 'ready') {
      this.ready = true;
      this.status('Python pronto!');
      if (this.pending) { const p = this.pending; this.pending = null; this.exec(p); }
    } else if (m.t === 'falha') {
      this.status('Não consegui carregar o Python. Confira sua internet.');
    } else if (m.t === 'out') {
      this.write(m.s);
    } else if (m.t === 'fim') {
      this.done();
      this.status('Terminou sem erros.');
      S.labRuns = (S.labRuns || 0) + 1;
      save();
      afterReward();
    } else if (m.t === 'erro') {
      this.done();
      this.showError(m.msg);
    }
  },

  run() {
    const code = this.ta.value;
    if (!code.trim()) { this.status('Escreva algum código primeiro!'); return; }
    this.out.textContent = '';
    this.saida = 0;
    $('.lab-say').hidden = true;
    this.hl.hidden = true;
    this.running = true;
    const rb = $('.lab-run');
    rb.innerHTML = `${icon('x')}Parar`;
    rb.classList.replace('btn-green', 'btn-red');
    const job = { code, entradas: this.stdin.value.split('\n').filter((l) => l !== '') };
    if (this.ready) this.exec(job);
    else { this.pending = job; this.status('Carregando o Python... seu código roda assim que ele estiver pronto.'); }
  },
  exec(job) {
    this.status('Rodando...');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.stop('Parei o programa: ele passou de 15 segundos. Será que tem um loop infinito?', true), LAB_TIMEOUT);
    this.worker.postMessage(job);
  },
  done() {
    clearTimeout(this.timer);
    this.running = false;
    const rb = $('.lab-run');
    if (rb) { rb.innerHTML = `${icon('play')}Rodar`; rb.classList.replace('btn-red', 'btn-green'); }
  },
  /* para um programa travado: desliga o worker e liga outro */
  stop(msg, erro) {
    this.done();
    this.pending = null;
    if (this.worker) { this.worker.terminate(); this.worker = null; }
    this.boot();
    this.status(msg);
    if (erro) this.tip(msg);
  },

  write(s) {
    if (this.saida > 200000) return;
    this.saida += s.length;
    this.out.insertAdjacentText('beforeend', s);
    this.out.scrollTop = this.out.scrollHeight;
  },
  status(t) { const el = $('.lab-status'); if (el) el.textContent = t; },
  tip(html) {
    const box = $('.lab-say');
    box.hidden = false;
    $('.say-bubble', box).innerHTML = html;
  },

  showError(msg) {
    const linhas = String(msg).trim().split('\n').filter(Boolean);
    let ultima = linhas[linhas.length - 1] || 'Erro';
    if (/VANCODE_LIMITE/.test(msg)) { this.status('Parado.'); this.tip(`O programa imprimiu mais de ${LAB_MAX_LINES} linhas e eu parei ele. Será que tem um loop infinito?`); return; }
    if (/VANCODE_SEM_ENTRADA/.test(msg)) { this.status('Faltou resposta para o input().'); this.tip('Seu código pediu um <code>input()</code>, mas não tem resposta na caixa <b>Respostas para o input()</b>. Escreva uma resposta por linha lá.'); $('.lab-in').open = true; return; }
    const nums = [...String(msg).matchAll(/File "(?:<exec>|laboratorio\.py)", line (\d+)/g)];
    const linha = nums.length ? +nums[nums.length - 1][1] : 0;
    const tipo = (ultima.match(/^(\w+(?:Error|Exception))/) || [])[1] || '';
    this.write(`\n${ultima}\n`);
    this.status(linha ? `Erro na linha ${linha}.` : 'Deu erro.');
    this.tip(`${linha ? `<b>Linha ${linha}:</b> ` : ''}<code>${esc(ultima.slice(0, 140))}</code><br>${LAB_ERROS[tipo] || 'Leia a mensagem com calma: ela diz o tipo do erro e onde ele aconteceu.'}`);
    this.errLine = linha;
    if (linha) { this.hl.hidden = false; this.placeHl(); }
    Sound.play('bad');
  },

  /* ---- editor ---- */
  sync() {
    const code = this.ta.value;
    this.pre.innerHTML = highlight(code, 'python') + '\n';
    const n = code.split('\n').length;
    this.gutter.innerHTML = Array.from({ length: n }, (_, i) => `<div>${i + 1}</div>`).join('');
    $('.lab-lines').textContent = `${plural(n, 'linha', 'linhas')}`;
    this.syncScroll();
  },
  syncScroll() {
    this.pre.scrollTop = this.ta.scrollTop;
    this.pre.scrollLeft = this.ta.scrollLeft;
    this.gutter.scrollTop = this.ta.scrollTop;
    if (!this.hl.hidden) this.placeHl();
  },
  /* faixa vermelha na linha do erro (acompanha a rolagem do editor) */
  placeHl() {
    const cs = getComputedStyle(this.ta);
    const lh = parseFloat(cs.lineHeight) || 26, pt = parseFloat(cs.paddingTop) || 14;
    this.hl.style.height = lh + 'px';
    this.hl.style.transform = `translateY(${pt + (this.errLine - 1) * lh - this.ta.scrollTop}px)`;
  },
  insertText(text) {
    const ta = this.ta;
    ta.focus();
    let ok = false;
    try { ok = document.execCommand('insertText', false, text); } catch (e) { ok = false; }
    if (!ok) { ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); }
  },
  onKey(e) {
    const ta = this.ta;
    if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); this.insertText('    '); }
    else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); if (!this.running) this.run(); }
    else if (e.key === 'Enter') {
      const v = ta.value, pos = ta.selectionStart;
      const before = v.slice(v.lastIndexOf('\n', pos - 1) + 1, pos);
      let indent = before.match(/^\s*/)[0];
      if (/:\s*(#.*)?$/.test(before)) indent += '    ';
      e.preventDefault();
      this.insertText('\n' + indent);
    }
  }
};
