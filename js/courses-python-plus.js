/* =========================================================
   VanCode · trilha Python (continuação)
   Unidades 4 a 8: do Python intermediário até robótica
   avançada no LEGO SPIKE Prime.
   (formato dos passos explicado em courses.js)
   ========================================================= */
'use strict';

COURSES.python.units.push(
  /* ---------------- Unidade 4 ---------------- */
  {
    name: 'Listas, textos e lógica',
    desc: 'elif, and/or, f-strings, listas e for em listas',
    color: '#8B5CF6',
    lessons: [
      {
        id: 'py-elif',
        title: 'Mais decisões',
        steps: [
          { t: 'teach', title: 'elif: mais de dois caminhos',
            text: 'Quando existem várias opções, use <code>elif</code> (senão, se). O Python testa de cima para baixo e para no <b>primeiro</b> que for verdadeiro.',
            code: _('distancia = 25', 'if distancia < 10:', '    print("Pare!")', 'elif distancia < 30:', '    print("Devagar...")', 'else:', '    print("Pode acelerar!")'),
            tip: 'Só UM dos blocos roda, mesmo que mais de uma condição seja verdadeira.' },
          { t: 'choice', q: 'O que aparece na tela?',
            code: _('distancia = 25', 'if distancia < 10:', '    print("Pare!")', 'elif distancia < 30:', '    print("Devagar...")', 'else:', '    print("Pode acelerar!")'),
            options: ['Devagar...', 'Pare!', 'Pode acelerar!', 'Devagar... e Pode acelerar!'], a: 0 },
          { t: 'teach', title: 'and, or e not',
            text: 'Junte condições com <code>and</code> (as duas precisam ser verdade), <code>or</code> (basta uma) e <code>not</code> (inverte).',
            code: _('tem_bateria = True', 'botao = False', 'if tem_bateria and botao:', '    print("Partiu!")', 'if tem_bateria or botao:', '    print("Pelo menos uma é verdade")', 'if not botao:', '    print("Aperte o botão")') },
          { t: 'choice', q: '<code>True and False</code> dá...', co: true,
            options: ['False', 'True', 'None', 'Erro'], a: 0,
            why: '<code>and</code> só é True quando os dois lados são True.' },
          { t: 'fill', q: 'O robô para se a distância for menor que 10 <b>OU</b> o botão estiver apertado:',
            code: _('if distancia < 10 ___ botao:', '    parar()'),
            options: ['or', 'and', 'not', '||'], a: 'or',
            why: 'Em Python escrevemos <code>or</code> e <code>and</code> por extenso. Os símbolos || e &amp;&amp; são do Java.' },
          { t: 'order', q: 'Monte a medalha da missão: 100 ou mais é ouro, 50 ou mais é prata, senão bronze.',
            lines: ['if pontos >= 100:', '    print("Ouro")', 'elif pontos >= 50:', '    print("Prata")', 'else:', '    print("Bronze")'] },
          { t: 'choice', q: 'O Python deixa comparar assim. O que aparece?', code: _('x = 15', 'print(10 < x < 20)'),
            options: ['True', 'False', '15', 'Erro'], a: 0,
            why: 'É o mesmo que <code>10 &lt; x and x &lt; 20</code>.' }
        ]
      },
      {
        id: 'py-textos',
        title: 'Textos e f-strings',
        steps: [
          { t: 'teach', title: 'Brincando com textos',
            text: 'Um texto (string) pode ser medido, transformado e misturado com números usando uma <b>f-string</b>.',
            code: _('nome = "Vanguard"', 'print(len(nome))       # 8', 'print(nome.upper())    # VANGUARD', 'pontos = 42', 'print(f"{nome} fez {pontos} pontos!")'),
            tip: 'O <code>f</code> antes das aspas cria uma f-string: o que está entre <code>{ }</code> vira o valor da variável.' },
          { t: 'choice', q: 'O que mostra <code>len("robo")</code>?',
            options: ['4', '5', '3', 'robo'], a: 0 },
          { t: 'fill', q: 'Complete para mostrar <b>Volta 3</b>:', code: _('volta = 3', 'print(___"Volta {volta}")'),
            options: ['f', 's', 'str', '$'], a: 'f' },
          { t: 'choice', q: 'Este código dá erro. Por quê?', code: _('pontos = 10', 'print("Pontos: " + pontos)'),
            options: ['Não dá para somar texto com número', 'Faltaram aspas no 10', 'O print não aceita +', 'Não tem erro'], a: 0,
            why: 'Use <code>f"Pontos: {pontos}"</code> ou <code>"Pontos: " + str(pontos)</code>.' },
          { t: 'choice', q: 'O que aparece?', code: _('cor = "azul"', 'print(cor.upper())'),
            options: ['AZUL', 'azul', 'Azul', 'cor.upper()'], a: 0 },
          { t: 'type', q: 'Mostre <b>Bateria: 80%</b> usando a variável <code>bateria</code> numa f-string:', code: 'bateria = 80',
            a: ['print(f"Bateria: {bateria}%")'], ph: 'print(f"...")' }
        ]
      },
      {
        id: 'py-listas',
        title: 'Listas',
        steps: [
          { t: 'teach', title: 'Uma caixa com várias coisas',
            text: 'Uma <b>lista</b> guarda vários valores em ordem, entre colchetes <code>[ ]</code>. Cada item tem uma posição (índice) que <b>começa no 0</b>.',
            code: _('portas = ["A", "B", "C", "D"]', 'print(portas[0])    # A', 'print(portas[-1])   # D (o último)', 'print(len(portas))  # 4', 'portas.append("E")  # coloca no final') },
          { t: 'choice', q: 'O que aparece?', code: _('missoes = ["ponte", "torre", "barco"]', 'print(missoes[1])'),
            options: ['torre', 'ponte', 'barco', 'Erro'], a: 0,
            why: 'O índice começa no 0: <code>missoes[0]</code> é "ponte" e <code>missoes[1]</code> é "torre".' },
          { t: 'fill', q: 'Adicione 300 no final da lista:', code: _('velocidades = [100, 200]', 'velocidades.___(300)'),
            options: ['append', 'add', 'push', 'insert'], a: 'append' },
          { t: 'choice', q: 'Quantos itens tem a lista?', code: _('notas = [7, 9, 10, 8, 6]', 'print(len(notas))'),
            options: ['5', '4', '6', '10'], a: 0 },
          { t: 'choice', q: 'Qual índice pega o <b>último</b> item de qualquer lista?', co: true,
            options: ['[-1]', '[0]', '[len]', '[fim]'], a: 0 },
          { t: 'choice', q: 'O que acontece?', code: _('cores = ["azul", "verde"]', 'print(cores[2])'),
            options: ['Erro: IndexError (não existe índice 2)', 'Mostra verde', 'Mostra azul', 'Não mostra nada'], a: 0,
            why: 'Com 2 itens, os índices são só 0 e 1.' }
        ]
      },
      {
        id: 'py-percorrer',
        title: 'Percorrendo listas',
        steps: [
          { t: 'teach', title: 'for em listas',
            text: 'O <code>for</code> pode passar por cada item de uma lista, um de cada vez.',
            code: _('missoes = ["ponte", "torre", "barco"]', 'for missao in missoes:', '    print(f"Fazendo: {missao}")', '', 'total = 0', 'for ponto in [10, 20, 30]:', '    total = total + ponto', 'print(total)   # 60') },
          { t: 'choice', q: 'Quantas vezes o print roda?', code: _('for cor in ["vermelho", "azul", "verde", "preto"]:', '    print(cor)'),
            options: ['4', '3', '1', '5'], a: 0 },
          { t: 'choice', q: 'O que aparece no final?', code: _('soma = 0', 'for n in [5, 5, 10]:', '    soma = soma + n', 'print(soma)'),
            options: ['20', '10', '5 5 10', '0'], a: 0 },
          { t: 'fill', q: 'Complete para percorrer a lista:', code: _('for nome ___ equipe:', '    print(nome)'),
            options: ['in', 'of', 'on', '='], a: 'in' },
          { t: 'teach', title: 'Está na lista?',
            text: 'Use <code>in</code> também para perguntar se algo está dentro da lista:',
            code: _('cores_boas = ["verde", "azul"]', 'if "verde" in cores_boas:', '    print("Pode passar!")') },
          { t: 'order', q: 'Ache o maior valor da lista <code>leituras</code>:',
            lines: ['maior = 0', 'for v in leituras:', '    if v > maior:', '        maior = v', 'print(maior)'] }
        ]
      }
    ]
  },

  /* ---------------- Unidade 5 ---------------- */
  {
    name: 'Funções e organização',
    desc: 'return, módulos, leitura de erros e dicionários',
    color: '#E5487A',
    lessons: [
      {
        id: 'py-return',
        title: 'Parâmetros e return',
        steps: [
          { t: 'teach', title: 'Funções que recebem e devolvem',
            text: 'Parâmetros são as <b>entradas</b> da função. Com <code>return</code> ela devolve um resultado. Dá até para dar um <b>valor padrão</b>.',
            code: _('def graus_para_voltas(graus):', '    return graus / 360', '', 'def apitar(vezes=1):', '    for i in range(vezes):', '        print("Bip!")', '', 'print(graus_para_voltas(720))  # 2.0', 'apitar()      # 1 Bip', 'apitar(3)     # 3 Bips') },
          { t: 'choice', q: 'O que aparece?', code: _('def media(a, b):', '    return (a + b) / 2', '', 'print(media(4, 8))'),
            options: ['6.0', '12', '4 8', 'media'], a: 0,
            why: 'A divisão com <code>/</code> sempre dá um número com ponto (float).' },
          { t: 'choice', q: 'Quantos “Bip” aparecem?', code: _('def apitar(vezes=2):', '    for i in range(vezes):', '        print("Bip")', '', 'apitar()', 'apitar(1)'),
            options: ['3', '2', '1', '4'], a: 0,
            why: '<code>apitar()</code> usa o padrão 2, e <code>apitar(1)</code> faz mais 1.' },
          { t: 'choice', q: 'O que acontece com o código depois do <code>return</code>?', code: _('def teste():', '    return 5', '    print("Oi")'),
            options: ['Nunca roda: o return sai da função', 'Roda normal', 'Dá erro', 'Roda duas vezes'], a: 0 },
          { t: 'fill', q: 'Faça a função devolver o dobro:', code: _('def dobro(n):', '    ___ n * 2'),
            options: ['return', 'print', 'def', 'give'], a: 'return' },
          { t: 'type', q: 'Chame a função <code>andar</code> passando <b>30</b>:', a: ['andar(30)'], ph: 'andar(...)' }
        ]
      },
      {
        id: 'py-math',
        title: 'Módulos e matemática',
        steps: [
          { t: 'teach', title: 'import traz superpoderes',
            text: 'O Python já vem com módulos prontos. O <code>math</code> tem o π, raiz quadrada e muito mais. E algumas funções nem precisam de import: <code>abs</code>, <code>round</code>, <code>min</code> e <code>max</code>.',
            code: _('import math', 'print(math.pi)          # 3.14159...', 'print(math.sqrt(16))    # 4.0', 'print(abs(-7))          # 7', 'print(round(3.6))       # 4', 'print(max(3, 9, 5))     # 9'),
            tip: 'No robô, <code>abs()</code> é ótimo para medir o tamanho de um erro sem se importar com o sinal.' },
          { t: 'choice', q: 'Quanto dá <code>abs(-12)</code>?',
            options: ['12', '-12', '0', 'Erro'], a: 0 },
          { t: 'choice', q: 'A roda do SPIKE tem 5,6 cm de diâmetro. Quanto o robô anda em 1 volta da roda?',
            options: ['Uns 17,6 cm (π × 5,6)', '5,6 cm', '11,2 cm', '360 cm'], a: 0,
            why: 'Uma volta da roda anda a circunferência: π × diâmetro ≈ 3,14 × 5,6 ≈ 17,6 cm.' },
          { t: 'fill', q: 'Complete para usar o π:', code: _('import math', 'volta_cm = ___.pi * 5.6'),
            options: ['math', 'pi', 'Math', 'import'], a: 'math' },
          { t: 'choice', q: 'O que aparece?', code: 'print(min(80, 35, 60))',
            options: ['35', '80', '60', '175'], a: 0 },
          { t: 'choice', q: 'Para que serve o <code>round()</code>?',
            options: ['Arredondar um número', 'Fazer o robô girar', 'Desenhar um círculo', 'Repetir o código'], a: 0 }
        ]
      },
      {
        id: 'py-erros',
        title: 'Lendo erros (debug)',
        steps: [
          { t: 'teach', title: 'Erro não é derrota, é pista!',
            text: 'Quando algo dá errado, o Python mostra o <b>tipo</b> do erro e a <b>linha</b>. Os mais comuns:',
            code: _('# SyntaxError      → escrita errada (faltou : ou parêntese)', '# IndentationError → espaços errados no começo da linha', '# NameError        → nome que não existe (erro de digitação?)', '# TypeError        → misturou tipos, como texto + número', '# ZeroDivisionError→ dividiu por zero'),
            tip: 'Programadores profissionais passam muito tempo lendo erros. Comece pela última linha da mensagem!' },
          { t: 'choice', q: 'Qual erro este código dá?', code: _('velocidade = 300', 'print(velocdade)'),
            options: ['NameError', 'SyntaxError', 'TypeError', 'Nenhum'], a: 0,
            why: '<code>velocdade</code> (sem o i) não existe: foi erro de digitação.' },
          { t: 'choice', q: 'E este?', code: _('if pontos > 10', '    print("Boa!")'),
            options: ['SyntaxError', 'NameError', 'TypeError', 'ZeroDivisionError'], a: 0,
            why: 'Faltaram os dois pontos <code>:</code> no final do if.' },
          { t: 'choice', q: 'E este?', code: 'print("Voltas: " + 3)',
            options: ['TypeError', 'NameError', 'IndentationError', 'Nenhum'], a: 0 },
          { t: 'fill', q: 'Conserte: transforme o texto em número <b>inteiro</b>.', code: _('voltas = ___("3")', 'print(voltas * 360)'),
            options: ['int', 'str', 'len', 'text'], a: 'int' },
          { t: 'choice', q: 'Qual a melhor primeira atitude quando aparece um erro?',
            options: ['Ler a mensagem e olhar a linha indicada', 'Apagar tudo e começar de novo', 'Desligar o robô', 'Ignorar'], a: 0 }
        ]
      },
      {
        id: 'py-dicionarios',
        title: 'Dicionários',
        steps: [
          { t: 'teach', title: 'Etiquetas com valores',
            text: 'Um <b>dicionário</b> guarda pares <i>chave: valor</i> entre chaves <code>{ }</code>. Perfeito para guardar a configuração do robô.',
            code: _('robo = {"nome": "Bip", "velocidade": 500, "porta_garra": "C"}', 'print(robo["nome"])          # Bip', 'robo["velocidade"] = 700     # muda o valor', 'print(robo["velocidade"])    # 700') },
          { t: 'choice', q: 'O que aparece?', code: _('cores = {"vermelho": "parar", "verde": "andar"}', 'print(cores["verde"])'),
            options: ['andar', 'parar', 'verde', 'Erro'], a: 0 },
          { t: 'fill', q: 'Pegue a velocidade do dicionário:', code: _('config = {"velocidade": 400}', 'v = config[___]'),
            options: ['"velocidade"', 'velocidade', '0', '(velocidade)'], a: '"velocidade"',
            why: 'A chave é um texto, então vai entre aspas.' },
          { t: 'choice', q: 'Qual a diferença entre lista e dicionário?',
            options: ['A lista usa posições (0, 1, 2...); o dicionário usa chaves com nome', 'Não tem diferença', 'O dicionário só guarda números', 'A lista não pode mudar'], a: 0 },
          { t: 'order', q: 'Monte a configuração e mostre a porta do motor:',
            lines: ['config = {"motor": "A", "sensor": "C"}', 'porta = config["motor"]', 'print(porta)'] }
        ]
      }
    ]
  },

  /* ---------------- Unidade 6 ---------------- */
  {
    name: 'SPIKE em ação',
    desc: 'Luzes, sons, botões, motores e esperas',
    color: '#0284C7',
    lessons: [
      {
        id: 'spike-luz-som',
        title: 'Luzes e sons',
        steps: [
          { t: 'teach', title: 'Fazendo o Hub brilhar e tocar',
            text: 'A matriz de luz tem 5×5 pixels (posições de 0 a 4). O <code>sound.beep</code> recebe a <b>frequência</b> (quanto maior, mais agudo) e a <b>duração</b> em milissegundos.',
            code: _('from hub import light_matrix, sound', 'import runloop', '', 'async def main():', '    light_matrix.show_image(light_matrix.IMAGE_HEART)', '    await sound.beep(440, 500)          # nota Lá por meio segundo', '    light_matrix.set_pixel(2, 2, 100)   # acende o pixel do meio', '    await runloop.sleep_ms(1000)', '    light_matrix.clear()', '', 'runloop.run(main())'),
            tip: '1000 milissegundos = 1 segundo.' },
          { t: 'choice', q: 'Qual linha mostra um coração?', co: true,
            options: ['light_matrix.show_image(light_matrix.IMAGE_HEART)', 'light_matrix.heart()', 'sound.heart()', 'hub.show("coração")'], a: 0 },
          { t: 'fill', q: 'Faça um bip agudo de <b>1 segundo</b>:', code: 'await sound.beep(880, ___)',
            options: ['1000', '1', '60', '10'], a: '1000' },
          { t: 'choice', q: 'Quantos pixels tem a matriz de luz do SPIKE Prime?',
            options: ['25 (5 por 5)', '9 (3 por 3)', '64 (8 por 8)', '100'], a: 0 },
          { t: 'choice', q: 'Por que tem <code>await</code> antes do <code>sound.beep</code>?',
            options: ['Para esperar o som terminar antes de continuar', 'Para o som sair mais alto', 'Porque beep é uma variável', 'Não precisa'], a: 0 },
          { t: 'type', q: 'Apague a matriz de luz:', a: ['light_matrix.clear()'], ph: 'light_matrix....' }
        ]
      },
      {
        id: 'spike-botoes',
        title: 'Botões e sensor de força',
        steps: [
          { t: 'teach', title: 'Apertou, aconteceu',
            text: 'O sensor de força funciona como um botão (e ainda mede a força!). Os botões do próprio Hub também podem ser lidos.',
            code: _('from hub import button, port', 'import force_sensor', '', 'if force_sensor.pressed(port.B):', '    print("Sensor de força apertado!")', '', 'if button.pressed(button.LEFT):', '    print("Botão da esquerda do Hub!")') },
          { t: 'choice', q: 'O que <code>force_sensor.pressed(port.B)</code> devolve?',
            options: ['True ou False (apertado ou não)', 'A cor', 'A distância', 'O número da porta'], a: 0 },
          { t: 'fill', q: 'Leia o botão da <b>direita</b> do Hub:', code: 'if button.pressed(button.___):',
            options: ['RIGHT', 'LEFT', 'DIREITA', 'right'], a: 'RIGHT' },
          { t: 'order', q: 'Espere o sensor de força ser apertado e então ande:',
            lines: ['while not force_sensor.pressed(port.B):', '    await runloop.sleep_ms(10)', 'await motor_pair.move_for_degrees(motor_pair.PAIR_1, 360, 0)'] },
          { t: 'choice', q: 'Por que colocar <code>await runloop.sleep_ms(10)</code> dentro do while?',
            options: ['Para o Hub respirar e cuidar de outras tarefas enquanto espera', 'Para o robô andar 10 cm', 'Para apagar a tela', 'Não faz nada'], a: 0,
            why: 'Sem essa pausinha, o loop gira sem parar e trava o resto do programa.' }
        ]
      },
      {
        id: 'spike-motor-pro',
        title: 'Motores: controle total',
        steps: [
          { t: 'teach', title: 'Liga, desliga e mede',
            text: 'Dá para ligar o motor, desligar quando quiser e ler quanto ele já girou, usando o <b>encoder</b> que fica dentro do motor.',
            code: _('import motor', 'from hub import port', '', 'motor.reset_relative_position(port.A, 0)  # zera a contagem', 'motor.run(port.A, 500)                    # liga a 500 graus/s', 'await runloop.sleep_ms(2000)              # deixa girar 2 s', 'motor.stop(port.A)                        # para', 'print(motor.relative_position(port.A))    # quantos graus girou'),
            tip: '<code>motor.run</code> não tem await: ele só liga o motor, e o programa segue na hora.' },
          { t: 'choice', q: 'O que faz <code>motor.run(port.A, -500)</code>?',
            options: ['Gira para o outro lado', 'Para o motor', 'Gira 500 graus e para', 'Dá erro'], a: 0 },
          { t: 'choice', q: 'Por que <code>motor.run</code> não usa await?',
            options: ['Porque ele só liga o motor e não tem um fim para esperar', 'Porque é mais lento', 'Porque está errado', 'Porque precisa de um botão'], a: 0 },
          { t: 'fill', q: 'Pare o motor da porta A:', code: 'motor.___(port.A)',
            options: ['stop', 'end', 'off', 'pause'], a: 'stop' },
          { t: 'choice', q: 'Girou 2 segundos a 500 graus/s. Mais ou menos quanto o <code>relative_position</code> mostra?',
            options: ['Uns 1000 graus', '500 graus', '2 graus', '360 graus'], a: 0,
            why: '500 graus por segundo × 2 segundos ≈ 1000 graus (pode variar um pouco).' },
          { t: 'type', q: 'Zere a contagem do motor da porta B:', a: ['motor.reset_relative_position(port.B, 0)'], ph: 'motor.reset_...' }
        ]
      },
      {
        id: 'spike-esperar',
        title: 'Esperar até...',
        steps: [
          { t: 'teach', title: 'runloop.until',
            text: 'O <code>runloop.until</code> espera até uma função devolver True. Com <code>lambda</code> você escreve essa funçãozinha numa linha só.',
            code: _('import runloop, force_sensor', 'from hub import port', '', 'def apertado():', '    return force_sensor.pressed(port.B)', '', 'async def main():', '    await runloop.until(apertado)', '    print("Vai!")', '    # o mesmo, com lambda:', '    await runloop.until(lambda: force_sensor.pressed(port.B))') },
          { t: 'choice', q: 'O que <code>await runloop.until(apertado)</code> faz?',
            options: ['Espera até apertado() devolver True', 'Roda apertado() uma vez só', 'Repete para sempre', 'Desliga o Hub'], a: 0 },
          { t: 'choice', q: 'Repare: passamos <code>apertado</code> sem parênteses. Por quê?',
            options: ['Estamos entregando a função para o until chamar várias vezes', 'Esquecemos os parênteses', 'Porque apertado é um número', 'Tanto faz'], a: 0,
            why: 'Com parênteses, a função rodaria uma vez só e entregaria apenas True ou False.' },
          { t: 'fill', q: 'Espere até um obstáculo ficar a menos de 100 mm:', code: 'await runloop.until(___: 0 < distance_sensor.distance(port.D) < 100)',
            options: ['lambda', 'def', 'function', 'until'], a: 'lambda' },
          { t: 'order', q: 'Espere o botão da esquerda, toque um bip e depois mostre Pronto!:',
            lines: ['await runloop.until(lambda: button.pressed(button.LEFT))', 'await sound.beep(660, 300)', 'print("Pronto!")'] }
        ]
      }
    ]
  },

  /* ---------------- Unidade 7 ---------------- */
  {
    name: 'Movimento preciso',
    desc: 'Centímetros, curvas, giroscópio e controle P',
    color: '#2BA346',
    lessons: [
      {
        id: 'spike-cm',
        title: 'Andando X centímetros',
        steps: [
          { t: 'teach', title: 'Centímetros para graus',
            text: 'Os motores entendem <b>graus</b>, mas a missão fala em <b>centímetros</b>. Uma volta da roda (360°) anda π × diâmetro. Com a roda de 5,6 cm, isso dá uns 17,6 cm por volta.',
            code: _('import math', '', 'DIAMETRO = 5.6                    # cm', 'CM_POR_VOLTA = math.pi * DIAMETRO # ≈ 17,6 cm', '', 'async def andar_cm(cm):', '    graus = int(cm / CM_POR_VOLTA * 360)', '    await motor_pair.move_for_degrees(motor_pair.PAIR_1, graus, 0)', '', '# dentro do main:', 'await andar_cm(30)'),
            tip: 'Variáveis em MAIÚSCULAS, como DIAMETRO, são um combinado entre programadores: valores que não mudam.' },
          { t: 'choice', q: 'Para andar 17,6 cm (uma volta), quantos graus?',
            options: ['360', '17,6', '180', '720'], a: 0 },
          { t: 'choice', q: 'E para andar 35,2 cm?',
            options: ['720 graus', '360 graus', '35 graus', '1000 graus'], a: 0,
            why: 'É o dobro de 17,6 cm, então são duas voltas: 720 graus.' },
          { t: 'fill', q: 'Complete a conta de graus:', code: 'graus = int(cm / CM_POR_VOLTA * ___)',
            options: ['360', '100', '3.14', '180'], a: '360' },
          { t: 'choice', q: 'Por que usamos <code>int()</code> no resultado?',
            options: ['Porque o motor espera um número inteiro de graus', 'Para o robô ficar mais rápido', 'Porque int significa interno', 'Para arredondar sempre para cima'], a: 0 },
          { t: 'choice', q: 'Se a equipe trocar para rodas maiores, o que muda no código?',
            options: ['Só o valor de DIAMETRO', 'A função inteira', 'O número 360', 'Nada, nunca muda'], a: 0,
            why: 'É por isso que guardamos o diâmetro numa variável: a mudança é num lugar só.' }
        ]
      },
      {
        id: 'spike-tank',
        title: 'Curvas com tank',
        steps: [
          { t: 'teach', title: 'Cada roda com sua velocidade',
            text: 'No <code>move_tank</code> você escolhe a velocidade da roda esquerda e da direita separadas. Iguais: anda reto. Uma mais rápida: faz curva. Uma para frente e outra para trás: gira no lugar!',
            code: _('# reto', 'await motor_pair.move_tank_for_degrees(motor_pair.PAIR_1, 720, 400, 400)', '# curva para a direita (esquerda mais rápida)', 'await motor_pair.move_tank_for_degrees(motor_pair.PAIR_1, 720, 500, 200)', '# gira no lugar', 'await motor_pair.move_tank_for_degrees(motor_pair.PAIR_1, 360, 300, -300)') },
          { t: 'choice', q: 'Esquerda 300 e direita -300. O que o robô faz?',
            options: ['Gira no lugar', 'Anda reto', 'Para', 'Anda de ré'], a: 0 },
          { t: 'choice', q: 'Para fazer uma curva para a <b>esquerda</b>, qual roda vai mais rápido?',
            options: ['A da direita', 'A da esquerda', 'As duas iguais', 'Nenhuma'], a: 0 },
          { t: 'fill', q: 'Ande reto: complete a velocidade da direita.', code: 'motor_pair.move_tank(motor_pair.PAIR_1, 400, ___)',
            options: ['400', '-400', '0', '200'], a: '400' },
          { t: 'choice', q: 'Qual a diferença entre <code>move_tank</code> e <code>move_tank_for_degrees</code>?',
            options: ['O primeiro liga e segue; o segundo anda uma quantidade e espera (com await)', 'São iguais', 'O primeiro é só para ré', 'O segundo não existe'], a: 0 },
          { t: 'choice', q: 'Por que girar no lugar é útil na competição?',
            options: ['Muda de direção sem sair do lugar, ótimo em espaço apertado', 'Gasta menos bateria', 'Deixa o robô mais pesado', 'Não é útil'], a: 0 }
        ]
      },
      {
        id: 'spike-giro',
        title: 'Giroscópio: girar certinho',
        steps: [
          { t: 'teach', title: 'O Hub sabe para onde aponta',
            text: 'O Hub tem um <b>giroscópio</b>. O <code>motion_sensor.tilt_angles()</code> devolve (yaw, pitch, roll) em <b>décimos de grau</b>: 900 = 90°. O <b>yaw</b> é o giro do robô no chão.',
            code: _('from hub import motion_sensor', '', 'motion_sensor.reset_yaw(0)                  # zera a direção', 'motor_pair.move_tank(motor_pair.PAIR_1, 200, -200)', 'while abs(motion_sensor.tilt_angles()[0]) < 900:', '    await runloop.sleep_ms(5)', 'motor_pair.stop(motor_pair.PAIR_1)          # parou em 90°'),
            tip: 'Girar contando graus da roda erra quando o pneu escorrega. O giroscópio mede o giro de verdade!' },
          { t: 'choice', q: 'Quanto vale 90° no yaw do SPIKE?',
            options: ['900', '90', '9', '9000'], a: 0,
            why: 'Os ângulos vêm em décimos de grau.' },
          { t: 'fill', q: 'Pegue o yaw (o primeiro valor):', code: 'yaw = motion_sensor.tilt_angles()[___]',
            options: ['0', '1', '2', '-1'], a: '0' },
          { t: 'choice', q: 'Por que usamos <code>abs()</code> no yaw?',
            options: ['Para funcionar girando para qualquer lado (o yaw pode ficar negativo)', 'Para girar mais rápido', 'Porque yaw é um texto', 'Não precisa'], a: 0 },
          { t: 'order', q: 'Gire 180° no lugar:',
            lines: ['motion_sensor.reset_yaw(0)', 'motor_pair.move_tank(motor_pair.PAIR_1, 200, -200)', 'while abs(motion_sensor.tilt_angles()[0]) < 1800:', '    await runloop.sleep_ms(5)', 'motor_pair.stop(motor_pair.PAIR_1)'] },
          { t: 'choice', q: 'Girando rápido, o robô passa um pouco do ângulo. Uma boa solução:',
            options: ['Girar mais devagar perto do final', 'Girar ainda mais rápido', 'Tirar o giroscópio', 'Desligar e ligar'], a: 0,
            why: 'Na próxima lição você vai ver como fazer isso automaticamente, com controle proporcional!' }
        ]
      },
      {
        id: 'spike-reto',
        title: 'Andar reto com controle P',
        steps: [
          { t: 'teach', title: 'O robô que se corrige sozinho',
            text: 'Mesmo com motores iguais, o robô entorta. A solução das equipes campeãs: medir o <b>erro</b> (quanto saiu da direção) e corrigir proporcionalmente. Isso é o <b>controle P</b> (proporcional).',
            code: _('KP = 0.2   # força da correção (ajuste testando)', '', 'motion_sensor.reset_yaw(0)', 'for i in range(200):', '    yaw = motion_sensor.tilt_angles()[0]  # quanto entortou', '    erro = 0 - yaw                         # queremos 0', '    correcao = int(KP * erro)', '    motor_pair.move(motor_pair.PAIR_1, correcao)', '    await runloop.sleep_ms(10)', 'motor_pair.stop(motor_pair.PAIR_1)'),
            tip: 'Se o robô corrigir para o lado errado, troque o sinal: <code>KP = -0.2</code>. Depende de como o Hub está montado.' },
          { t: 'choice', q: 'O que é o <b>erro</b> no controle P?',
            options: ['A diferença entre onde queremos estar e onde estamos', 'Um bug no código', 'A velocidade do robô', 'A cor do chão'], a: 0 },
          { t: 'choice', q: 'Se o erro for <b>zero</b>, quanto vale a correção?',
            options: ['Zero: o robô segue reto', '100', 'Depende da cor', 'Dá erro'], a: 0 },
          { t: 'choice', q: 'O KP está grande demais. O que costuma acontecer?',
            options: ['O robô corrige demais e anda em zigue-zague', 'Fica perfeito', 'Para de andar', 'Anda de ré'], a: 0,
            why: 'Ajustar o KP é testar: comece pequeno e vá aumentando aos poucos.' },
          { t: 'fill', q: 'Complete a correção proporcional:', code: 'correcao = int(___ * erro)',
            options: ['KP', 'yaw', '360', 'erro'], a: 'KP' },
          { t: 'type', q: 'Calcule o erro: o alvo é 0 e a leitura está em <code>yaw</code>.', a: ['erro = 0 - yaw', 'erro = -yaw'], ph: 'erro = ...' }
        ]
      }
    ]
  },

  /* ---------------- Unidade 8 ---------------- */
  {
    name: 'Robótica avançada',
    desc: 'Seguidor de linha, multitarefa, estados e missões',
    color: '#4C1D95',
    lessons: [
      {
        id: 'spike-linha',
        title: 'Seguidor de linha',
        steps: [
          { t: 'teach', title: 'Seguindo a linha preta',
            text: 'O sensor de cor mede a <b>luz refletida</b> (0 a 100): o branco reflete muito e o preto quase nada. O robô segue a <b>borda</b> da linha: viu escuro, vira para um lado; viu claro, vira para o outro.',
            code: _('import color_sensor', 'from hub import port', '', 'while True:', '    luz = color_sensor.reflection(port.C)', '    if luz < 50:   # escuro: está na linha', '        motor_pair.move_tank(motor_pair.PAIR_1, 100, 300)', '    else:          # claro: saiu da linha', '        motor_pair.move_tank(motor_pair.PAIR_1, 300, 100)', '    await runloop.sleep_ms(5)'),
            tip: 'Esse é o seguidor “liga-desliga”: funciona, mas o robô anda rebolando. Na próxima lição ele fica suave!' },
          { t: 'choice', q: 'O que <code>color_sensor.reflection(port.C)</code> devolve?',
            options: ['A luz refletida, de 0 a 100', 'O nome da cor', 'A distância', 'True ou False'], a: 0 },
          { t: 'choice', q: 'No branco, a reflexão fica...',
            options: ['Alta (perto de 100)', 'Baixa (perto de 0)', 'Sempre 50', 'Negativa'], a: 0 },
          { t: 'choice', q: 'Por que o número 50 no if?',
            options: ['É o meio entre o preto e o branco (a borda da linha)', 'É a velocidade', 'É a porta', 'É o tempo'], a: 0,
            why: 'O ideal é medir o preto e o branco da sua mesa e usar a média dos dois.' },
          { t: 'fill', q: 'Complete para ler a reflexão:', code: 'luz = color_sensor.___(port.C)',
            options: ['reflection', 'color', 'light', 'distance'], a: 'reflection' },
          { t: 'order', q: 'Monte o seguidor liga-desliga. No escuro use (100, 300); no claro, (300, 100):',
            lines: ['luz = color_sensor.reflection(port.C)', 'if luz < 50:', '    motor_pair.move_tank(motor_pair.PAIR_1, 100, 300)', 'else:', '    motor_pair.move_tank(motor_pair.PAIR_1, 300, 100)'] }
        ]
      },
      {
        id: 'spike-linha-p',
        title: 'Seguidor proporcional',
        steps: [
          { t: 'teach', title: 'Suave como um campeão',
            text: 'Em vez de só “esquerda ou direita”, a curva depende do <b>tamanho do erro</b>: um pouquinho fora, curva pouquinho; muito fora, curva muito. É o controle P de novo!',
            code: _('ALVO = 50        # borda da linha', 'KP = 3', 'BASE = 300       # velocidade normal', '', 'while True:', '    erro = color_sensor.reflection(port.C) - ALVO', '    curva = int(KP * erro)', '    motor_pair.move_tank(motor_pair.PAIR_1, BASE + curva, BASE - curva)', '    await runloop.sleep_ms(5)'),
            tip: 'Ajuste fino: primeiro escolha a BASE, depois vá aumentando o KP até o robô seguir firme sem rebolar.' },
          { t: 'choice', q: 'A leitura deu 50 (exatamente o ALVO). Qual a curva?',
            options: ['0: segue reto', '50', '300', '-50'], a: 0 },
          { t: 'choice', q: 'A leitura deu 70. Com KP = 3, quanto vale a curva?',
            options: ['60', '70', '210', '20'], a: 0,
            why: 'erro = 70 - 50 = 20, e curva = 3 × 20 = 60.' },
          { t: 'choice', q: 'Qual a vantagem sobre o liga-desliga?',
            options: ['Movimento suave e mais rápido, sem rebolar', 'Usa menos sensores', 'Não precisa de linha', 'Nenhuma'], a: 0 },
          { t: 'fill', q: 'Complete as velocidades das rodas:', code: 'motor_pair.move_tank(motor_pair.PAIR_1, BASE + curva, BASE ___ curva)',
            options: ['-', '+', '*', '/'], a: '-' },
          { t: 'choice', q: 'O robô sai da linha nas curvas fechadas. O que tentar primeiro?',
            options: ['Diminuir a BASE ou aumentar um pouco o KP', 'Tirar o sensor', 'Aumentar muito a BASE', 'Mudar a cor da linha'], a: 0 }
        ]
      },
      {
        id: 'spike-multitarefa',
        title: 'Duas coisas ao mesmo tempo',
        steps: [
          { t: 'teach', title: 'async de verdade',
            text: 'O <code>runloop.run</code> pode rodar várias funções <b>ao mesmo tempo</b>. Enquanto uma espera (await), a outra trabalha.',
            code: _('async def piscar():', '    for i in range(10):', '        light_matrix.show_image(light_matrix.IMAGE_HAPPY)', '        await runloop.sleep_ms(300)', '        light_matrix.clear()', '        await runloop.sleep_ms(300)', '', 'async def andar():', '    motor_pair.pair(motor_pair.PAIR_1, port.A, port.B)', '    await motor_pair.move_for_degrees(motor_pair.PAIR_1, 1080, 0)', '', 'runloop.run(piscar(), andar())   # as duas juntas!') },
          { t: 'choice', q: 'O que acontece com <code>runloop.run(piscar(), andar())</code>?',
            options: ['O robô anda e pisca ao mesmo tempo', 'Primeiro pisca, depois anda', 'Dá erro', 'Só anda'], a: 0 },
          { t: 'choice', q: 'Por que os <code>await runloop.sleep_ms</code> são importantes aqui?',
            options: ['É no await que uma tarefa deixa a outra trabalhar', 'Para gastar menos bateria', 'Para o som funcionar', 'Não são importantes'], a: 0 },
          { t: 'fill', q: 'Rode as duas tarefas juntas:', code: 'runloop.run(piscar(), ___())',
            options: ['andar', 'await', 'async', 'run'], a: 'andar' },
          { t: 'choice', q: 'Uma tarefa tem um <code>while True</code> sem nenhum await dentro. O que acontece?',
            options: ['Ela trava, e a outra tarefa para de rodar', 'Funciona normal', 'O robô acelera', 'O Hub desliga'], a: 0 }
        ]
      },
      {
        id: 'spike-estados',
        title: 'Máquina de estados',
        steps: [
          { t: 'teach', title: 'Um robô com etapas',
            text: 'Robôs avançados trabalham com <b>estados</b>: em cada estado fazem uma coisa, e mudam de estado quando algo acontece. Fica muito mais fácil de entender e de consertar.',
            code: _('estado = "procurar"', '', 'while estado != "fim":', '    if estado == "procurar":', '        motor_pair.move(motor_pair.PAIR_1, 0)', '        if 0 < distance_sensor.distance(port.D) < 100:', '            estado = "pegar"', '    elif estado == "pegar":', '        motor_pair.stop(motor_pair.PAIR_1)', '        await motor.run_for_degrees(port.C, 90, 300)  # fecha a garra', '        estado = "voltar"', '    elif estado == "voltar":', '        await motor_pair.move_for_degrees(motor_pair.PAIR_1, -720, 0)', '        estado = "fim"', '    await runloop.sleep_ms(10)') },
          { t: 'choice', q: 'Qual o estado logo depois que o robô fecha a garra?',
            options: ['voltar', 'procurar', 'fim', 'pegar'], a: 0 },
          { t: 'choice', q: 'O que faz o loop terminar?',
            options: ['O estado virar "fim"', 'O sensor ver preto', 'Apertar o botão', 'Ele nunca termina'], a: 0 },
          { t: 'fill', q: 'Mude para o estado de pegar:', code: _('if 0 < distance_sensor.distance(port.D) < 100:', '    estado = ___'),
            options: ['"pegar"', 'pegar', '"Pegar"', 'estado'], a: '"pegar"' },
          { t: 'choice', q: 'Qual a grande vantagem da máquina de estados?',
            options: ['Cada parte do comportamento fica separada e fácil de mudar', 'Deixa o robô sempre mais rápido', 'Não precisa de sensores', 'Só funciona no SPIKE'], a: 0 },
          { t: 'type', q: 'Escreva a linha que muda o estado para <b>fim</b>:', a: ['estado = "fim"'], ph: 'estado = ...' }
        ]
      },
      {
        id: 'spike-missoes',
        title: 'Organizando missões',
        steps: [
          { t: 'teach', title: 'Código de competição',
            text: 'Na competição, cada missão vira uma <b>função</b>, e o programa principal chama todas em ordem. Se uma missão der problema, você conserta só ela.',
            code: _('async def missao_ponte():', '    await andar_cm(40)', '    await girar(90)', '', 'async def missao_torre():', '    await andar_cm(25)', '    await motor.run_for_degrees(port.C, 180, 500)', '', 'MISSOES = [missao_ponte, missao_torre]', '', 'async def main():', '    for missao in MISSOES:', '        await missao()', '        await sound.beep(880, 100)   # bip entre missões', '', 'runloop.run(main())'),
            tip: 'Dá para usar os botões do Hub para escolher qual missão rodar. Isso economiza um tempo precioso na mesa!' },
          { t: 'choice', q: 'Por que separar cada missão numa função?',
            options: ['Fica fácil testar, consertar e trocar a ordem', 'Deixa o robô mais pesado', 'É obrigatório no Python', 'Gasta menos bateria'], a: 0 },
          { t: 'choice', q: 'Na lista <code>MISSOES</code>, por que as funções estão sem parênteses?',
            options: ['Guardamos as funções para chamar depois, no for', 'Esquecemos', 'Porque são textos', 'Tanto faz'], a: 0 },
          { t: 'fill', q: 'Chame cada missão da lista:', code: _('for missao in MISSOES:', '    await ___()'),
            options: ['missao', 'MISSOES', 'main', 'runloop'], a: 'missao' },
          { t: 'order', q: 'Monte a sequência: ponte, depois torre, depois voltar para a base:',
            lines: ['await missao_ponte()', 'await missao_torre()', 'await voltar_base()'] },
          { t: 'choice', q: 'Parabéns! Qual o próximo passo de quem programa robôs?',
            options: ['Testar muito na mesa, anotar e melhorar o código', 'Nunca mais mudar o código', 'Copiar o código de outra equipe', 'Voltar para os blocos'], a: 0,
            why: 'Engenharia é testar, medir e melhorar. Você está pronto(a) para encarar o FTC!' }
        ]
      }
    ]
  }
);
