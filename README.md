# Vanguard Code 🤖

Site da equipe **FTC Vanguard #37520** que ensina crianças e adolescentes a trocar a programação em blocos por **código de verdade**:

- 🐍 **Python** para LEGO® SPIKE™ Prime (10 lições)
- ☕ **Java** para FIRST® Tech Challenge (10 lições)
- 🎮 **Arena do Bip**: 6 fases em que o aluno digita Python ou Java e vê um robô andar no tabuleiro

Funciona como um app de idiomas: lições curtinhas, vidas ❤️, XP ⚡, ofensiva 🔥, meta diária e conquistas. O progresso fica salvo no navegador (localStorage), sem login nem servidor.

## Como rodar

É só HTML, CSS e JS puro, sem build. Abra o `index.html` no navegador ou publique a pasta no **GitHub Pages** (Settings → Pages → branch principal, pasta raiz).

## Estrutura

```
index.html        página única (início, trilhas, arena)
css/style.css     visual
js/utils.js       destaque de código, mascote Bip, sons, confete
js/courses.js     TODO o conteúdo das lições  ← edite aqui!
js/arena.js       fases da Arena + mini-interpretador Python/Java
js/app.js         estado, rotas, mapa da trilha, lições, perfil
```

## Como adicionar ou editar lições

Tudo fica em `js/courses.js`. Cada lição é uma lista de passos:

| tipo     | o que faz                         | campos principais |
|----------|-----------------------------------|-------------------|
| `teach`  | explica um conceito               | `title`, `text`, `code`, `tip` |
| `choice` | múltipla escolha                  | `q`, `options`, `a` (índice certo), `co: true` se as opções forem código |
| `fill`   | completar a lacuna `___`          | `q`, `code`, `options`, `a` (texto certo) |
| `order`  | colocar linhas na ordem           | `q`, `lines` (ordem certa), `alts` (outras ordens válidas) |
| `type`   | digitar o código                  | `q`, `a` (lista de respostas aceitas) |

Para fases novas da Arena, edite `ARENA_LEVELS` em `js/arena.js` (`#` pedra, `B` bateria, `G` bandeira, `R` início).

**Dica para apresentações:** no perfil (👤) existe o *Modo mentor*, que libera todas as lições.

---
LEGO® e SPIKE™ são marcas do LEGO Group. FIRST® e FIRST® Tech Challenge são marcas da FIRST®. Projeto educacional da equipe, sem vínculo oficial.
