import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search, X, LayoutDashboard, Boxes, Package, Factory,
  Calculator, ShoppingCart, Megaphone, DollarSign, Settings,
  ArrowRight, Tag,
} from "lucide-react";
import { useProdutos } from "@/hooks/useProdutos";
import { useFornecedores } from "@/hooks/useFornecedores";

const PAGES = [
  { label: "Dashboard",      to: "/",              icon: LayoutDashboard, desc: "Visão geral do negócio" },
  { label: "Estoque",        to: "/estoque",        icon: Boxes,           desc: "Palmilhas e produtos" },
  { label: "Calculadora",    to: "/calculadora",    icon: Calculator,      desc: "Precificação inteligente" },
  { label: "Fornecedores",   to: "/fornecedores",   icon: Factory,         desc: "Gestão de fornecedores" },
  { label: "Vendas",         to: "/vendas",         icon: ShoppingCart,    desc: "Histórico de pedidos" },
  { label: "Anúncios",       to: "/anuncios",       icon: Megaphone,       desc: "Campanhas e ADS" },
  { label: "Financeiro",     to: "/financeiro",     icon: DollarSign,      desc: "P&L e relatórios" },
  { label: "Configurações",  to: "/configuracoes",  icon: Settings,        desc: "Perfil e preferências" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { produtos } = useProdutos();
  const { fornecedores } = useFornecedores();

  const q = query.trim().toLowerCase();

  const filteredPages = q
    ? PAGES.filter((p) => p.label.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))
    : PAGES;

  const filteredProdutos = q
    ? produtos.filter((p) => p.nome.toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q))
    : [];

  const filteredFornecedores = q
    ? fornecedores.filter((f) => f.nome.toLowerCase().includes(q) || (f.cnpj ?? "").includes(q))
    : [];

  type Result =
    | { kind: "page"; label: string; to: string; icon: React.ElementType; desc: string }
    | { kind: "produto"; id: string; nome: string; categoria: string; estoque: number; unidade: string }
    | { kind: "fornecedor"; id: string; nome: string; cnpj: string | null };

  const results: Result[] = [
    ...filteredPages.map((p) => ({ kind: "page" as const, ...p })),
    ...filteredProdutos.map((p) => ({ kind: "produto" as const, id: p.id, nome: p.nome, categoria: p.categoria, estoque: p.estoque_atual, unidade: p.unidade })),
    ...filteredFornecedores.map((f) => ({ kind: "fornecedor" as const, id: f.id, nome: f.nome, cnpj: f.cnpj })),
  ];

  useEffect(() => { setActiveIdx(0); }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  function go(result: Result) {
    if (result.kind === "page") navigate(result.to);
    else if (result.kind === "produto" || result.kind === "fornecedor") {
      navigate(result.kind === "produto" ? "/estoque" : "/fornecedores");
    }
    onClose();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[activeIdx]) go(results[activeIdx]);
    if (e.key === "Escape") onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Buscar páginas, produtos, fornecedores…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="hidden sm:flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto py-2">
              {results.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum resultado encontrado.</p>
              )}

              {/* Páginas */}
              {filteredPages.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    {q ? "Páginas" : "Navegação rápida"}
                  </p>
                  {filteredPages.map((page, i) => {
                    const globalIdx = i;
                    const Icon = page.icon;
                    return (
                      <button key={page.to} onClick={() => go({ kind: "page", ...page })}
                        onMouseEnter={() => setActiveIdx(globalIdx)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === globalIdx ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}>
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${activeIdx === globalIdx ? "bg-primary/15" : "bg-muted"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{page.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{page.desc}</p>
                        </div>
                        <ArrowRight className={`h-3.5 w-3.5 shrink-0 transition-opacity ${activeIdx === globalIdx ? "opacity-100" : "opacity-0"}`} />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Produtos */}
              {filteredProdutos.length > 0 && (
                <div className="mt-1">
                  <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Produtos</p>
                  {filteredProdutos.map((prod, i) => {
                    const globalIdx = filteredPages.length + i;
                    return (
                      <button key={prod.id} onClick={() => go({ kind: "produto", id: prod.id, nome: prod.nome, categoria: prod.categoria, estoque: prod.estoque_atual, unidade: prod.unidade })}
                        onMouseEnter={() => setActiveIdx(globalIdx)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === globalIdx ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}>
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${activeIdx === globalIdx ? "bg-primary/15" : "bg-muted"}`}>
                          <Package className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{prod.nome}</p>
                          <p className="text-xs text-muted-foreground">{prod.categoria} · {prod.estoque_atual} {prod.unidade} em estoque</p>
                        </div>
                        <Tag className="h-3.5 w-3.5 shrink-0 opacity-40" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Fornecedores */}
              {filteredFornecedores.length > 0 && (
                <div className="mt-1">
                  <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Fornecedores</p>
                  {filteredFornecedores.map((forn, i) => {
                    const globalIdx = filteredPages.length + filteredProdutos.length + i;
                    return (
                      <button key={forn.id} onClick={() => go({ kind: "fornecedor", id: forn.id, nome: forn.nome, cnpj: forn.cnpj })}
                        onMouseEnter={() => setActiveIdx(globalIdx)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === globalIdx ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}>
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${activeIdx === globalIdx ? "bg-primary/15" : "bg-muted"}`}>
                          <Factory className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{forn.nome}</p>
                          {forn.cnpj && <p className="text-xs text-muted-foreground">{forn.cnpj}</p>}
                        </div>
                        <ArrowRight className={`h-3.5 w-3.5 shrink-0 transition-opacity ${activeIdx === globalIdx ? "opacity-100" : "opacity-0"}`} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-2.5 flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-muted px-1">↑↓</kbd> navegar</span>
              <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-muted px-1">↵</kbd> abrir</span>
              <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-muted px-1">Ctrl K</kbd> abrir/fechar</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
