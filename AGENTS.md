# Tebex Headless API Notes

## Content Filter / Username Strategy
- Tebex API blocks usernames containing "pelo" (case-insensitive substring check)
- Error: `{status:404, title:"Invalid Username provided"}`
- **Current solution**: first try `username: nickname` (real player nick); if 404 "Invalid Username", **retry with** `username: "Steve"` + `variable_data: { nickname }` — user sees a modal warning and must type nick in Tebex's Minecraft Username field
- **Fallback modal**: shows on any 404 "Invalid Username" (not just "pelo"), explains user must re-enter nick on Tebex checkout page
- **Nickname capture**: via API username (unfiltered nicks — `{nickname}` resolves in LP commands); via Tebex checkout page field (filtered nicks — Steve fallback)

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

> ⚠️ IMPORTANTE: Esta solução depende tanto do código quanto da configuração do painel da Tebex. Não remova o fallback para "Steve" sem entender este fluxo.

### Contexto

A Tebex Headless API rejeita alguns usernames (ex.: `Pelicaneitor`) retornando:

```
404 Invalid Username
```

Quando isso acontece, o sistema utiliza um fallback criando o basket com:

```json
{
  "username": "Steve"
}
```

e envia o nick verdadeiro através de:

```json
variable_data
```

O problema é que, se `variable_data` estiver incorreto, a Tebex executa todos os comandos para **Steve**, e não para o jogador que comprou.

---

### Causa raiz

A Tebex **não aceita qualquer chave** dentro de `variable_data`.

Ela procura exatamente o nome da variável global cadastrada no painel.

Variável cadastrada atualmente:

```
Digite seu Nick no Minecraft.
```

Antes o código enviava:

```js
variable_data: {
    nickname: nickname
}
```

Como essa chave não existe na Tebex, ela era descartada.

Resultado:

- checkout criado
- pagamento aprovado
- LuckPerms executado para Steve

---

### Solução implementada

O arquivo:

```
js/checkout.js
```

agora envia duas chaves:

```js
variable_data: {
    "Digite seu Nick no Minecraft.": nickname,
    "nickname": nickname
}
```

A primeira é obrigatória para a Tebex.

A segunda é usada internamente pelo projeto.

---

### Fluxo atual

#### Nick normal

```
checkoutDireto()

↓

POST username = jogador

↓

200 OK

↓

Checkout Tebex

↓

Pagamento

↓

LuckPerms executa normalmente
```

---

#### Nick rejeitado pela API

Exemplo:

```
Pelicaneitor
```

Fluxo:

```
checkoutDireto()

↓

404 Invalid Username

↓

checkoutDiretoComSteve()

↓

POST username = Steve

↓

variable_data = {
    "Digite seu Nick no Minecraft.": "Pelicaneitor",
    "nickname": "Pelicaneitor"
}

↓

200 OK

↓

Modal avisa o jogador

↓

Redirect para Tebex

↓

Jogador digita o nick verdadeiro
no campo "Minecraft Username"

↓

Pagamento

↓

LuckPerms executa para Pelicaneitor
```

---

### Configuração obrigatória na Tebex

No painel da Tebex:

```
Settings
    → Storefront
        → Options
            → Require Online Store Username
```

Valor:

```
Required
```

Sem essa configuração o campo de username não aparece no checkout e o fallback deixa de funcionar corretamente.

---

### Arquivos relacionados

```
js/checkout.js
```

Responsável por:

- checkoutDireto()
- checkoutDiretoComSteve()
- confirmarCompra()

```
index.html
```

Modal informando o fallback Steve.

```
css/style.css
```

Estilos do modal.

---

### NÃO ALTERAR

Se remover:

- username = "Steve"
- variável "Digite seu Nick no Minecraft."
- modal de aviso
- campo obrigatório de username na Tebex

o sistema voltará a executar comandos para Steve ou falhará para jogadores cujo nick seja rejeitado pela Headless API.
