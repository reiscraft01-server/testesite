const TEBEX_PUBLIC_TOKEN = "141pu-6f0b71e8fb176f3f358f89d13973105efd0e5ae1";
const TEBEX_PRIVATE_KEY = "dhQKxTacNvOYQDrU0mZiCrqUKXVPvyjr";
const HEADLESS_API = "https://headless.tebex.io/api/accounts";
const BASKET_API = "https://headless.tebex.io/api/baskets";

const SUPABASE_URL = "https://pnycyhwostszwwfgqgyf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_QfFXkGVf86cSsw46z3aI2w_PSeMNPCV";

async function criarBasket(username, completeUrl, cancelUrl) {
  const auth = btoa(`${TEBEX_PUBLIC_TOKEN}:${TEBEX_PRIVATE_KEY}`);
  const resp = await fetch(`${HEADLESS_API}/${TEBEX_PUBLIC_TOKEN}/baskets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Basic ${auth}` },
    body: JSON.stringify({
      username,
      complete_url: completeUrl,
      cancel_url: cancelUrl,
      complete_auto_redirect: true
    })
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Erro ao criar basket: ${resp.status} ${err}`);
  }
  const data = await resp.json();
  return data.data;
}

async function adicionarPackage(basketIdent, packageId, quantity) {
  const resp = await fetch(`${BASKET_API}/${basketIdent}/packages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ package_id: String(packageId), quantity })
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Erro ao adicionar pacote ${packageId}: ${resp.status} ${err}`);
  }
  return resp.json();
}

async function obterCheckoutUrl(basketIdent) {
  const auth = btoa(`${TEBEX_PUBLIC_TOKEN}:${TEBEX_PRIVATE_KEY}`);
  const resp = await fetch(`${HEADLESS_API}/${TEBEX_PUBLIC_TOKEN}/baskets/${basketIdent}`, {
    headers: { "Authorization": `Basic ${auth}` }
  });
  const data = await resp.json();
  return data.data?.links?.checkout || null;
}

async function registrarPedido(orders) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(orders)
    });
  } catch (e) {
    console.error("Erro ao salvar pedido:", e);
  }
}

async function handleCreateCheckout(request) {
  const body = await request.json();
  const { username, items, complete_url, cancel_url } = body;

  if (!username || !items || !items.length) {
    return new Response(JSON.stringify({ error: "username e items são obrigatórios" }), {
      status: 400, headers: { "Content-Type": "application/json" }
    });
  }

  const basket = await criarBasket(username, complete_url, cancel_url);

  for (const item of items) {
    await adicionarPackage(basket.ident, item.package_id, item.quantity);
  }

  const checkoutUrl = await obterCheckoutUrl(basket.ident);
  if (!checkoutUrl) {
    return new Response(JSON.stringify({ error: "URL de checkout não encontrada. Verifique se a loja está ativa." }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }

  const hasVip = items.some(i => ["7588021","7588026","7588030","7588032"].includes(i.package_id));
  const homesItem = items.find(i => i.package_id === "7588036");
  const desbanItem = items.find(i => i.package_id === "7588047");

  const pedido = {
    nickname: username,
    vip: hasVip ? "comprado" : null,
    homes: homesItem ? homesItem.quantity : 0,
    desban: !!desbanItem,
    total: 0,
    tebex_txn_id: basket.ident,
    status: "pending"
  };
  registrarPedido(pedido);

  return new Response(JSON.stringify({
    checkoutUrl,
    basketIdent: basket.ident
  }), {
    headers: { "Content-Type": "application/json" }
  });
}

async function handleWebhook(request) {
  const body = await request.json();
  const txnId = body.id || body.transaction_id || null;

  if (txnId && body.status === "complete") {
    const listResp = await fetch(`${SUPABASE_URL}/rest/v1/orders?tebex_txn_id=eq.${txnId}&select=*`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const orders = await listResp.json();

    for (const order of (Array.isArray(orders) ? orders : [])) {
      const precisaManual = (order.homes || 0) > 0 || !!order.desban;
      if (!precisaManual) {
        await fetch(`${SUPABASE_URL}/rest/v1/orders?tebex_txn_id=eq.${txnId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ status: "completed" })
        });
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" }
  });
}

async function handleGetOrders(request) {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || 50;

  const resp = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc&limit=${limit}`, {
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  const data = await resp.json();

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
}

async function handlePatchOrder(request) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();
  const body = await request.json();

  await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(body)
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }

    const corsHeaders = { "Access-Control-Allow-Origin": "*" };

    try {
      if (path === "/create-checkout" && request.method === "POST") {
        const resp = await handleCreateCheckout(request);
        Object.entries(corsHeaders).forEach(([k, v]) => resp.headers.set(k, v));
        return resp;
      }

      if (path === "/webhook" && request.method === "POST") {
        return await handleWebhook(request);
      }

      if (path === "/orders" && request.method === "GET") {
        return await handleGetOrders(request);
      }

      if (path.startsWith("/orders/") && request.method === "PATCH") {
        return await handlePatchOrder(request);
      }

      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }
};
