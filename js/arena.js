/* =========================================================
   VanCode · Arena
   Um mini-interpretador de Python e Java (só com os comandos
   do Guardinho) + o tabuleiro animado.
   ========================================================= */
'use strict';

/* ---------- Fases ----------
   #  pedra   B  moeda   G  bandeira   R  início   X  início + bandeira
   dir: 0 cima · 1 direita · 2 baixo · 3 esquerda                        */
const ARENA_LEVELS = [
  {
    name: 'Em frente!', dir: 1,
    map: ['......', '......', 'R...G.', '......', '......', '......'],
    goal: 'Leve o Guardinho até a bandeira.',
    limit: { python: 1, java: 1 },
    hint: {
      python: 'Cada <code>frente()</code> anda 1 casa. Sabia que <code>frente(4)</code> anda 4 de uma vez?',
      java: 'Cada <code>guardinho.frente();</code> anda 1 casa. Sabia que <code>guardinho.frente(4);</code> anda 4 de uma vez?'
    }
  },
  {
    name: 'Virando a esquina', dir: 0,
    map: ['......', '...G..', '.###..', '.###..', 'R.....', '......'],
    goal: 'Suba e depois vire para chegar na bandeira.',
    limit: { python: 3, java: 3 },
    hint: {
      python: 'Ande 3 casas para cima, use <code>direita()</code> para virar e ande mais 3.',
      java: 'Ande 3 casas para cima, use <code>guardinho.direita();</code> para virar e ande mais 3.'
    }
  },
  {
    name: 'Caça às moedas', dir: 0,
    map: ['B....B', '.####.', '.####.', '.####.', '.####.', 'R.##.G'],
    goal: 'Pegue as 2 moedas e termine na bandeira.',
    limit: { python: 5, java: 5 },
    hint: {
      python: 'Dê a volta pelas bordas: suba, vire à direita, atravesse, vire à direita e desça.',
      java: 'Dê a volta pelas bordas: suba, vire à direita, atravesse, vire à direita e desça.'
    }
  },
  {
    name: 'Escadinha', dir: 1,
    map: ['#####G', '####B.', '###..#', '##B.##', '#..###', 'R.####'],
    goal: 'Suba a escada! Para ganhar 2 estrelas você vai precisar de um loop.',
    limit: { python: 5, java: 6 },
    hint: {
      python: 'Cada degrau é: <code>frente()</code>, <code>esquerda()</code>, <code>frente()</code>, <code>direita()</code>. Repita 5 vezes com <code>for i in range(5):</code>',
      java: 'Cada degrau é: frente, esquerda, frente, direita. Repita 5 vezes com <code>for (int i = 0; i &lt; 5; i++) { ... }</code>'
    }
  },
  {
    name: 'Volta no lago', dir: 0,
    map: ['......', '.B..B.', '..##..', '..##..', '.X..B.', '......'],
    goal: 'Pegue as 3 moedas e volte para a bandeira, onde você começou.',
    limit: { python: 3, java: 4 },
    hint: {
      python: 'O caminho é um quadrado! 4 vezes: <code>frente(3)</code> e <code>direita()</code>.',
      java: 'O caminho é um quadrado! 4 vezes: <code>guardinho.frente(3);</code> e <code>guardinho.direita();</code>'
    }
  },
  {
    name: 'Cortador de grama', dir: 1,
    map: ['R....B', 'B.B...', '...B.B', 'B.....', 'G.....', '######'],
    goal: 'Varra o campo em zigue-zague, pegue as 6 moedas e termine na bandeira.',
    limit: { python: 9, java: 10 },
    hint: {
      python: 'Uma ida e volta é: <code>frente(5)</code>, <code>direita()</code>, <code>frente()</code>, <code>direita()</code>, <code>frente(5)</code>, <code>esquerda()</code>, <code>frente()</code>, <code>esquerda()</code>. Repita 2 vezes!',
      java: 'Uma ida e volta é: frente(5), direita, frente, direita, frente(5), esquerda, frente, esquerda. Repita 2 vezes com um <code>for</code>!'
    }
  },

  /* ---- Missões com sensores: o mapa muda a cada vez que roda ---- */
  {
    name: 'Corredor surpresa', dir: 1, sensors: true,
    variants() {
      return [3, 4, 5, 6].map((w) => {
        const row = [...'......'].map((_, x) => (x === 0 ? 'R' : x < w - 1 ? '.' : x === w - 1 ? 'G' : '#')).join('');
        return ['######', '######', row, '######', '######', '######'];
      });
    },
    goal: 'O corredor muda de tamanho a cada vez que você roda! Use o sensor para andar até a bandeira.',
    limit: { python: 2, java: 3 },
    hint: {
      python: 'Use <code>while frente_livre():</code> e, dentro dele, <code>frente()</code>. O Guardinho anda enquanto não tiver parede na frente.',
      java: 'Use <code>while (guardinho.frenteLivre()) {</code>, com <code>guardinho.frente();</code> dentro.'
    }
  },
  {
    name: 'Caminho em L', dir: 0, sensors: true,
    variants() {
      const out = [];
      for (const top of [0, 1, 2]) for (const right of [3, 4, 5]) {
        const g = Array.from({ length: 6 }, () => [...'######']);
        for (let y = top; y <= 5; y++) g[y][0] = '.';
        for (let x = 0; x <= right; x++) g[top][x] = '.';
        g[5][0] = 'R';
        g[top][right] = 'G';
        out.push(g.map((r) => r.join('')));
      }
      return out;
    },
    goal: 'Suba até a parede, vire à direita e ande até a bandeira. A altura e a largura mudam toda vez!',
    limit: { python: 5, java: 7 },
    hint: {
      python: 'São dois <code>while frente_livre():</code>, com um <code>direita()</code> no meio.',
      java: 'São dois <code>while (guardinho.frenteLivre()) { ... }</code>, com um <code>guardinho.direita();</code> no meio.'
    }
  },
  {
    name: 'Bifurcação', dir: 1, sensors: true,
    variants() {
      return [
        ['##.###', '##.###', '##.###', 'RB...G', '######', '######'],
        ['##G###', '##.###', '##.###', 'RB.#..', '######', '######']
      ];
    },
    goal: 'Às vezes o caminho segue reto, às vezes vira para cima. Use if e else para decidir!',
    limit: { python: 6, java: 7 },
    hint: {
      python: 'Ande até a bifurcação com <code>frente(2)</code>. Depois: <code>if frente_livre():</code> segue reto; <code>else:</code> vira à esquerda e sobe.',
      java: 'Ande até a bifurcação. Depois: <code>if (guardinho.frenteLivre()) { ... } else { ... }</code>'
    }
  },
  {
    name: 'Labirinto espiral', dir: 1, sensors: true,
    map: ['R.....', '#####.', '..B.#.', '.#G.#B', '.####.', 'B.....'],
    goal: 'Chegue no centro do labirinto pegando as 3 moedas. Dica de mestre: um algoritmo pequeno resolve tudo!',
    limit: { python: 5, java: 7 },
    hint: {
      python: '<code>while not na_bandeira():</code> e, dentro: se a frente estiver livre, <code>frente()</code>; senão, <code>direita()</code>.',
      java: '<code>while (!guardinho.naBandeira()) {</code> e, dentro, um <code>if</code> com <code>else</code>: anda se estiver livre, senão vira à direita.'
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
        if (indent <= top.indent) throw this.err(ln, `As linhas de dentro do <code>${pending.kw}</code> precisam de espaços no começo (indentação). Aperte TAB antes do comando!`);
        stack.push({ indent, body: pending.body });
        pending = null;
      } else {
        const deepest = stack[stack.length - 1].indent;
        while (stack.length > 1 && indent < stack[stack.length - 1].indent) stack.pop();
        const want = stack[stack.length - 1].indent;
        if (indent !== want) {
          throw this.err(ln, indent > want && indent > deepest
            ? 'Tem espaços sobrando no começo desta linha. Só use espaços nas linhas de dentro de um <code>for</code>, <code>while</code> ou <code>if</code>!'
            : 'Os espaços desta linha não combinam com os das linhas de cima. Confira a indentação!');
        }
      }

      const body = stack[stack.length - 1].body;
      if (/^else\b/.test(code)) {
        if (!/^else\s*:$/.test(code)) throw this.err(ln, 'Escreva assim: <code>else:</code>');
        const prev = body[body.length - 1];
        if (!prev || prev.type !== 'if' || prev.elseBody) throw this.err(ln, 'O <code>else:</code> precisa vir logo depois de um <code>if</code>, com os mesmos espaços no começo.');
        prev.elseBody = [];
        pending = { body: prev.elseBody, line: ln, kw: 'else' };
        return;
      }
      const node = this.pyStatement(code, ln);
      body.push(node);
      if (node.body) pending = { body: node.body, line: ln, kw: node.kw };
    });

    if (pending) throw this.err(pending.line, `O <code>${pending.kw}</code> precisa de pelo menos uma linha dentro dele (com espaços no começo).`);
    return root;
  },

  /* condição dos sensores: frente_livre(), na_bandeira() e o not */
  pyCond(s, ln) {
    s = s.trim().replace(/^\((.*)\)$/, '$1').trim();
    const m = s.match(/^(not\s+)?(?:guardinho\s*\.\s*)?(frente_livre|na_bandeira)\s*\(\s*\)$/);
    if (m) return { not: !!m[1], sensor: m[2] === 'frente_livre' ? 'frente' : 'bandeira', line: ln };
    if (/^True$/.test(s)) throw this.err(ln, 'Aqui o <code>while True</code> nunca acabaria! Use um sensor: <code>while frente_livre():</code>');
    if (/^(not\s+)?(frente_livre|na_bandeira)$/.test(s)) throw this.err(ln, `Faltaram os parênteses: <code>${s}()</code>`);
    if (/frente_livre|na_bandeira/i.test(s)) throw this.err(ln, 'Python diferencia maiúsculas: escreva <code>frente_livre()</code> ou <code>na_bandeira()</code>.');
    if (/frenteLivre|naBandeira|!/.test(s)) throw this.err(ln, 'Isso parece Java! Em Python: <code>frente_livre()</code>, <code>na_bandeira()</code> e <code>not</code>.');
    throw this.err(ln, 'Na condição use um sensor: <code>frente_livre()</code> ou <code>na_bandeira()</code> (com <code>not</code> se quiser inverter).');
  },

  pyStatement(code, ln) {
    let m;
    if (/[{}]/.test(code)) throw this.err(ln, 'Em Python não usamos chaves <code>{ }</code>. Os espaços no começo da linha mostram o que está dentro do <code>for</code>.');

    if (/^for\b/.test(code)) {
      if (/^for\s*\(/.test(code)) throw this.err(ln, 'Isso parece Java! Em Python o for é assim: <code>for i in range(4):</code>');
      if (!code.endsWith(':')) throw this.err(ln, 'Faltaram os dois pontos <code>:</code> no final do <code>for</code>.');
      m = code.match(/^for\s+([A-Za-z_]\w*)\s+in\s+range\s*\(\s*(\d+)\s*\)\s*:$/);
      if (!m) throw this.err(ln, 'Escreva o for assim: <code>for i in range(4):</code>');
      const times = +m[2];
      if (times > 50) throw this.err(ln, 'Calma! Use no máximo <code>range(50)</code>.');
      return { type: 'loop', times, body: [], line: ln, kw: 'for' };
    }

    if (/^(while|if|elif)\b/.test(code)) {
      const kw = code.match(/^(while|if|elif)/)[1];
      if (kw === 'elif') throw this.err(ln, 'Nesta arena use só <code>if</code> e <code>else</code>.');
      if (/\{\s*$/.test(code)) throw this.err(ln, `Isso parece Java! Em Python: <code>${kw} frente_livre():</code>`);
      if (!code.endsWith(':')) throw this.err(ln, `Faltaram os dois pontos <code>:</code> no final do <code>${kw}</code>.`);
      const cond = this.pyCond(code.slice(kw.length, -1), ln);
      return { type: kw, cond, body: [], line: ln, kw };
    }

    code = code.replace(/;\s*$/, '').replace(/^guardinho\s*\.\s*/, '');
    if (/^(frente_livre|na_bandeira)\s*\(/.test(code)) throw this.err(ln, `<code>${code.split('(')[0]}()</code> é uma pergunta: use dentro de um <code>if</code> ou <code>while</code>.`);

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
    if (/^def\b/.test(code)) throw this.err(ln, 'Nesta arena não criamos funções. Use os comandos do Guardinho!');
    throw this.err(ln, `Não conheço <code>${esc(code.slice(0, 30))}</code>. Comandos: <code>frente()</code>, <code>direita()</code>, <code>esquerda()</code>, <code>print()</code>, <code>for</code>, <code>while</code> e <code>if</code>.`);
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
      if (t.t === 'id' && (t.v === 'while' || t.v === 'if')) return condStatement();
      if (t.t === 'id' && t.v === 'else') throw self.err(t.line, 'Esse <code>else</code> está sem um <code>if</code> antes dele.');
      if (t.t === 'id' && t.v === 'guardinho') return heroStatement();
      if (t.t === 'id' && t.v === 'System') return printStatement();
      if (t.t === 'id' && CMDS.includes(t.v)) throw self.err(t.line, `Em Java os comandos começam com <code>guardinho.</code> Escreva: <code>guardinho.${t.v}();</code>`);
      if (t.t === 'id' && /^guardinho$/i.test(t.v)) throw self.err(t.line, 'Java diferencia maiúsculas: escreva <code>guardinho</code> com letras minúsculas.');
      if (t.t === 'id' && t.v === 'robo') throw self.err(t.line, 'Aqui quem anda é o cavaleiro: escreva <code>guardinho.frente();</code>');
      if (t.t === 'id' && /^(void|public|class)$/.test(t.v)) throw self.err(t.line, 'Nesta arena não criamos métodos nem classes. Use os comandos do Guardinho!');
      if (t.t === 'id' && t.v === 'print') throw self.err(t.line, 'Em Java o print é assim: <code>System.out.println("Oi!");</code>');
      throw self.err(t.line, `Não conheço <code>${esc(t.v)}</code>. Use <code>guardinho.frente();</code>, <code>guardinho.direita();</code>, <code>guardinho.esquerda();</code>, <code>for</code>, <code>while</code> ou <code>if</code>.`);
    }
    function cond() {
      const t = peek();
      if (!t) throw self.err(lastLine(), 'Faltou a condição.');
      let not = false;
      if (t.v === '!') { next(); not = true; }
      const g = next();
      if (g && g.v === 'true') throw self.err(g.line, 'Aqui o <code>while (true)</code> nunca acabaria! Use um sensor: <code>guardinho.frenteLivre()</code>');
      if (g && (g.v === 'frente_livre' || g.v === 'na_bandeira' || g.v === 'not')) throw self.err(g.line, 'Isso parece Python! Em Java: <code>guardinho.frenteLivre()</code>, <code>guardinho.naBandeira()</code> e <code>!</code> para inverter.');
      if (!g || g.v !== 'guardinho') throw self.err(g ? g.line : lastLine(), 'Na condição use um sensor: <code>guardinho.frenteLivre()</code> ou <code>guardinho.naBandeira()</code>.');
      expect('.', 'Depois de <code>guardinho</code> vem um ponto.');
      const s = next();
      if (!s || (s.v !== 'frenteLivre' && s.v !== 'naBandeira')) {
        if (s && /^(frentelivre|nabandeira)$/i.test(s.v)) throw self.err(s.line, 'Java diferencia maiúsculas: <code>frenteLivre()</code> e <code>naBandeira()</code>.');
        throw self.err(s ? s.line : lastLine(), 'Os sensores são <code>frenteLivre()</code> e <code>naBandeira()</code>.');
      }
      expect('(', `Faltaram os parênteses: <code>guardinho.${s.v}()</code>`);
      expect(')', 'Faltou fechar o parêntese <code>)</code>.');
      return { not, sensor: s.v === 'frenteLivre' ? 'frente' : 'bandeira', line: s.line };
    }
    function condStatement() {
      const t = next();
      expect('(', `Depois do <code>${t.v}</code> vem a condição entre parênteses: <code>${t.v} (guardinho.frenteLivre()) {</code>`);
      const c = cond();
      expect(')', `Faltou fechar o parêntese <code>)</code> do ${t.v}.`);
      const body = (peek() && peek().v === '{') ? block() : [statement()];
      const node = { type: t.v, cond: c, body, line: t.line };
      if (t.v === 'if' && peek() && peek().v === 'else') {
        next();
        node.elseBody = (peek() && peek().v === '{') ? block() : [statement()];
      }
      return node;
    }
    function heroStatement() {
      const t = next();
      expect('.', 'Depois de <code>guardinho</code> vem um ponto: <code>guardinho.frente();</code>');
      const name = next();
      if (!name || name.t !== 'id') throw self.err(t.line, 'Depois de <code>guardinho.</code> vem o nome do comando: frente, direita ou esquerda.');
      if (name.v === 'frenteLivre' || name.v === 'naBandeira') throw self.err(name.line, `<code>${name.v}()</code> é uma pergunta: use dentro de um <code>if</code> ou <code>while</code>.`);
      if (!CMDS.includes(name.v)) {
        if (CMDS.includes(name.v.toLowerCase())) throw self.err(name.line, `Java diferencia maiúsculas: escreva <code>guardinho.${name.v.toLowerCase()}();</code>`);
        throw self.err(name.line, `O Guardinho não conhece <code>${esc(name.v)}</code>. Use frente, direita ou esquerda.`);
      }
      expect('(', `Faltaram os parênteses: <code>guardinho.${name.v}();</code>`);
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

  hasCode(nodes) { return nodes.some((n) => n.type !== 'noop'); },

  /* Roda o programa passo a passo: cada ação sai na hora, e os sensores
     leem o mundo (w) já atualizado pelas ações anteriores. */
  *exec(nodes, w) {
    for (const n of nodes) {
      if (n.type === 'loop') {
        for (let k = 0; k < n.times; k++) yield* this.exec(n.body, w);
      } else if (n.type === 'while') {
        while (this.test(n.cond, w)) yield* this.exec(n.body, w);
      } else if (n.type === 'if') {
        if (this.test(n.cond, w)) yield* this.exec(n.body, w);
        else if (n.elseBody) yield* this.exec(n.elseBody, w);
      } else if (n.type === 'move') {
        for (let k = 0; k < n.n; k++) yield { a: 'move', line: n.line };
      } else if (n.type === 'turn') {
        yield { a: 'turn', dir: n.dir, line: n.line };
      } else if (n.type === 'say') {
        yield { a: 'say', text: n.text, line: n.line };
      }
    }
  },
  test(c, w) {
    w.checks = (w.checks || 0) + 1;
    if (w.checks > 5000) throw this.err(c.line, 'O programa ficou preso num loop infinito! Confira a condição do <code>while</code>.');
    const v = c.sensor === 'frente' ? w.frenteLivre() : w.naBandeira();
    return c.not ? !v : v;
  },

  /* Lista de ações de um programa sem sensores (usada na demo do topo) */
  flatten(nodes) {
    const sem = () => { throw this.err(0, 'Este programa usa sensores.'); };
    const out = [];
    for (const a of this.exec(nodes, { frenteLivre: sem, naBandeira: sem })) {
      out.push(a);
      if (out.length > this.MAX_ACTIONS) throw this.err(a.line, 'Programa comprido demais! Use números menores no for.');
    }
    return out;
  }
};

/* ---------- Simulação (sem tela, também usada nos testes) ---------- */
function arenaLevelState(lv, map = lv.map) {
  const st = { x: 0, y: 0, d: lv.dir, gx: -1, gy: -1, bats: new Set() };
  map.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === 'R' || ch === 'X') { st.x = x; st.y = y; }
    if (ch === 'G' || ch === 'X') { st.gx = x; st.gy = y; }
    if (ch === 'B') st.bats.add(x + ',' + y);
  }));
  return st;
}
const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const arenaMaps = (lv) => (lv.variants ? lv.variants() : [lv.map]);

