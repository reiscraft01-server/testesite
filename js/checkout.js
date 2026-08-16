const CONFIG = {
  tebex: {
    publicToken: "141pu-6f0b71e8fb176f3f358f89d13973105efd0e5ae1",
    usarWorker: false,
    workerUrl: "https://tebex-worker.seu-subdomain.workers.dev/create-checkout"
  },
  site: {
    url: window.location.origin,
    obrigadoUrl: (() => {
      const path = window.location.pathname;
      const base = path.substring(0, path.lastIndexOf("/") + 1);
      return window.location.origin + base + "obrigado.html";
    })()
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
  if (/pelo/i.test(nickname)) {
    document.getElementById("nickname-input").focus();
    document.getElementById("nickname-input").classList.add("input-error");
    mostrarToast("❌ Seu nick contém um termo bloqueado pela plataforma de pagamento (Tebex). Contate o suporte no Discord para concluir a compra.");
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
  if (/pelo/i.test(nicknameConfirmacao)) {
    mostrarToast("❌ Seu nick contém um termo bloqueado pela plataforma de pagamento. Contate o suporte no Discord.");
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
  const baseUrl = CONFIG.site.obrigadoUrl + "?nick=" + encodeURIComponent(nickname);

  console.log("[TEBEX] Criando basket com username:", nickname);
  const basketResp = await fetch(`https://headless.tebex.io/api/accounts/${token}/baskets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: nickname,
      complete_url: baseUrl,
      cancel_url: CONFIG.site.url + "/index.html?canceled=true",
      complete_auto_redirect: true
    })
  });

  if (!basketResp.ok) {
    const errText = await basketResp.text();
    if (basketResp.status === 404 && errText.includes("Invalid Username")) {
      console.warn("[TEBEX] Nickname bloqueado pelo filtro. Retry com Steve...");
      await checkoutDiretoComSteve(nickname, items);
      return;
    }
    const msg = errText.includes("<!DOCTYPE") ? "Erro interno do servidor de pagamento" : errText;
    throw new Error(`Tebex ${basketResp.status} ao criar basket: ${msg}`);
  }

  const basket = (await basketResp.json()).data;

  let basketAtual;
  for (const item of items) {
    console.log("[TEBEX] Adicionando pacote:", item.package_id);
    const pkgResp = await fetch(`https://headless.tebex.io/api/baskets/${basket.ident}/packages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ package_id: item.package_id, quantity: item.quantity, variable_data: { nickname: nickname } })
    });
    if (!pkgResp.ok) {
      const err = await pkgResp.text();
      const msg = err.includes("<!DOCTYPE") ? "Erro interno do servidor de pagamento" : err;
      throw new Error(`Tebex ${pkgResp.status} ao adicionar pacote ${item.package_id}: ${msg}`);
    }
    basketAtual = await pkgResp.json();
  }

  const checkoutUrl = basketAtual?.data?.links?.checkout;
  if (!checkoutUrl) {
    throw new Error("URL de checkout não encontrada. Verifique se a loja está ativa no Tebex.");
  }

  await registrarPedido(nickname, items, basket.ident);
  salvarPedidoLocal(nickname);

  window.location.href = checkoutUrl;
}

let steveCheckoutUrl = "";

async function checkoutDiretoComSteve(nickname, items) {
  const token = CONFIG.tebex.publicToken;
  const baseUrl = CONFIG.site.obrigadoUrl + "?nick=" + encodeURIComponent(nickname);

  console.log("[TEBEX] Retry basket com username: Steve");
  const basketResp = await fetch(`https://headless.tebex.io/api/accounts/${token}/baskets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "Steve",
      variable_data: { nickname: nickname },
      complete_url: baseUrl,
      cancel_url: CONFIG.site.url + "/index.html?canceled=true",
      complete_auto_redirect: true
    })
  });

  if (!basketResp.ok) {
    const errText = await basketResp.text();
    const msg = errText.includes("<!DOCTYPE") ? "Erro interno do servidor de pagamento" : errText;
    throw new Error(`Tebex ${basketResp.status} ao criar basket (retry Steve): ${msg}`);
  }

  const basket = (await basketResp.json()).data;

  let basketAtual;
  for (const item of items) {
    console.log("[TEBEX] Adicionando pacote:", item.package_id);
    const pkgResp = await fetch(`https://headless.tebex.io/api/baskets/${basket.ident}/packages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ package_id: item.package_id, quantity: item.quantity, variable_data: { nickname: nickname } })
    });
    if (!pkgResp.ok) {
      const err = await pkgResp.text();
      const msg = err.includes("<!DOCTYPE") ? "Erro interno do servidor de pagamento" : err;
      throw new Error(`Tebex ${pkgResp.status} ao adicionar pacote ${item.package_id}: ${msg}`);
    }
    basketAtual = await pkgResp.json();
  }

  const checkoutUrl = basketAtual?.data?.links?.checkout;
  if (!checkoutUrl) {
    throw new Error("URL de checkout não encontrada. Verifique se a loja está ativa no Tebex.");
  }

  await registrarPedido(nickname, items, basket.ident);
  salvarPedidoLocal(nickname);

  steveCheckoutUrl = checkoutUrl;
  document.getElementById("steve-nick-display").textContent = nickname;
  document.getElementById("steve-modal").style.display = "flex";
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
  const state = carrinho.state;
  const precisaManual = state.homes > 0 || state.desban;

  const payload = {
    nickname: nickname,
    vip: null,
    homes: 0,
    desban: false,
    bp: false,
    picareta: null,
    total: carrinho.total,
    tebex_txn_id: basketIdent,
    status: precisaManual ? "pending" : "completed"
  };

  if (state.vip) payload.vip = state.vip.id;
  if (state.homes > 0) payload.homes = state.homes;
  if (state.desban) payload.desban = true;
  if (state.bp) payload.bp = true;
  if (state.picareta) payload.picareta = state.picareta.id;

  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    try {
      const resp = await fetch(`${CONFIG.supabase.url}/rest/v1/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": CONFIG.supabase.anonKey,
          "Authorization": `Bearer ${CONFIG.supabase.anonKey}`
        },
        body: JSON.stringify(payload)
      });

      if (resp.ok) return true;

      const errText = await resp.text();
      console.warn(`[SUPABASE] Falha na tentativa ${tentativa}/3:`, resp.status, errText);
    } catch (err) {
      console.warn(`[SUPABASE] Erro na tentativa ${tentativa}/3:`, err);
    }

    if (tentativa < 3) await new Promise(r => setTimeout(r, 800));
  }

  mostrarToast("⚠️ Não conseguimos registrar seu pedido automaticamente. Se o pagamento for aprovado, contate o suporte no Discord com este nick: " + nickname);
  return false;
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
  document.getElementById("steve-continuar-btn")?.addEventListener("click", () => {
    document.getElementById("steve-modal").style.display = "none";
    window.location.href = steveCheckoutUrl;
  });
});
