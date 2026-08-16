function renderizarProdutos() {
  const loja = document.getElementById("loja");
  if (!loja) return;

  let html = `
    <div class="loja-header">
      <h2 id="mc-loja">Loja Reis Craft</h2>
      <p id="mc-loja-desc">Fortaleça seu império. Kits lendários te aguardam.</p>
    </div>
  `;

    for (const [chave, categoria] of Object.entries(PRODUTOS)) {
      html += `<div class="categoria-wrapper"><h3 class="categoria-titulo" style="color:${categoria.cor}">${categoria.titulo}</h3><div class="categoria-grid">`;
      for (let i = 0; i < categoria.itens.length; i++) {
        const item = categoria.itens[i];
        const delay = i * 0.08;
        html += `
        <div class="vip${item.id === 'vip_rei' ? ' recomendado' : ''}" data-produto-id="${item.id}" style="animation:fadeUp .5s ease ${delay}s both">
          <div class="vip-image-box">
            <img src="${item.imagem}" class="vip-img" alt="${item.nome}" loading="lazy">
          </div>
          <h3 style="color:${item.cor}">${item.nome}</h3>
          <h4 class="preco-${item.id}" style="color:${item.cor}">${formatarPreco(item.preco)}</h4>
          <p class="vip-desc">${item.descricao}</p>
          ${item.tebexId ? `
          <button class="mc-btn mc-btn-add" onclick="adicionarAoCarrinho('${item.id}')">
            ${chave === "vips" ? "⚔ Escolher VIP" : "📦 Adicionar ao carrinho"}
          </button>` : `
          <button class="mc-btn mc-btn-add" disabled style="opacity:.55;cursor:not-allowed">🎫 Em breve</button>`}
          <button class="info-btn" onclick="abrirInfo('${item.id}')">📜 Saiba mais</button>
        </div>`;
    }
    html += `</div></div>`;
  }

  loja.innerHTML = html;
}

function renderizarCarrinho() {
  const panel = document.getElementById("cart-items");
  const count = document.getElementById("cart-count");
  const totalEl = document.getElementById("cart-total");
  const resumo = document.getElementById("cart-resumo");
  const finalizarBtn = document.getElementById("finalizar-btn");

  const state = carrinho.state;
  panel.innerHTML = "";

  if (carrinho.quantidadeItens === 0) {
    panel.innerHTML = `<p class="cart-empty-msg">Seu carrinho está vazio</p>`;
  }

  if (state.vip) {
    panel.innerHTML += `
      <div class="cart-item" data-tipo="vip">
        <img class="cart-item-img" src="${state.vip.imagem}" alt="${state.vip.nome}">
        <div class="cart-item-info">
          <b style="color:${state.vip.cor}">${state.vip.nome}</b>
          <span class="cart-item-preco">${formatarPreco(state.vip.preco)}</span>
        </div>
        <button class="cart-item-remove" onclick="removerDoCarrinho('vip')" title="Remover">✕</button>
      </div>`;
  }

  if (state.homes > 0) {
    const home = getProduto("home");
    panel.innerHTML += `
      <div class="cart-item" data-tipo="home">
        <img class="cart-item-img" src="${home.imagem}" alt="Home Adicional">
        <div class="cart-item-info">
          <b>Home Adicional</b>
          <div class="cart-item-qtd">
            <button onclick="alterarHome(-1)">−</button>
            <span>${state.homes}</span>
            <button onclick="alterarHome(1)">+</button>
          </div>
          <span class="cart-item-preco">${formatarPreco(home.preco * state.homes)}</span>
        </div>
        <button class="cart-item-remove" onclick="removerDoCarrinho('home')" title="Remover">✕</button>
      </div>`;
  }

  if (state.desban) {
    const desban = getProduto("desban");
    panel.innerHTML += `
      <div class="cart-item" data-tipo="desban">
        <img class="cart-item-img" src="${desban.imagem}" alt="Seja Desbanido">
        <div class="cart-item-info">
          <b style="color:${desban.cor}">Seja Desbanido</b>
          <span class="cart-item-preco">${formatarPreco(desban.preco)}</span>
        </div>
        <button class="cart-item-remove" onclick="removerDoCarrinho('desban')" title="Remover">✕</button>
      </div>`;
  }

  if (state.bp) {
    const bp = getProduto("kingspass");
    panel.innerHTML += `
      <div class="cart-item" data-tipo="bp">
        <img class="cart-item-img" src="${bp.imagem}" alt="King's Pass">
        <div class="cart-item-info">
          <b style="color:${bp.cor}">King's Pass</b>
          <span class="cart-item-preco">${formatarPreco(bp.preco)}</span>
        </div>
        <button class="cart-item-remove" onclick="removerDoCarrinho('bp')" title="Remover">✕</button>
      </div>`;
  }

  if (state.picareta) {
    panel.innerHTML += `
      <div class="cart-item" data-tipo="picareta">
        <img class="cart-item-img" src="${state.picareta.imagem}" alt="${state.picareta.nome}">
        <div class="cart-item-info">
          <b style="color:${state.picareta.cor}">${state.picareta.nome}</b>
          <span class="cart-item-preco">${formatarPreco(state.picareta.preco)}</span>
        </div>
        <button class="cart-item-remove" onclick="removerDoCarrinho('picareta')" title="Remover">✕</button>
      </div>`;
  }

  count.textContent = carrinho.quantidadeItens;
  totalEl.innerHTML = `<h3 id="cart-total">Total: ${formatarPreco(carrinho.total)}</h3>`;

  const nickname = document.getElementById("nickname-input")?.value.trim();
  const valido = nickname && carrinho.quantidadeItens > 0;
  finalizarBtn.disabled = !valido;
  if (finalizarBtn) {
    finalizarBtn.style.opacity = valido ? "1" : "0.5";
    finalizarBtn.style.cursor = valido ? "pointer" : "not-allowed";
  }
}

