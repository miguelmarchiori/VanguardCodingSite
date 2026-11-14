/* =========================================================
   VanCode · cargos especiais
   ---------------------------------------------------------
   O cargo fica preso ao ID da conta (não ao apelido): ninguém
   consegue "pegar" um cargo só trocando o nome.

   Para dar um cargo a alguém:
   1. Console do Firebase → Firestore → Dados → players
   2. Copie o ID do documento da pessoa (aquele código comprido)
   3. Adicione uma linha abaixo, no mesmo formato

   estilo: 'gold' (dourado) ou 'purple' (roxo)
   ========================================================= */
const CARGOS = {
  Qh5CKl8wQFSYRC24ItnQRW3G5B22: {
    titulo: 'Criador',
    descricao: 'Criador da VanCode · programador principal da Vanguard #37520',
    estilo: 'gold'
  }

  // Exemplo:
  // 'ID_DA_PESSOA': { titulo: 'Mentor', descricao: 'Mentor da equipe Vanguard', estilo: 'purple' },
};
