/* =========================================================
   VanCode · configuração do Firebase (login com Google + ranking)
   ---------------------------------------------------------
   Enquanto os campos estiverem vazios, o site funciona normal,
   só que sem login e sem ranking online.

   Onde pegar: console.firebase.google.com → seu projeto →
   ⚙ Configurações do projeto → Seus apps → app Web (</>) → "firebaseConfig".

   Esses dados NÃO são senha: podem ficar públicos no GitHub.
   Quem protege os dados são as regras do arquivo firestore.rules.
   Passo a passo completo no README.md.
   ========================================================= */
window.VANCODE_FIREBASE = {
  apiKey: 'AIzaSyAruCsnG0xvIGigPGfEWlhLBCSzIkMYUwk',
  authDomain: 'vancode.firebaseapp.com',
  projectId: 'vancode',
  storageBucket: 'vancode.firebasestorage.app',
  messagingSenderId: '984451534458',
  appId: '1:984451534458:web:0e6ec888f25db08e0b35c3'
};
