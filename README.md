# Shopee Vendedor Pro

Dashboard completo para gestão de vendas na Shopee — controle de estoque, pedidos, produtos e financeiro, com integração nativa à Shopee Open Platform API v2.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange?style=flat-square)
![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=flat-square&logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-2.49-3ecf8e?style=flat-square&logo=supabase)

---

## Sumário

- [Visão Geral](#visão-geral)
- [Stack Tecnológico](#stack-tecnológico)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Configuração Local](#configuração-local)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Banco de Dados](#banco-de-dados)
- [Integração Shopee API v2](#integração-shopee-api-v2)
- [Deploy](#deploy)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Scripts](#scripts)

---

## Visão Geral

Plataforma web para vendedores Shopee gerenciarem seu negócio em um único painel: controle de estoque por lotes, acompanhamento de pedidos em tempo real, sincronização de produtos via API oficial e análise financeira.

---

## Stack Tecnológico

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript 5 + Vite 5 |
| UI / Estilo | Tailwind CSS 3 + Radix UI + shadcn/ui |
| Animações | Framer Motion 11 |
| Estado servidor | TanStack React Query v5 |
| Formulários | React Hook Form + Zod |
| Gráficos | Recharts |
| Backend / DB | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Funções serverless | Deno — Supabase Edge Functions |
| Deploy | Vercel |

---

## Funcionalidades

### Disponíveis

| Módulo | Descrição |
|---|---|
| **Auth** | Cadastro e login via Supabase Auth |
| **Dashboard** | KPIs, gráfico de receita vs custo, evolução do lucro, ranking de produtos |
| **Estoque** | Controle de lotes de compra e vendas, saldo em tempo real, alerta de estoque baixo, barra de progresso do lote |
| **Produtos** | Listagem com busca por nome/SKU e filtro por categoria |
| **Vendas** | Histórico de pedidos com KPIs |
| **Financeiro** | Análise de receitas, custos e margens |
| **Calculadora** | Cálculo de lucro líquido com comissão e tarifas Shopee |
| **Fornecedores** | Cadastro e gestão de fornecedores |
| **Tema claro/escuro** | Alternância global de tema |

### Integração Shopee API v2 *(requer CNPJ/MEI aprovado na Open Platform)*

| Endpoint | Função |
|---|---|
| `v2/public/get_access_token` | Troca do código OAuth por token |
| `v2/public/refresh_access_token` | Renovação automática do token |
| `v2/product/get_item_list` | Listagem de produtos |
| `v2/product/update_stock` | Atualização de estoque |
| `v2/order/get_order_list` | Pedidos prontos para envio |
| `v2/order/get_order_detail` | Detalhes do pedido |
| `v2/logistics/ship_order` | Postagem do pedido |

---

## Arquitetura

```
┌──────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                      │
│                                                              │
│  src/integrations/shopee/   ──▶  Supabase Edge Functions    │
│  src/integrations/supabase/ ──▶  Supabase DB (PostgreSQL)   │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│              Supabase Edge Functions (Deno/TypeScript)        │
│                                                              │
│  shopee-auth     ──▶  OAuth 2.0, troca e renovação de token │
│  shopee-products ──▶  Produtos e atualização de estoque      │
│  shopee-orders   ──▶  Pedidos, detalhes e postagem           │
│                                                              │
│  _shared/shopee-signature.ts ──▶  HMAC-SHA256 signing        │
│  _shared/token-store.ts      ──▶  Gestão e refresh de token  │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│              Shopee Open Platform API v2                      │
│         https://partner.shopeemobile.com                     │
└──────────────────────────────────────────────────────────────┘
```

> **Segurança:** a `partner_key` da Shopee **nunca toca o frontend**. Toda assinatura HMAC-SHA256 é executada dentro das Edge Functions, usando secrets do Supabase.

---

## Pré-requisitos

- Node.js >= 18
- npm >= 9
- [Supabase CLI](https://supabase.com/docs/guides/cli) — `npm install -g supabase`
- Conta no [Supabase](https://supabase.com)

---

## Configuração Local

```bash
# 1. Clone o repositório
git clone https://github.com/caua-mendonca/shopee-vendedor-pro.git
cd shopee-vendedor-pro

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# 4. Vincule ao projeto Supabase e aplique as migrations
supabase link --project-ref SEU_PROJECT_REF
supabase db push

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: [http://localhost:8080](http://localhost:8080)

---

## Variáveis de Ambiente

Crie um `.env` na raiz com base no `.env.example`:

```env
# ── Supabase ──────────────────────────────────────────────────
# Obtenha em: supabase.com > Settings > API
VITE_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_SUPABASE_PROJECT_ID=SEU_PROJECT_REF

# ── Shopee Open Platform ──────────────────────────────────────
# Requer aprovação em open.shopee.com (CNPJ/MEI obrigatório)
# partner_key NÃO vai aqui — vai nos Supabase Secrets (servidor)
VITE_SHOPEE_PARTNER_ID=SEU_PARTNER_ID
VITE_SHOPEE_REDIRECT_URI=http://localhost:8080/auth/shopee/callback
```

### Secrets do Supabase (servidor — nunca no frontend)

```bash
supabase secrets set SHOPEE_PARTNER_ID=seu_id
supabase secrets set SHOPEE_PARTNER_KEY=sua_chave_secreta
supabase secrets set SHOPEE_BASE_URL=https://partner.shopeemobile.com
supabase secrets set SHOPEE_REDIRECT_URI=https://seu-dominio.vercel.app/auth/shopee/callback
```

Para desenvolvimento com sandbox:
```bash
supabase secrets set SHOPEE_BASE_URL=https://partner.test-stable.shopeemobile.com
```

---

## Banco de Dados

### Tabelas

| Tabela | Descrição | RLS |
|---|---|---|
| `profiles` | Perfil do usuário (nome, loja) | ✅ |
| `shopee_tokens` | Tokens OAuth da Shopee por loja | ✅ |
| `palmilha_movimentacoes` | Movimentações de estoque (entradas/saídas) | ✅ |

Todas as tabelas possuem **Row Level Security** ativo — cada usuário acessa somente seus próprios dados.

### Aplicar migrations

```bash
supabase db push
```

---

## Integração Shopee API v2

> Requer aprovação na [Shopee Open Platform](https://open.shopee.com) com CNPJ ou MEI.

### Fluxo OAuth

```
Usuário clica "Conectar Loja"
  ↓
Frontend chama Edge Function shopee-auth { action: "get_auth_url" }
  ↓
Edge Function assina a URL com HMAC-SHA256 (server-side)
  ↓
Shopee redireciona para /auth/shopee/callback?code=...&shop_id=...
  ↓
Frontend chama shopee-auth { action: "exchange", code, shop_id }
  ↓
Edge Function troca code por access_token + refresh_token
  ↓
Tokens armazenados em shopee_tokens (criptografados no banco)
```

### Renovação automática de token

- Token renovado **proativamente 5 minutos antes** do vencimento
- Em caso de 401 inesperado: o cliente renova o token e reexecuta a chamada automaticamente (máximo 1 retry)

### Deploy das Edge Functions

```bash
supabase functions deploy shopee-auth
supabase functions deploy shopee-products
supabase functions deploy shopee-orders
```

---

## Deploy

O projeto usa **Vercel** integrado ao **Supabase** para deploy contínuo.

### Fluxo

1. Push para `main` no GitHub
2. Vercel detecta a mudança e faz o build automaticamente
3. Variáveis de ambiente do Supabase são sincronizadas via integração Vercel + Supabase

### Variáveis no Vercel

Configure em Vercel > Settings > Environment Variables:

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
VITE_SHOPEE_PARTNER_ID
VITE_SHOPEE_REDIRECT_URI
```

> A integração nativa Supabase + Vercel sincroniza as variáveis de banco automaticamente.

---

## Estrutura do Projeto

```
shopee-vendedor-pro/
├── src/
│   ├── components/
│   │   ├── AppSidebar.tsx        # Sidebar de navegação
│   │   ├── Layout.tsx            # Layout principal
│   │   ├── ProtectedRoute.tsx    # Guard de autenticação
│   │   └── StatCard.tsx          # Card de KPI
│   ├── contexts/
│   │   └── AuthContext.tsx       # Estado global de autenticação
│   ├── integrations/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Cliente Supabase singleton
│   │   │   └── types.ts          # Tipos gerados do banco
│   │   └── shopee/
│   │       ├── types.ts          # Tipos da Shopee API v2
│   │       ├── client.ts         # Caller base com retry automático
│   │       ├── auth.ts           # OAuth, conexão de loja, hooks
│   │       ├── products.ts       # Produtos e estoque (hooks React Query)
│   │       └── orders.ts         # Pedidos e logística (hooks React Query)
│   ├── lib/
│   │   └── utils.ts              # Utilitários (cn, formatters)
│   └── pages/
│       ├── Auth.tsx              # Login e cadastro
│       ├── Dashboard.tsx         # Visão geral e gráficos
│       ├── Estoque.tsx           # Controle de estoque de palmilhas
│       ├── Products.tsx          # Gestão de produtos
│       ├── Sales.tsx             # Histórico de vendas
│       ├── Financial.tsx         # Análise financeira
│       ├── Ads.tsx               # Campanhas de anúncios
│       ├── Calculator.tsx        # Calculadora de precificação
│       ├── Suppliers.tsx         # Fornecedores
│       └── ShopeeCallback.tsx    # Callback OAuth Shopee
├── supabase/
│   ├── functions/
│   │   ├── _shared/
│   │   │   ├── shopee-signature.ts   # HMAC-SHA256 + shopeeRequest()
│   │   │   └── token-store.ts        # getValidToken() + upsertToken()
│   │   ├── shopee-auth/index.ts      # Edge Function: OAuth
│   │   ├── shopee-products/index.ts  # Edge Function: Produtos
│   │   └── shopee-orders/index.ts    # Edge Function: Pedidos
│   └── migrations/
│       ├── ..._profiles.sql
│       ├── 20260622000000_shopee_tokens.sql
│       └── 20260623000000_palmilha_movimentacoes.sql
├── .env.example                  # Template de variáveis (versionar este, não o .env)
├── .gitignore
├── .mcp.json                     # Supabase MCP server config
├── vite.config.ts
├── tailwind.config.ts
├── components.json               # Configuração shadcn/ui
└── package.json
```

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (porta 8080) |
| `npm run build` | Build de produção otimizado com code splitting |
| `npm run preview` | Preview do build local |
| `npm run lint` | Análise estática com ESLint |

---

## Licença

Projeto privado — todos os direitos reservados © 2026 Cauã Mendonça.
