function renderizarProdutos() {
  const loja = document.getElementById("loja");
  if (!loja) return;

  let html = `
    <div class="loja-header">
      <h2 id="mc-loja">Loja Reis Craft</h2>
      <p id="mc-loja-desc">Monte seu pedido e finalize com a Tebex.</p>
    </div>
  `;

  for (const [chave, categoria] of Object.entries(PRODUTOS)) {
    html += `<div class="categoria-wrapper"><h3 class="categoria-titulo" style="color:${categoria.cor}">${categoria.titulo}</h3><div class="categoria-grid">`;
    for (const item of categoria.itens) {
      html += `
        <div class="vip" data-produto-id="${item.id}">
          <div class="vip-image-box">
            <img src="${item.imagem}" class="vip-img" alt="${item.nome}" loading="lazy">
          </div>
          <h3 style="color:${item.cor}">${item.icone} ${item.nome}</h3>
          <h4 class="preco-${item.id}" style="color:${item.cor}">${formatarPreco(item.preco)}</h4>
          <p class="vip-desc">${item.descricao}</p>
          <button class="mc-btn mc-btn-add" onclick="adicionarAoCarrinho('${item.id}')">
            ${chave === "vips" ? "⚔ Escolher VIP" : "📦 Adicionar ao carrinho"}
          </button>
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
    panel.innerHTML = `<p class="cart-empty-msg">🗝️ Seu baú está vazio...</p>`;
  }

  if (state.vip) {
    panel.innerHTML += `
      <div class="cart-item" data-tipo="vip">
        <span class="cart-item-icone">${state.vip.icone}</span>
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
        <span class="cart-item-icone">🏠</span>
        <div class="cart-item-info">
          <b>Home Adicional</b>
          <div class="cart-item-qtd">
            <button onclick="alterarHome(-1)">➖</button>
            <span>${state.homes}</span>
            <button onclick="alterarHome(1)">➕</button>
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
        <span class="cart-item-icone">🔓</span>
        <div class="cart-item-info">
          <b style="color:${desban.cor}">Seja Desbanido</b>
          <span class="cart-item-preco">${formatarPreco(desban.preco)}</span>
        </div>
        <button class="cart-item-remove" onclick="removerDoCarrinho('desban')" title="Remover">✕</button>
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
        <span class="resumo-label">👤 Nickname</span>
        <span class="resumo-valor">${nickname}</span>
      </div>
  `;

  if (state.vip) {
    html += `
      <div class="resumo-linha">
        <span class="resumo-label">${state.vip.icone} VIP</span>
        <span class="resumo-valor" style="color:${state.vip.cor}">${state.vip.nome} (${formatarPreco(state.vip.preco)})</span>
      </div>`;
  } else {
    html += `
      <div class="resumo-linha">
        <span class="resumo-label">⚔ VIP</span>
        <span class="resumo-valor" style="color:#666">Nenhum</span>
      </div>`;
  }

  if (state.homes > 0) {
    const home = getProduto("home");
    html += `
      <div class="resumo-linha">
        <span class="resumo-label">🏠 Homes</span>
        <span class="resumo-valor">${state.homes}x (${formatarPreco(home.preco * state.homes)})</span>
      </div>`;
  }

  html += `
    <div class="resumo-linha">
      <span class="resumo-label">🔓 Desban</span>
      <span class="resumo-valor">${state.desban ? "Sim (" + formatarPreco(getProduto("desban").preco) + ")" : "Não"}</span>
    </div>
    <div class="resumo-divider"></div>
    <div class="resumo-linha resumo-total">
      <span class="resumo-label">💰 Total</span>
      <span class="resumo-valor">${formatarPreco(carrinho.total)}</span>
    </div>
  </div>`;

  resumo.innerHTML = html;
}

function adicionarAoCarrinho(produtoId) {
  const prod = getProduto(produtoId);
  if (!prod) return;

  const categoria = Object.values(PRODUTOS).find(c => c.itens.some(i => i.id === produtoId));
  if (!categoria) return;

  if (categoria.exclusivo) {
    const result = carrinho.adicionarVip(prod);
    if (result.substituido) {
      mostrarToast(`✅ ${result.novo} substituiu ${result.anterior} no carrinho!`);
    } else if (result.jaTem) {
      mostrarToast(`⚔ ${prod.nome} já está no carrinho!`);
      return;
    } else {
      mostrarToast(`✅ ${prod.nome} adicionado ao carrinho!`);
    }
  } else {
    if (produtoId === "home") {
      carrinho.adicionarHome();
      mostrarToast("🏠 +1 Home Adicional adicionada!");
    } else if (produtoId === "desban") {
      if (carrinho.state.desban) {
        mostrarToast("🔓 Desban já está no carrinho!");
        return;
      }
      carrinho.toggleDesban();
      mostrarToast("🔓 Desban adicionado ao carrinho!");
    }
  }

  fecharInfo();
  atualizarInterface();
}

function removerDoCarrinho(tipo) {
  if (tipo === "vip") carrinho.removerVip();
  else if (tipo === "home") carrinho.setarHomes(0);
  else if (tipo === "desban") carrinho.removerDesban();
  atualizarInterface();
}

function alterarHome(delta) {
  const state = carrinho.state;
  const novaQtd = state.homes + delta;
  if (novaQtd < 0) return;
  carrinho.setarHomes(novaQtd);
  atualizarInterface();
}

function abrirInfo(produtoId) {
  const prod = getProduto(produtoId);
  if (!prod) return;

  const popup = document.getElementById("popup");
  const titulo = document.getElementById("tituloVip");
  const imagem = document.getElementById("imagemKit");
  const texto = document.getElementById("textoVip");

  titulo.innerHTML = `${prod.icone} ${prod.nome}`;
  imagem.src = prod.imagemKit;
  imagem.alt = prod.nome;

  let beneficiosHtml = "";
  if (prod.beneficios) {
    beneficiosHtml = "<ul class='info-beneficios'>";
    for (const b of prod.beneficios) {
      beneficiosHtml += `<li>✦ ${b}</li>`;
    }
    beneficiosHtml += "</ul>";
  } else {
    beneficiosHtml = `<p>${prod.descricao}</p>`;
  }

  texto.innerHTML = beneficiosHtml;
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

  const btnCarrinho = document.getElementById("cart-button");
  if (!btnCarrinho) return;

  const icone = btnCarrinho.querySelector("#chest-icon");
  if (carrinho.quantidadeItens > 0) {
    btnCarrinho.classList.add("has-items");
  } else {
    btnCarrinho.classList.remove("has-items");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carrinho.subscribe(atualizarInterface);
  renderizarProdutos();
  atualizarInterface();
});
