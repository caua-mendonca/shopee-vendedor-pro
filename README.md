# 🛒 Shopee Seller Dashboard

> Plataforma completa de gestão e análise de vendas para vendedores Shopee — métricas em tempo real, controle de produtos, fornecedores, anúncios e relatório financeiro em um só lugar.

![Dashboard Preview](https://img.shields.io/badge/status-em%20desenvolvimento-orange?style=flat-square)
![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwindcss)

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Como Rodar](#-como-rodar)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Contribuindo](#-contribuindo)

---

## 🔍 Visão Geral

O **Shopee Seller Dashboard** é uma aplicação web voltada para vendedores da Shopee que precisam de uma visão consolidada e analítica do seu negócio. A plataforma centraliza dados de vendas, produtos, fornecedores, anúncios e finanças, eliminando a necessidade de planilhas manuais e oferecendo insights visuais em tempo real.

---

## ✨ Funcionalidades

### 📊 Dashboard Principal
- Visão geral com KPIs: Receita Total, Custos Totais, Lucro Líquido e Total de Pedidos
- Comparativo percentual com o mês anterior (↑ crescimento / ↓ queda)
- Gráfico de **Receita vs Custo Mensal** (barras agrupadas)
- Gráfico de **Evolução do Lucro** ao longo dos meses (linha)
- Ranking de produtos por lucro gerado

### 📦 Produtos
- Listagem de produtos cadastrados com SKU, categoria e status (ativo/inativo)
- Busca por nome ou SKU
- Filtro por categoria
- Cadastro, edição e remoção de produtos
- Preço de custo e venda por produto

### 🏭 Fornecedores
- Cadastro e gerenciamento de fornecedores
- Associação de fornecedores a produtos

### 🛒 Vendas
- Registro de vendas por produto e data
- Tabela de histórico com data, produto, quantidade, preço unitário e total
- KPIs de vendas: Unidades Vendidas, Receita Total, Custo Total e Lucro Líquido
- Filtro por produto

### 📢 Anúncios
- Gerenciamento e acompanhamento de campanhas de anúncios na Shopee
- Controle de investimento em ads por produto

### 💰 Financeiro (Relatório)
- Receita Total, Custos + Taxas, Investimento em Ads e Lucro Líquido
- Gráfico de **Lucro por Produto** (barras horizontais)
- Gráfico de **Composição dos Gastos** (rosca: Custo Produto, Taxas Shopee, Anúncios, Lucro)
- Tabela detalhada por produto: Receita, Custo, Taxas, Ads, Lucro e Margem %

### 🧮 Calculadora
- Calculadora de precificação para estimar margem de lucro e preço de venda ideal

### 🌙 Tema Claro / Escuro
- Alternância entre modo escuro e claro disponível em toda a aplicação

---


## 🛠 Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | [React 18](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) |
| Build | [Vite 5](https://vitejs.dev/) |
| Estilização | [Tailwind CSS 3](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Componentes UI | [Radix UI](https://www.radix-ui.com/) |
| Roteamento | [React Router DOM 6](https://reactrouter.com/) |
| Estado e Cache | [TanStack Query (React Query) 5](https://tanstack.com/query) |
| Formulários | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Gráficos | [Recharts](https://recharts.org/) |
| Backend / DB | [Supabase](https://supabase.com/) |
| Animações | [Framer Motion](https://www.framer.com/motion/) |
| Testes | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |
| Linting | [ESLint 9](https://eslint.org/) + TypeScript ESLint |

---

## ✅ Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18.x
- [npm](https://npmjs.com/) >= 9.x
- Conta no [Supabase](https://supabase.com/) (para banco de dados)

---

## 🚀 Como Rodar

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/shopee-seller-dashboard.git
cd shopee-seller-dashboard
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:8080](http://localhost:8080) no navegador.

---

## 📁 Estrutura do Projeto

```
shopee-vendedor-pro/
├── .git/
├── node_modules/
├── public/                      # Arquivos estáticos públicos
├── src/
│   ├── components/
│   │   ├── ui/                  # Componentes shadcn/ui (base)
│   │   ├── AppSidebar.tsx       # Sidebar de navegação principal
│   │   ├── Layout.tsx           # Layout wrapper da aplicação
│   │   ├── NavLink.tsx          # Componente de link de navegação
│   │   └── StatCard.tsx         # Card de métricas/KPIs
│   ├── hooks/                   # Custom hooks reutilizáveis
│   ├── integrations/            # Integrações externas (Supabase, etc.)
│   ├── lib/                     # Utilitários e helpers
│   ├── pages/                   # Páginas da aplicação
│   ├── test/                    # Setup e utilitários de teste
│   ├── App.css
│   ├── App.tsx                  # Componente raiz + rotas
│   ├── index.css                # Estilos globais e variáveis CSS
│   ├── main.tsx                 # Entry point da aplicação
│   └── vite-env.d.ts
├── supabase/                    # Configurações e migrations do Supabase
├── .env                         # Variáveis de ambiente (não versionado)
├── .gitignore
├── components.json              # Configuração shadcn/ui
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento em `localhost:8080` |
| `npm run build` | Gera o build de produção na pasta `dist/` |
| `npm run build:dev` | Gera o build em modo desenvolvimento |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Executa o ESLint em todos os arquivos |
| `npm run test` | Executa os testes uma vez |
| `npm run test:watch` | Executa os testes em modo watch |

---

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|---|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase | ✅ |

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Commit suas alterações (`git commit -m 'feat: adiciona minha feature'`)
4. Faça o push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">Feito com ❤️ para vendedores Shopee 🛒</p>