function renderizarResumo(nickname) {
  const resumo = document.getElementById("cart-resumo-content");
  if (!resumo) return;

  const state = carrinho.state;
  let html = `
    <div class="resumo-card">
      <div class="resumo-linha">
        <span class="resumo-label">Nickname</span>
        <span class="resumo-valor">${nickname}</span>
      </div>
  `;

  if (state.vip) {
    html += `
      <div class="resumo-linha">
        <span class="resumo-label">VIP</span>
        <span class="resumo-valor" style="color:${state.vip.cor}">${state.vip.nome} (${formatarPreco(state.vip.preco)})</span>
      </div>`;
  } else {
    html += `
      <div class="resumo-linha">
        <span class="resumo-label">VIP</span>
        <span class="resumo-valor" style="color:#666">Nenhum</span>
      </div>`;
  }

  if (state.homes > 0) {
    const home = getProduto("home");
    html += `
      <div class="resumo-linha">
        <span class="resumo-label">Homes</span>
        <span class="resumo-valor">${state.homes}x (${formatarPreco(home.preco * state.homes)})</span>
      </div>`;
  }

  html += `
    <div class="resumo-linha">
        <span class="resumo-label">Desban</span>
      <span class="resumo-valor">${state.desban ? "Sim (" + formatarPreco(getProduto("desban").preco) + ")" : "Não"}</span>
    </div>`;

  if (state.bp) {
    html += `
      <div class="resumo-linha">
        <span class="resumo-label">King's Pass</span>
        <span class="resumo-valor" style="color:#ffd700">🎫 ${formatarPreco(getProduto("kingspass").preco)}</span>
      </div>`;
  }

  if (state.picareta) {
    html += `
      <div class="resumo-linha">
        <span class="resumo-label">Picareta 3x3</span>
        <span class="resumo-valor" style="color:${state.picareta.cor}">⛏ ${state.picareta.nome} (${formatarPreco(state.picareta.preco)})</span>
      </div>`;
  }

  html += `
    <div class="resumo-divider"></div>
    <div class="resumo-linha resumo-total">
        <span class="resumo-label">Total</span>
      <span class="resumo-valor">${formatarPreco(carrinho.total)}</span>
    </div>
  </div>`;

  resumo.innerHTML = html;
}

function adicionarProdutoDireto(prod) {
  const chave = Object.keys(PRODUTOS).find(c => PRODUTOS[c].itens.some(i => i.id === prod.id));
  const categoria = chave ? PRODUTOS[chave] : null;
  if (!categoria) return;

  if (categoria.exclusivo) {
    const result = chave === "vips" ? carrinho.adicionarVip(prod) : carrinho.adicionarPicareta(prod);
    if (result.substituido) {
      mostrarToast(`✅ ${result.novo} substituiu ${result.anterior} no carrinho!`);
    } else if (result.jaTem) {
      mostrarToast(`⚔ ${prod.nome} já está no carrinho!`);
      return;
    } else {
      mostrarToast(`✅ ${prod.nome} adicionado ao carrinho!`);
    }
  } else {
    if (prod.id === "home") {
      carrinho.adicionarHome();
      mostrarToast("🏠 +1 Home Adicional adicionada!");
    } else if (prod.id === "desban") {
      if (carrinho.state.desban) {
        mostrarToast("🔓 Desban já está no carrinho!");
        return;
      }
      carrinho.toggleDesban();
      mostrarToast("🔓 Desban adicionado ao carrinho!");
    } else if (prod.id === "kingspass") {
      if (!prod.tebexId) {
        mostrarToast("🎫 King's Pass estará disponível em breve!");
        return;
      }
      if (carrinho.state.bp) {
        mostrarToast("🎫 King's Pass já está no carrinho!");
        return;
      }
      carrinho.toggleBp();
      mostrarToast("🎫 King's Pass adicionado ao carrinho!");
    }
  }

  fecharInfo();
  atualizarInterface();
}

