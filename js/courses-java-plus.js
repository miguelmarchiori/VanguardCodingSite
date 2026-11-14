/* =========================================================
   VanCode · trilha Java (continuação)
   Unidades 4 a 8: do Java intermediário até robótica
   avançada no FIRST Tech Challenge.
   (formato dos passos explicado em courses.js)
   ========================================================= */
'use strict';

COURSES.java.units.push(
  /* ---------------- Unidade 4 ---------------- */
  {
    name: 'Mais Java',
    desc: 'Strings, arrays, for-each e Math',
    color: '#0E9E8A',
    lessons: [
      {
        id: 'java-strings',
        title: 'Textos (String)',
        steps: [
          { t: 'teach', title: 'Trabalhando com textos',
            text: 'Uma <code>String</code> é um texto, e ela vem com métodos úteis. Para comparar textos, use <code>.equals()</code>, e não <code>==</code>.',
            code: _('String equipe = "Vanguard";', 'System.out.println(equipe.length());        // 8', 'System.out.println(equipe.toUpperCase());   // VANGUARD', 'System.out.println("Equipe " + equipe + " #37520");', '', 'String alianca = "azul";', 'if (alianca.equals("azul")) {', '    System.out.println("Aliança azul!");', '}'),
            tip: 'Com textos, o == compara se são o MESMO objeto na memória, e não se as letras são iguais. Use sempre .equals().' },
          { t: 'choice', q: 'Quanto vale <code>"robo".length()</code>?',
            options: ['4', '5', '3', 'robo'], a: 0 },
          { t: 'choice', q: 'Qual o jeito certo de comparar textos em Java?', co: true,
            options: ['cor.equals("azul")', 'cor == "azul"', 'cor = "azul"', 'equals(cor, azul)'], a: 0 },
          { t: 'fill', q: 'Mostre o texto em maiúsculas:', code: 'System.out.println(nome.___());',
            options: ['toUpperCase', 'upper', 'toUpper', 'capitalize'], a: 'toUpperCase' },
          { t: 'choice', q: 'O que aparece?', code: _('int pontos = 30;', 'System.out.println("Pontos: " + pontos);'),
            options: ['Pontos: 30', 'Pontos: pontos', 'Erro', '30'], a: 0,
            why: 'Em Java, texto + número vira texto. (No Python isso daria erro!)' },
          { t: 'choice', q: 'Qual o tipo de <code>"Vanguard"</code>?', co: true,
            options: ['String', 'char', 'int', 'Text'], a: 0 }
        ]
      },
      {
        id: 'java-arrays',
        title: 'Arrays',
        steps: [
          { t: 'teach', title: 'Várias caixas em fila',
            text: 'Um <b>array</b> guarda vários valores do mesmo tipo. O tamanho é fixo, e os índices começam no <b>0</b>.',
            code: _('int[] pontos = {10, 25, 40};', 'System.out.println(pontos[0]);      // 10', 'System.out.println(pontos.length);  // 3', 'pontos[1] = 30;                     // troca o 25 por 30', '', 'double[] potencias = new double[4]; // 4 posições, todas 0.0'),
            tip: 'Pegadinha clássica: no array é <code>.length</code> sem parênteses; na String é <code>.length()</code> com parênteses.' },
          { t: 'choice', q: 'O que aparece?', code: _('String[] missoes = {"ponte", "torre", "barco"};', 'System.out.println(missoes[2]);'),
            options: ['barco', 'torre', 'ponte', 'Erro'], a: 0 },
          { t: 'choice', q: 'Quanto vale <code>pontos.length</code> em <code>int[] pontos = {5, 10, 15, 20};</code>?',
            options: ['4', '3', '20', '5'], a: 0 },
          { t: 'fill', q: 'Crie um array para os 4 motores da tração:', code: 'DcMotor[] rodas = new DcMotor[___];',
            options: ['4', '3', '0', 'motores'], a: '4' },
          { t: 'choice', q: 'O que acontece?', code: _('int[] v = {1, 2, 3};', 'System.out.println(v[3]);'),
            options: ['Erro: ArrayIndexOutOfBoundsException', 'Mostra 3', 'Mostra 0', 'Mostra 1'], a: 0,
            why: 'Com 3 itens, os índices vão de 0 a 2.' },
          { t: 'type', q: 'Crie um array de int chamado <b>notas</b> com 7, 8 e 10:', a: ['int[] notas = {7, 8, 10};'], ph: 'int[] notas = ...' }
        ]
      },
      {
        id: 'java-foreach',
        title: 'Percorrendo arrays',
        steps: [
          { t: 'teach', title: 'for e for-each',
            text: 'Dá para percorrer um array com o for normal (usando o índice) ou com o <b>for-each</b>, que pega cada item direto.',
            code: _('int[] leituras = {12, 30, 18};', '', 'for (int i = 0; i < leituras.length; i++) {', '    System.out.println("Leitura " + i + ": " + leituras[i]);', '}', '', 'int soma = 0;', 'for (int valor : leituras) {', '    soma += valor;', '}', 'System.out.println(soma);  // 60'),
            tip: '<code>soma += valor</code> é o mesmo que <code>soma = soma + valor</code>.' },
          { t: 'choice', q: 'O que aparece no final?', code: _('int[] p = {5, 5, 10};', 'int total = 0;', 'for (int x : p) {', '    total += x;', '}', 'System.out.println(total);'),
            options: ['20', '10', '5', '0'], a: 0 },
          { t: 'fill', q: 'Complete o for-each:', code: _('for (DcMotor m ___ rodas) {', '    m.setPower(0);', '}'),
            options: [':', 'in', 'of', '='], a: ':' },
          { t: 'choice', q: 'No for normal, qual condição percorre o array inteiro?', co: true,
            options: ['i < arr.length', 'i <= arr.length', 'i < arr.length()', 'i > 0'], a: 0,
            why: 'Com <code>&lt;=</code> você passaria do último índice.' },
          { t: 'order', q: 'Pare todos os motores do array <code>rodas</code>:',
            lines: ['for (DcMotor motor : rodas) {', '    motor.setPower(0);', '}'] },
          { t: 'choice', q: 'Achando o maior valor: o que vai no lugar do comentário?', code: _('int maior = v[0];', 'for (int x : v) {', '    if (x > maior) {', '        // ???', '    }', '}'), co: true,
            options: ['maior = x;', 'x = maior;', 'maior++;', 'break;'], a: 0 }
        ]
      },
      {
        id: 'java-math',
        title: 'Math e conversões',
        steps: [
          { t: 'teach', title: 'Contas prontas',
            text: 'A classe <code>Math</code> tem as contas prontas. E às vezes precisamos <b>converter</b> um tipo em outro, como de double para int. Isso se chama <i>cast</i>.',
            code: _('System.out.println(Math.abs(-0.5));    // 0.5', 'System.out.println(Math.max(3, 7));    // 7', 'System.out.println(Math.sqrt(16));     // 4.0', 'System.out.println(Math.PI);           // 3.14159...', '', 'double ticks = 537.7 * 2.5;', 'int alvo = (int) ticks;                // 1344 (corta a parte decimal)'),
            tip: 'No FTC, <code>Range.clip(valor, -1, 1)</code> garante que a potência nunca passe dos limites do motor.' },
          { t: 'choice', q: 'Quanto vale <code>(int) 3.9</code>?',
            options: ['3', '4', '3.9', 'Erro'], a: 0,
            why: 'O cast para int corta a parte decimal. Ele não arredonda.' },
          { t: 'choice', q: 'Quanto vale <code>Math.max(-2, -8)</code>?',
            options: ['-2', '-8', '8', '2'], a: 0 },
          { t: 'fill', q: 'Pegue o tamanho do erro, sem o sinal:', code: 'double tamanho = Math.___(erro);',
            options: ['abs', 'max', 'round', 'sqrt'], a: 'abs' },
          { t: 'choice', q: 'O que faz <code>Range.clip(potencia, -1, 1)</code>?',
            options: ['Limita o valor entre -1 e 1', 'Corta o fio do motor', 'Arredonda o número', 'Inverte o motor'], a: 0 },
          { t: 'choice', q: 'Uma roda mecanum de 9,6 cm de diâmetro anda quanto em uma volta?',
            options: ['Uns 30,2 cm (π × 9,6)', '9,6 cm', '19,2 cm', '96 cm'], a: 0 }
        ]
      }
    ]
  },

  /* ---------------- Unidade 5 ---------------- */
  {
    name: 'Classes e objetos',
    desc: 'new, atributos, construtor, private e static',
    color: '#3776D6',
    lessons: [
      {
        id: 'java-objetos',
        title: 'Objetos e new',
        steps: [
          { t: 'teach', title: 'Tudo no FTC é objeto',
            text: 'Um <b>objeto</b> junta dados e ações. O <code>DcMotor</code> é um objeto: tem dados (potência, posição) e ações (setPower). Criamos objetos com <code>new</code>, ou o FTC cria para nós com o hardwareMap.',
            code: _('ElapsedTime cronometro = new ElapsedTime();   // criando um objeto', 'cronometro.reset();                           // usando um método', 'double s = cronometro.seconds();', '', 'DcMotor motor = hardwareMap.get(DcMotor.class, "motor");  // o FTC cria', 'motor.setPower(0.5);') },
          { t: 'choice', q: 'O que a palavra <code>new</code> faz?',
            options: ['Cria um objeto novo', 'Apaga um objeto', 'Liga o robô', 'Cria um int'], a: 0 },
          { t: 'choice', q: 'Em <code>motor.setPower(0.5)</code>, o que é <code>setPower</code>?',
            options: ['Um método (uma ação) do objeto motor', 'Uma variável', 'Uma classe', 'Um tipo de número'], a: 0 },
          { t: 'fill', q: 'Crie um cronômetro novo:', code: 'ElapsedTime timer = ___ ElapsedTime();',
            options: ['new', 'create', 'make', 'this'], a: 'new' },
          { t: 'choice', q: 'Classe e objeto: qual a diferença?',
            options: ['A classe é a receita; o objeto é o bolo pronto', 'São a mesma coisa', 'O objeto é a receita', 'Classe é só para números'], a: 0 },
          { t: 'type', q: 'Zere o cronômetro <code>timer</code>:', a: ['timer.reset();'], ph: 'timer....' }
        ]
      },
      {
        id: 'java-classe',
        title: 'Criando sua classe',
        steps: [
          { t: 'teach', title: 'Seu próprio tipo',
            text: 'Você pode criar seus próprios tipos! Uma classe tem <b>atributos</b> (os dados) e <b>métodos</b> (as ações).',
            code: _('public class Placar {', '    int pontos = 0;', '', '    void marcar(int valor) {', '        pontos += valor;', '    }', '', '    boolean ganhou() {', '        return pontos >= 100;', '    }', '}', '', '// usando:', 'Placar placar = new Placar();', 'placar.marcar(60);', 'placar.marcar(50);', 'System.out.println(placar.ganhou());  // true') },
          { t: 'choice', q: 'No exemplo, <code>pontos</code> é...',
            options: ['Um atributo (um dado da classe)', 'Um método', 'Uma classe', 'Um pacote'], a: 0 },
          { t: 'choice', q: 'Quanto vale <code>placar.pontos</code> depois de <code>marcar(60)</code> e <code>marcar(50)</code>?',
            options: ['110', '60', '50', '100'], a: 0 },
          { t: 'fill', q: 'Complete o método que diz se ganhou:', code: _('boolean ganhou() {', '    ___ pontos >= 100;', '}'),
            options: ['return', 'void', 'print', 'new'], a: 'return' },
          { t: 'choice', q: 'Cada <code>new Placar()</code> cria...',
            options: ['Um placar separado, com seus próprios pontos', 'Sempre o mesmo placar', 'Um erro', 'Um número'], a: 0 },
          { t: 'order', q: 'Monte a classe Garra com um método abrir:',
            lines: ['public class Garra {', '    void abrir() {', '        System.out.println("Abrindo!");', '    }', '}'] }
        ]
      },
      {
        id: 'java-construtor',
        title: 'Construtor e this',
        steps: [
          { t: 'teach', title: 'Quando o objeto nasce',
            text: 'O <b>construtor</b> é um método especial com o mesmo nome da classe. Ele roda quando o objeto é criado e prepara tudo. O <code>this</code> quer dizer “o próprio objeto”.',
            code: _('public class Robo {', '    String nome;', '    int numero;', '', '    Robo(String nome, int numero) {   // construtor', '        this.nome = nome;             // this.nome é o atributo', '        this.numero = numero;', '    }', '}', '', 'Robo nosso = new Robo("Vanguard", 37520);', 'System.out.println(nosso.nome);   // Vanguard') },
          { t: 'choice', q: 'Quando o construtor roda?',
            options: ['Quando fazemos new Robo(...)', 'Toda vez que usamos o objeto', 'Nunca', 'Quando ligamos a bateria'], a: 0 },
          { t: 'choice', q: 'Em <code>this.nome = nome;</code>, o que é <code>this.nome</code>?',
            options: ['O atributo do objeto', 'O parâmetro que chegou', 'Uma String nova', 'Um erro'], a: 0 },
          { t: 'fill', q: 'Complete o construtor da classe Braco:', code: _('public class Braco {', '    ___(int posicaoInicial) {', '    }', '}'),
            options: ['Braco', 'void', 'new', 'braco'], a: 'Braco',
            why: 'O construtor não tem tipo de retorno e tem exatamente o nome da classe, com a mesma maiúscula.' },
          { t: 'choice', q: 'O construtor tem tipo de retorno, como void ou int?',
            options: ['Não, nenhum', 'Sim, sempre void', 'Sim, sempre int', 'Sim, o nome da classe em minúsculo'], a: 0 },
          { t: 'type', q: 'Crie um Robo chamado <b>bot</b> com o nome "Bip" e o número 7:', a: ['Robo bot = new Robo("Bip", 7);'], ph: 'Robo bot = ...' }
        ]
      },
      {
        id: 'java-static',
        title: 'private, static e final',
        steps: [
          { t: 'teach', title: 'Protegendo e fixando valores',
            text: '<code>private</code> esconde algo dentro da classe. <code>final</code> deixa um valor fixo. <code>static</code> faz algo pertencer à classe toda, sem precisar de objeto. Juntos, eles criam as <b>constantes</b> do robô!',
            code: _('public class Constantes {', '    public static final double TICKS_POR_VOLTA = 537.7;', '    public static final double DIAMETRO_CM = 9.6;', '}', '', 'public class Garra {', '    private Servo servo;              // ninguém de fora mexe', '    private static final double ABERTA = 1.0;', '', '    public void abrir() {', '        servo.setPosition(ABERTA);', '    }', '}'),
            tip: 'Constantes em MAIÚSCULAS_COM_UNDERLINE são um combinado entre programadores Java.' },
          { t: 'choice', q: 'O que <code>final</code> faz numa variável?',
            options: ['Impede que o valor mude depois', 'Faz ela ser a última', 'Apaga a variável', 'Deixa mais rápida'], a: 0 },
          { t: 'choice', q: 'Como usar uma constante static de outra classe?', co: true,
            options: ['Constantes.TICKS_POR_VOLTA', 'new Constantes.TICKS_POR_VOLTA', 'TICKS_POR_VOLTA.Constantes', 'Constantes(TICKS_POR_VOLTA)'], a: 0 },
          { t: 'fill', q: 'Esconda o motor dentro da classe:', code: '___ DcMotor motorBraco;',
            options: ['private', 'public', 'static', 'final'], a: 'private' },
          { t: 'choice', q: 'Por que usar constantes em vez de escrever 537.7 em todo lugar?',
            options: ['Se trocar o motor, você muda o número num lugar só', 'Porque o Java exige', 'Para o código ficar maior', 'Não tem motivo'], a: 0 },
          { t: 'type', q: 'Crie uma constante <b>VELOCIDADE_MAX</b> igual a 0.8 (public static final double):', a: ['public static final double VELOCIDADE_MAX = 0.8;'], ph: 'public static final ...' }
        ]
      }
    ]
  },

  /* ---------------- Unidade 6 ---------------- */
  {
    name: 'TeleOp de competição',
    desc: 'Gatilhos, mecanum, modo lento e braço com encoder',
    color: '#C2410C',
    lessons: [
      {
        id: 'ftc-controles',
        title: 'Gatilhos, bumpers e d-pad',
        steps: [
          { t: 'teach', title: 'O controle inteiro',
            text: 'O gamepad tem muito mais que analógicos: <b>gatilhos</b> (de 0 a 1, como um acelerador), <b>bumpers</b> e o <b>d-pad</b> (true ou false).',
            code: _('double intake = gamepad1.right_trigger - gamepad1.left_trigger;', 'motorIntake.setPower(intake);   // gatilho direito puxa, esquerdo solta', '', 'if (gamepad1.dpad_up) {', '    motorBraco.setPower(0.6);', '} else if (gamepad1.dpad_down) {', '    motorBraco.setPower(-0.6);', '} else {', '    motorBraco.setPower(0);', '}', '', 'if (gamepad2.left_bumper) {', '    garra.setPosition(0.0);', '}'),
            tip: 'O gamepad1 é do piloto e o gamepad2 é do copiloto. Dividir as funções deixa o time mais rápido!' },
          { t: 'choice', q: 'Que valores o <code>gamepad1.right_trigger</code> dá?',
            options: ['De 0 a 1', 'Só true ou false', 'De -1 a 1', 'De 0 a 100'], a: 0 },
          { t: 'choice', q: 'Ninguém aperta nenhum gatilho. Quanto vale <code>intake</code> no exemplo?',
            options: ['0', '1', '-1', 'Erro'], a: 0 },
          { t: 'fill', q: 'Use o botão de cima do d-pad:', code: 'if (gamepad1.___) {',
            options: ['dpad_up', 'up', 'dpadUp', 'arrow_up'], a: 'dpad_up' },
          { t: 'choice', q: 'Por que o <code>else</code> que zera o braço é importante?',
            options: ['Senão o braço continua girando depois que solta o botão', 'Para o gamepad funcionar', 'Para economizar código', 'Não é importante'], a: 0 },
          { t: 'choice', q: 'Quem usa o <code>gamepad2</code>?',
            options: ['O copiloto (segundo driver)', 'O juiz', 'O técnico', 'Ninguém'], a: 0 }
        ]
      },
      {
        id: 'ftc-mecanum',
        title: 'Tração mecanum',
        steps: [
          { t: 'teach', title: 'Andando até de lado!',
            text: 'Rodas <b>mecanum</b> deixam o robô andar para qualquer direção, até de lado. Cada roda recebe uma mistura de frente (y), lado (x) e giro (rx).',
            code: _('double y  = -gamepad1.left_stick_y;   // frente e trás', 'double x  = gamepad1.left_stick_x;    // lado', 'double rx = gamepad1.right_stick_x;   // girar', '', 'double den = Math.max(Math.abs(y) + Math.abs(x) + Math.abs(rx), 1);', 'frenteEsq.setPower((y + x + rx) / den);', 'trasEsq.setPower((y - x + rx) / den);', 'frenteDir.setPower((y - x - rx) / den);', 'trasDir.setPower((y + x - rx) / den);'),
            tip: 'O <code>den</code> (denominador) garante que nenhuma potência passe de 1, mantendo a proporção entre as rodas. Lembre de inverter (REVERSE) os motores de um dos lados!' },
          { t: 'choice', q: 'Só o analógico esquerdo para frente (y = 1, x = 0, rx = 0). Como ficam as 4 rodas?',
            options: ['Todas com 1: anda para frente', 'Só as da esquerda giram', 'As da frente giram para trás', 'Todas param'], a: 0 },
          { t: 'choice', q: 'Só para o lado (x = 1, y = 0, rx = 0). Quanto recebe a roda <code>frenteEsq</code>?',
            options: ['1', '-1', '0', '2'], a: 0,
            why: 'y + x + rx = 0 + 1 + 0 = 1. Já a <code>trasEsq</code> recebe y - x + rx = -1: as rodas giram em sentidos trocados e o robô anda de lado.' },
          { t: 'fill', q: 'Complete a roda de trás esquerda:', code: 'trasEsq.setPower((y ___ x + rx) / den);',
            options: ['-', '+', '*', '/'], a: '-' },
          { t: 'choice', q: 'Para que serve o <code>den</code>?',
            options: ['Manter todas as potências entre -1 e 1 sem perder a proporção', 'Deixar o robô mais pesado', 'Ler o gamepad', 'Contar as rodas'], a: 0 },
          { t: 'choice', q: 'Por que tem um <code>-</code> no <code>-gamepad1.left_stick_y</code>?',
            options: ['Porque empurrar o analógico para frente dá valor negativo', 'Para andar de ré', 'Por causa das rodas mecanum', 'Não precisa'], a: 0 }
        ]
      },
      {
        id: 'ftc-lento',
        title: 'Modo lento e precisão',
        steps: [
          { t: 'teach', title: 'Devagar na hora de encaixar',
            text: 'Na hora de encaixar uma peça, velocidade máxima atrapalha. Um <b>modo lento</b> multiplica a potência por um número menor, e o <code>Range.clip</code> protege os limites.',
            code: _('double multiplicador = 1.0;', 'if (gamepad1.right_bumper) {', '    multiplicador = 0.35;           // lento enquanto segura', '}', '', 'double frente = -gamepad1.left_stick_y * multiplicador;', 'frente = Range.clip(frente, -1, 1);', 'motorEsq.setPower(frente);', '', 'telemetry.addData("Modo", multiplicador < 1 ? "LENTO" : "normal");'),
            tip: 'O <code>condição ? a : b</code> é um if numa linha só: se a condição for true, usa a; senão, usa b.' },
          { t: 'choice', q: 'Segurando o bumper, o analógico todo para frente dá potência...',
            options: ['0.35', '1.0', '0', '-0.35'], a: 0 },
          { t: 'choice', q: 'Com multiplicador 0.35, o que o telemetry mostra?',
            options: ['Modo: LENTO', 'Modo: normal', 'Modo: 0.35', 'Nada'], a: 0 },
          { t: 'fill', q: 'Limite a potência entre -1 e 1:', code: 'potencia = Range.___(potencia, -1, 1);',
            options: ['clip', 'limit', 'clamp', 'cut'], a: 'clip' },
          { t: 'choice', q: 'Com x = 8, quanto vale <code>x > 5 ? "alto" : "baixo"</code>?',
            options: ['"alto"', '"baixo"', '8', 'Erro'], a: 0 },
          { t: 'type', q: 'Faça o modo lento multiplicar por 0.4:', a: ['multiplicador = 0.4;'], ph: 'multiplicador = ...' }
        ]
      },
      {
        id: 'ftc-braco',
        title: 'Braço com encoder',
        steps: [
          { t: 'teach', title: 'Posições exatas',
            text: 'Com o <b>encoder</b>, o motor sabe quantos <i>ticks</i> girou. No modo <code>RUN_TO_POSITION</code> ele vai sozinho até a posição alvo e segura lá. Perfeito para braços e elevadores!',
            code: _('motorBraco.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);  // zera', 'motorBraco.setTargetPosition(0);', 'motorBraco.setMode(DcMotor.RunMode.RUN_TO_POSITION);', 'motorBraco.setPower(0.7);', '', '// no loop do TeleOp:', 'if (gamepad2.y) {', '    motorBraco.setTargetPosition(1200);   // posição alta', '} else if (gamepad2.a) {', '    motorBraco.setTargetPosition(0);      // posição baixa', '}', 'telemetry.addData("Braço", motorBraco.getCurrentPosition());'),
            tip: 'Regra de ouro: chame setTargetPosition ANTES de mudar para RUN_TO_POSITION, senão o robô dá erro.' },
          { t: 'choice', q: 'O que <code>STOP_AND_RESET_ENCODER</code> faz?',
            options: ['Para o motor e zera a contagem de ticks', 'Liga o motor no máximo', 'Desliga o encoder para sempre', 'Inverte o motor'], a: 0 },
          { t: 'choice', q: 'No modo RUN_TO_POSITION, o que o <code>setPower(0.7)</code> controla?',
            options: ['A velocidade máxima para chegar no alvo', 'A posição alvo', 'A direção', 'Nada'], a: 0 },
          { t: 'fill', q: 'Leia a posição atual do braço:', code: 'int pos = motorBraco.___();',
            options: ['getCurrentPosition', 'getPosition', 'getTicks', 'position'], a: 'getCurrentPosition' },
          { t: 'order', q: 'Prepare o braço: zere, defina o alvo, mude o modo e, por último, dê potência:',
            lines: ['motorBraco.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);', 'motorBraco.setTargetPosition(0);', 'motorBraco.setMode(DcMotor.RunMode.RUN_TO_POSITION);', 'motorBraco.setPower(0.7);'] },
          { t: 'choice', q: 'Por que o braço fica no <code>gamepad2</code>?',
            options: ['Para o copiloto cuidar do braço enquanto o piloto dirige', 'Porque o gamepad1 não tem botão Y', 'É regra do FTC', 'Tanto faz'], a: 0 }
        ]
      }
    ]
  },

  /* ---------------- Unidade 7 ---------------- */
  {
    name: 'Autônomo',
    desc: 'Tempo, encoders, IMU e sensores',
    color: '#0F766E',
    lessons: [
      {
        id: 'ftc-auto-tempo',
        title: 'Autônomo por tempo',
        steps: [
          { t: 'teach', title: 'O primeiro autônomo',
            text: 'O jeito mais simples de fazer um autônomo é dar potência por um tempo. Com <code>ElapsedTime</code> você mede o tempo sem travar o programa.',
            code: _('@Autonomous(name = "Auto Simples")', 'public class AutoSimples extends LinearOpMode {', '    @Override', '    public void runOpMode() {', '        DcMotor esq = hardwareMap.get(DcMotor.class, "esq");', '        DcMotor dir = hardwareMap.get(DcMotor.class, "dir");', '        ElapsedTime timer = new ElapsedTime();', '        waitForStart();', '', '        timer.reset();', '        while (opModeIsActive() && timer.seconds() < 2.0) {', '            esq.setPower(0.5);', '            dir.setPower(0.5);', '        }', '        esq.setPower(0);', '        dir.setPower(0);', '    }', '}'),
            tip: 'Andar por tempo muda com a bateria: com bateria fraca, o robô anda menos. Por isso as equipes usam encoders (próxima lição)!' },
          { t: 'choice', q: 'Por quanto tempo o robô anda?',
            options: ['2 segundos', 'Meio segundo', 'Para sempre', '20 segundos'], a: 0 },
          { t: 'choice', q: 'Por que o <code>opModeIsActive()</code> na condição do while?',
            options: ['Para parar na hora se alguém apertar STOP', 'Para ligar o robô', 'Para ler o gamepad', 'Não precisa'], a: 0 },
          { t: 'fill', q: 'Zere o cronômetro antes de começar:', code: 'timer.___();',
            options: ['reset', 'start', 'zero', 'clear'], a: 'reset' },
          { t: 'choice', q: 'Qual o maior problema do autônomo por tempo?',
            options: ['A distância muda com a carga da bateria', 'Não funciona no FTC', 'É proibido', 'Gasta o gamepad'], a: 0 },
          { t: 'choice', q: 'Quanto dura o período autônomo de uma partida do FTC?',
            options: ['30 segundos', '2 minutos', '10 segundos', '5 minutos'], a: 0 }
        ]
      },
      {
        id: 'ftc-encoder-cm',
        title: 'Encoders: andar X cm',
        steps: [
          { t: 'teach', title: 'Contando ticks',
            text: 'O encoder conta <b>ticks</b> a cada volta do motor (por exemplo, 537,7 no motor goBILDA de 312 RPM). Sabendo o diâmetro da roda, dá para converter centímetros em ticks.',
            code: _('static final double TICKS_POR_VOLTA = 537.7;', 'static final double DIAMETRO_CM = 9.6;', 'static final double TICKS_POR_CM = TICKS_POR_VOLTA / (Math.PI * DIAMETRO_CM);', '', 'void andarCm(double cm, double potencia) {', '    int alvo = (int) (cm * TICKS_POR_CM);', '    for (DcMotor m : rodas) {', '        m.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);', '        m.setTargetPosition(alvo);', '        m.setMode(DcMotor.RunMode.RUN_TO_POSITION);', '        m.setPower(potencia);', '    }', '    while (opModeIsActive() && rodas[0].isBusy()) {', '        telemetry.addData("Faltam", alvo - rodas[0].getCurrentPosition());', '        telemetry.update();', '    }', '    for (DcMotor m : rodas) m.setPower(0);', '}'),
            tip: 'Cada motor tem seu número de ticks por volta. Confira na página do fabricante!' },
          { t: 'choice', q: 'Com uns 17,8 ticks por cm, quantos ticks para andar 50 cm?',
            options: ['Uns 890', '50', '537', '17,8'], a: 0 },
          { t: 'choice', q: 'O que o <code>isBusy()</code> diz?',
            options: ['Se o motor ainda está indo até o alvo', 'Se a bateria está cheia', 'Se o motor quebrou', 'Se o gamepad está conectado'], a: 0 },
          { t: 'fill', q: 'Converta para int:', code: 'int alvo = (___) (cm * TICKS_POR_CM);',
            options: ['int', 'double', 'Integer', 'float'], a: 'int' },
          { t: 'choice', q: 'Por que encoders são melhores que tempo?',
            options: ['Medem quanto a roda girou de verdade, sem depender da bateria', 'São mais baratos', 'Não precisam de código', 'Deixam o robô mais leve'], a: 0 },
          { t: 'type', q: 'Mande o motor <code>m</code> ir até a posição <code>alvo</code>:', a: ['m.setTargetPosition(alvo);'], ph: 'm.set...' }
        ]
      },
      {
        id: 'ftc-imu',
        title: 'IMU: girar no ângulo certo',
        steps: [
          { t: 'teach', title: 'A bússola do robô',
            text: 'O Control Hub tem uma <b>IMU</b> que mede a direção do robô (o yaw). Antes de usar, diga como o Hub está montado.',
            code: _('IMU imu = hardwareMap.get(IMU.class, "imu");', 'imu.initialize(new IMU.Parameters(new RevHubOrientationOnRobot(', '        RevHubOrientationOnRobot.LogoFacingDirection.UP,', '        RevHubOrientationOnRobot.UsbFacingDirection.FORWARD)));', 'imu.resetYaw();', '', 'double yaw = imu.getRobotYawPitchRollAngles().getYaw(AngleUnit.DEGREES);', 'telemetry.addData("Direção", yaw);'),
            tip: 'No FTC, o yaw aumenta quando o robô gira para a ESQUERDA (sentido anti-horário).' },
          { t: 'choice', q: 'Para que serve <code>imu.resetYaw()</code>?',
            options: ['Definir a direção atual como 0°', 'Desligar a IMU', 'Girar o robô', 'Ler o gamepad'], a: 0 },
          { t: 'choice', q: 'O robô girou 90° para a esquerda. O yaw fica perto de...',
            options: ['90', '-90', '0', '180'], a: 0 },
          { t: 'fill', q: 'Leia o yaw em graus:', code: 'double yaw = imu.getRobotYawPitchRollAngles().getYaw(AngleUnit.___);',
            options: ['DEGREES', 'RADIANS', 'GRAUS', 'DEG'], a: 'DEGREES' },
          { t: 'order', q: 'Gire para a esquerda até 90° (usando o seu método <code>getYaw()</code>):',
            lines: ['imu.resetYaw();', 'while (opModeIsActive() && getYaw() < 90) {', '    esq.setPower(-0.3);', '    dir.setPower(0.3);', '}', 'parar();'],
            alts: [['imu.resetYaw();', 'while (opModeIsActive() && getYaw() < 90) {', '    dir.setPower(0.3);', '    esq.setPower(-0.3);', '}', 'parar();']] },
          { t: 'choice', q: 'Por que usar a IMU em vez de contar ticks para girar?',
            options: ['As rodas podem escorregar, e a IMU mede o giro real', 'A IMU é mais barata', 'Ticks não existem no FTC', 'Não tem diferença'], a: 0 }
        ]
      },
      {
        id: 'ftc-sensores',
        title: 'Sensores do FTC',
        steps: [
          { t: 'teach', title: 'Sentidos do robô',
            text: 'Cada sensor tem sua classe no FTC. O nome entre aspas precisa ser igual ao da configuração do robô.',
            code: _('DistanceSensor dist = hardwareMap.get(DistanceSensor.class, "distancia");', 'TouchSensor toque = hardwareMap.get(TouchSensor.class, "toque");', 'ColorSensor cor = hardwareMap.get(ColorSensor.class, "cor");', '', 'double cm = dist.getDistance(DistanceUnit.CM);', 'boolean apertado = toque.isPressed();', 'int vermelho = cor.red();', 'int azul = cor.blue();', '', 'if (vermelho > azul) {', '    telemetry.addLine("Peça vermelha!");', '}'),
            tip: 'Mostre as leituras no telemetry para descobrir os valores reais na sua arena antes de programar as decisões!' },
          { t: 'choice', q: 'Qual método diz se o sensor de toque está apertado?', co: true,
            options: ['isPressed()', 'getPressed()', 'pressed', 'touch()'], a: 0 },
          { t: 'fill', q: 'Leia a distância em centímetros:', code: 'double cm = dist.getDistance(DistanceUnit.___);',
            options: ['CM', 'METER', 'INCH', 'MM'], a: 'CM' },
          { t: 'choice', q: 'Como saber se a peça é azul com um ColorSensor?',
            options: ['Comparar cor.blue() com cor.red()', 'Usar cor.isBlue()', 'Perguntar ao juiz', 'Usar o gamepad'], a: 0 },
          { t: 'choice', q: 'Por que mostrar as leituras no telemetry antes de programar?',
            options: ['Para descobrir os números reais da sua arena', 'Porque é obrigatório', 'Para o robô andar', 'Para economizar bateria'], a: 0 },
          { t: 'order', q: 'Ande até ficar a 10 cm da parede:',
            lines: ['while (opModeIsActive() && dist.getDistance(DistanceUnit.CM) > 10) {', '    andar(0.3);', '}', 'parar();'] }
        ]
      }
    ]
  },

  /* ---------------- Unidade 8 ---------------- */
  {
    name: 'Robótica avançada',
    desc: 'Controle P, PID, estados, AprilTags e subsistemas',
    color: '#4C1D95',
    lessons: [
      {
        id: 'ftc-controle-p',
        title: 'Controle P',
        steps: [
          { t: 'teach', title: 'Corrigindo pelo tamanho do erro',
            text: 'Em vez de “liga até chegar”, o <b>controle P</b> dá potência proporcional ao <b>erro</b>: longe do alvo, potência alta; perto, potência baixa. O robô chega suave e preciso!',
            code: _('double alvo = 90;          // graus', 'double kP = 0.02;', '', 'while (opModeIsActive()) {', '    double erro = alvo - getYaw();', '    if (Math.abs(erro) < 1) break;          // chegou!', '    double potencia = Range.clip(kP * erro, -0.5, 0.5);', '    esq.setPower(-potencia);', '    dir.setPower(potencia);', '}', 'parar();') },
          { t: 'choice', q: 'Erro de 50° com kP = 0.02. Qual a potência antes do clip?',
            options: ['1.0', '0.02', '50', '0.5'], a: 0,
            why: '0.02 × 50 = 1.0.' },
          { t: 'choice', q: 'E depois do <code>Range.clip(..., -0.5, 0.5)</code>?',
            options: ['0.5', '1.0', '-0.5', '0'], a: 0 },
          { t: 'choice', q: 'Perto do alvo, o que acontece com a potência?',
            options: ['Fica pequena, e o robô chega devagar', 'Fica no máximo', 'Inverte sozinha', 'Nada muda'], a: 0 },
          { t: 'fill', q: 'Calcule o erro:', code: 'double erro = alvo ___ getYaw();',
            options: ['-', '+', '*', '/'], a: '-' },
          { t: 'choice', q: 'Às vezes o robô para um pouquinho antes do alvo e não chega. Por quê?',
            options: ['Perto do alvo, a potência fica fraca demais para mover o robô', 'O kP está perfeito demais', 'A IMU desligou', 'É impossível'], a: 0,
            why: 'Esse erro que sobra é resolvido com o I do PID (próxima lição) ou com uma potência mínima.' }
        ]
      },
      {
        id: 'ftc-pid',
        title: 'PID completo',
        steps: [
          { t: 'teach', title: 'P, I e D',
            text: 'O <b>PID</b> junta três correções: <b>P</b> (o erro de agora), <b>I</b> (a soma dos erros, que tira o erro que sobra) e <b>D</b> (a variação do erro, que freia antes de passar do alvo).',
            code: _('double kP = 0.02, kI = 0.001, kD = 0.003;', 'double integral = 0, erroAnterior = 0;', 'ElapsedTime timer = new ElapsedTime();', '', 'while (opModeIsActive()) {', '    double dt = timer.seconds();', '    timer.reset();', '    double erro = alvo - getYaw();', '    integral += erro * dt;', '    double derivada = (erro - erroAnterior) / dt;', '    erroAnterior = erro;', '', '    double saida = kP * erro + kI * integral + kD * derivada;', '    girar(Range.clip(saida, -0.6, 0.6));', '}'),
            tip: 'Ajuste nesta ordem: primeiro só o P, depois o D para não passar do ponto, e por último um pouquinho de I.' },
          { t: 'choice', q: 'Qual parte do PID ajuda a <b>frear</b> antes de passar do alvo?',
            options: ['D (derivativo)', 'P (proporcional)', 'I (integral)', 'Nenhuma'], a: 0 },
          { t: 'choice', q: 'Qual parte elimina aquele erro pequeno que sobra no final?',
            options: ['I (integral)', 'D (derivativo)', 'P (proporcional)', 'O clip'], a: 0 },
          { t: 'fill', q: 'Complete a saída do PID:', code: 'double saida = kP * erro + kI * integral + ___ * derivada;',
            options: ['kD', 'kI', 'kP', 'dt'], a: 'kD' },
          { t: 'choice', q: 'Qual a ordem recomendada para ajustar?',
            options: ['P, depois D, depois I', 'I, depois P, depois D', 'Tudo junto no máximo', 'Só o D'], a: 0 },
          { t: 'choice', q: 'Onde mais o PID aparece em robôs de competição?',
            options: ['Braços, elevadores, giros e trajetórias', 'Só em giros', 'Só no gamepad', 'Em lugar nenhum'], a: 0 }
        ]
      },
      {
        id: 'ftc-estados',
        title: 'Máquina de estados',
        steps: [
          { t: 'teach', title: 'enum + switch',
            text: 'Para autônomos e TeleOps complexos, use um <code>enum</code> com os estados e um <code>switch</code>. O loop nunca trava: a cada volta ele faz um pouquinho do estado atual.',
            code: _('// dentro da classe (fora do runOpMode):', 'enum Estado { ANDAR, LEVANTAR, SOLTAR, FIM }', '', '// dentro do runOpMode:', 'Estado estado = Estado.ANDAR;', 'while (opModeIsActive()) {', '    switch (estado) {', '        case ANDAR:', '            if (andouAteOAlvo()) estado = Estado.LEVANTAR;', '            break;', '        case LEVANTAR:', '            braco.setTargetPosition(1200);', '            if (!braco.isBusy()) estado = Estado.SOLTAR;', '            break;', '        case SOLTAR:', '            garra.setPosition(1.0);', '            estado = Estado.FIM;', '            break;', '        case FIM:', '            break;', '    }', '    telemetry.addData("Estado", estado);', '    telemetry.update();', '}'),
            tip: 'Mostrar o estado no telemetry ajuda MUITO a descobrir onde o autônomo travou.' },
          { t: 'choice', q: 'Depois de SOLTAR, qual o próximo estado?',
            options: ['FIM', 'ANDAR', 'LEVANTAR', 'SOLTAR de novo'], a: 0 },
          { t: 'choice', q: 'Para que serve o <code>break</code> em cada case?',
            options: ['Sair do switch sem rodar o próximo case', 'Quebrar o loop while', 'Parar o robô', 'Nada'], a: 0 },
          { t: 'fill', q: 'Mude para o estado SOLTAR:', code: 'estado = Estado.___;',
            options: ['SOLTAR', 'soltar', '"SOLTAR"', 'Soltar'], a: 'SOLTAR' },
          { t: 'choice', q: 'Qual a vantagem de um loop que nunca trava?',
            options: ['Dá para ler sensores, mostrar telemetry e parar a qualquer momento', 'O robô fica mais rápido', 'Gasta menos código', 'Não tem vantagem'], a: 0 },
          { t: 'type', q: 'Declare o estado inicial como ANDAR:', a: ['Estado estado = Estado.ANDAR;'], ph: 'Estado estado = ...' }
        ]
      },
      {
        id: 'ftc-apriltag',
        title: 'Visão com AprilTags',
        steps: [
          { t: 'teach', title: 'O robô que enxerga',
            text: 'AprilTags são aqueles quadradinhos preto e branco no campo. Com uma webcam, o FTC diz o <b>ID</b> da tag e a <b>distância</b> até ela. Ótimo para saber onde o robô está!',
            code: _('AprilTagProcessor tags = AprilTagProcessor.easyCreateWithDefaults();', 'VisionPortal portal = VisionPortal.easyCreateWithDefaults(', '        hardwareMap.get(WebcamName.class, "Webcam 1"), tags);', '', 'waitForStart();', 'while (opModeIsActive()) {', '    for (AprilTagDetection d : tags.getDetections()) {', '        telemetry.addData("Tag", d.id);', '        if (d.metadata != null) {', '            telemetry.addData("Distância (pol)", d.ftcPose.range);', '        }', '    }', '    telemetry.update();', '}'),
            tip: 'A tag só tem posição (ftcPose) se fizer parte da biblioteca da temporada. Por isso o if com metadata.' },
          { t: 'choice', q: 'O que <code>tags.getDetections()</code> devolve?',
            options: ['A lista de tags que a câmera está vendo agora', 'A posição do gamepad', 'A cor do chão', 'O número da equipe'], a: 0 },
          { t: 'choice', q: 'Para que serve o <code>d.id</code>?',
            options: ['Saber QUAL tag foi vista', 'Saber a velocidade', 'Ligar a câmera', 'Nada'], a: 0 },
          { t: 'fill', q: 'Percorra as detecções:', code: 'for (AprilTagDetection d ___ tags.getDetections()) {',
            options: [':', 'in', 'of', '='], a: ':' },
          { t: 'choice', q: 'Um uso comum de AprilTags no autônomo:',
            options: ['Alinhar o robô e saber a distância até um alvo', 'Medir a bateria', 'Controlar o servo', 'Ler o gamepad'], a: 0 },
          { t: 'choice', q: 'Por que conferir <code>d.metadata != null</code>?',
            options: ['Só tags conhecidas têm posição; sem isso o código pode dar erro', 'Para ligar a câmera', 'Para mudar a cor', 'Não precisa'], a: 0 }
        ]
      },
      {
        id: 'ftc-subsistemas',
        title: 'Subsistemas',
        steps: [
          { t: 'teach', title: 'Organizando o robô',
            text: 'Equipes de ponta separam o robô em <b>subsistemas</b>: uma classe para a tração, outra para o braço, outra para a garra. O OpMode fica curtinho, e o mesmo código serve para o TeleOp e para o autônomo!',
            code: _('public class Garra {', '    private final Servo servo;', '    private static final double ABERTA = 1.0, FECHADA = 0.0;', '', '    public Garra(HardwareMap hw) {', '        servo = hw.get(Servo.class, "garra");', '    }', '    public void abrir()  { servo.setPosition(ABERTA); }', '    public void fechar() { servo.setPosition(FECHADA); }', '}', '', '// no OpMode:', 'Garra garra = new Garra(hardwareMap);', 'waitForStart();', 'garra.fechar();'),
            tip: 'Bibliotecas que as equipes usam no FTC, como Road Runner e Pedro Pathing, também são organizadas assim: classes com responsabilidades separadas.' },
          { t: 'choice', q: 'Qual a vantagem de ter uma classe Garra?',
            options: ['O TeleOp e o autônomo usam o mesmo código da garra', 'Deixa a garra mais forte', 'É obrigatório no FTC', 'Nenhuma'], a: 0 },
          { t: 'choice', q: 'Por que o construtor recebe o <code>HardwareMap</code>?',
            options: ['Para a classe pegar o servo pelo nome da configuração', 'Para desenhar um mapa', 'Para ler o gamepad', 'Não precisa'], a: 0 },
          { t: 'fill', q: 'Use a garra no OpMode:', code: 'Garra garra = ___ Garra(hardwareMap);',
            options: ['new', 'this', 'Garra', 'make'], a: 'new' },
          { t: 'order', q: 'Monte o método fechar da garra:',
            lines: ['public void fechar() {', '    servo.setPosition(FECHADA);', '}'] },
          { t: 'choice', q: 'Parabéns, você terminou a trilha! Qual o próximo passo?',
            options: ['Montar o código do robô da equipe, testar e melhorar sempre', 'Parar de estudar', 'Copiar o código de outra equipe', 'Voltar para os blocos'], a: 0,
            why: 'Engenharia é testar, medir e melhorar. Bem-vindo(a) ao FTC de verdade!' }
        ]
      }
    ]
  }
);
