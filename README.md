# VanCode

Site da equipe **FTC Vanguard #37520** que ensina crianças e adolescentes a trocar a programação em blocos por **código de verdade**:

- **Python** para LEGO® SPIKE™ Prime: 8 unidades, 31 lições, do `print` até seguidor de linha proporcional, giroscópio, multitarefa e máquina de estados
- **Java** para FIRST® Tech Challenge: 8 unidades, 31 lições, do `println` até mecanum, encoders, IMU, PID, máquina de estados e AprilTags
- **Arena**: 6 missões em que o aluno digita Python ou Java e vê o cavaleiro **Guardinho** andar no tabuleiro
- **Contas com Google + ranking**: progresso salvo na nuvem e ligas de Escudeiro a Lenda

Funciona como um app de idiomas: lições curtinhas, vidas, XP, ofensiva, meta diária e conquistas. Sem conta, o progresso fica no navegador. Com conta Google, fica salvo no Firebase e o aluno aparece no ranking com o apelido que escolher.

## Como rodar

É só HTML, CSS e JS puro, sem build. O site está publicado na **Vercel** (https://vancode-khaki.vercel.app), que atualiza sozinha a cada commit na branch `main`. Para testar no computador, abra o `index.html` no navegador (o login com Google só funciona no site publicado).

Se o endereço do site mudar, atualize as linhas de prévia (`og:url`, `og:image` e `canonical`) no começo do `index.html` e adicione o novo domínio no Firebase (passo 3 abaixo).

## Ligar o login com Google e o ranking (uns 10 minutos)

O site já funciona sem isso. Para ligar as contas:

1. Entre em <https://console.firebase.google.com> com a conta da equipe e clique em **Criar projeto** (pode desativar o Google Analytics).
2. **Authentication** → *Vamos começar* → aba **Sign-in method** → ative **Google** → escolha o e-mail de suporte → Salvar.
3. Ainda em Authentication → aba **Settings** → **Domínios autorizados** → *Adicionar domínio* → o domínio do site (hoje `vancode-khaki.vercel.app`).
4. **Firestore Database** → *Criar banco de dados* → local `southamerica-east1 (São Paulo)` → modo de produção.
5. Na aba **Regras** do Firestore, apague tudo, cole o conteúdo do arquivo [`firestore.rules`](firestore.rules) e clique em **Publicar**.
6. ⚙ **Configurações do projeto** → em *Seus apps* clique no ícone **Web** (`</>`) → dê um nome (ex.: VanCode) → *Registrar app*. Vai aparecer um bloco `firebaseConfig`.
7. Copie `apiKey`, `authDomain`, `projectId` e `appId` para o arquivo [`js/firebase-config.js`](js/firebase-config.js) e faça commit na `main`.

Pronto: aparece o botão **Entrar com Google** e a página **Ranking** passa a funcionar.

> Os dados do `firebaseConfig` **não são senha** e podem ficar públicos. Quem protege os dados são as regras do `firestore.rules`: cada aluno só lê e escreve o próprio progresso, e o ranking guarda só apelido e números (nunca e-mail).

**Moderação:** se alguém colocar um apelido impróprio, apague ou edite o documento dele em Firestore → `players`.

**Cargos especiais:** o selo dourado com coroa (ex.: *Criador*) é configurado em [`js/cargos.js`](js/cargos.js). Para dar um cargo a alguém, copie o ID do documento da pessoa em Firestore → `players` e adicione uma linha no arquivo. O cargo fica preso ao ID da conta, então ninguém ganha o selo só copiando o apelido.

## Estrutura

```
index.html            página única (início, trilhas, arena, ranking)
css/style.css         visual
img/                  logo da Vanguard, favicon e logos do Python e do Java
js/utils.js           destaque de código, mascote Guardinho, ícones, sons, confete
js/courses.js         unidades 1 a 3 das duas trilhas  ← edite aqui!
js/courses-python-plus.js  unidades 4 a 8 de Python (SPIKE avançado)
js/courses-java-plus.js    unidades 4 a 8 de Java (FTC avançado)
js/arena.js           missões da Arena + mini-interpretador Python/Java
js/firebase-config.js configuração do Firebase (login e ranking)
js/cloud.js           login com Google, sincronização e ranking
js/cargos.js          cargos especiais (selo com coroa no ranking)
js/app.js             estado, rotas, mapa da trilha, lições, perfil, ranking
firestore.rules       regras de segurança do banco
```

## Como adicionar ou editar lições

As lições ficam em `js/courses.js` e nos arquivos `courses-*-plus.js`. Cada lição tem um `id` fixo (é ele que guarda o progresso do aluno, então nunca troque o id de uma lição existente) e uma lista de passos:

| tipo     | o que faz                         | campos principais |
|----------|-----------------------------------|-------------------|
| `teach`  | explica um conceito               | `title`, `text`, `code`, `tip` |
| `choice` | múltipla escolha                  | `q`, `options`, `a` (índice certo), `co: true` se as opções forem código |
| `fill`   | completar a lacuna `___`          | `q`, `code`, `options`, `a` (texto certo) |
| `order`  | colocar linhas na ordem           | `q`, `lines` (ordem certa), `alts` (outras ordens válidas) |
| `type`   | digitar o código                  | `q`, `a` (lista de respostas aceitas) |

Para missões novas da Arena, edite `ARENA_LEVELS` em `js/arena.js` (`#` pedra, `B` moeda, `G` bandeira, `R` início).

**Dica para apresentações:** no perfil existe o *Modo mentor*, que libera todas as lições.

---
LEGO® e SPIKE™ são marcas do LEGO Group. FIRST® e FIRST® Tech Challenge são marcas da FIRST®. “Python” e o logo do Python são marcas da Python Software Foundation; Java e o logo do Java são marcas da Oracle. Os arquivos SVG dos logos vêm do projeto [devicon](https://github.com/devicons/devicon) (licença MIT). Projeto educacional da equipe, sem vínculo oficial.
