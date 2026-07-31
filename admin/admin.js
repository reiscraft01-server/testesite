const SUPABASE_URL = "https://pnycyhwostszwwfgqgyf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_QfFXkGVf86cSsw46z3aI2w_PSeMNPCV";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let filtroAtual = "todos";
let ordersCache = [];

function mostrarTela(tela) {
  document.getElementById("login-screen").style.display = tela === "login" ? "flex" : "none";
  document.getElementById("dashboard-screen").style.display = tela === "dashboard" ? "block" : "none";
}

function sistemaPronto() {
  const statusEl = document.getElementById("login-status");
  if (statusEl) statusEl.textContent = "🛰 Status: sistema pronto";
}

window.onerror = function (msg) {
  const errEl = document.getElementById("login-error");
  if (errEl) errEl.textContent = "❌ Erro no painel: " + msg;
  console.error("[ADMIN] Erro global:", msg);
};

async function init() {
  try {
    if (!window.supabase) {
      throw new Error("modulo de autenticacao indisponivel");
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      mostrarTela("dashboard");
      carregarPedidos();
    } else {
      mostrarTela("login");
    }
  } catch (err) {
    console.error("[ADMIN] init falhou:", err);
    document.getElementById("login-error").textContent = "❌ Falha ao carregar o módulo de autenticação. Recarregue a página.";
    mostrarTela("login");
  }
}

function comTimeout(promise, ms) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ timeout: true }), ms);
    promise.then(v => { clearTimeout(timer); resolve(v); }).catch(e => { clearTimeout(timer); resolve({ error: e }); });
  });
}

async function entrar(event) {
  if (event && event.preventDefault) event.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const senha = document.getElementById("login-password").value;
  const btn = document.getElementById("login-btn");
  const errEl = document.getElementById("login-error");

  try {
    errEl.textContent = "";
    if (!email || !senha) {
      errEl.textContent = "⚠️ Preencha email e senha.";
      return;
    }
    if (!window.supabase) {
      errEl.textContent = "❌ Falha ao carregar o módulo de autenticação. Recarregue a página.";
      return;
    }

    btn.disabled = true;
    btn.textContent = "⏳ Entrando...";

    const resultado = await comTimeout(supabase.auth.signInWithPassword({ email: email, password: senha }), 15000);

    if (resultado.timeout) {
      errEl.textContent = "❌ Tempo esgotado — verifique sua conexão e tente novamente.";
      return;
    }
    if (resultado.error) {
      console.error("[ADMIN] Erro de login:", resultado.error);
      errEl.textContent = "❌ Email ou senha inválidos.";
      return;
    }

    document.getElementById("login-password").value = "";
    mostrarTela("dashboard");
    carregarPedidos();
  } finally {
    btn.disabled = false;
    btn.textContent = "⚔ Entrar";
  }
}

async function sair() {
  await supabase.auth.signOut();
  document.getElementById("login-email").value = "";
  mostrarTela("login");
}

function toggleSenha() {
  const input = document.getElementById("login-password");
  const eye = document.getElementById("login-eye");
  const mostrar = input.type === "password";
  input.type = mostrar ? "text" : "password";
  eye.textContent = mostrar ? "🙈" : "👁";
}

async function carregarPedidos() {
  const tbody = document.querySelector("#orders-table tbody");
  tbody.innerHTML = '<tr><td colspan="9" class="loading">⏳ Carregando pedidos...</td></tr>';

  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!resp.ok) throw new Error("HTTP " + resp.status);

    ordersCache = await resp.json();
    aplicarFiltro();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty-msg">❌ Erro ao carregar: ${err.message}</td></tr>`;
  }
}

function aplicarFiltro() {
  const tbody = document.querySelector("#orders-table tbody");
  let dados = ordersCache;

  if (filtroAtual === "pendentes") {
    dados = dados.filter(o => {
      const precisaHomes = o.homes > 0;
      const precisaDesban = !!o.desban;
      return o.status === "pending" || (precisaHomes && !o.homes_delivered) || (precisaDesban && !o.desban_delivered);
    });
  } else if (filtroAtual === "concluidos") {
    dados = dados.filter(o => {
      const precisaHomes = o.homes > 0;
      const precisaDesban = !!o.desban;
      return o.status === "completed" && (!precisaHomes || o.homes_delivered) && (!precisaDesban || o.desban_delivered);
    });
  }

  atualizarStats();
  renderizarTabela(dados);
}

