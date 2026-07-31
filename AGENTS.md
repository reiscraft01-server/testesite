# Tebex Headless API Notes

## Content Filter / Username Strategy
- Tebex API blocks usernames containing "pelo" (case-insensitive substring check)
- Error: `{status:404, title:"Invalid Username provided"}`
- **Current solution**: frontend blocks nicks containing "pelo" BEFORE checkout (`/pelo/i.test(nickname)` in `finalizarCompra()` and `confirmarCompra()`) — user sees a toast telling them to contact support on Discord. No basket is created, no payment lost.
- **Nickname capture**: via API username — commands must use `{username}`/`{nickname}` (both resolve to the basket `username`). NOTE: `{variable_data.X}` is NOT interpolated by Tebex commands (it's sent literally to the server).
- **Fallback modal (checkoutDiretoComSteve)**: still exists as defensive code for unexpected 404s, but "pelo" nicks never reach it (blocked on frontend). The modal text about typing the nick in "Minecraft Username" is INACCURATE — the store has no Storefront, so no such field exists.

## API Endpoints
- Headless: `https://headless.tebex.io/api/accounts/{publicToken}/baskets` (POST)
- Add package: `POST https://headless.tebex.io/api/baskets/{ident}/packages`
- Authed (privateKey): `Authorization: Basic {base64(publicToken:privateKey)}`
- Direct checkout: `https://pay.tebex.io/checkout/{packageId}`
- Auth methods: `GET /api/accounts/{token}/baskets/{ident}/auth?returnUrl=...` returns empty for offline mode

## Store Info
- ID: 1868466
- Platform: Geyser (Dot Prefix)
- `disabled: true` (but API still works)
- Currency: USD
- Private key: dhQKxTacNvOYQDrU0mZiCrqUKXVPvyjr
- Public token: 141pu-6f0b71e8fb176f3f358f89d13973105efd0e5ae1

## Package IDs
- VIP Ferro: 7588021 ($1.95)
- VIP Diamante: 7588026 ($3.52)
- VIP Netherite: 7588030 ($4.89)
- VIP Rei: 7588032 ($9.78)
- Home Adicional: 7588036 ($0.49)
- Desban: 7588047 ($9.78)

## Problema: Comandos executados para "Steve" em vez do jogador real

> ⚠️ IMPORTANTE: Este problema foi investigado a fundo e a SOLUÇÃO FINAL é bloquear o nick no frontend (opção A). O fallback "Steve" existe como código defensivo, mas NÃO entrega VIP corretamente.

### Contexto

A Tebex Headless API rejeita usernames contendo "pelo" (case-insensitive, ex.: `Pelicaneitor`, `tudopeloscara`) retornando:

```
404 Invalid Username
```

Tentativas de contornar via fallback (basket com `username: "Steve"` + `variable_data`) NÃO funcionam porque:

1. `{variable_data.X}` **não é interpolado** pela Tebex nos comandos — é enviado literalmente pro servidor (confirmado no log LP: `{variable_data.nickname} is not a valid username/uuid`)
2. Só `{username}`/`{nickname}` resolvem — e ambos usam o `username` do basket
3. A variável global `"Digite seu Nick no Minecraft."` causa erro 400 ao adicionar pacotes, mesmo com valor `"Steve"` (validação de username inválido)
4. O site **não tem Storefront** — o checkout do Tebex vai direto pro pagamento, SEM campo "Minecraft Username" pra jogador corrigir o nick

Resultado do fallback Steve:

- checkout criado
- pagamento aprovado
- LuckPerms executado para **Steve** (ninguém recebe o VIP)

### Solução implementada (final)

**Bloqueio no frontend antes do checkout** em `js/checkout.js`:

```js
if (/pelo/i.test(nickname)) {
  mostrarToast("❌ Seu nick contém um termo bloqueado pela plataforma de pagamento (Tebex). Contate o suporte no Discord para concluir a compra.");
  return;
}
```

Aplicado em `finalizarCompra()` (ao clicar em finalizar) e `confirmarCompra()` (defesa dupla).

Fluxo do nick bloqueado:

- Nenhum basket é criado
- Nenhum pagamento é perdido
- Jogador é orientado a contatar o suporte no Discord
- Entrega do VIP pra esses nicks é feita manualmente pelo suporte

### Estado do código (js/checkout.js)

- `variable_data` em TODOS os lugares é apenas `{ nickname: nickname }` (chave interna, não usada pela Tebex)
- `checkoutDireto()` — fluxo normal: `username: nickname`, funciona 100%
- `checkoutDiretoComSteve()` — código defensivo para 404s inesperados (não "pelo", que é bloqueado antes). NÃO entregar VIP corretamente — só usado como última rede de segurança

### Comandos no painel Tebex

Devem usar `{username}` (ou `{nickname}`, que é sinônimo) — EX: `/lp user {username} parent addtemp vip 30d`.

**NÃO usar** `{variable_data.X}` — a Tebex envia literal e o comando quebra no servidor.

## Painel Admin de Pedidos (Supabase)

- Projeto Supabase: `pnycyhwostszwwfgqgyf` — URL/anon key em `js/checkout.js` e `admin/admin.js` (publishable key)
- Admin: `<site>/admin/` — **protegido por login** (Supabase Auth): usuário `reis.craft.01@gmail.com` (criado no dashboard Auth → Users). Sem sessão válida a tela de login bloqueia a lista. Página usa supabase-js CDN; `signInWithPassword` → sessão persistida; botão "Sair" → `signOut()`. A lista só é carregada com sessão. (Limitação: o HTML/JS são públicos por ser GitHub Pages estático, mas as credenciais vivem no Supabase Auth, não no código.)
- Tabela: `orders` — colunas: `nickname`, `vip`, `homes`, `desban`, `total`, `status`, `tebex_txn_id` (= `basket.ident`), `homes_delivered`, `desban_delivered`, `created_at`

### Modelo de status (decidido)

- Pedido **só com VIP** → `status: "completed"` na criação (`registrarPedido()` em `js/checkout.js`) — entrega automática pelos comandos do painel Tebex
- Pedido **com Home Adicional ou Desban** (incluindo misto com VIP) → `status: "pending"` — entrega manual pelo painel (`homes_delivered`/`desban_delivered`)
- Filtros do admin: "Pendentes" = pending OU home/desban não entregues; "Concluídos" = completed E todas as entregas manuais feitas

### Nota: `disabled: true` na API

- `disabled: true` na resposta de `GET /api/accounts/{token}` significa **apenas** que o storefront hospedado pelo Tebex está desligado (fluxo de checkout próprio/headless) — **NÃO** bloqueia o checkout headless
- Testado (31/07/2026): basket criado + pacote adicionado → `links.checkout` retornado normalmente → página `pay.tebex.io/...` responde 200
- O `links.checkout` só aparece **depois** de adicionar pacotes ao basket (basket vazio não retorna link)
- Test Mode ativado no painel (Checkout settings) para pagamentos de teste
- `tebex-worker.js` NÃO está deployado (URL placeholder `tebex-worker.seu-subdomain.workers.dev`; conta Cloudflare existe mas sem uso). Webhook é código defensivo: marca `completed` só em pedidos sem home/desban. Se um dia deployar: configurar webhook URL no painel Tebex. Caveat: `tebex_txn_id` no Supabase guarda o `basket.ident`, não o transaction id do webhook — o lookup pode não bater.