function adicionarAoCarrinho(produtoId) {
  const prod = getProduto(produtoId);
  if (!prod) return;

  const zerado = prod.id === "home" ? carrinho.state.homes === 0
    : prod.id === "desban" ? !carrinho.state.desban
    : prod.id === "kingspass" ? !carrinho.state.bp
    : false;

  if (prod.ativacaoManual && zerado) {
    abrirManual(prod, "carrinho");
    return;
  }

  adicionarProdutoDireto(prod);
}

function removerDoCarrinho(tipo) {
  if (tipo === "vip") carrinho.removerVip();
  else if (tipo === "home") carrinho.setarHomes(0);
  else if (tipo === "desban") carrinho.removerDesban();
  else if (tipo === "bp") carrinho.removerBp();
  else if (tipo === "picareta") carrinho.removerPicareta();
  atualizarInterface();
}

function alterarHome(delta) {
  const state = carrinho.state;
  const novaQtd = state.homes + delta;
  if (novaQtd < 0) return;
  carrinho.setarHomes(novaQtd);
  atualizarInterface();
}

const MANUAL_DEFAULT = {
  titulo: "📦 Ativação Manual",
  texto: "Este extra é ativado manualmente pela equipe do ReisCraft.<br>Após concluir sua compra, entre em contato com nosso suporte no Discord informando o número do seu pedido para que possamos realizar a ativação o mais rápido possível."
};

let manualProdutoAtual = null;

function abrirManual(prod, modo) {
  const popup = document.getElementById("manual-popup");
  if (!popup) return;

  manualProdutoAtual = prod;
  const conf = { ...MANUAL_DEFAULT, ...(prod.manual || {}) };
  const titulo = document.getElementById("manual-titulo");
  const texto = document.getElementById("manual-texto");
  if (titulo) titulo.textContent = conf.titulo;
  if (texto) texto.innerHTML = conf.texto;

  const discordBtn = document.getElementById("manual-discord-btn");
  const continuarBtn = document.getElementById("manual-continuar-btn");
  if (discordBtn) discordBtn.style.display = modo === "info" ? "flex" : "none";
  if (continuarBtn) continuarBtn.style.display = modo === "carrinho" ? "flex" : "none";

  popup.style.display = "flex";
}

function fecharManual() {
  const popup = document.getElementById("manual-popup");
  if (popup) popup.style.display = "none";
}

function continuarComprando() {
  if (!manualProdutoAtual) return;
  const prod = manualProdutoAtual;
  fecharManual();
  adicionarProdutoDireto(prod);
}

function abrirInfo(produtoId) {
  const prod = getProduto(produtoId);
  if (!prod) return;

  if (prod.ativacaoManual) {
    abrirManual(prod, "info");
    return;
  }

  const popup = document.getElementById("popup");
  const titulo = document.getElementById("tituloVip");
  const imagem = document.getElementById("imagemKit");
  const texto = document.getElementById("textoVip");

  titulo.innerHTML = `${prod.icone} ${prod.nome}`;
  imagem.src = prod.imagemKit || prod.imagem;
  imagem.alt = prod.nome;

  if (prod.infoLonga) {
    texto.innerHTML = prod.infoLonga;
  } else if (prod.beneficios) {
    let beneficiosHtml = "<ul class='info-beneficios'>";
    for (const b of prod.beneficios) {
      beneficiosHtml += `<li>✦ ${b}</li>`;
    }
    beneficiosHtml += "</ul>";
    texto.innerHTML = beneficiosHtml;
  } else {
    texto.innerHTML = `<p>${prod.descricao}</p>`;
  }

  popup.style.display = "flex";
}

function fecharInfo() {
  document.getElementById("popup").style.display = "none";
}

function toggleCarrinho() {
  const panel = document.getElementById("cart-panel");
  const overlay = document.getElementById("cart-overlay");
  const isOpen = panel.classList.contains("cart-open");
  if (isOpen) {
    panel.classList.remove("cart-open");
    overlay.classList.remove("cart-open");
  } else {
    panel.classList.add("cart-open");
    overlay.classList.add("cart-open");
  }
}

let toastTimeout;

function mostrarToast(mensagem) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = mensagem;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("toast-show");
  }, 10);
  setTimeout(() => {
    toast.classList.remove("toast-show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function atualizarInterface() {
  renderizarCarrinho();
}

document.addEventListener("DOMContentLoaded", () => {
  carrinho.subscribe(atualizarInterface);
  renderizarProdutos();
  atualizarInterface();
});
