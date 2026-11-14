/* =========================================================
   Vanguard Code · Arena do Bip
   Um mini-interpretador de Python e Java (só com os comandos
   do Bip) + o tabuleiro animado.
   ========================================================= */
'use strict';

/* ---------- Fases ----------
   #  pedra   B  bateria   G  bandeira   R  início   X  início + bandeira
   dir: 0 cima · 1 direita · 2 baixo · 3 esquerda                        */
const ARENA_LEVELS = [
  {
    name: 'Em frente!', dir: 1,
    map: ['......', '......', 'R...G.', '......', '......', '......'],
    goal: 'Leve o Bip até a bandeira 🏁.',
    limit: { python: 1, java: 1 },
    hint: {
      python: 'Cada <code>frente()</code> anda 1 casa. Sabia que <code>frente(4)</code> anda 4 de uma vez?',
      java: 'Cada <code>robo.frente();</code> anda 1 casa. Sabia que <code>robo.frente(4);</code> anda 4 de uma vez?'
    }
  },
  {
    name: 'Virando a esquina', dir: 0,
    map: ['......', '...G..', '.###..', '.###..', 'R.....', '......'],
    goal: 'Suba e depois vire para chegar na bandeira.',
    limit: { python: 3, java: 3 },
    hint: {
      python: 'Ande 3 casas para cima, use <code>direita()</code> para virar e ande mais 3.',
      java: 'Ande 3 casas para cima, use <code>robo.direita();</code> para virar e ande mais 3.'
    }
  },
  {
    name: 'Caça às baterias', dir: 0,
    map: ['B....B', '.####.', '.####.', '.####.', '.####.', 'R.##.G'],
    goal: 'Pegue as 2 baterias ⚡ e termine na bandeira.',
    limit: { python: 5, java: 5 },
    hint: {
      python: 'Dê a volta pelas bordas: suba, vire à direita, atravesse, vire à direita e desça.',
      java: 'Dê a volta pelas bordas: suba, vire à direita, atravesse, vire à direita e desça.'
    }
  },
  {
    name: 'Escadinha', dir: 1,
    map: ['#####G', '####B.', '###..#', '##B.##', '#..###', 'R.####'],
    goal: 'Suba a escada! Para ganhar ⭐⭐ você vai precisar de um loop.',
    limit: { python: 5, java: 6 },
    hint: {
      python: 'Cada degrau é: <code>frente()</code>, <code>esquerda()</code>, <code>frente()</code>, <code>direita()</code>. Repita 5 vezes com <code>for i in range(5):</code>',
      java: 'Cada degrau é: frente, esquerda, frente, direita. Repita 5 vezes com <code>for (int i = 0; i &lt; 5; i++) { ... }</code>'
    }
  },
  {
    name: 'Volta no lago', dir: 0,
    map: ['......', '.B..B.', '..##..', '..##..', '.X..B.', '......'],
    goal: 'Pegue as 3 baterias e volte para a bandeira, onde você começou.',
    limit: { python: 3, java: 4 },
    hint: {
      python: 'O caminho é um quadrado! 4 vezes: <code>frente(3)</code> e <code>direita()</code>.',
      java: 'O caminho é um quadrado! 4 vezes: <code>robo.frente(3);</code> e <code>robo.direita();</code>'
    }
  },
  {
    name: 'Cortador de grama', dir: 1,
    map: ['R....B', 'B.B...', '...B.B', 'B.....', 'G.....', '######'],
    goal: 'Varra o campo em zigue-zague, pegue as 6 baterias e termine na bandeira.',
    limit: { python: 9, java: 10 },
    hint: {
      python: 'Uma ida e volta é: <code>frente(5)</code>, <code>direita()</code>, <code>frente()</code>, <code>direita()</code>, <code>frente(5)</code>, <code>esquerda()</code>, <code>frente()</code>, <code>esquerda()</code>. Repita 2 vezes!',
      java: 'Uma ida e volta é: frente(5), direita, frente, direita, frente(5), esquerda, frente, esquerda. Repita 2 vezes com um <code>for</code>!'
    }
  }
];

