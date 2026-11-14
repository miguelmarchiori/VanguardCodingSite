/* =========================================================
   VanCode · conteúdo das trilhas
   ---------------------------------------------------------
   Tipos de passo:
     teach  → explica um conceito  { title, text, code?, tip? }
     choice → múltipla escolha     { q, code?, options, a (índice), co? (opções são código), why? }
     fill   → completar lacuna     { q, code (com ___), options, a (texto), why? }
     order  → ordenar linhas       { q, lines (ordem certa), alts? (outras ordens válidas), why? }
     type   → digitar código       { q, a: [respostas aceitas], ph?, why? }
   Cada lição tem um id fixo (é ele que guarda o progresso do aluno):
   nunca troque o id de uma lição que já existe.
   As unidades avançadas ficam em courses-python-plus.js e courses-java-plus.js.
   Para criar uma lição nova, é só copiar um bloco e editar.
   ========================================================= */
'use strict';

const _ = (...linhas) => linhas.join('\n');

const COURSES = {
  /* ======================================================  PYTHON · LEGO SPIKE Prime
     ====================================================== */
  python: {
    id: 'python',
    lang: 'python',
    name: 'Python',
    emoji: '',
    robot: 'LEGO® SPIKE™ Prime',
    color: '#3776D6',
    desc: 'A linguagem que roda no LEGO SPIKE Prime e também em sites, jogos e inteligência artificial!',
    units: [
      {
        name: 'Olá, Python!',
        desc: 'Seus primeiros comandos, variáveis e contas',
        color: '#3776D6',
        lessons: [
          {
            id: 'py-print',
            title: 'Seu primeiro código',
            steps: [
              { t: 'teach', title: 'Diga olá!',
                text: 'Em Python, o comando <code>print()</code> mostra uma mensagem na tela. O texto vai <b>entre aspas</b> dentro dos parênteses.',
                code: 'print("Olá, robô!")',
                tip: 'No SPIKE, o que você manda pelo <code>print</code> aparece no console do app. Ótimo pra descobrir o que o robô está “pensando”!' },
              { t: 'choice', q: 'Qual linha mostra a mensagem <b>Oi</b> na tela?', co: true,
                options: ['print("Oi")', 'print(Oi)', 'mostrar "Oi"', 'Print["Oi"]'], a: 0,
                why: 'Use <code>print</code>, parênteses <code>( )</code> e o texto entre aspas.' },
              { t: 'choice', q: 'O que aparece na tela?', code: 'print("Vanguard")',
                options: ['Vanguard', '"Vanguard"', 'print Vanguard', 'Nada'], a: 0,
                why: 'As aspas só avisam ao Python que aquilo é um texto. Elas não aparecem na tela.' },
              { t: 'fill', q: 'Complete para mostrar a mensagem:', code: '___("Vamos programar!")',
                options: ['print', 'escrever', 'falar', 'show'], a: 'print' },
              { t: 'order', q: 'Monte a contagem regressiva para o robô largar:',
                lines: ['print("3...")', 'print("2...")', 'print("1...")', 'print("Já!")'],
                why: 'O Python lê o código de cima para baixo, uma linha por vez.' },
              { t: 'choice', q: 'Este código dá erro. O que está faltando?', code: 'print("Olá)',
                options: ['Fechar as aspas', 'Um ponto final', 'Mais parênteses', 'Nada, está certo'], a: 0,
                why: 'Todo texto precisa abrir e fechar aspas: <code>"Olá"</code>.' },
              { t: 'type', q: 'Agora é com você! Escreva uma linha que mostre a mensagem <b>Bip!</b>',
                a: ['print("Bip!")'], ph: 'print(...)' }
            ]
          },
          {
            id: 'py-variaveis',
            title: 'Variáveis',
            steps: [
              { t: 'teach', title: 'Caixinhas de memória',
                text: 'Uma <b>variável</b> é uma caixinha com nome onde o robô guarda um valor. Use <code>=</code> para colocar algo dentro dela.',
                code: _('velocidade = 50', 'nome = "Bip"', 'print(velocidade)'),
                tip: 'Repare: <code>print(velocidade)</code> mostra <b>50</b>, e não a palavra “velocidade”, porque está sem aspas!' },
              { t: 'choice', q: 'O que aparece na tela?', code: _('voltas = 3', 'print(voltas)'),
                options: ['3', 'voltas', '"voltas"', 'Erro'], a: 0 },
              { t: 'choice', q: 'Qual é um nome de variável <b>válido</b> em Python?', co: true,
                options: ['minha_velocidade', 'minha velocidade', '2velocidade', 'minha-velocidade'], a: 0,
                why: 'Nomes não podem ter espaços, tracinhos, nem começar com número. Use o <code>_</code> para separar as palavras.' },
              { t: 'fill', q: 'Guarde o texto <b>Vanguard</b> na variável:', code: 'equipe = ___',
                options: ['"Vanguard"', 'Vanguard', '(Vanguard)', '[Vanguard]'], a: '"Vanguard"',
                why: 'Texto sempre entre aspas!' },
              { t: 'choice', q: 'Uma variável pode mudar de valor! O que aparece?',
                code: _('pontos = 10', 'pontos = pontos + 5', 'print(pontos)'),
                options: ['15', '10', '5', 'pontos + 5'], a: 0,
                why: 'Primeiro <code>pontos</code> vale 10. Depois calculamos 10 + 5 e guardamos de novo na caixinha: 15!' },
              { t: 'type', q: 'Crie uma variável chamada <b>voltas</b> com o valor <b>3</b>:',
                a: ['voltas = 3'], ph: 'voltas = ...' }
            ]
          },
          {
            id: 'py-contas',
            title: 'Fazendo contas',
            steps: [
              { t: 'teach', title: 'Python é uma calculadora',
                text: 'Use <code>+</code> para somar, <code>-</code> para subtrair, <code>*</code> para multiplicar e <code>/</code> para dividir.',
                code: _('print(2 + 3)    # 5', 'print(10 - 4)   # 6', 'print(3 * 4)    # 12', 'print(10 / 2)   # 5.0'),
                tip: 'Tudo que vem depois do <code>#</code> é um <b>comentário</b>: o Python ignora. Serve pra deixar recadinhos para o seu time!' },
              { t: 'choice', q: 'Qual é o resultado?', code: 'print(6 * 7)',
                options: ['42', '13', '67', '6 * 7'], a: 0 },
              { t: 'choice', q: 'E agora? Lembre: multiplicação vem antes da soma!', code: 'print(2 + 3 * 4)',
                options: ['14', '20', '24', '9'], a: 0,
                why: 'Primeiro 3 * 4 = 12, depois 2 + 12 = 14. Igualzinho à matemática da escola!' },
              { t: 'fill', q: 'O robô anda 20 cm por volta da roda. Calcule a distância de 5 voltas:', code: 'distancia = 20 ___ 5',
                options: ['*', '+', '-', '/'], a: '*', why: '20 × 5 = 100 cm.' },
              { t: 'choice', q: 'Juntando textos com <code>+</code>. O que aparece?', code: _('nome = "Bip"', 'print("Oi, " + nome)'),
                options: ['Oi, Bip', 'Oi, nome', '"Oi, " + Bip', 'Erro'], a: 0,
                why: 'Com textos, o <code>+</code> cola um no outro.' },
              { t: 'order', q: 'Organize o programa que calcula a velocidade do robô:',
                lines: ['voltas = 5', 'distancia = voltas * 20', 'velocidade = distancia / 4', 'print(velocidade)'],
                why: 'Precisamos criar cada variável ANTES de usá-la.' }
            ]
          }
        ]
      },
      {
        name: 'Decidir e repetir',
        desc: 'if, for, while e funções: o cérebro do robô',
        color: '#14B8A6',
        lessons: [
          {
            id: 'py-if',
            title: 'Decisões com if',
            steps: [
              { t: 'teach', title: 'Se... senão!',
                text: 'O <code>if</code> faz o robô tomar decisões. Repare nos <b>dois pontos</b> <code>:</code> e nos <b>4 espaços</b> antes das linhas de dentro. Isso se chama <b>indentação</b>.',
                code: _('distancia = 8', 'if distancia < 10:', '    print("Obstáculo! Parar!")', 'else:', '    print("Caminho livre!")'),
                tip: 'Comparações: <code>&lt;</code> menor, <code>&gt;</code> maior, <code>==</code> igual, <code>!=</code> diferente, <code>&lt;=</code> menor ou igual, <code>&gt;=</code> maior ou igual.' },
              { t: 'choice', q: 'O que aparece na tela?',
                code: _('bateria = 30', 'if bateria < 50:', '    print("Carregar!")', 'else:', '    print("Tudo certo")'),
                options: ['Carregar!', 'Tudo certo', 'As duas mensagens', 'Nada'], a: 0 },
              { t: 'fill', q: 'Complete para <b>comparar</b> se a cor é vermelha:', code: _('if cor ___ "vermelho":', '    print("Pare!")'),
                options: ['==', '=', '=>', '!'], a: '==',
                why: 'Um <code>=</code> guarda um valor. Dois <code>==</code> comparam se são iguais!' },
              { t: 'choice', q: 'O que está faltando neste código?', code: _('if pontos > 5', '    print("Uhul!")'),
                options: ['Os dois pontos : no final do if', 'Aspas no 5', 'Um ponto e vírgula', 'Parênteses no print'], a: 0 },
              { t: 'order', q: 'Monte: se o botão foi apertado, o robô comemora; senão, espera.',
                lines: ['if botao_apertado:', '    print("Comemorar!")', 'else:', '    print("Esperando...")'] },
              { t: 'choice', q: 'Por que as linhas de dentro do if têm espaços no começo?',
                options: ['Para o Python saber o que está DENTRO do if', 'Só para ficar bonito', 'Para o robô andar mais rápido', 'Não precisa ter'], a: 0,
                why: 'Em Python, a indentação é obrigatória: ela mostra quais linhas pertencem ao if.' }
            ]
          },
          {
            id: 'py-for',
            title: 'Repetindo com for',
            steps: [
              { t: 'teach', title: 'Repita sem copiar!',
                text: 'Nos blocos você arrasta o “repetir”. Em Python usamos o <code>for</code>: ele repete as linhas de dentro quantas vezes você quiser.',
                code: _('for i in range(3):', '    print("Bip!")'),
                tip: '<code>range(3)</code> gera os números 0, 1 e 2. Ou seja: 3 repetições!' },
              { t: 'choice', q: 'Quantas vezes aparece “Olá”?', code: _('for i in range(5):', '    print("Olá")'),
                options: ['5', '4', '6', '1'], a: 0 },
              { t: 'choice', q: 'O que aparece na tela?', code: _('for i in range(4):', '    print(i)'),
                options: ['0 1 2 3', '1 2 3 4', '0 1 2 3 4', '4'], a: 0,
                why: 'O <code>range</code> começa no 0 e para ANTES do 4.' },
              { t: 'fill', q: 'Complete para repetir 10 vezes:', code: _('for i in ___(10):', '    print("Volta!")'),
                options: ['range', 'repeat', 'times', 'loop'], a: 'range' },
              { t: 'order', q: 'Faça a luz piscar 3 vezes (acende e depois apaga):',
                lines: ['for i in range(3):', '    print("Luz acesa")', '    print("Luz apagada")'] },
              { t: 'choice', q: 'Qual a grande vantagem do <code>for</code>?',
                options: ['Repetir sem copiar e colar o mesmo código', 'Deixar o programa mais lento', 'Só funciona com números', 'Nenhuma'], a: 0 }
            ]
          },
          {
            id: 'py-while',
            title: 'Loop while',
            steps: [
              { t: 'teach', title: 'Enquanto for verdade...',
                text: 'O <code>while</code> repete <b>enquanto</b> uma condição for verdadeira. Perfeito para “ande até encontrar a parede”!',
                code: _('energia = 3', 'while energia > 0:', '    print("Andando...")', '    energia = energia - 1', 'print("Parei!")'),
                tip: 'No robô é comum usar <code>while True:</code> para repetir para sempre, lendo os sensores o tempo todo.' },
              { t: 'choice', q: 'Quantas vezes aparece “Andando...”?',
                code: _('energia = 3', 'while energia > 0:', '    print("Andando...")', '    energia = energia - 1'),
                options: ['3', '2', '4', 'Para sempre'], a: 0 },
              { t: 'choice', q: 'O que acontece com este código?', code: _('while True:', '    print("Bip")'),
                options: ['Repete para sempre', 'Repete 1 vez', 'Dá erro', 'Não faz nada'], a: 0,
                why: '<code>True</code> é sempre verdadeiro, então o loop nunca para. No robô isso é útil para ficar lendo sensores!' },
              { t: 'fill', q: 'Repita <b>enquanto</b> a distância for maior que 10:', code: _('___ distancia > 10:', '    andar()'),
                options: ['while', 'for', 'if', 'else'], a: 'while' },
              { t: 'choice', q: 'Qual a diferença entre <code>if</code> e <code>while</code>?',
                options: ['if decide uma vez; while repete enquanto for verdade', 'São iguais', 'while só funciona com textos', 'if repete para sempre'], a: 0 },
              { t: 'order', q: 'Conte de 1 até 3:',
                lines: ['n = 1', 'while n <= 3:', '    print(n)', '    n = n + 1'] }
            ]
          },
          {
            id: 'py-funcoes',
            title: 'Funções',
            steps: [
              { t: 'teach', title: 'Crie seus próprios comandos',
                text: 'Com <code>def</code> você dá um nome a um grupo de comandos. Depois é só chamar pelo nome!',
                code: _('def comemorar():', '    print("Uhul!")', '    print("Vanguard!")', '', 'comemorar()', 'comemorar()'),
                tip: 'Funções evitam repetir código e deixam o programa organizado. Parecido com “Meus Blocos”, só que muito mais poderoso.' },
              { t: 'fill', q: 'Complete para criar a função:', code: _('___ dancar():', '    print("Girando!")'),
                options: ['def', 'function', 'func', 'criar'], a: 'def' },
              { t: 'choice', q: 'Quantas vezes aparece “Uhul!”?',
                code: _('def comemorar():', '    print("Uhul!")', '', 'comemorar()', 'comemorar()'),
                options: ['2', '1', '0', '3'], a: 0, why: 'A função foi chamada duas vezes!' },
              { t: 'teach', title: 'Funções com presentes',
                text: 'Funções podem receber valores (os <b>parâmetros</b>) e devolver um resultado com <code>return</code>.',
                code: _('def dobro(numero):', '    return numero * 2', '', 'print(dobro(4))   # 8') },
              { t: 'choice', q: 'O que aparece na tela?', code: _('def soma(a, b):', '    return a + b', '', 'print(soma(3, 7))'),
                options: ['10', '37', 'a + b', 'soma'], a: 0 },
              { t: 'choice', q: 'O que acontece se você cria uma função mas nunca chama ela?',
                options: ['Nada: ela só roda quando é chamada', 'Ela roda sozinha', 'Dá erro', 'O robô desliga'], a: 0 }
            ]
          }
        ]
      },
      {
        name: 'Python no SPIKE',
        desc: 'Hub, motores e sensores de verdade',
        color: '#F59E0B',
        lessons: [
          {
            id: 'spike-hub',
            title: 'Conhecendo o Hub',
            steps: [
              { t: 'teach', title: 'Hora do robô!',
                text: 'No app do SPIKE, crie um projeto em <b>Python</b>. Quase todo programa tem esta carinha:',
                code: _('from hub import light_matrix', 'import runloop', '', 'async def main():', '    await light_matrix.write("Oi!")', '', 'runloop.run(main())'),
                tip: '<code>import</code> = pegar ferramentas da caixa. <code>main</code> = o programa principal. <code>runloop.run(main())</code> = dar o play!' },
              { t: 'choice', q: 'Para que serve o <code>import</code>?',
                options: ['Trazer ferramentas (módulos) para usar no código', 'Desligar o robô', 'Mostrar um texto', 'Repetir comandos'], a: 0 },
              { t: 'fill', q: 'Faça a matriz de luz do Hub escrever <b>Vanguard</b>:', code: 'await light_matrix.___("Vanguard")',
                options: ['write', 'print', 'say', 'show_text'], a: 'write' },
              { t: 'choice', q: 'O que o <code>await</code> faz?',
                options: ['Espera a ação terminar antes de ir para a próxima linha', 'Faz o robô ir mais rápido', 'Apaga o programa', 'Liga o Bluetooth'], a: 0,
                why: 'Ações que demoram (escrever na tela, girar um motor) usam <code>await</code> para o robô esperar elas acabarem.' },
              { t: 'order', q: 'Monte o programa completo:',
                lines: ['from hub import light_matrix', 'import runloop', 'async def main():', '    await light_matrix.write("Oi!")', 'runloop.run(main())'],
                alts: [['import runloop', 'from hub import light_matrix', 'async def main():', '    await light_matrix.write("Oi!")', 'runloop.run(main())']] },
              { t: 'choice', q: 'Qual linha mostra uma carinha feliz na matriz de luz?', co: true,
                options: ['light_matrix.show_image(light_matrix.IMAGE_HAPPY)', 'light_matrix.happy()', 'print(":)")', 'hub.smile()'], a: 0,
                why: '<code>show_image</code> mostra uma imagem pronta. Existem várias: <code>IMAGE_HAPPY</code>, <code>IMAGE_HEART</code>, <code>IMAGE_SAD</code>...' }
            ]
          },
          {
            id: 'spike-motores',
            title: 'Motores em ação',
            steps: [
              { t: 'teach', title: 'Girando motores',
                text: 'O módulo <code>motor</code> controla um motor. Diga a <b>porta</b>, quantos <b>graus</b> girar e a <b>velocidade</b> (em graus por segundo).',
                code: _('import motor', 'from hub import port', 'import runloop', '', 'async def main():', '    # porta A, 360 graus = 1 volta, velocidade 720', '    await motor.run_for_degrees(port.A, 360, 720)', '', 'runloop.run(main())') },
              { t: 'choice', q: 'Quantas voltas o motor dá com <b>720 graus</b>?',
                options: ['2 voltas', '1 volta', '7 voltas', 'Meia volta'], a: 0,
                why: 'Cada volta tem 360 graus. 720 ÷ 360 = 2.' },
              { t: 'fill', q: 'O motor está na porta <b>B</b>. Complete:', code: 'await motor.run_for_degrees(port.___, 180, 500)',
                options: ['B', 'A', '2', 'b'], a: 'B',
                why: 'As portas do Hub são letras maiúsculas: A, B, C, D, E e F.' },
              { t: 'teach', title: 'Andando com duas rodas',
                text: 'Para um robô com rodas, junte dois motores em um <b>par</b>. O último número é a <b>direção</b> (steering): <code>0</code> anda reto, outros valores fazem curva.',
                code: _('import motor_pair', 'from hub import port', 'import runloop', '', 'async def main():', '    motor_pair.pair(motor_pair.PAIR_1, port.A, port.B)', '    await motor_pair.move_for_degrees(motor_pair.PAIR_1, 720, 0)', '', 'runloop.run(main())') },
              { t: 'choice', q: 'Em <code>move_for_degrees(motor_pair.PAIR_1, 720, 0)</code>, o que significa o <b>0</b>?',
                options: ['Direção 0: anda reto', 'Velocidade zero', 'Porta 0', 'Desligar'], a: 0 },
              { t: 'choice', q: 'Qual comando junta os motores das portas <b>C</b> e <b>D</b>?', co: true,
                options: ['motor_pair.pair(motor_pair.PAIR_1, port.C, port.D)', 'motor_pair(C, D)', 'pair.motor(C + D)', 'motor.pair("CD")'], a: 0 }
            ]
          },
          {
            id: 'spike-sensores',
            title: 'Sensores',
            steps: [
              { t: 'teach', title: 'O robô enxerga!',
                text: 'O sensor de distância mede em <b>milímetros</b>. Com um <code>while True</code> o robô fica de olho o tempo todo e para antes de bater!',
                code: _('async def main():', '    motor_pair.pair(motor_pair.PAIR_1, port.A, port.B)', '    motor_pair.move(motor_pair.PAIR_1, 0)   # anda reto', '    while True:', '        distancia = distance_sensor.distance(port.C)', '        if 0 < distancia < 100:   # mais perto que 10 cm', '            motor_pair.stop(motor_pair.PAIR_1)', '            break   # sai do while', '        await runloop.sleep_ms(10)'),
                tip: 'Quando o sensor não enxerga nada, ele devolve <b>-1</b>. Por isso conferimos <code>0 &lt; distancia</code>!' },
              { t: 'choice', q: 'O sensor de distância do SPIKE mede em...',
                options: ['Milímetros', 'Metros', 'Quilos', 'Graus'], a: 0, why: '100 mm = 10 cm.' },
              { t: 'fill', q: 'Pare o robô quando o obstáculo estiver <b>mais perto</b> que 50 mm:',
                code: _('if 0 < distancia ___ 50:', '    motor_pair.stop(motor_pair.PAIR_1)'),
                options: ['<', '>', '==', '='], a: '<' },
              { t: 'choice', q: 'O que o <code>break</code> faz?',
                options: ['Sai do loop', 'Quebra o robô', 'Reinicia o programa', 'Pula uma linha'], a: 0 },
              { t: 'teach', title: 'Sensor de cor',
                text: 'O sensor de cor diz qual cor está vendo. Compare com as cores do módulo <code>color</code>:',
                code: _('import color_sensor', 'import color', 'from hub import port', '', 'if color_sensor.color(port.E) == color.RED:', '    print("Vermelho! Parar!")'),
                tip: 'Também existem <code>color.BLUE</code>, <code>color.GREEN</code>, <code>color.YELLOW</code>, <code>color.BLACK</code>, <code>color.WHITE</code>...' },
              { t: 'fill', q: 'Comemore quando o sensor ver <b>verde</b>:',
                code: _('if color_sensor.color(port.E) == color.___:', '    print("Achei o verde!")'),
                options: ['GREEN', 'green', 'VERDE', 'Green'], a: 'GREEN',
                why: 'As cores são constantes em inglês e MAIÚSCULAS.' },
              { t: 'order', q: 'Desafio final! Ande até ver a linha preta e pare:',
                lines: ['motor_pair.move(motor_pair.PAIR_1, 0)', 'while color_sensor.color(port.E) != color.BLACK:', '    await runloop.sleep_ms(10)', 'motor_pair.stop(motor_pair.PAIR_1)'],
                why: 'Liga os motores, espera enquanto NÃO vê preto e, quando vê, para. Você acabou de programar um robô de verdade!' }
            ]
          }
        ]
      }
    ]
  },

  /* ======================================================  JAVA · FIRST Tech Challenge
     ====================================================== */
  java: {
    id: 'java',
    lang: 'java',
    name: 'Java',
    emoji: '',
    robot: 'FIRST® Tech Challenge',
    color: '#F2792B',
    desc: 'A linguagem dos robôs do FTC, também usada em apps Android, jogos e grandes sistemas.',
    units: [
      {
        name: 'Olá, Java!',
        desc: 'Comandos, tipos de variáveis e lógica',
        color: '#F2792B',
        lessons: [
          {
            id: 'java-print',
            title: 'Seu primeiro código',
            steps: [
              { t: 'teach', title: 'Olá, Java!',
                text: 'Java é a linguagem usada pelas equipes do <b>FTC</b>. Para mostrar uma mensagem usamos <code>System.out.println()</code>. E atenção: <b>todo comando termina com ponto e vírgula</b> <code>;</code>',
                code: 'System.out.println("Olá, FTC!");',
                tip: 'No robô do FTC, as mensagens aparecem na tela do Driver Station com o <code>telemetry</code>. Você vai aprender logo, logo!' },
              { t: 'choice', q: 'Com o que termina todo comando em Java?', co: true,
                options: [';', '.', ':', '!'], a: 0 },
              { t: 'fill', q: 'Complete para mostrar a mensagem:', code: 'System.out.___("Vanguard #37520");',
                options: ['println', 'print_line', 'say', 'write'], a: 'println' },
              { t: 'choice', q: 'Encontre o erro:', code: 'System.out.println("Bora, robô!")',
                options: ['Faltou o ; no final', 'Faltou fechar as aspas', 'O println está errado', 'Não tem erro'], a: 0 },
              { t: 'choice', q: 'O que aparece na tela?', code: 'System.out.println("Robô" + " pronto!");',
                options: ['Robô pronto!', '"Robô" + " pronto!"', 'Robô + pronto!', 'Erro'], a: 0,
                why: 'O <code>+</code> junta (concatena) textos.' },
              { t: 'choice', q: 'Java diferencia MAIÚSCULAS de minúsculas. Qual está certo?', co: true,
                options: ['System.out.println("Oi");', 'system.out.println("Oi");', 'System.Out.Println("Oi");', 'SYSTEM.OUT.PRINTLN("Oi");'], a: 0 },
              { t: 'type', q: 'Escreva o comando que mostra <b>Bip!</b> (não esqueça o <code>;</code>)',
                a: ['System.out.println("Bip!");'], ph: 'System.out.println(...);' }
            ]
          },
          {
            id: 'java-tipos',
            title: 'Tipos de variáveis',
            steps: [
              { t: 'teach', title: 'Cada caixa tem um tipo',
                text: 'Em Java você diz o <b>tipo</b> da variável antes do nome:',
                code: _('int voltas = 3;              // número inteiro', 'double potencia = 0.5;       // número com vírgula', 'boolean garraAberta = true;  // verdadeiro ou falso', 'String equipe = "Vanguard";  // texto'),
                tip: 'Em programação usamos <b>ponto</b> no lugar da vírgula: <code>0.5</code> (e não 0,5).' },
              { t: 'choice', q: 'Qual tipo usar para guardar <b>0.75</b>?', co: true,
                options: ['double', 'int', 'boolean', 'String'], a: 0 },
              { t: 'fill', q: 'Complete com o tipo certo:', code: '___ equipe = "Vanguard";',
                options: ['String', 'int', 'double', 'boolean'], a: 'String' },
              { t: 'choice', q: 'O que tem de errado?', code: 'int x = 2.5;',
                options: ['int só guarda números inteiros', 'Faltaram aspas', 'Faltou o ;', 'Nada'], a: 0,
                why: 'Para números com casas decimais, use <code>double</code>.' },
              { t: 'choice', q: 'Qual tipo guarda <b>verdadeiro ou falso</b>?', co: true,
                options: ['boolean', 'String', 'int', 'double'], a: 0 },
              { t: 'choice', q: 'O que aparece na tela?', code: _('int a = 7;', 'int b = 3;', 'System.out.println(a + b);'),
                options: ['10', '73', 'a + b', '7 + 3'], a: 0 },
              { t: 'type', q: 'Crie uma variável <b>int</b> chamada <b>pontos</b> valendo <b>10</b>:',
                a: ['int pontos = 10;'], ph: 'int ...' }
            ]
          },
          {
            id: 'java-logica',
            title: 'Contas e lógica',
            steps: [
              { t: 'teach', title: 'Matemática e lógica',
                text: 'Os operadores <code>+ - * /</code> funcionam como na calculadora. Para juntar condições usamos <code>&amp;&amp;</code> (E), <code>||</code> (OU) e <code>!</code> (NÃO).',
                code: _('double metade = 1.0 / 2;          // 0.5', 'boolean podeAndar = true && false; // false', 'boolean temLuz = !false;          // true') },
              { t: 'choice', q: 'Qual é o resultado?', code: 'System.out.println(4 * 5 + 2);',
                options: ['22', '28', '42', '20'], a: 0 },
              { t: 'choice', q: 'Pegadinha! Divisão de dois <code>int</code> em Java...', code: 'System.out.println(7 / 2);',
                options: ['3', '3.5', '4', 'Erro'], a: 0,
                why: 'Dividindo int por int, o Java joga fora a parte decimal. Para ter 3.5, use <code>7.0 / 2</code>.' },
              { t: 'choice', q: '<code>true &amp;&amp; false</code> dá...', co: true,
                options: ['false', 'true', '0', 'Erro'], a: 0,
                why: '<code>&amp;&amp;</code> (E) só é true se os DOIS lados forem true.' },
              { t: 'fill', q: 'O robô pontua se estiver na zona <b>OU</b> segurando a peça:', code: 'boolean pontua = naZona ___ segurandoPeca;',
                options: ['||', '&&', '!', '=='], a: '||' },
              { t: 'choice', q: 'Para que serve o <code>!</code>?',
                options: ['Inverte: true vira false e false vira true', 'Grita com o robô', 'Termina o comando', 'Multiplica'], a: 0 }
            ]
          }
        ]
      },
      {
        name: 'Decidir e repetir',
        desc: 'if, for, while e métodos',
        color: '#E5487A',
        lessons: [
          {
            id: 'java-if',
            title: 'Decisões com if',
            steps: [
              { t: 'teach', title: 'Se... senão',
                text: 'Em Java, a condição vai entre <b>parênteses</b> <code>( )</code> e os comandos de dentro ficam entre <b>chaves</b> <code>{ }</code>.',
                code: _('double distancia = 8.0;', 'if (distancia < 10) {', '    System.out.println("Obstáculo! Parar!");', '} else {', '    System.out.println("Caminho livre!");', '}'),
                tip: 'Use <code>==</code> para comparar números e booleans. Para comparar textos (String), use <code>.equals()</code>.' },
              { t: 'choice', q: 'O que aparece na tela?',
                code: _('int bateria = 80;', 'if (bateria < 20) {', '    System.out.println("Carregar!");', '} else {', '    System.out.println("Bora jogar!");', '}'),
                options: ['Bora jogar!', 'Carregar!', 'As duas', 'Nada'], a: 0 },
              { t: 'fill', q: 'Se os pontos forem <b>maior ou igual</b> a 100:', code: _('if (pontos ___ 100) {', '    System.out.println("Recorde!");', '}'),
                options: ['>=', '=>', '>', '='], a: '>=' },
              { t: 'choice', q: 'O que está errado?', code: _('if pontos > 5 {', '    System.out.println("Uhul!");', '}'),
                options: ['Faltaram os parênteses ( ) na condição', 'Faltaram aspas no 5', 'Faltou o :', 'Nada'], a: 0 },
              { t: 'order', q: 'Monte: se o botão A foi apertado, abre a garra; senão, fecha.',
                lines: ['if (gamepad1.a) {', '    garra.setPosition(1.0);', '} else {', '    garra.setPosition(0.0);', '}'] },
              { t: 'choice', q: 'E o <code>else if</code>? O que aparece?',
                code: _('int nivel = 2;', 'if (nivel == 1) {', '    System.out.println("Fácil");', '} else if (nivel == 2) {', '    System.out.println("Médio");', '} else {', '    System.out.println("Difícil");', '}'),
                options: ['Médio', 'Fácil', 'Difícil', 'Fácil e Médio'], a: 0 }
            ]
          },
          {
            id: 'java-for',
            title: 'Repetindo com for',
            steps: [
              { t: 'teach', title: 'O for tem 3 partes',
                text: '<b>Início</b> (<code>int i = 0</code>), <b>condição</b> (<code>i &lt; 3</code>) e <b>passo</b> (<code>i++</code>, que soma 1 no i).',
                code: _('for (int i = 0; i < 3; i++) {', '    System.out.println("Bip!");', '}'),
                tip: '<code>i++</code> é o mesmo que <code>i = i + 1</code>.' },
              { t: 'choice', q: 'Quantas vezes aparece “Olá”?', code: _('for (int i = 0; i < 4; i++) {', '    System.out.println("Olá");', '}'),
                options: ['4', '3', '5', '0'], a: 0 },
              { t: 'choice', q: 'O que aparece na tela?', code: _('for (int i = 1; i <= 3; i++) {', '    System.out.println(i);', '}'),
                options: ['1 2 3', '0 1 2', '1 2', '0 1 2 3'], a: 0 },
              { t: 'fill', q: 'Complete o passo do for:', code: _('for (int i = 0; i < 5; ___) {', '    System.out.println("Volta " + i);', '}'),
                options: ['i++', 'i+', '++', 'i = 1'], a: 'i++' },
              { t: 'order', q: 'Pisque a luz 3 vezes (acende e depois apaga):',
                lines: ['for (int i = 0; i < 3; i++) {', '    System.out.println("Acende");', '    System.out.println("Apaga");', '}'] },
              { t: 'choice', q: 'O que o <code>i++</code> faz?',
                options: ['Soma 1 ao i', 'Multiplica o i por 2', 'Zera o i', 'Mostra o i'], a: 0 }
            ]
          },
          {
            id: 'java-while',
            title: 'Loop while',
            steps: [
              { t: 'teach', title: 'Enquanto...',
                text: 'O <code>while</code> repete enquanto a condição for verdadeira. No FTC, o <code>while (opModeIsActive())</code> é o coração do TeleOp: ele repete enquanto a partida está rolando!',
                code: _('int energia = 3;', 'while (energia > 0) {', '    System.out.println("Andando...");', '    energia--;', '}', 'System.out.println("Parei!");'),
                tip: '<code>energia--</code> é o mesmo que <code>energia = energia - 1</code>.' },
              { t: 'choice', q: 'Quantas vezes aparece “Andando...”?',
                code: _('int energia = 3;', 'while (energia > 0) {', '    System.out.println("Andando...");', '    energia--;', '}'),
                options: ['3', '2', '4', 'Para sempre'], a: 0 },
              { t: 'choice', q: 'Por que este loop nunca termina?', code: _('int x = 0;', 'while (x < 5) {', '    System.out.println(x);', '}'),
                options: ['O x nunca muda, então é sempre menor que 5', 'Faltou um ;', 'O while está escrito errado', 'Ele termina sim'], a: 0,
                why: 'Faltou o <code>x++;</code> dentro do loop!' },
              { t: 'fill', q: 'Repita enquanto o OpMode estiver ativo:', code: _('___ (opModeIsActive()) {', '    // controlar o robô', '}'),
                options: ['while', 'for', 'if', 'loop'], a: 'while' },
              { t: 'order', q: 'Conte de 1 até 3:',
                lines: ['int n = 1;', 'while (n <= 3) {', '    System.out.println(n);', '    n++;', '}'] },
              { t: 'choice', q: 'Qual a diferença entre <code>if</code> e <code>while</code>?',
                options: ['if decide uma vez; while repete enquanto for verdade', 'São iguais', 'while só funciona com textos', 'if repete para sempre'], a: 0 }
            ]
          },
          {
            id: 'java-metodos',
            title: 'Métodos',
            steps: [
              { t: 'teach', title: 'Crie seus próprios comandos',
                text: 'Métodos são comandos que você mesmo cria. <code>void</code> quer dizer que ele não devolve nada; <code>int</code> antes do nome quer dizer que ele devolve um número inteiro com <code>return</code>.',
                code: _('void comemorar() {', '    System.out.println("Uhul!");', '}', '', 'int dobro(int numero) {', '    return numero * 2;', '}'),
                tip: 'No FTC vários métodos já vêm prontos: <code>waitForStart()</code>, <code>sleep(1000)</code>, <code>opModeIsActive()</code>...' },
              { t: 'choice', q: 'O que <code>void</code> significa?',
                options: ['O método não devolve nenhum valor', 'O método está vazio e não faz nada', 'É um tipo de número', 'Apaga a variável'], a: 0 },
              { t: 'choice', q: 'Quanto vale <code>dobro(6)</code>?', code: _('int dobro(int numero) {', '    return numero * 2;', '}'),
                options: ['12', '6', '62', 'numero * 2'], a: 0 },
              { t: 'fill', q: 'Complete para devolver a soma:', code: _('int soma(int a, int b) {', '    ___ a + b;', '}'),
                options: ['return', 'print', 'void', 'int'], a: 'return' },
              { t: 'choice', q: 'Como chamar o método <code>comemorar</code>?', co: true,
                options: ['comemorar();', 'void comemorar;', 'call comemorar', 'comemorar'], a: 0 },
              { t: 'order', q: 'Monte um método que anda por 1 segundo e para:',
                lines: ['void andarUmSegundo() {', '    motor.setPower(0.5);', '    sleep(1000);', '    motor.setPower(0);', '}'] }
            ]
          }
        ]
      },
      {
        name: 'Java no FTC',
        desc: 'OpMode, motores, servos e gamepad',
        color: '#6C4DF6',
        lessons: [
          {
            id: 'ftc-opmode',
            title: 'Seu primeiro OpMode',
            steps: [
              { t: 'teach', title: 'O esqueleto do OpMode',
                text: 'Todo programa do FTC é um <b>OpMode</b>. Ele aparece na lista do Driver Station com o nome que você colocar no <code>@TeleOp</code>.',
                code: _('package org.firstinspires.ftc.teamcode;', '', 'import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;', 'import com.qualcomm.robotcore.eventloop.opmode.TeleOp;', '', '@TeleOp(name = "Meu Primeiro TeleOp")', 'public class MeuPrimeiro extends LinearOpMode {', '    @Override', '    public void runOpMode() {', '        telemetry.addData("Status", "Pronto!");', '        telemetry.update();', '', '        waitForStart();', '', '        while (opModeIsActive()) {', '            // aqui o robô é controlado', '        }', '    }', '}'),
                tip: 'O nome do arquivo precisa ser igual ao nome da classe: <code>MeuPrimeiro.java</code>.' },
              { t: 'choice', q: 'O que o <code>waitForStart()</code> faz?',
                options: ['Espera o piloto apertar o PLAY ▶ no Driver Station', 'Liga os motores', 'Espera 1 segundo', 'Encerra o programa'], a: 0 },
              { t: 'choice', q: 'Qual anotação usar no período <b>autônomo</b> (os 30 segundos iniciais da partida)?', co: true,
                options: ['@Autonomous', '@TeleOp', '@Auto30', '@Robot'], a: 0 },
              { t: 'fill', q: 'Complete a classe:', code: 'public class Robo extends ___ {',
                options: ['LinearOpMode', 'Robot', 'OpModeLinear', 'FTC'], a: 'LinearOpMode' },
              { t: 'order', q: 'Organize o runOpMode:',
                lines: ['public void runOpMode() {', '    waitForStart();', '    while (opModeIsActive()) {', '        // controlar o robô', '    }', '}'] },
              { t: 'choice', q: 'Para que serve o <code>telemetry</code>?',
                options: ['Mostrar informações na tela do Driver Station', 'Ler o gamepad', 'Girar os motores', 'Conectar no Wi-Fi'], a: 0 }
            ]
          },
          {
            id: 'ftc-motores',
            title: 'Motores e servos',
            steps: [
              { t: 'teach', title: 'Ligando motores',
                text: 'Pegamos o motor do <code>hardwareMap</code> pelo <b>nome da configuração</b> e damos uma potência de <b>-1.0</b> (ré total) até <b>1.0</b> (frente total).',
                code: _('DcMotor motorEsquerdo = hardwareMap.get(DcMotor.class, "motorEsquerdo");', '', 'motorEsquerdo.setPower(0.5);  // metade da força para frente', 'sleep(1000);                   // espera 1 segundo', 'motorEsquerdo.setPower(0);    // para'),
                tip: 'O nome entre aspas precisa ser IGUAL ao da configuração do robô no Driver Station!' },
              { t: 'choice', q: 'O que faz <code>motor.setPower(-1.0)</code>?',
                options: ['Gira com força total para trás', 'Para o motor', 'Gira devagar para frente', 'Dá erro'], a: 0 },
              { t: 'choice', q: 'Qual potência deixa o motor <b>parado</b>?', co: true,
                options: ['0', '1', '-1', '0.5'], a: 0 },
              { t: 'teach', title: 'Servos vão para posições',
                text: 'Um servo vai para uma <b>posição</b> entre <b>0.0</b> e <b>1.0</b>. Perfeito para garras e braços!',
                code: _('Servo garra = hardwareMap.get(Servo.class, "garra");', '', 'garra.setPosition(0.0);  // garra fechada', 'garra.setPosition(1.0);  // garra aberta') },
              { t: 'fill', q: 'Coloque o servo no meio do caminho:', code: 'garra.___(0.5);',
                options: ['setPosition', 'setPower', 'move', 'position'], a: 'setPosition' },
              { t: 'choice', q: 'O motor da direita está montado ao contrário. Como corrigir?', co: true,
                options: ['motorDireito.setDirection(DcMotor.Direction.REVERSE);', 'motorDireito.setPower(2);', 'motorDireito.flip();', 'motorDireito.turnAround();'], a: 0,
                why: 'Em robôs com tração, um lado costuma ficar invertido. O <code>setDirection</code> resolve sem mudar o resto do código!' },
              { t: 'type', q: 'Faça o <b>motorBraco</b> girar com potência <b>0.8</b>:',
                a: ['motorBraco.setPower(0.8);'], ph: 'motorBraco...' }
            ]
          },
          {
            id: 'ftc-gamepad',
            title: 'Gamepad e telemetria',
            steps: [
              { t: 'teach', title: 'Controlando com o gamepad',
                text: 'O <code>gamepad1</code> é o controle do piloto. Os analógicos vão de <b>-1</b> a <b>1</b> e os botões são <code>true</code> ou <code>false</code>.',
                code: _('while (opModeIsActive()) {', '    double frente = -gamepad1.left_stick_y; // pra cima é negativo!', '    motorEsquerdo.setPower(frente);', '    motorDireito.setPower(frente);', '', '    if (gamepad1.a) {', '        garra.setPosition(1.0);', '    }', '', '    telemetry.addData("Potência", frente);', '    telemetry.update();', '}'),
                tip: 'Pegadinha clássica: empurrar o analógico para FRENTE dá um valor NEGATIVO. Por isso usamos o sinal de menos!' },
              { t: 'choice', q: 'Por que tem um <b>-</b> antes de <code>gamepad1.left_stick_y</code>?',
                options: ['Porque empurrar o analógico para frente dá um valor negativo', 'Para o robô andar de ré', 'É obrigatório em Java', 'Para economizar bateria'], a: 0 },
              { t: 'fill', q: 'Quando o piloto apertar o botão <b>B</b>:', code: _('if (gamepad1.___) {', '    garra.setPosition(0.0);', '}'),
                options: ['b', 'B', 'buttonB', 'botaoB'], a: 'b',
                why: 'Os botões do gamepad no FTC são minúsculos: <code>a</code>, <code>b</code>, <code>x</code>, <code>y</code>.' },
              { t: 'fill', q: 'Complete para a mensagem aparecer na tela do Driver Station:', code: _('telemetry.addData("Status", "Rodando");', 'telemetry.___();'),
                options: ['update', 'show', 'print', 'refresh'], a: 'update' },
              { t: 'choice', q: 'Tração tanque: cada analógico controla um lado do robô. Qual linha está certa?', co: true,
                options: ['motorDireito.setPower(-gamepad1.right_stick_y);', 'motorDireito.setPower(gamepad1.a);', 'motorDireito = gamepad1;', 'gamepad1.setPower(motorDireito);'], a: 0 },
              { t: 'order', q: 'Desafio final! Monte o começo do TeleOp:',
                lines: ['waitForStart();', 'while (opModeIsActive()) {', '    double frente = -gamepad1.left_stick_y;', '    motor.setPower(frente);', '}'],
                why: 'Espera o PLAY, e enquanto a partida rola, lê o analógico e manda para o motor. Isso é um TeleOp de verdade!' }
            ]
          }
        ]
      }
    ]
  }
};