function renderizarTabela(dados) {
  const tbody = document.querySelector("#orders-table tbody");

  if (!dados.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty-msg">📭 Nenhum pedido encontrado</td></tr>';
    return;
  }

  tbody.innerHTML = dados.map(o => {
    const statusClass = o.status === "completed" ? "status-completed" : o.status === "refunded" ? "status-refunded" : "status-pending";
    const statusText = o.status === "completed" ? "✅ Pago" : o.status === "refunded" ? "❌ Reembolsado" : "⏳ Pendente";

    const homesDone = o.homes_delivered;
    const desbanDone = o.desban_delivered;

    return `<tr>
      <td data-label="ID">#${o.id.slice(0, 8)}</td>
      <td data-label="Data">${new Date(o.created_at).toLocaleDateString("pt-BR")}</td>
      <td data-label="Nickname"><b style="color:#ffd700">${o.nickname}</b></td>
      <td data-label="Produtos">${formatarProdutos(o)}</td>
      <td data-label="Valor"><b style="color:#ffd700">$${Number(o.total).toFixed(2)}</b></td>
      <td data-label="Status"><span class="status-badge ${statusClass}">${statusText}</span></td>
      <td data-label="Homes">
        ${o.homes > 0 ? `
          <button class="delivery-btn ${homesDone ? 'btn-done' : 'btn-pending'}"
            onclick="toggleDelivery('${o.id}','homes_delivered',${homesDone})">
            ${homesDone ? '✅ Entregue' : '⏳ Entregar'}
          </button>` : '<span style="color:#555">—</span>'}
      </td>
      <td data-label="Desban">
        ${o.desban ? `
          <button class="delivery-btn ${desbanDone ? 'btn-done' : 'btn-pending'}"
            onclick="toggleDelivery('${o.id}','desban_delivered',${desbanDone})">
            ${desbanDone ? '✅ Concluído' : '⏳ Concluir'}
          </button>` : '<span style="color:#555">—</span>'}
      </td>
      <td data-label="Tebex">
        ${o.tebex_txn_id ? `<a href="https://checkout.tebex.io/checkout/${o.tebex_txn_id}" target="_blank" class="tec-btn">🔗</a>` : '<span style="color:#555">—</span>'}
      </td>
    </tr>`;
  }).join("");
}

function formatarProdutos(o) {
  const partes = [];
  const vips = { vip_ferro: "VIP Ferro", vip_diamante: "VIP Diamante", vip_netherite: "VIP Netherite", vip_rei: "VIP Rei" };
  if (o.vip && vips[o.vip]) partes.push("🛡 " + vips[o.vip]);
  if (o.homes > 0) partes.push("🏠 " + o.homes + "x Home");
  if (o.desban) partes.push("🔓 Desban");
  if (o.bp) partes.push("🎫 King's Pass");
  return partes.join("<br>") || "—";
}

function atualizarStats() {
  const total = ordersCache.length;
  const pendentes = ordersCache.filter(o => o.status === "pending").length;
  const concluidos = ordersCache.filter(o => o.status === "completed").length;
  const receita = ordersCache.reduce((s, o) => s + Number(o.total || 0), 0);
  const homesPend = ordersCache.filter(o => o.homes > 0 && !o.homes_delivered).length;
  const desbanPend = ordersCache.filter(o => o.desban && !o.desban_delivered).length;

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-pendentes").textContent = pendentes;
  document.getElementById("stat-concluidos").textContent = concluidos;
  document.getElementById("stat-receita").textContent = "$" + receita.toFixed(2);
  document.getElementById("stat-homes-pend").textContent = homesPend;
  document.getElementById("stat-desban-pend").textContent = desbanPend;
}

async function toggleDelivery(orderId, campo, atual) {
  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ [campo]: !atual })
    });

    if (!resp.ok) throw new Error("Falha ao atualizar");

    await carregarPedidos();
  } catch (err) {
    alert("Erro: " + err.message);
  }
}

function definirFiltro(filtro) {
  filtroAtual = filtro;
  document.querySelectorAll(".filtros button").forEach(b => b.classList.remove("ativo"));
  const btn = document.querySelector(`.filtros button[onclick*='${filtro}']`);
  if (btn) btn.classList.add("ativo");
  aplicarFiltro();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (form) form.addEventListener("submit", entrar);
  sistemaPronto();
  init();
});
