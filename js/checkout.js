const CONFIG = {
  tebex: {
    publicToken: "141pu-6f0b71e8fb176f3f358f89d13973105efd0e5ae1",
    usarWorker: false,
    workerUrl: "https://tebex-worker.seu-subdomain.workers.dev/create-checkout"
  },
  site: {
    url: window.location.origin,
    obrigadoUrl: window.location.origin + "/obrigado.html"
  },
  supabase: {
    url: "https://pnycyhwostszwwfgqgyf.supabase.co",
    anonKey: "sb_publishable_QfFXkGVf86cSsw46z3aI2w_PSeMNPCV"
  }
};

let nicknameConfirmacao = "";

async function finalizarCompra() {
  const nickname = document.getElementById("nickname-input").value.trim();
  if (nickname.length < 3) {
    document.getElementById("nickname-input").focus();
    document.getElementById("nickname-input").classList.add("input-error");
    mostrarToast("⚠️ Digite seu nickname do Minecraft (mínimo 3 letras)!");
    return;
  }
  document.getElementById("nickname-input").classList.remove("input-error");

  if (carrinho.quantidadeItens === 0) {
    mostrarToast("⚠️ Carrinho vazio!");
    return;
  }

  nicknameConfirmacao = nickname;
  renderizarResumo(nickname);
  document.getElementById("confirmacao-nick").textContent = nickname;

  document.getElementById("cart-panel").classList.remove("cart-open");
  document.getElementById("cart-overlay").classList.remove("cart-open");

  document.getElementById("resumo-panel").classList.add("resumo-open");
  document.getElementById("resumo-overlay").classList.add("resumo-open");
}

function fecharResumo() {
  document.getElementById("resumo-panel").classList.remove("resumo-open");
  document.getElementById("resumo-overlay").classList.remove("resumo-open");
}

async function confirmarCompra() {
  const btnConfirmar = document.querySelector("#resumo-panel .mc-btn");
  btnConfirmar.disabled = true;
  btnConfirmar.textContent = "⏳ Criando pedido...";

  if (!nicknameConfirmacao || nicknameConfirmacao.length < 3) {
    mostrarToast("⚠️ Nickname inválido. Volte e digite novamente.");
    btnConfirmar.disabled = false;
    btnConfirmar.textContent = "🛒 Ir para o pagamento";
    return;
  }

  try {
    const items = carrinho.getItemsParaTebex();

    if (CONFIG.tebex.usarWorker) {
      await checkoutViaWorker(nicknameConfirmacao, items);
    } else {
      await checkoutDireto(nicknameConfirmacao, items);
    }
  } catch (err) {
    console.error("Erro no checkout:", err);
    mostrarToast("❌ " + err.message);
    btnConfirmar.disabled = false;
    btnConfirmar.textContent = "🛒 Ir para o pagamento";
  }
}

async function checkoutDireto(nickname, items) {
  const token = CONFIG.tebex.publicToken;

  const criarBasket = async (usarPlayerFallback) => {
    const baseUrl = CONFIG.site.obrigadoUrl + "?nick=" + encodeURIComponent(nickname);
    let payload;
    if (usarPlayerFallback) {
      payload = {
        username: "Player",
        player: { name: nickname, auth_type: "offline" },
        complete_url: baseUrl,
        cancel_url: CONFIG.site.url + "/index.html?canceled=true",
        complete_auto_redirect: true
      };
    } else {
      payload = {
        username: nickname,
        complete_url: baseUrl,
        cancel_url: CONFIG.site.url + "/index.html?canceled=true",
        complete_auto_redirect: true
      };
    }
    console.log("[TEBEX] Criando basket:", payload);
    const resp = await fetch(`https://headless.tebex.io/api/accounts/${token}/baskets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      const errText = await resp.text();
      if (!usarPlayerFallback && resp.status === 404 && errText.includes("Invalid Username")) {
        console.warn("[TEBEX] Nickname bloqueado pelo filtro. Retentando com player object...");
        return criarBasket(true);
      }
      throw new Error(`Tebex ${resp.status} ao criar basket: ${errText}`);
    }
    const data = await resp.json();
    return data.data;
  };

  const adicionarPackage = async (basketIdent, packageId, qtd) => {
    const payload = { package_id: String(packageId), quantity: qtd };
    console.log("[TEBEX] Adicionando pacote:", payload);
    const resp = await fetch(`https://headless.tebex.io/api/baskets/${basketIdent}/packages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Tebex ${resp.status} ao adicionar pacote ${packageId}: ${err}`);
    }
    return resp.json();
  };

  const basket = await criarBasket();

  let basketAtual;
  for (const item of items) {
    basketAtual = await adicionarPackage(basket.ident, item.package_id, item.quantity);
  }

  const checkoutUrl = basketAtual?.data?.links?.checkout;
  if (!checkoutUrl) {
    throw new Error("URL de checkout não encontrada. Verifique se a loja está ativa no Tebex.");
  }

  await registrarPedido(nickname, items, basket.ident);
  salvarPedidoLocal(nickname);

  window.location.href = checkoutUrl;
}

async function checkoutViaWorker(nickname, items) {
  const resp = await fetch(CONFIG.tebex.workerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: nickname,
      items: items,
      return_url: CONFIG.site.url,
      cancel_url: CONFIG.site.url,
      complete_url: CONFIG.site.obrigadoUrl + "?nick=" + encodeURIComponent(nickname)
    })
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error("Worker retornou erro: " + err);
  }

  const data = await resp.json();

  await registrarPedido(nickname, items, data.basketIdent || "worker");
  salvarPedidoLocal(nickname);

  window.location.href = data.checkoutUrl;
}

async function registrarPedido(nickname, items, basketIdent) {
  try {
    const payload = {
      nickname: nickname,
      vip: null,
      homes: 0,
      desban: false,
      total: carrinho.total,
      tebex_txn_id: basketIdent,
      status: "pending"
    };

    const state = carrinho.state;
    if (state.vip) payload.vip = state.vip.id;
    if (state.homes > 0) payload.homes = state.homes;
    if (state.desban) payload.desban = true;

    await fetch(`${CONFIG.supabase.url}/rest/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": CONFIG.supabase.anonKey,
        "Authorization": `Bearer ${CONFIG.supabase.anonKey}`
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn("Erro ao registrar no Supabase (pedido salvo localmente):", err);
  }
}

function salvarPedidoLocal(nickname) {
  const pedidos = JSON.parse(localStorage.getItem("reiscraft_pedidos") || "[]");
  pedidos.push({
    nickname: nickname,
    itens: carrinho.getItemsParaTebex(),
    total: carrinho.total,
    data: new Date().toISOString(),
    status: "pending"
  });
  localStorage.setItem("reiscraft_pedidos", JSON.stringify(pedidos));
}

function validarNickname(input) {
  input.value = input.value.replace(/[^a-zA-Z0-9_]/g, "").substring(0, 16);
  if (input.value.trim().length >= 3) {
    input.classList.remove("input-error");
  }
  atualizarInterface();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("nickname-input")?.addEventListener("input", function () {
    validarNickname(this);
  });
});
