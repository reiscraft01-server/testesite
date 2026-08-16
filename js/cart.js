class Carrinho {
  constructor() {
    this.state = { vip: null, homes: 0, desban: false, bp: false, picareta: null };
    this.listeners = [];
  }

  subscribe(fn) {
    this.listeners.push(fn);
  }

  _notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  adicionarVip(produto) {
    const anterior = this.state.vip;
    if (anterior && anterior.id !== produto.id) {
      this.state.vip = produto;
      this._notify();
      return { substituido: true, anterior: anterior.nome, novo: produto.nome };
    }
    if (anterior && anterior.id === produto.id) {
      return { substituido: false, jaTem: true };
    }
    this.state.vip = produto;
    this._notify();
    return { substituido: false };
  }

  removerVip() {
    this.state.vip = null;
    this._notify();
  }

  adicionarPicareta(produto) {
    const anterior = this.state.picareta;
    if (anterior && anterior.id !== produto.id) {
      this.state.picareta = produto;
      this._notify();
      return { substituido: true, anterior: anterior.nome, novo: produto.nome };
    }
    if (anterior && anterior.id === produto.id) {
      return { substituido: false, jaTem: true };
    }
    this.state.picareta = produto;
    this._notify();
    return { substituido: false };
  }

  removerPicareta() {
    this.state.picareta = null;
    this._notify();
  }

  adicionarHome(qtd = 1) {
    this.state.homes += qtd;
    this._notify();
  }

  removerHome(qtd = 1) {
    this.state.homes = Math.max(0, this.state.homes - qtd);
    this._notify();
  }

  setarHomes(valor) {
    this.state.homes = Math.max(0, valor);
    this._notify();
  }

  toggleDesban() {
    if (this.state.desban) {
      this.state.desban = false;
    } else {
      this.state.desban = true;
    }
    this._notify();
  }

  removerDesban() {
    this.state.desban = false;
    this._notify();
  }

  setBp(valor) {
    this.state.bp = !!valor;
    this._notify();
  }

  toggleBp() {
    this.state.bp = !this.state.bp;
    this._notify();
  }

  removerBp() {
    this.state.bp = false;
    this._notify();
  }

  get total() {
    let t = 0;
    if (this.state.vip) t += this.state.vip.preco;
    t += this.state.homes * (getProduto("home")?.preco ?? 0);
    if (this.state.desban) t += getProduto("desban")?.preco ?? 0;
    if (this.state.bp) t += getProduto("kingspass")?.preco ?? 0;
    if (this.state.picareta) t += this.state.picareta.preco;
    return t;
  }

  get quantidadeItens() {
    let q = 0;
    if (this.state.vip) q++;
    if (this.state.homes > 0) q += this.state.homes;
    if (this.state.desban) q++;
    if (this.state.bp) q++;
    if (this.state.picareta) q++;
    return q;
  }

  get resumo() {
    const produtos = [];
    if (this.state.vip) {
      produtos.push({ id: this.state.vip.id, nome: this.state.vip.nome, preco: this.state.vip.preco, quantidade: 1, tipo: "vip" });
    }
    if (this.state.homes > 0) {
      const home = getProduto("home");
      produtos.push({ id: "home", nome: "Home Adicional", preco: home.preco, quantidade: this.state.homes, tipo: "extra" });
    }
    if (this.state.desban) {
      const desban = getProduto("desban");
      produtos.push({ id: "desban", nome: "Seja Desbanido", preco: desban.preco, quantidade: 1, tipo: "extra" });
    }
    if (this.state.bp) {
      const bp = getProduto("kingspass");
      produtos.push({ id: "kingspass", nome: "King's Pass", preco: bp.preco, quantidade: 1, tipo: "extra" });
    }
    if (this.state.picareta) {
      produtos.push({ id: this.state.picareta.id, nome: this.state.picareta.nome, preco: this.state.picareta.preco, quantidade: 1, tipo: "picareta" });
    }
    return produtos;
  }

  getItemsParaTebex() {
    const items = [];
    if (this.state.vip) {
      items.push({ package_id: this.state.vip.tebexId, quantity: 1 });
    }
    if (this.state.homes > 0) {
      items.push({ package_id: getProduto("home").tebexId, quantity: this.state.homes });
    }
    if (this.state.desban) {
      items.push({ package_id: getProduto("desban").tebexId, quantity: 1 });
    }
    if (this.state.bp) {
      const bp = getProduto("kingspass");
      if (bp.tebexId) items.push({ package_id: bp.tebexId, quantity: 1 });
    }
    if (this.state.picareta) {
      if (this.state.picareta.tebexId) items.push({ package_id: this.state.picareta.tebexId, quantity: 1 });
    }
    return items;
  }

  limpar() {
    this.state = { vip: null, homes: 0, desban: false, bp: false, picareta: null };
    this._notify();
  }
}

const carrinho = new Carrinho();
