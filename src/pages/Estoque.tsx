import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PackagePlus,
  PackageMinus,
  Boxes,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  X,
  Plus,
  Minus,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Receipt,
  Upload,
  Package,
  Pencil,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import ImportarCSVModal from "@/components/estoque/ImportarCSVModal";
import {
  SIZES,
  useEstoqueData,
  useEstoqueMutations,
  type LoteComDetalhes,
  type EstoqueStats,
} from "@/hooks/useEstoque";
import { useProdutos, type Produto } from "@/hooks/useProdutos";

const BRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Size chip ───────────────────────────────────────────────────────────────

function chipClass(qty: number) {
  if (qty > 5) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (qty >= 1) return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-rose-500/10 text-rose-400/70 border-rose-500/20";
}

function SizeGrid({ stats }: { stats: EstoqueStats }) {
  return (
    <div className="card-pro p-5">
      <div className="flex items-center gap-2 mb-4">
        <Boxes className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-card-foreground">Estoque por Numeração</h2>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {SIZES.map((size) => {
          const qty = stats.stockMap[size] ?? 0;
          return (
            <div
              key={size}
              className={`flex flex-col items-center justify-center rounded-xl border px-2 py-3 gap-1 transition-colors ${chipClass(qty)}`}
            >
              <span className="text-base font-bold tabular-nums">{size}</span>
              <span className="text-[10px] font-medium opacity-80">{qty} par{qty !== 1 ? "es" : ""}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> &gt;5 pares</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500 inline-block" /> 1–5 pares</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500 inline-block" /> esgotado</span>
      </div>
    </div>
  );
}

// ── Lote card ───────────────────────────────────────────────────────────────

function LoteCard({ lote }: { lote: LoteComDetalhes }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/8">
          <Receipt className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div>
              <p className="text-sm font-semibold text-card-foreground">
                {lote.totalPares} pares
                {lote.descricao && <span className="ml-2 font-normal text-muted-foreground">— {lote.descricao}</span>}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatDate(lote.created_at)}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-sm font-bold text-card-foreground tabular-nums">{BRL(lote.preco_total)}</p>
                <p className="text-[11px] text-muted-foreground">{BRL(lote.custoPorPar)}/par</p>
              </div>
              {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4">
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 bg-muted/40 rounded-xl p-3">
                {lote.detalhes.sort((a, b) => a.numeracao - b.numeracao).map((d) => (
                  <div key={d.numeracao} className="flex flex-col items-center rounded-lg bg-card border border-border px-2 py-2">
                    <span className="text-xs font-bold text-card-foreground">{d.numeracao}</span>
                    <span className="text-[10px] text-muted-foreground">{d.quantidade}x</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Nova Compra Modal ───────────────────────────────────────────────────────

interface NovaCompraModalProps {
  onClose: () => void;
  onConfirm: (preco: number, descricao: string, quantidades: Record<number, number>) => void;
  loading: boolean;
}

function NovaCompraModal({ onClose, onConfirm, loading }: NovaCompraModalProps) {
  const [precoTotal, setPrecoTotal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [quantidades, setQuantidades] = useState<Record<number, number>>(
    () => Object.fromEntries(SIZES.map((s) => [s, 0])),
  );
  const [erro, setErro] = useState("");

  const totalPares = Object.values(quantidades).reduce((a, b) => a + b, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const preco = parseFloat(precoTotal.replace(",", "."));
    if (!preco || preco <= 0) { setErro("Informe o preço pago pelo lote."); return; }
    if (totalPares === 0) { setErro("Informe a quantidade de ao menos um tamanho."); return; }
    setErro("");
    onConfirm(preco, descricao, quantidades);
  }

  function setQty(size: number, val: number) {
    setQuantidades((prev) => ({ ...prev, [size]: Math.max(0, val) }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
              <PackagePlus className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-card-foreground">Registrar Compra</h2>
              <p className="text-xs text-muted-foreground">{totalPares} pares informados</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preço total pago (R$)</label>
              <input type="text" inputMode="decimal" value={precoTotal}
                onChange={(e) => setPrecoTotal(e.target.value)}
                placeholder="Ex: 280,00" className="input-pro mt-1.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Observação (opcional)</label>
              <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Lote Janeiro" className="input-pro mt-1.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quantidade por numeração</label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {SIZES.map((size) => (
                <div key={size} className="flex flex-col gap-1">
                  <span className="text-[11px] text-center font-semibold text-muted-foreground">Nº {size}</span>
                  <div className="flex items-center gap-0.5">
                    <button type="button" onClick={() => setQty(size, (quantidades[size] ?? 0) - 1)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground transition-colors">
                      <Minus className="h-3 w-3" />
                    </button>
                    <input type="number" min="0" value={quantidades[size] ?? 0}
                      onChange={(e) => setQty(size, parseInt(e.target.value) || 0)}
                      className="input-pro text-center text-sm py-1 px-1 flex-1 min-w-0" />
                    <button type="button" onClick={() => setQty(size, (quantidades[size] ?? 0) + 1)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground transition-colors">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {erro && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/8 px-3 py-2 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{erro}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 transition-colors">
            {loading ? "Salvando…" : `Registrar ${totalPares} par${totalPares !== 1 ? "es" : ""}`}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ── Registrar Venda Modal ───────────────────────────────────────────────────

interface RegistrarVendaModalProps {
  stats: EstoqueStats;
  onClose: () => void;
  onConfirm: (numeracao: number, quantidade: number, descricao: string, preco_venda: number | null) => void;
  loading: boolean;
}

function RegistrarVendaModal({ stats, onClose, onConfirm, loading }: RegistrarVendaModalProps) {
  const defaultSize = SIZES.find((s) => (stats.stockMap[s] ?? 0) > 0) ?? 33;
  const [numeracao, setNumeracao] = useState(defaultSize);
  const [quantidade, setQuantidade] = useState(1);
  const [descricao, setDescricao] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");

  const disponivel = stats.stockMap[numeracao] ?? 0;
  const semEstoque = quantidade > disponivel;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (semEstoque) return;
    const preco = precoVenda ? parseFloat(precoVenda.replace(",", ".")) : null;
    onConfirm(numeracao, quantidade, descricao, preco);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10">
              <PackageMinus className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-card-foreground">Registrar Venda</h2>
              <p className="text-xs text-muted-foreground">Nº {numeracao}: {disponivel} disponíveis</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Numeração</label>
            <select value={numeracao} onChange={(e) => { setNumeracao(Number(e.target.value)); setQuantidade(1); }}
              className="input-pro mt-1.5">
              {SIZES.map((s) => (
                <option key={s} value={s} disabled={(stats.stockMap[s] ?? 0) === 0}>
                  Nº {s} — {stats.stockMap[s] ?? 0} disponível{(stats.stockMap[s] ?? 0) !== 1 ? "is" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quantidade</label>
            <div className="mt-1.5 flex items-center gap-2">
              <button type="button" onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted hover:bg-muted/70 transition-colors">
                <Minus className="h-4 w-4" />
              </button>
              <input type="number" min={1} max={disponivel} value={quantidade}
                onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                className="input-pro text-center text-lg font-bold flex-1" />
              <button type="button" onClick={() => setQuantidade((q) => Math.min(disponivel, q + 1))}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted hover:bg-muted/70 transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preço de venda (R$)</label>
              <input type="text" inputMode="decimal" value={precoVenda} onChange={(e) => setPrecoVenda(e.target.value)}
                placeholder="Ex: 49,90" className="input-pro mt-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1">Opcional — usado no P&L</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Observação</label>
              <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Pedido #123" className="input-pro mt-1.5" />
            </div>
          </div>

          {semEstoque && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/8 px-3 py-2 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Quantidade maior que o estoque disponível ({disponivel} par{disponivel !== 1 ? "es" : ""}).
            </div>
          )}

          <button type="submit" disabled={loading || semEstoque}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-50 transition-colors">
            {loading ? "Salvando…" : "Registrar Venda"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ── Produtos Tab ─────────────────────────────────────────────────────────────

const CATEGORIAS = ["Geral", "Calçados", "Meias", "Acessórios", "Outro"];

interface ProdutoModalProps {
  initial?: Produto | null;
  onClose: () => void;
  onSave: (data: Omit<Produto, "id" | "user_id" | "created_at" | "updated_at" | "ativo">) => void;
  loading: boolean;
}

function ProdutoModal({ initial, onClose, onSave, loading }: ProdutoModalProps) {
  const [form, setForm] = useState({
    nome: initial?.nome ?? "",
    categoria: initial?.categoria ?? "Geral",
    sku: initial?.sku ?? "",
    preco_custo: initial?.preco_custo ?? 0,
    preco_venda: initial?.preco_venda ?? null as number | null,
    estoque_atual: initial?.estoque_atual ?? 0,
    estoque_minimo: initial?.estoque_minimo ?? 3,
    unidade: initial?.unidade ?? "un",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) { toast.error("Nome obrigatório"); return; }
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-base font-semibold text-card-foreground">
              {initial ? "Editar Produto" : "Novo Produto"}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nome *</label>
            <input value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Meia Esportiva" className="input-pro mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Categoria</label>
              <select value={form.categoria} onChange={(e) => setForm(f => ({ ...f, categoria: e.target.value }))} className="input-pro mt-1.5">
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Unidade</label>
              <select value={form.unidade} onChange={(e) => setForm(f => ({ ...f, unidade: e.target.value }))} className="input-pro mt-1.5">
                {["un", "par", "kit", "cx", "dz"].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Custo (R$)</label>
              <input type="number" min={0} step="0.01" value={form.preco_custo}
                onChange={(e) => setForm(f => ({ ...f, preco_custo: parseFloat(e.target.value) || 0 }))}
                className="input-pro mt-1.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preço venda (R$)</label>
              <input type="number" min={0} step="0.01" value={form.preco_venda ?? ""}
                onChange={(e) => setForm(f => ({ ...f, preco_venda: e.target.value ? parseFloat(e.target.value) : null }))}
                placeholder="Opcional" className="input-pro mt-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estoque inicial</label>
              <input type="number" min={0} value={form.estoque_atual}
                onChange={(e) => setForm(f => ({ ...f, estoque_atual: parseInt(e.target.value) || 0 }))}
                className="input-pro mt-1.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alerta mínimo</label>
              <input type="number" min={0} value={form.estoque_minimo}
                onChange={(e) => setForm(f => ({ ...f, estoque_minimo: parseInt(e.target.value) || 0 }))}
                className="input-pro mt-1.5" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">SKU (opcional)</label>
            <input value={form.sku ?? ""} onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))}
              placeholder="Ex: MEI-001" className="input-pro mt-1.5" />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
            {loading ? "Salvando…" : initial ? "Salvar alterações" : "Cadastrar produto"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

interface MovModal { produto: Produto; tipo: "entrada" | "saida" }

function MovimentacaoModal({ produto, tipo, onClose, onConfirm, loading }:
  MovModal & { onClose: () => void; onConfirm: (qty: number, preco?: number, desc?: string) => void; loading: boolean }) {
  const [qty, setQty] = useState(1);
  const [preco, setPreco] = useState("");
  const [desc, setDesc] = useState("");
  const semEstoque = tipo === "saida" && qty > produto.estoque_atual;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tipo === "entrada" ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
              {tipo === "entrada" ? <ArrowUpCircle className="h-5 w-5 text-emerald-500" /> : <ArrowDownCircle className="h-5 w-5 text-rose-500" />}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-card-foreground">{tipo === "entrada" ? "Registrar Entrada" : "Registrar Saída"}</h2>
              <p className="text-xs text-muted-foreground">{produto.nome}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quantidade</label>
            <div className="mt-1.5 flex items-center gap-2">
              <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted hover:bg-muted/70 transition-colors">
                <Minus className="h-4 w-4" />
              </button>
              <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="input-pro text-center text-lg font-bold flex-1" />
              <button type="button" onClick={() => setQty(q => q + 1)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted hover:bg-muted/70 transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {tipo === "saida" && <p className="text-xs text-muted-foreground mt-1">Disponível: {produto.estoque_atual} {produto.unidade}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {tipo === "entrada" ? "Custo unitário (R$)" : "Preço de venda (R$)"}
            </label>
            <input type="number" min={0} step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)}
              placeholder="Opcional" className="input-pro mt-1.5" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Observação</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Opcional" className="input-pro mt-1.5" />
          </div>
          {semEstoque && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/8 px-3 py-2 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Estoque insuficiente.
            </div>
          )}
          <button disabled={loading || semEstoque} onClick={() => onConfirm(qty, preco ? parseFloat(preco) : undefined, desc || undefined)}
            className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-colors ${tipo === "entrada" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"}`}>
            {loading ? "Salvando…" : `Registrar ${tipo}`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ProdutosTab() {
  const { produtos, isLoading, criar, editar, excluir, movimentar, alertas } = useProdutos();
  const [modalProduto, setModalProduto] = useState<{ mode: "new" | "edit"; produto?: Produto } | null>(null);
  const [modalMov, setModalMov] = useState<MovModal | null>(null);

  const categorias = [...new Set(produtos.map(p => p.categoria))].sort();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-card-foreground">{produtos.length} produto{produtos.length !== 1 ? "s" : ""}</p>
          {alertas.length > 0 && (
            <p className="text-xs text-amber-500 mt-0.5">{alertas.length} com estoque baixo</p>
          )}
        </div>
        <button onClick={() => setModalProduto({ mode: "new" })} className="btn-primary w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Novo Produto
        </button>
      </div>

      {alertas.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-500">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="font-medium">Estoque baixo:</span>
          {alertas.map(p => (
            <span key={p.id} className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-xs font-bold">
              {p.nome} ({p.estoque_atual} {p.unidade})
            </span>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Carregando…</div>
      ) : produtos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Package className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-card-foreground">Nenhum produto cadastrado</p>
            <p className="text-xs text-muted-foreground mt-1">Adicione produtos genéricos além das palmilhas.</p>
          </div>
          <button onClick={() => setModalProduto({ mode: "new" })} className="btn-primary">
            <Plus className="h-4 w-4" /> Cadastrar produto
          </button>
        </div>
      ) : (
        categorias.map(cat => (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cat}</p>
            </div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {produtos.filter(p => p.categoria === cat).map(p => {
                const stockColor = p.estoque_atual <= p.estoque_minimo
                  ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                  : p.estoque_atual <= p.estoque_minimo * 2
                  ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                  : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                return (
                  <div key={p.id} className="card-pro p-4 group">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-card-foreground truncate">{p.nome}</p>
                        {p.sku && <p className="text-[11px] text-muted-foreground mt-0.5">SKU: {p.sku}</p>}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => setModalProduto({ mode: "edit", produto: p })}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => { if (confirm(`Remover "${p.nome}"?`)) excluir.mutate(p.id); }}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className={`flex items-center justify-between rounded-xl border px-3 py-2.5 mb-3 ${stockColor}`}>
                      <span className="text-xs font-medium">Estoque atual</span>
                      <span className="text-lg font-bold tabular-nums">{p.estoque_atual} <span className="text-xs font-normal">{p.unidade}</span></span>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                      <span>Custo: <strong>{BRL(p.preco_custo)}</strong></span>
                      {p.preco_venda && <span className="ml-auto">Venda: <strong>{BRL(p.preco_venda)}</strong></span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setModalMov({ produto: p, tipo: "entrada" })}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/8 px-3 py-2 text-xs font-semibold text-emerald-500 hover:bg-emerald-500/15 transition-colors">
                        <ArrowUpCircle className="h-3.5 w-3.5" /> Entrada
                      </button>
                      <button disabled={p.estoque_atual === 0} onClick={() => setModalMov({ produto: p, tipo: "saida" })}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/8 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/15 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        <ArrowDownCircle className="h-3.5 w-3.5" /> Saída
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      <AnimatePresence>
        {modalProduto && (
          <ProdutoModal
            initial={modalProduto.produto}
            onClose={() => setModalProduto(null)}
            loading={criar.isPending || editar.isPending}
            onSave={(data) => {
              if (modalProduto.mode === "edit" && modalProduto.produto) {
                editar.mutate({ id: modalProduto.produto.id, ...data }, {
                  onSuccess: () => { toast.success("Produto atualizado!"); setModalProduto(null); },
                  onError: (e) => toast.error(e.message),
                });
              } else {
                criar.mutate(data, {
                  onSuccess: () => { toast.success("Produto cadastrado!"); setModalProduto(null); },
                  onError: (e) => toast.error(e.message),
                });
              }
            }}
          />
        )}
        {modalMov && (
          <MovimentacaoModal
            produto={modalMov.produto}
            tipo={modalMov.tipo}
            onClose={() => setModalMov(null)}
            loading={movimentar.isPending}
            onConfirm={(qty, preco, desc) => {
              movimentar.mutate({ produto_id: modalMov.produto.id, tipo: modalMov.tipo, quantidade: qty, preco_unitario: preco, descricao: desc }, {
                onSuccess: () => { toast.success(`${modalMov.tipo === "entrada" ? "Entrada" : "Saída"} registrada!`); setModalMov(null); },
                onError: (e) => toast.error(e.message),
              });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function Estoque() {
  const [tab, setTab] = useState<"palmilhas" | "produtos">("palmilhas");
  const [modal, setModal] = useState<"compra" | "venda" | "csv" | null>(null);
  const { lotes, saidas, stats, isLoading } = useEstoqueData();
  const { novaCompra, registrarVenda } = useEstoqueMutations();

  const esgotados = SIZES.filter(
    (s) => (stats.stockMap[s] ?? 0) === 0 && stats.totalComprado > 0 &&
      (lotes.some((l) => l.detalhes.some((d) => d.numeracao === s))),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Estoque</h1>
          <p className="text-sm text-muted-foreground mt-1">Palmilhas por numeração e outros produtos</p>
        </div>
        {tab === "palmilhas" && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setModal("csv")}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted/60 transition-all">
              <Upload className="h-4 w-4" /> Importar CSV
            </button>
            <button onClick={() => setModal("venda")} disabled={stats.totalEstoque === 0}
              className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/8 px-4 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-500/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <PackageMinus className="h-4 w-4" /> Registrar Venda
            </button>
            <button onClick={() => setModal("compra")} className="btn-primary">
              <PackagePlus className="h-4 w-4" /> Nova Compra
            </button>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted/50 p-1 w-fit">
        {(["palmilhas", "produtos"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>
            {t === "palmilhas" ? "Palmilhas" : "Outros Produtos"}
          </button>
        ))}
      </div>

      {/* Conteúdo por aba */}
      {tab === "produtos" && <ProdutosTab />}

      {tab === "palmilhas" && <>

      {/* Alert */}
      <AnimatePresence>
        {esgotados.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="font-medium">Numerações esgotadas:</span>
            {esgotados.map((s) => (
              <span key={s} className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-xs font-bold">Nº {s}</span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total em Estoque", value: `${stats.totalEstoque}`, suffix: "pares", icon: Boxes, color: "text-primary", bg: "bg-primary/8" },
          { label: "Total Investido", value: BRL(stats.totalInvestido), suffix: "em lotes", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/8" },
          { label: "Custo Médio/Par", value: BRL(stats.custoMedioPorPar), suffix: "por par", icon: TrendingDown, color: "text-blue-500", bg: "bg-blue-500/8" },
          { label: "Total Vendido", value: `${stats.totalVendido}`, suffix: "pares", icon: ShoppingBag, color: "text-orange-500", bg: "bg-orange-500/8" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }} className="card-pro px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>
              {isLoading ? "—" : stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.suffix}</p>
          </motion.div>
        ))}
      </div>

      {/* Size grid */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <SizeGrid stats={stats} />
      </motion.div>

      {/* Lote history */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
        className="card-pro overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          <div>
            <h2 className="text-sm font-semibold text-card-foreground">Histórico de Lotes</h2>
            <p className="text-xs text-muted-foreground">{lotes.length} lote{lotes.length !== 1 ? "s" : ""} registrado{lotes.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">Carregando…</div>
        ) : lotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center px-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <Boxes className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">Nenhuma compra registrada</p>
              <p className="text-xs text-muted-foreground mt-1">Clique em "Nova Compra" para registrar seu primeiro lote.</p>
            </div>
          </div>
        ) : (
          <div>
            {lotes.map((lote) => <LoteCard key={lote.id} lote={lote} />)}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {modal === "csv" && (
          <ImportarCSVModal onClose={() => setModal(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {modal === "compra" && (
          <NovaCompraModal
            onClose={() => setModal(null)}
            loading={novaCompra.isPending}
            onConfirm={(preco, descricao, quantidades) =>
              novaCompra.mutate(
                { preco_total: preco, descricao, quantidades },
                {
                  onSuccess: () => { toast.success(`Lote registrado com sucesso!`); setModal(null); },
                  onError: (e) => toast.error(e.message),
                },
              )
            }
          />
        )}
        {modal === "venda" && (
          <RegistrarVendaModal
            stats={stats}
            onClose={() => setModal(null)}
            loading={registrarVenda.isPending}
            onConfirm={(numeracao, quantidade, descricao, preco_venda) =>
              registrarVenda.mutate(
                { numeracao, quantidade, descricao, preco_venda },
                {
                  onSuccess: () => { toast.success(`${quantidade} par${quantidade !== 1 ? "es" : ""} nº ${numeracao} vendido${quantidade !== 1 ? "s" : ""}.`); setModal(null); },
                  onError: (e) => toast.error(e.message),
                },
              )
            }
          />
        )}
      </AnimatePresence>

      </>}
    </div>
  );
}