/* sensores do Guardinho, lendo o estado atual (st) no mapa */
function arenaWorld(st, map) {
  return {
    checks: 0,
    frenteLivre() {
      const [dx, dy] = DIRS[st.d];
      const nx = st.x + dx, ny = st.y + dy;
      return ny >= 0 && ny < map.length && nx >= 0 && nx < map[0].length && map[ny][nx] !== '#';
    },
    naBandeira() { return st.x === st.gx && st.y === st.gy; }
  };
}

/* roda um programa inteiro sem animação: diz se passou e por quê */
function arenaSimulate(prog, lv, map) {
  const st = arenaLevelState(lv, map);
  const w = arenaWorld(st, map);
  let n = 0;
  try {
    for (const a of BipLang.exec(prog, w)) {
      if (++n > BipLang.MAX_ACTIONS) return { ok: false, why: 'longo' };
      if (a.a === 'turn') st.d = (st.d + a.dir + 4) % 4;
      if (a.a === 'move') {
        const [dx, dy] = DIRS[st.d];
        const nx = st.x + dx, ny = st.y + dy;
        if (nx < 0 || ny < 0 || ny >= map.length || nx >= map[0].length || map[ny][nx] === '#') return { ok: false, why: 'bateu' };
        st.x = nx; st.y = ny; st.bats.delete(nx + ',' + ny);
      }
    }
  } catch (e) { return { ok: false, why: 'erro', e }; }
  return { ok: st.x === st.gx && st.y === st.gy && st.bats.size === 0, why: 'fim' };
}

