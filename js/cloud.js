/* =========================================================
   VanCode · nuvem (Firebase): login com Google, progresso
   salvo na conta e ranking.
   ---------------------------------------------------------
   Coleções no Firestore:
     progress/{uid}  → progresso completo (só o dono lê/escreve)
     players/{uid}   → dados públicos do ranking: apelido, XP...
   O SDK do Firebase só é baixado se a configuração existir.
   ========================================================= */
'use strict';

const Cloud = {
  SDK: 'https://www.gstatic.com/firebasejs/10.12.2/',
  enabled: false,   // Firebase configurado e carregado
  failed: false,    // configurado, mas não carregou (sem internet, bloqueio...)
  user: null,       // usuário logado (objeto do Firebase Auth)
  busy: false,      // carregando o progresso da conta
  synced: null,     // data da última sincronização
  A: null, F: null, auth: null, db: null,
  _timer: null,
  deleting: false,  // apagando a conta: não salva mais nada
  deleted: false,

  configured() {
    const c = window.VANCODE_FIREBASE;
    return !!(c && c.apiKey && c.projectId && c.appId);
  },

  async init() {
    if (!this.configured()) return;
    try {
      const [appM, authM, fsM] = await Promise.all([
        import(this.SDK + 'firebase-app.js'),
        import(this.SDK + 'firebase-auth.js'),
        import(this.SDK + 'firebase-firestore.js')
      ]);
      const app = appM.initializeApp(window.VANCODE_FIREBASE);
      this.A = authM;
      this.F = fsM;
      this.auth = authM.getAuth(app);
      this.auth.languageCode = 'pt-BR';
      this.db = fsM.getFirestore(app);
      this.enabled = true;
      authM.getRedirectResult(this.auth).catch((e) => this.authError(e));
      authM.onAuthStateChanged(this.auth, (u) => this.onUser(u));
    } catch (e) {
      console.warn('[VanCode] Firebase não carregou:', e);
      this.failed = true;
    }
    onCloudChange();
  },

  async onUser(u) {
    const before = this.user && this.user.uid;
    this.user = u;
    if (!u) {
      if (before) onSignedOut();
      onCloudChange();
      return;
    }
    this.busy = true;
    onCloudChange();
    try {
      const snap = await this.F.getDoc(this.F.doc(this.db, 'progress', u.uid));
      const remote = snap.exists() ? snap.data().state : null;
      await adoptCloudState(u, remote);
      await this.push();
    } catch (e) {
      console.warn('[VanCode] erro ao carregar progresso:', e);
      toast('Não consegui carregar seu progresso da nuvem. Tente recarregar a página.', 'err');
    }
    this.busy = false;
    onCloudChange();
  },

  async signIn() {
    if (!this.configured()) {
      openModal(`<div class="center-modal"><div data-knight="sad" data-knight-class="knight-md"></div><h3>Login ainda não ativado</h3>
        <p>A equipe ainda está configurando o login com Google. Enquanto isso, seu progresso fica salvo neste navegador.</p>
        <button class="btn btn-brand" data-close>Entendi</button></div>`);
      return;
    }
    if (!this.enabled) { toast('O login não carregou. Confira sua internet e recarregue a página.', 'err'); return; }
    const provider = new this.A.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await this.A.signInWithPopup(this.auth, provider);
    } catch (e) {
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') {
        return this.A.signInWithRedirect(this.auth, provider);
      }
      this.authError(e);
    }
  },

  authError(e) {
    if (!e || !e.code) return;
    if (['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'].includes(e.code)) return;
    const msg = {
      'auth/unauthorized-domain': 'Este endereço ainda não foi autorizado no Firebase (veja o README).',
      'auth/network-request-failed': 'Sem conexão com a internet.',
      'auth/operation-not-allowed': 'O login com Google não está ativado no Firebase.'
    }[e.code] || 'Não deu para entrar agora (' + e.code + ').';
    toast(msg, 'err');
  },

  async signOut() {
    if (!this.enabled) return;
    clearTimeout(this._timer);
    await this.push();
    await this.A.signOut(this.auth);
  },

  /* chamado a cada save(): espera um pouco e envia tudo de uma vez */
  schedule() {
    if (!this.user || this.busy || this.deleting) return;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.push(), 2500);
  },

  async push() {
    if (!this.user || !this.enabled || this.deleting) return;
    const F = this.F, uid = this.user.uid;
    try {
      await F.setDoc(F.doc(this.db, 'progress', uid), {
        state: JSON.parse(JSON.stringify(S)),
        updatedAt: F.serverTimestamp()
      });
      await F.setDoc(F.doc(this.db, 'players', uid), Object.assign(publicProfile(), { updatedAt: F.serverTimestamp() }));
      this.synced = new Date();
    } catch (e) {
      console.warn('[VanCode] erro ao salvar na nuvem:', e);
    }
    // ranking semanal: só funciona depois que as regras novas forem publicadas no Firebase
    const wx = weekXP();
    if (wx > 0) {
      try {
        await F.setDoc(F.doc(this.db, 'semanas', isoWeek(), 'jogadores', uid), { name: safeName(S.name), xp: wx, updatedAt: F.serverTimestamp() });
      } catch (e) {
        if (e.code !== 'permission-denied') console.warn('[VanCode] ranking semanal:', e);
      }
    }
  },

  /* apaga o progresso, o cartão do ranking e o login da pessoa */
  async deleteAccount() {
    if (!this.user || !this.enabled) return false;
    clearTimeout(this._timer);
    this.deleting = true;
    const F = this.F, A = this.A, user = this.user, uid = user.uid;
    try {
      await F.deleteDoc(F.doc(this.db, 'players', uid));
      await F.deleteDoc(F.doc(this.db, 'progress', uid));
      await F.deleteDoc(F.doc(this.db, 'semanas', isoWeek(), 'jogadores', uid)).catch(() => null);
    } catch (e) {
      console.warn('[VanCode] erro ao apagar dados:', e);
      this.deleting = false;
      toast('Não consegui apagar seus dados agora. Tente de novo.', 'err');
      return false;
    }
    this.deleted = true;
    try {
      try { await A.deleteUser(user); }
      catch (e) {
        if (e.code !== 'auth/requires-recent-login') throw e;
        await A.reauthenticateWithPopup(user, new A.GoogleAuthProvider());
        await A.deleteUser(user);
      }
    } catch (e) {
      console.warn('[VanCode] login não foi apagado:', e);
      toast('Seus dados foram apagados. Para remover também o login, entre de novo e repita.', 'err');
      await A.signOut(this.auth);
    }
    this.deleting = false;
    return true;
  },

  async top(n = 50) {
    const F = this.F;
    const q = F.query(F.collection(this.db, 'players'), F.orderBy('xp', 'desc'), F.limit(n));
    const snap = await F.getDocs(q);
    return snap.docs.map((d) => Object.assign({ id: d.id }, d.data()));
  },

  async topWeek(n = 50) {
    const F = this.F;
    const q = F.query(F.collection(this.db, 'semanas', isoWeek(), 'jogadores'), F.orderBy('xp', 'desc'), F.limit(n));
    const snap = await F.getDocs(q);
    return snap.docs.map((d) => Object.assign({ id: d.id }, d.data()));
  },

  /* números de impacto: somas feitas no próprio Firebase, sem baixar os jogadores */
  async stats() {
    const F = this.F;
    const col = F.collection(this.db, 'players');
    const agg = await F.getAggregateFromServer(col, { contas: F.count(), xp: F.sum('xp'), licoes: F.sum('lessons'), missoes: F.sum('arena') });
    const ligas = await Promise.all(LEAGUES.map((l, k) => {
      const prox = LEAGUES[k + 1];
      const q = prox ? F.query(col, F.where('xp', '>=', l.min), F.where('xp', '<', prox.min)) : F.query(col, F.where('xp', '>=', l.min));
      return F.getCountFromServer(q).then((s) => s.data().count);
    }));
    return Object.assign(agg.data(), { ligas, em: new Date() });
  }
};