/* ---------- Interpretador ---------- */
const BipLang = {
  MAX_ACTIONS: 400,

  err(line, msg) {
    const e = new Error(msg);
    e.line = line;
    e.bip = true;
    return e;
  },

  stripComment(line, lang) {
    let q = null;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) { if (c === q) q = null; continue; }
      if (c === '"' || c === "'") { q = c; continue; }
      if (lang === 'python' && c === '#') return line.slice(0, i);
      if (lang === 'java' && c === '/' && line[i + 1] === '/') return line.slice(0, i);
    }
    return line;
  },

  countLines(src, lang) {
    return src.split('\n').filter((l) => this.stripComment(l, lang).trim()).length;
  },

  parse(src, lang) {
    return lang === 'java' ? this.parseJava(src) : this.parsePython(src);
  },

  /* ---- Python ---- */
  parsePython(src) {
    const lines = src.replace(/\r/g, '').replace(/\t/g, '    ').split('\n');
    const root = [];
    const stack = [{ indent: 0, body: root }];
    let pending = null;

    lines.forEach((raw, idx) => {
      const ln = idx + 1;
      const line = this.stripComment(raw, 'python');
      if (!line.trim()) return;
      const indent = line.match(/^ */)[0].length;
      const code = line.trim();

      if (pending) {
        const top = stack[stack.length - 1];
        if (indent <= top.indent) throw this.err(ln, 'As linhas de dentro do <code>for</code> precisam de espaços no começo (indentação). Aperte TAB ⇥ antes do comando!');
        stack.push({ indent, body: pending.body });
        pending = null;
      } else {
        const deepest = stack[stack.length - 1].indent;
        while (stack.length > 1 && indent < stack[stack.length - 1].indent) stack.pop();
        const want = stack[stack.length - 1].indent;
        if (indent !== want) {
          throw this.err(ln, indent > want && indent > deepest
            ? 'Tem espaços sobrando no começo desta linha. Só use espaços nas linhas de dentro de um <code>for</code>!'
            : 'Os espaços desta linha não combinam com os das linhas de cima. Confira a indentação!');
        }
      }

      const node = this.pyStatement(code, ln);
      stack[stack.length - 1].body.push(node);
      if (node.type === 'loop') pending = node;
    });

    if (pending) throw this.err(pending.line, 'O <code>for</code> precisa de pelo menos uma linha dentro dele (com espaços no começo).');
    return root;
  },

  pyStatement(code, ln) {
    let m;
    if (/[{}]/.test(code)) throw this.err(ln, 'Em Python não usamos chaves <code>{ }</code>. Os espaços no começo da linha mostram o que está dentro do <code>for</code>.');

    if (/^for\b/.test(code)) {
      if (/^for\s*\(/.test(code)) throw this.err(ln, 'Isso parece Java! 😄 Em Python o for é assim: <code>for i in range(4):</code>');
      if (!code.endsWith(':')) throw this.err(ln, 'Faltaram os dois pontos <code>:</code> no final do <code>for</code>.');
      m = code.match(/^for\s+([A-Za-z_]\w*)\s+in\s+range\s*\(\s*(\d+)\s*\)\s*:$/);
      if (!m) throw this.err(ln, 'Escreva o for assim: <code>for i in range(4):</code>');
      const times = +m[2];
      if (times > 50) throw this.err(ln, 'Calma! Use no máximo <code>range(50)</code>.');
      return { type: 'loop', times, body: [], line: ln };
    }

    code = code.replace(/;\s*$/, '').replace(/^robo\s*\.\s*/, '');

    if ((m = code.match(/^frente\s*\(\s*(\d*)\s*\)$/))) {
      const n = m[1] === '' ? 1 : +m[1];
      if (n < 1 || n > 10) throw this.err(ln, 'Use um número de 1 a 10 dentro do <code>frente()</code>.');
      return { type: 'move', n, line: ln };
    }
    if ((m = code.match(/^(direita|esquerda)\s*\(\s*\)$/))) return { type: 'turn', dir: m[1] === 'direita' ? 1 : -1, line: ln };
    if ((m = code.match(/^(direita|esquerda)\s*\(.+\)$/))) throw this.err(ln, `<code>${m[1]}()</code> não recebe número: cada ${m[1]}() vira 90°.`);
    if ((m = code.match(/^print\s*\(\s*(["'])(.*)\1\s*\)$/))) return { type: 'say', text: m[2], line: ln };
    if (/^print\s*\(/.test(code)) throw this.err(ln, 'No print, coloque o texto entre aspas: <code>print("Oi!")</code>');
    if (/^(frente|direita|esquerda|print)$/.test(code)) throw this.err(ln, `Faltaram os parênteses: <code>${code}()</code>`);
    if (/^(frente|direita|esquerda)\s*\(/.test(code) && !/\)$/.test(code)) throw this.err(ln, 'Faltou fechar o parêntese <code>)</code>.');
    if (/^frente\s*\(/.test(code)) throw this.err(ln, 'Dentro do <code>frente()</code> vai um número, tipo <code>frente(3)</code>.');
    if (/^(frente|direita|esquerda|print)/i.test(code)) throw this.err(ln, 'Python diferencia maiúsculas e minúsculas: escreva os comandos em letras minúsculas.');
    if (/^(while|if|def)\b/.test(code)) throw this.err(ln, 'Nesta arena use o <code>for</code> para repetir. 😉');
    throw this.err(ln, `Não conheço <code>${esc(code.slice(0, 30))}</code>. Comandos: <code>frente()</code>, <code>direita()</code>, <code>esquerda()</code>, <code>print()</code> e <code>for</code>.`);
  },

  /* ---- Java ---- */
  tokenizeJava(src) {
    const toks = [];
    let i = 0, line = 1;
    src = src.replace(/\r/g, '');
    while (i < src.length) {
      const ch = src[i];
      if (ch === '\n') { line++; i++; continue; }
      if (/\s/.test(ch)) { i++; continue; }
      if (src.startsWith('//', i)) { while (i < src.length && src[i] !== '\n') i++; continue; }
      if (src.startsWith('/*', i)) {
        const end = src.indexOf('*/', i + 2);
        const chunk = end < 0 ? src.slice(i) : src.slice(i, end + 2);
        line += (chunk.match(/\n/g) || []).length;
        i += chunk.length;
        continue;
      }
      if (ch === '"') {
        let j = i + 1;
        while (j < src.length && src[j] !== '"' && src[j] !== '\n') j++;
        if (src[j] !== '"') throw this.err(line, 'Faltou fechar as aspas <code>"</code>.');
        toks.push({ t: 'str', v: src.slice(i + 1, j), line });
        i = j + 1;
        continue;
      }
      if (ch === "'") throw this.err(line, 'Em Java, textos usam aspas duplas: <code>"assim"</code>.');
      const rest = src.slice(i);
      let m = /^[A-Za-z_]\w*/.exec(rest);
      if (m) { toks.push({ t: 'id', v: m[0], line }); i += m[0].length; continue; }
      m = /^\d+/.exec(rest);
      if (m) { toks.push({ t: 'num', v: m[0], line }); i += m[0].length; continue; }
      const two = src.substr(i, 2);
      if (['<=', '>=', '++', '--', '==', '+=', '&&', '||'].includes(two)) { toks.push({ t: 'sym', v: two, line }); i += 2; continue; }
      toks.push({ t: 'sym', v: ch, line });
      i++;
    }
    return toks;
  },

  parseJava(src) {
    const toks = this.tokenizeJava(src);
    const self = this;
    let p = 0;
    const peek = () => toks[p];
    const next = () => toks[p++];
    const lastLine = () => (toks[p - 1] || toks[0] || { line: 1 }).line;
    const CMDS = ['frente', 'direita', 'esquerda'];

    function expect(v, msg) {
      const t = peek();
      if (!t || t.v !== v) {
        const ln = (v === ';' || v === ')' || !t) ? lastLine() : t.line;
        throw self.err(ln, msg || `Esperava <code>${esc(v)}</code> aqui.`);
      }
      return next();
    }
    function number(msg) {
      const t = next();
      if (!t || t.t !== 'num') throw self.err(t ? t.line : lastLine(), msg);
      return +t.v;
    }
    function statements(insideBlock) {
      const list = [];
      while (p < toks.length) {
        if (peek().v === '}') {
          if (insideBlock) return list;
          throw self.err(peek().line, 'Tem uma chave <code>}</code> sobrando.');
        }
        list.push(statement());
      }
      if (insideBlock) throw self.err(lastLine(), 'Faltou fechar a chave <code>}</code> do bloco.');
      return list;
    }
    function block() {
      expect('{', 'Esperava uma chave <code>{</code> aqui.');
      const body = statements(true);
      expect('}');
      return body;
    }
    function statement() {
      const t = peek();
      if (t.v === '{') return { type: 'loop', times: 1, body: block(), line: t.line };
      if (t.v === ';') { next(); return { type: 'noop' }; }
      if (t.t === 'id' && t.v === 'for') return forStatement();
      if (t.t === 'id' && t.v === 'robo') return roboStatement();
      if (t.t === 'id' && t.v === 'System') return printStatement();
      if (t.t === 'id' && CMDS.includes(t.v)) throw self.err(t.line, `Em Java os comandos começam com <code>robo.</code> Escreva: <code>robo.${t.v}();</code>`);
      if (t.t === 'id' && /^robo$/i.test(t.v)) throw self.err(t.line, 'Java diferencia maiúsculas: escreva <code>robo</code> com letras minúsculas.');
      if (t.t === 'id' && /^(while|if|void|public)$/.test(t.v)) throw self.err(t.line, 'Nesta arena use o <code>for</code> para repetir. 😉');
      if (t.t === 'id' && t.v === 'print') throw self.err(t.line, 'Em Java o print é assim: <code>System.out.println("Oi!");</code>');
      throw self.err(t.line, `Não conheço <code>${esc(t.v)}</code>. Use <code>robo.frente();</code>, <code>robo.direita();</code>, <code>robo.esquerda();</code> ou <code>for</code>.`);
    }
    function roboStatement() {
      const t = next();
      expect('.', 'Depois de <code>robo</code> vem um ponto: <code>robo.frente();</code>');
      const name = next();
      if (!name || name.t !== 'id') throw self.err(t.line, 'Depois de <code>robo.</code> vem o nome do comando: frente, direita ou esquerda.');
      if (!CMDS.includes(name.v)) {
        if (CMDS.includes(name.v.toLowerCase())) throw self.err(name.line, `Java diferencia maiúsculas: escreva <code>robo.${name.v.toLowerCase()}();</code>`);
        throw self.err(name.line, `O Bip não conhece <code>${esc(name.v)}</code>. Use frente, direita ou esquerda.`);
      }
      expect('(', `Faltaram os parênteses: <code>robo.${name.v}();</code>`);
      let n = 1;
      if (peek() && peek().t === 'num') {
        if (name.v !== 'frente') throw self.err(name.line, `<code>${name.v}()</code> não recebe número: cada ${name.v}() vira 90°.`);
        n = +next().v;
        if (n < 1 || n > 10) throw self.err(name.line, 'Use um número de 1 a 10 dentro do <code>frente()</code>.');
      }
      expect(')', 'Faltou fechar o parêntese <code>)</code>.');
      expect(';', 'Faltou o ponto e vírgula <code>;</code> no final do comando.');
      if (name.v === 'frente') return { type: 'move', n, line: name.line };
      return { type: 'turn', dir: name.v === 'direita' ? 1 : -1, line: name.line };
    }
    function printStatement() {
      const t = next();
      const bad = 'O print do Java é assim: <code>System.out.println("Oi!");</code>';
      expect('.', bad);
      const o = next();
      if (!o || o.v !== 'out') throw self.err(t.line, bad);
      expect('.', bad);
      const pr = next();
      if (!pr || (pr.v !== 'println' && pr.v !== 'print')) throw self.err(t.line, bad);
      expect('(', bad);
      const s = next();
      if (!s || s.t !== 'str') throw self.err(t.line, 'Coloque o texto entre aspas: <code>System.out.println("Oi!");</code>');
      expect(')', 'Faltou fechar o parêntese <code>)</code>.');
      expect(';', 'Faltou o ponto e vírgula <code>;</code> no final do comando.');
      return { type: 'say', text: s.v, line: t.line };
    }
    function forStatement() {
      const t = next();
      const shape = 'Escreva o for assim: <code>for (int i = 0; i &lt; 4; i++) {</code>';
      expect('(', shape);
      const ty = next();
      if (!ty || ty.v !== 'int') throw self.err(t.line, 'No for, crie a variável com <code>int</code>: ' + shape);
      const v = next();
      if (!v || v.t !== 'id') throw self.err(t.line, shape);
      expect('=', shape);
      const start = number(shape);
      expect(';', 'Faltou o <code>;</code> depois do início do for: <code>int i = 0;</code>');
      const v2 = next();
      if (!v2 || v2.v !== v.v) throw self.err(t.line, `A condição do for precisa usar a mesma variável <code>${esc(v.v)}</code>.`);
      const op = next();
      if (!op || (op.v !== '<' && op.v !== '<=')) throw self.err(t.line, 'Use <code>&lt;</code> ou <code>&lt;=</code> na condição do for.');
      const end = number(shape);
      expect(';', 'Faltou o <code>;</code> depois da condição: <code>i &lt; 4;</code>');
      const v3 = next();
      if (!v3 || v3.v !== v.v) throw self.err(t.line, `No passo do for use <code>${esc(v.v)}++</code>.`);
      const inc = next();
      if (!inc || inc.v !== '++') throw self.err(t.line, `No passo do for use <code>${esc(v.v)}++</code>.`);
      expect(')', 'Faltou fechar o parêntese <code>)</code> do for.');
      const body = (peek() && peek().v === '{') ? block() : [statement()];
      const times = Math.max(0, op.v === '<' ? end - start : end - start + 1);
      if (times > 50) throw self.err(t.line, 'Calma! Repita no máximo 50 vezes.');
      return { type: 'loop', times, body, line: t.line };
    }

    return statements(false);
  },

  /* Transforma o programa em uma lista de ações simples */
  flatten(nodes, out = []) {
    for (const n of nodes) {
      if (n.type === 'loop') {
        for (let k = 0; k < n.times; k++) {
          this.flatten(n.body, out);
          if (out.length > this.MAX_ACTIONS) throw this.err(n.line, 'Programa comprido demais! Use números menores no for.');
        }
      } else if (n.type === 'move') {
        for (let k = 0; k < n.n; k++) out.push({ a: 'move', line: n.line });
      } else if (n.type === 'turn') {
        out.push({ a: 'turn', dir: n.dir, line: n.line });
      } else if (n.type === 'say') {
        out.push({ a: 'say', text: n.text, line: n.line });
      }
      if (out.length > this.MAX_ACTIONS) throw this.err(n.line || 1, 'Programa comprido demais!');
    }
    return out;
  }
};

/* ---------- Simulação (sem tela, também usada nos testes) ---------- */
function arenaLevelState(lv) {
  const st = { x: 0, y: 0, d: lv.dir, gx: -1, gy: -1, bats: new Set() };
  lv.map.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === 'R' || ch === 'X') { st.x = x; st.y = y; }
    if (ch === 'G' || ch === 'X') { st.gx = x; st.gy = y; }
    if (ch === 'B') st.bats.add(x + ',' + y);
  }));
  return st;
}
const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

/* ---------- Interface da Arena ---------- */
const Arena = {
  lang: 'python',
  level: 0,
  running: false,
  timer: null,
  built: false,
  speed: 300,

  codeKey() { return this.lang + '-' + this.level; },
  starterCode() {
    return this.lang === 'java'
      ? '// Leve o Bip até a bandeira 🏁\nrobo.frente();\n'
      : '# Leve o Bip até a bandeira 🏁\nfrente()\n';
  },
  stars(lang, i) { return (S.arena && S.arena[lang + '-' + i]) || 0; },
  unlocked(i) { return S.mentor || i === 0 || this.stars(this.lang, i - 1) > 0; },

  show() {
    this.lang = Store.get('vg_arena_lang', 'python');
    if (!this.built) this.build();
    const first = ARENA_LEVELS.findIndex((_, i) => !this.stars(this.lang, i));
    if (!this.unlocked(this.level)) this.level = 0;
    if (this._fresh !== false) { this.level = first < 0 ? 0 : first; this._fresh = false; }
    this.loadLevel(this.level);
  },

  build() {
    const v = $('#view-arena');
    v.innerHTML = `
    <div class="arena-page wrap">
      <div class="arena-head">
        <div>
          <h1>🎮 Arena do Bip</h1>
          <p>Escreva código <b>de verdade</b> para guiar o Bip até a bandeira 🏁, pegando todas as baterias ⚡.</p>
        </div>
        <div class="lang-toggle" role="tablist" aria-label="Linguagem">
          <button data-lang="python" role="tab">🐍 Python</button>
          <button data-lang="java" role="tab">☕ Java</button>
        </div>
      </div>
      <div class="level-chips" aria-label="Fases"></div>
      <div class="arena-main">
        <div class="card board-card">
          <div class="level-title"></div>
          <div class="board-wrap"><div class="board" id="board"></div></div>
          <div class="arena-say"><div class="say-bip">${bipSVG('happy')}</div><div class="say-bubble" aria-live="polite"></div></div>
        </div>
        <div class="card editor-card">
          <div class="ed-top"><span class="ed-file"></span><span class="ed-lines"></span></div>
          <div class="editor">
            <div class="ed-gutter" aria-hidden="true"></div>
            <div class="ed-area">
              <div class="ed-hl" hidden></div>
              <pre class="ed-pre" aria-hidden="true"></pre>
              <textarea class="ed-ta" spellcheck="false" wrap="off" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Editor de código"></textarea>
            </div>
          </div>
          <div class="snips" aria-label="Atalhos de comandos"></div>
          <div class="ed-actions">
            <button class="btn btn-green ar-run">▶ Rodar</button>
            <button class="btn btn-white ar-reset" title="Volta o Bip para o começo">↺ Recomeçar</button>
            <button class="btn btn-white ar-hint">💡 Dica</button>
          </div>
          <details class="ref">
            <summary>📘 Comandos do Bip</summary>
            <div class="ref-body"></div>
          </details>
        </div>
      </div>
    </div>`;
    this.built = true;
    this.ta = $('.ed-ta', v);
    this.pre = $('.ed-pre', v);
    this.gutter = $('.ed-gutter', v);
    this.hl = $('.ed-hl', v);

    $('.lang-toggle', v).addEventListener('click', (e) => {
      const b = e.target.closest('[data-lang]');
      if (!b || this.running) return;
      this.saveCode();
      this.lang = b.dataset.lang;
      Store.set('vg_arena_lang', this.lang);
      if (!this.unlocked(this.level)) this.level = 0;
      this.loadLevel(this.level);
    });
    $('.level-chips', v).addEventListener('click', (e) => {
      const b = e.target.closest('[data-lv]');
      if (!b || this.running) return;
      const i = +b.dataset.lv;
      if (!this.unlocked(i)) { this.say('🔒 Passe a fase anterior para liberar esta!', 'sad'); Sound.play('bad'); return; }
      this.saveCode();
      this.loadLevel(i);
    });
    $('.ar-run', v).addEventListener('click', () => this.run());
    $('.ar-reset', v).addEventListener('click', () => { this.stop(); this.resetBoard(); this.say('Prontinho! O Bip voltou para o começo. 😊'); });
    $('.ar-hint', v).addEventListener('click', () => this.say('💡 ' + ARENA_LEVELS[this.level].hint[this.lang], 'wow'));
    $('.snips', v).addEventListener('click', (e) => {
      const b = e.target.closest('[data-snip]');
      if (b) this.insertSnippet(b.dataset.snip);
    });
    v.addEventListener('click', (e) => {
      if (e.target.closest('.say-next')) this.loadLevel(this.level + 1);
    });

    const ta = this.ta;
    ta.addEventListener('input', () => { this.clearHl(); this.sync(); this.saveCode(); });
    ta.addEventListener('scroll', () => this.syncScroll());
    ta.addEventListener('keydown', (e) => this.onKey(e));
  },

  loadLevel(i) {
    if (i >= ARENA_LEVELS.length) i = ARENA_LEVELS.length - 1;
    this.stop();
    this.level = i;
    const lv = ARENA_LEVELS[i];
    const v = $('#view-arena');

    $$('.lang-toggle button', v).forEach((b) => b.classList.toggle('on', b.dataset.lang === this.lang));
    $('.level-chips', v).innerHTML = ARENA_LEVELS.map((l, k) => {
      const st = this.stars(this.lang, k);
      const cls = k === i ? 'cur' : (this.unlocked(k) ? (st ? 'done' : 'open') : 'locked');
      return `<button class="lvl ${cls}" data-lv="${k}" aria-label="Fase ${k + 1}">${this.unlocked(k) ? k + 1 : '🔒'}<span class="lvl-stars">${'★'.repeat(st)}${'☆'.repeat(2 - st)}</span></button>`;
    }).join('');

    const lim = lv.limit[this.lang];
    $('.level-title', v).innerHTML = `<small>Fase ${i + 1} de ${ARENA_LEVELS.length}</small><h2>${lv.name}</h2><p>${lv.goal}</p>
      <div class="lvl-goals"><span>⭐ Chegar na bandeira</span><span>⭐⭐ Usar até <b>${lim}</b> linha${lim > 1 ? 's' : ''} de código</span></div>`;
    $('.ed-file', v).innerHTML = this.lang === 'java' ? '☕ Bip.java' : '🐍 bip.py';

    const isPy = this.lang === 'python';
    const snips = isPy
      ? [['frente()', 'frente()'], ['frente(2)', 'frente(2)'], ['direita()', 'direita()'], ['esquerda()', 'esquerda()'], ['🔁 for', 'for i in range(4):\n    §'], ['💬 print', 'print("Oi!")']]
      : [['robo.frente();', 'robo.frente();'], ['robo.frente(2);', 'robo.frente(2);'], ['robo.direita();', 'robo.direita();'], ['robo.esquerda();', 'robo.esquerda();'], ['🔁 for', 'for (int i = 0; i < 4; i++) {\n    §\n}'], ['💬 println', 'System.out.println("Oi!");']];
    $('.snips', v).innerHTML = '<span class="snips-label">Atalhos:</span>' + snips.map(([label, code]) => `<button class="snip" data-snip="${esc(code)}">${esc(label)}</button>`).join('');

    $('.ref-body', v).innerHTML = (isPy ? [
      ['frente()', 'anda 1 casa para frente'], ['frente(3)', 'anda 3 casas'], ['direita()', 'vira 90° para a direita'], ['esquerda()', 'vira 90° para a esquerda'],
      ['for i in range(4):', 'repete 4 vezes as linhas de dentro (com 4 espaços no começo)'], ['print("Oi!")', 'o Bip fala'], ['# texto', 'comentário: o Python ignora']
    ] : [
      ['robo.frente();', 'anda 1 casa para frente'], ['robo.frente(3);', 'anda 3 casas'], ['robo.direita();', 'vira 90° para a direita'], ['robo.esquerda();', 'vira 90° para a esquerda'],
      ['for (int i = 0; i < 4; i++) { }', 'repete 4 vezes o que está entre as chaves'], ['System.out.println("Oi!");', 'o Bip fala'], ['// texto', 'comentário: o Java ignora']
    ]).map(([c, d]) => `<div class="ref-row"><code>${highlight(c, this.lang)}</code><span>${d}</span></div>`).join('') +
      '<p class="ref-note">ℹ️ Estes são comandos especiais do simulador do Bip. No robô de verdade os nomes mudam (você aprende nas trilhas!), mas a lógica é a mesmíssima.</p>';

    const saved = Store.get('vg_arena_code', {})[this.codeKey()];
    this.ta.value = saved != null ? saved : this.starterCode();
    this.ta.readOnly = false;
    this.clearHl();
    this.sync();
    this.resetBoard();
    const st = this.stars(this.lang, i);
    this.say(st ? `Você já tem ${'⭐'.repeat(st)} nesta fase. Quer tentar de novo? 😎` : `Fase ${i + 1}: ${lv.goal} Escreva o código e aperte <b>▶ Rodar</b>!`);
  },

  /* ---- tabuleiro ---- */
  resetBoard() {
    const lv = ARENA_LEVELS[this.level];
    this.st = arenaLevelState(lv);
    this.angle = this.st.d * 90;
    const b = $('#board');
    let cells = '';
    lv.map.forEach((row, y) => [...row].forEach((ch, x) => {
      const cls = ['cell', (x + y) % 2 ? 'alt' : ''];
      let inner = '';
      if (ch === '#') cls.push('rock');
      if (ch === 'G' || ch === 'X') inner += '<span class="flag">🏁</span>';
      if (ch === 'B') inner += `<span class="bat" data-xy="${x},${y}">⚡</span>`;
      cells += `<div class="${cls.join(' ')}">${inner}</div>`;
    }));
    b.innerHTML = cells + `<div class="bot" id="bot"><div class="bot-in">${botTopSVG()}</div><div class="bot-say" hidden></div></div>`;
    this.bot = $('#bot');
    this.placeBot(true);
  },
  placeBot(instant) {
    const bot = this.bot;
    if (instant) bot.classList.add('no-anim');
    bot.style.setProperty('--x', this.st.x);
    bot.style.setProperty('--y', this.st.y);
    $('.bot-in', bot).style.transform = `rotate(${this.angle}deg)`;
    if (instant) { void bot.offsetWidth; bot.classList.remove('no-anim'); }
  },

  /* ---- execução ---- */
  run() {
    if (this.running) { this.stop(); this.say('Programa parado. ✋'); return; }
    this.resetBoard();
    this.clearHl();
    let actions;
    try {
      const prog = BipLang.parse(this.ta.value, this.lang);
      actions = BipLang.flatten(prog);
      if (!actions.length) throw BipLang.err(0, 'Escreva algum comando primeiro! 😉');
    } catch (e) {
      if (!e.bip) throw e;
      if (e.line) this.markLine(e.line, true);
      this.say(`${e.line ? `<b>Linha ${e.line}:</b> ` : ''}${e.message}`, 'sad', 'err');
      Sound.play('bad');
      return;
    }
    this.running = true;
    this.ta.readOnly = true;
    $('.ar-run').innerHTML = '■ Parar';
    $('.ar-run').classList.replace('btn-green', 'btn-red');
    this.say('Rodando... 🤖', 'normal');
    let k = 0;
    const step = () => {
      if (!this.running) return;
      if (k >= actions.length) return this.finish();
      const act = actions[k++];
      this.markLine(act.line, false);
      const st = this.st;
      if (act.a === 'turn') {
        st.d = (st.d + act.dir + 4) % 4;
        this.angle += act.dir * 90;
        this.placeBot();
        Sound.play('turn');
      } else if (act.a === 'move') {
        const [dx, dy] = DIRS[st.d];
        const nx = st.x + dx, ny = st.y + dy;
        const lv = ARENA_LEVELS[this.level];
        const out = nx < 0 || ny < 0 || ny >= lv.map.length || nx >= lv.map[0].length;
        if (out || lv.map[ny][nx] === '#') return this.crash(act.line, out);
        st.x = nx; st.y = ny;
        this.placeBot();
        Sound.play('move');
        const key = nx + ',' + ny;
        if (st.bats.has(key)) {
          st.bats.delete(key);
          const bat = $(`.bat[data-xy="${key}"]`);
          if (bat) setTimeout(() => bat.classList.add('got'), this.speed * 0.6);
          setTimeout(() => Sound.play('coin'), this.speed * 0.6);
        }
      } else if (act.a === 'say') {
        const bubble = $('.bot-say', this.bot);
        bubble.textContent = act.text;
        bubble.hidden = false;
        Sound.play('say');
        this.timer = setTimeout(() => { bubble.hidden = true; step(); }, 1100);
        return;
      }
      this.timer = setTimeout(step, this.speed);
    };
    step();
  },
  stop() {
    this.running = false;
    clearTimeout(this.timer);
    if (this.ta) this.ta.readOnly = false;
    const r = $('.ar-run');
    if (r) { r.innerHTML = '▶ Rodar'; r.classList.replace('btn-red', 'btn-green'); }
  },
  crash(line, out) {
    this.stop();
    this.bot.classList.add('crash');
    setTimeout(() => this.bot && this.bot.classList.remove('crash'), 600);
    this.markLine(line, true);
    Sound.play('crash');
    this.say(`💥 Ops! Na <b>linha ${line}</b> o Bip ${out ? 'tentou sair do tabuleiro' : 'bateu numa pedra'}. Ajuste o código e tente de novo!`, 'sad', 'err');
  },
  finish() {
    this.stop();
    const st = this.st;
    const lv = ARENA_LEVELS[this.level];
    const onGoal = st.x === st.gx && st.y === st.gy;
    if (!onGoal || st.bats.size) {
      const faltam = st.bats.size;
      const msg = !onGoal && faltam ? `O Bip não chegou na bandeira e ainda faltam ${faltam} bateria${faltam > 1 ? 's' : ''} ⚡.`
        : !onGoal ? 'Quase! O Bip não terminou em cima da bandeira 🏁.'
        : `Chegou na bandeira, mas faltou pegar ${faltam} bateria${faltam > 1 ? 's' : ''} ⚡!`;
      this.say(msg + ' Tente de novo, você consegue! 💪', 'sad', 'err');
      Sound.play('bad');
      return;
    }
    const lines = BipLang.countLines(this.ta.value, this.lang);
    const lim = lv.limit[this.lang];
    const stars = lines <= lim ? 2 : 1;
    const key = this.codeKey();
    const prev = S.arena[key] || 0;
    let xp = 0;
    if (stars > prev) {
      if (prev === 0) xp += 10;
      if (stars === 2) xp += 5;
      S.arena[key] = stars;
    }
    if (xp) addXP(xp); else save();
    Sound.play('win');
    confetti(1800);
    const isLast = this.level >= ARENA_LEVELS.length - 1;
    const nextBtn = isLast ? '' : ' <button class="btn btn-green btn-sm say-next">Próxima fase →</button>';
    const msg = stars === 2
      ? `🌟🌟 <b>Perfeito!</b> Código enxuto com ${lines} linha${lines > 1 ? 's' : ''}.${xp ? ` <b>+${xp} XP</b>` : ''}${isLast ? ' Você zerou a Arena! 👑' : ''}`
      : `⭐ <b>Passou!</b>${xp ? ` <b>+${xp} XP</b>.` : ''} Desafio extra: consegue fazer com até ${lim} linha${lim > 1 ? 's' : ''}? Dica: use o <code>for</code> 🔁`;
    this.say(msg + nextBtn, 'happy', 'win');
    afterReward();
    // atualiza as estrelinhas das fases
    const cur = this.level;
    $$('.level-chips .lvl').forEach((b, k) => {
      const s = this.stars(this.lang, k);
      b.className = 'lvl ' + (k === cur ? 'cur' : (this.unlocked(k) ? (s ? 'done' : 'open') : 'locked'));
      b.innerHTML = `${this.unlocked(k) ? k + 1 : '🔒'}<span class="lvl-stars">${'★'.repeat(s)}${'☆'.repeat(2 - s)}</span>`;
    });
  },

  say(html, mood = 'happy', kind = '') {
    const wrap = $('.arena-say');
    if (!wrap) return;
    $('.say-bip', wrap).innerHTML = bipSVG(mood);
    const b = $('.say-bubble', wrap);
    b.className = 'say-bubble ' + kind;
    b.innerHTML = html;
  },

  /* ---- editor ---- */
  sync() {
    const code = this.ta.value;
    this.pre.innerHTML = highlight(code, this.lang) + '\n';
    const n = code.split('\n').length;
    this.gutter.innerHTML = Array.from({ length: n }, (_, i) => `<div>${i + 1}</div>`).join('');
    const c = BipLang.countLines(code, this.lang);
    $('.ed-lines').textContent = `${c} linha${c === 1 ? '' : 's'} de código`;
    this.syncScroll();
  },
  syncScroll() {
    this.pre.scrollTop = this.ta.scrollTop;
    this.pre.scrollLeft = this.ta.scrollLeft;
    this.gutter.scrollTop = this.ta.scrollTop;
    if (this.hlLine) this.positionHl();
  },
  markLine(line, isErr) {
    this.hlLine = line;
    this.hl.hidden = false;
    this.hl.classList.toggle('err', !!isErr);
    this.positionHl();
    const g = this.gutter.children[line - 1];
    $$('.ed-gutter div.on').forEach((d) => d.classList.remove('on'));
    if (g) g.classList.add('on');
  },
  positionHl() {
    const lh = parseFloat(getComputedStyle(this.ta).lineHeight) || 24;
    const pt = parseFloat(getComputedStyle(this.ta).paddingTop) || 12;
    this.hl.style.transform = `translateY(${pt + (this.hlLine - 1) * lh - this.ta.scrollTop}px)`;
    this.hl.style.height = lh + 'px';
  },
  clearHl() {
    this.hlLine = 0;
    if (this.hl) this.hl.hidden = true;
    $$('.ed-gutter div.on').forEach((d) => d.classList.remove('on'));
  },
  saveCode() {
    if (!this.ta) return;
    const all = Store.get('vg_arena_code', {});
    all[this.codeKey()] = this.ta.value;
    Store.set('vg_arena_code', all);
  },
  insertText(text) {
    const ta = this.ta;
    ta.focus();
    let ok = false;
    try { ok = document.execCommand('insertText', false, text); } catch (e) { ok = false; }
    if (!ok) {
      ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
      ta.dispatchEvent(new Event('input'));
    }
  },
  insertSnippet(snip) {
    if (this.running) return;
    const ta = this.ta;
    const v = ta.value;
    const pos = ta.selectionStart;
    const lineStart = v.lastIndexOf('\n', pos - 1) + 1;
    let lineEnd = v.indexOf('\n', pos);
    if (lineEnd < 0) lineEnd = v.length;
    const line = v.slice(lineStart, lineEnd);
    const indent = line.match(/^\s*/)[0];
    const body = snip.replace(/\n/g, '\n' + indent);
    let text;
    if (line.trim()) {
      ta.setSelectionRange(lineEnd, lineEnd);
      text = '\n' + indent + body;
    } else {
      ta.setSelectionRange(lineStart, lineEnd);
      text = indent + body;
    }
    const caret = text.indexOf('§');
    const clean = text.replace('§', '');
    const startAt = ta.selectionStart;
    this.insertText(clean);
    if (caret >= 0) ta.setSelectionRange(startAt + caret, startAt + caret);
    Sound.play('tap');
  },
  onKey(e) {
    if (this.running) return;
    const ta = this.ta;
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      this.insertText('    ');
    } else if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
      const v = ta.value;
      const pos = ta.selectionStart;
      const lineStart = v.lastIndexOf('\n', pos - 1) + 1;
      const before = v.slice(lineStart, pos);
      let indent = before.match(/^\s*/)[0];
      const trimmed = this.lang === 'java' ? before.trim() : BipLang.stripComment(before, 'python').trim();
      if (/[:{]$/.test(trimmed)) indent += '    ';
      e.preventDefault();
      this.insertText('\n' + indent);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      this.run();
    }
  }
};