/* ---------- Interface da Arena ---------- */
const Arena = {
  lang: 'python',
  level: 0,
  running: false,
  timer: null,
  built: false,
  speed: 300,
  _fresh: true,

  codeKey() { return this.lang + '-' + this.level; },
  starterCode() {
    return this.lang === 'java'
      ? '// Leve o Guardinho até a bandeira\nguardinho.frente();\n'
      : '# Leve o Guardinho até a bandeira\nfrente()\n';
  },
  stars(lang, i) { return (S.arena && S.arena[lang + '-' + i]) || 0; },
  unlocked(i) { return S.mentor || i === 0 || this.stars(this.lang, i - 1) > 0; },
  starsHTML(n) { return `<span class="lvl-stars">${icon('star', n >= 1 ? 'on' : '')}${icon('star', n >= 2 ? 'on' : '')}</span>`; },

  show() {
    this.lang = Store.get('vg_arena_lang', 'python');
    if (!this.built) this.build();
    if (this._fresh) {
      const first = ARENA_LEVELS.findIndex((_, i) => !this.stars(this.lang, i));
      this.level = first < 0 ? 0 : first;
      this._fresh = false;
    }
    if (!this.unlocked(this.level)) this.level = 0;
    this.loadLevel(this.level);
  },

  build() {
    const v = $('#view-arena');
    v.innerHTML = `
    <div class="arena-page wrap">
      <div class="arena-head">
        <div>
          <span class="eyebrow">Arena</span>
          <h1>Missões do Guardinho</h1>
          <p>Escreva código <b>de verdade</b> para levar o cavaleiro até a bandeira, pegando todas as moedas.</p>
        </div>
        <div class="lang-toggle" role="tablist" aria-label="Linguagem">
          <button data-lang="python" role="tab">${langBadge('python', 'mini')}Python</button>
          <button data-lang="java" role="tab">${langBadge('java', 'mini')}Java</button>
        </div>
      </div>
      <div class="level-chips" aria-label="Missões"></div>
      <div class="arena-main">
        <div class="card board-card">
          <div class="level-title"></div>
          <div class="board-wrap"><div class="board" id="board"></div></div>
          <div class="arena-say"><div class="say-knight"></div><div class="say-bubble" aria-live="polite"></div></div>
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
            <button class="btn btn-green ar-run">${icon('play')}Rodar</button>
            <button class="btn btn-white ar-reset" title="Volta o cavaleiro para o começo">${icon('reset')}Recomeçar</button>
            <button class="btn btn-white ar-hint">${icon('bulb')}Dica</button>
          </div>
          <details class="ref">
            <summary>Comandos do Guardinho</summary>
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
      if (!this.unlocked(i)) { this.say('Passe a missão anterior para liberar esta!', 'sad'); Sound.play('bad'); return; }
      this.saveCode();
      this.loadLevel(i);
    });
    $('.ar-run', v).addEventListener('click', () => this.run());
    $('.ar-reset', v).addEventListener('click', () => { this.stop(); this.resetBoard(); this.say('Prontinho! O Guardinho voltou para o começo.'); });
    $('.ar-hint', v).addEventListener('click', () => this.say('<b>Dica:</b> ' + ARENA_LEVELS[this.level].hint[this.lang], 'wow'));
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

  renderChips() {
    $('.level-chips').innerHTML = ARENA_LEVELS.map((l, k) => {
      const st = this.stars(this.lang, k);
      const open = this.unlocked(k);
      const cls = k === this.level ? 'cur' : (open ? (st ? 'done' : 'open') : 'locked');
      return `<button class="lvl ${cls}" data-lv="${k}" aria-label="Missão ${k + 1}">${open ? `<span>${k + 1}</span>` : icon('lock')}${this.starsHTML(st)}</button>`;
    }).join('');
  },

  loadLevel(i) {
    if (i >= ARENA_LEVELS.length) i = ARENA_LEVELS.length - 1;
    this.stop();
    this.level = i;
    const lv = ARENA_LEVELS[i];
    const v = $('#view-arena');

    $$('.lang-toggle button', v).forEach((b) => b.classList.toggle('on', b.dataset.lang === this.lang));
    this.renderChips();

    const lim = lv.limit[this.lang];
    $('.level-title', v).innerHTML = `<small>Missão ${i + 1} de ${ARENA_LEVELS.length}${lv.sensors ? ' · <span class="tag-sensor">sensores</span>' : ''}${lv.variants ? ' · <span class="tag-sensor">mapa surpresa</span>' : ''}</small><h2>${lv.name}</h2><p>${lv.goal}</p>
      <div class="lvl-goals"><span>${icon('star')}Chegar na bandeira</span><span>${icon('star')}${icon('star')}Usar até <b>${lim}</b> linha${lim > 1 ? 's' : ''} de código</span></div>`;
    $('.ed-file', v).innerHTML = this.lang === 'java' ? `${langBadge('java', 'mini')}Missao.java` : `${langBadge('python', 'mini')}missao.py`;

    const isPy = this.lang === 'python';
    let snips = isPy
      ? [['frente()', 'frente()'], ['frente(2)', 'frente(2)'], ['direita()', 'direita()'], ['esquerda()', 'esquerda()'], ['for', 'for i in range(4):\n    §'], ['print', 'print("Oi!")']]
      : [['guardinho.frente();', 'guardinho.frente();'], ['guardinho.frente(2);', 'guardinho.frente(2);'], ['guardinho.direita();', 'guardinho.direita();'], ['guardinho.esquerda();', 'guardinho.esquerda();'], ['for', 'for (int i = 0; i < 4; i++) {\n    §\n}'], ['println', 'System.out.println("Oi!");']];
    if (lv.sensors) {
      snips = snips.filter(([l]) => !/print|frente\(2\)/.test(l)).concat(isPy
        ? [['while frente_livre()', 'while frente_livre():\n    §'], ['while not na_bandeira()', 'while not na_bandeira():\n    §'], ['if / else', 'if frente_livre():\n    §\nelse:\n    ']]
        : [['while (frenteLivre)', 'while (guardinho.frenteLivre()) {\n    §\n}'], ['while (!naBandeira)', 'while (!guardinho.naBandeira()) {\n    §\n}'], ['if / else', 'if (guardinho.frenteLivre()) {\n    §\n} else {\n    \n}']]);
    }
    $('.snips', v).innerHTML = '<span class="snips-label">Atalhos:</span>' + snips.map(([label, code]) => `<button class="snip" data-snip="${esc(code)}">${esc(label)}</button>`).join('');

    $('.ref-body', v).innerHTML = (isPy ? [
      ['frente()', 'anda 1 casa para frente'], ['frente(3)', 'anda 3 casas'], ['direita()', 'vira 90° para a direita'], ['esquerda()', 'vira 90° para a esquerda'],
      ['for i in range(4):', 'repete 4 vezes as linhas de dentro (com 4 espaços no começo)'], ['print("Oi!")', 'o Guardinho fala'], ['# texto', 'comentário: o Python ignora'],
      ['frente_livre()', 'sensor: True se não tem parede na frente'], ['na_bandeira()', 'sensor: True se está em cima da bandeira'],
      ['while frente_livre():', 'repete enquanto a condição for verdadeira'], ['if frente_livre():', 'decide: se for verdade faz o de dentro; senão, o do else:']
    ] : [
      ['guardinho.frente();', 'anda 1 casa para frente'], ['guardinho.frente(3);', 'anda 3 casas'], ['guardinho.direita();', 'vira 90° para a direita'], ['guardinho.esquerda();', 'vira 90° para a esquerda'],
      ['for (int i = 0; i < 4; i++) { }', 'repete 4 vezes o que está entre as chaves'], ['System.out.println("Oi!");', 'o Guardinho fala'], ['// texto', 'comentário: o Java ignora'],
      ['guardinho.frenteLivre()', 'sensor: true se não tem parede na frente'], ['guardinho.naBandeira()', 'sensor: true se está em cima da bandeira'],
      ['while (guardinho.frenteLivre()) { }', 'repete enquanto a condição for verdadeira'], ['if (...) { } else { }', 'decide entre dois caminhos (use ! para inverter)']
    ]).map(([c, d]) => `<div class="ref-row"><code>${highlight(c, this.lang)}</code><span>${d}</span></div>`).join('') +
      '<p class="ref-note">Estes são comandos especiais do simulador. No robô de verdade os nomes mudam (você aprende nas trilhas), mas a lógica é a mesmíssima.</p>';

    const saved = Store.get('vg_arena_code', {})[this.codeKey()];
    this.ta.value = saved != null ? saved : this.starterCode();
    this.ta.readOnly = false;
    this.clearHl();
    this.sync();
    this.resetBoard(true);
    const st = this.stars(this.lang, i);
    this.say(st ? `Você já tem ${st} estrela${st > 1 ? 's' : ''} nesta missão. Quer tentar de novo?` : `${lv.goal} Escreva o código e aperte <b>Rodar</b>.`);
  },

  /* ---- tabuleiro ---- */
  resetBoard(sortear) {
    const lv = ARENA_LEVELS[this.level];
    if (sortear || !this.map || this.mapLevel !== this.level) {
      this.map = lv.variants ? pick(lv.variants()) : lv.map;
      this.mapLevel = this.level;
    }
    this.st = arenaLevelState(lv, this.map);
    this.angle = this.st.d * 90;
    const b = $('#board');
    let cells = '';
    this.map.forEach((row, y) => [...row].forEach((ch, x) => {
      const cls = ['cell', (x + y) % 2 ? 'alt' : ''];
      let inner = '';
      if (ch === '#') cls.push('rock');
      if (ch === 'G' || ch === 'X') inner += `<span class="cell-flag">${FLAG_SVG}</span>`;
      if (ch === 'B') inner += `<span class="cell-coin" data-xy="${x},${y}">${COIN_SVG}</span>`;
      cells += `<div class="${cls.join(' ')}">${inner}</div>`;
    }));
    b.innerHTML = cells + `<div class="bot" id="bot">${boardKnightHTML()}<div class="bot-say" hidden></div></div>`;
    this.bot = $('#bot');
    this.placeBot(true);
  },
  placeBot(instant) {
    const bot = this.bot;
    if (instant) bot.classList.add('no-anim');
    bot.style.setProperty('--x', this.st.x);
    bot.style.setProperty('--y', this.st.y);
    $('.bot-dir', bot).style.transform = `rotate(${this.angle}deg)`;
    if (instant) { void bot.offsetWidth; bot.classList.remove('no-anim'); }
  },

  /* ---- execução ---- */
  run() {
    if (this.running) { this.stop(); this.say('Programa parado.'); return; }
    this.resetBoard(!!ARENA_LEVELS[this.level].variants);
    this.clearHl();
    let prog, gen;
    const showErr = (e) => {
      if (!e.bip) throw e;
      this.stop();
      if (e.line) this.markLine(e.line, true);
      this.say(`${e.line ? `<b>Linha ${e.line}:</b> ` : ''}${e.message}`, 'sad', 'err');
      Sound.play('bad');
    };
    try {
      prog = BipLang.parse(this.ta.value, this.lang);
      if (!BipLang.hasCode(prog)) throw BipLang.err(0, 'Escreva algum comando primeiro!');
      gen = BipLang.exec(prog, arenaWorld(this.st, this.map));
    } catch (e) { showErr(e); return; }
    this.prog = prog;
    this.running = true;
    this.ta.readOnly = true;
    const rb = $('.ar-run');
    rb.innerHTML = `${icon('x')}Parar`;
    rb.classList.replace('btn-green', 'btn-red');
    this.say('Rodando...', 'normal');
    let k = 0;
    const step = () => {
      if (!this.running) return;
      let r;
      try { r = gen.next(); } catch (e) { showErr(e); return; }
      if (r.done) return this.finish();
      if (++k > BipLang.MAX_ACTIONS) { showErr(BipLang.err(r.value.line, 'Programa comprido demais! Será que o <code>while</code> nunca termina?')); return; }
      const act = r.value;
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
        const map = this.map;
        const out = nx < 0 || ny < 0 || ny >= map.length || nx >= map[0].length;
        if (out || map[ny][nx] === '#') return this.crash(act.line, out);
        st.x = nx; st.y = ny;
        this.placeBot();
        Sound.play('move');
        const key = nx + ',' + ny;
        if (st.bats.has(key)) {
          st.bats.delete(key);
          const coin = $(`.cell-coin[data-xy="${key}"]`);
          if (coin) setTimeout(() => coin.classList.add('got'), this.speed * 0.6);
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
    if (r && r.classList.contains('btn-red')) { r.innerHTML = `${icon('play')}Rodar`; r.classList.replace('btn-red', 'btn-green'); }
  },
  crash(line, out) {
    this.stop();
    this.bot.classList.add('crash');
    setTimeout(() => this.bot && this.bot.classList.remove('crash'), 600);
    this.markLine(line, true);
    Sound.play('crash');
    this.say(`Ops! Na <b>linha ${line}</b> o Guardinho ${out ? 'tentou sair do tabuleiro' : 'bateu numa pedra'}. Ajuste o código e tente de novo.`, 'sad', 'err');
  },
  finish() {
    this.stop();
    const st = this.st;
    const lv = ARENA_LEVELS[this.level];
    const onGoal = st.x === st.gx && st.y === st.gy;
    if (!onGoal || st.bats.size) {
      const f = st.bats.size;
      const moedas = `${f} moeda${f > 1 ? 's' : ''}`;
      const msg = !onGoal && f ? `O Guardinho não chegou na bandeira e ainda faltam ${moedas}.`
        : !onGoal ? 'Quase! O Guardinho não terminou em cima da bandeira.'
        : `Chegou na bandeira, mas faltou pegar ${moedas}!`;
      this.say(msg + ' Tente de novo, você consegue!', 'sad', 'err');
      Sound.play('bad');
      return;
    }
    // mapa surpresa: o código precisa funcionar em todos os mapas, não só neste
    if (lv.variants && lv.variants().some((m) => !arenaSimulate(this.prog, lv, m).ok)) {
      this.say('Chegou neste mapa! Mas o mapa muda a cada vez, e o seu código não funciona em todos. Use os <b>sensores</b> para o Guardinho decidir sozinho.', 'wow', 'err');
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
    const nextBtn = isLast ? '' : ' <button class="btn btn-green btn-sm say-next">Próxima missão</button>';
    const msg = stars === 2
      ? `<b>Perfeito, 2 estrelas!</b> Código enxuto com ${lines} linha${lines > 1 ? 's' : ''}.${xp ? ` <b>+${xp} XP</b>` : ''}${isLast ? ' Você zerou a Arena!' : ''}`
      : `<b>Passou, 1 estrela!</b>${xp ? ` <b>+${xp} XP</b>.` : ''} Desafio extra: consegue fazer com até ${lim} linha${lim > 1 ? 's' : ''}? Dica: use o <code>for</code>.`;
    this.say(msg + nextBtn, 'happy', 'win');
    afterReward();
    this.renderChips();
  },

  say(html, mood = 'happy', kind = '') {
    const wrap = $('.arena-say');
    if (!wrap) return;
    $('.say-knight', wrap).innerHTML = knightSVG(mood);
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
    const cs = getComputedStyle(this.ta);
    const lh = parseFloat(cs.lineHeight) || 24;
    const pt = parseFloat(cs.paddingTop) || 12;
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
