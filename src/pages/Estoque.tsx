import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PackagePlus,
  PackageMinus,
  Boxes,
  TrendingDown,
  ShoppingBag,
  X,
  Plus,
  Minus,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Movimentacao {
  id: string;
  tipo: "entrada" | "saida";
  quantidade: number;
  descricao: string | null;
  created_at: string;
}

const LOTE_PADRAO = 100;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Modal ─────────────────────────────────────────────────────────────────

interface ModalProps {
  tipo: "entrada" | "saida";
  saldoAtual: number;
  onClose: () => void;
  onConfirm: (quantidade: number, descricao: string) => void;
  loading: boolean;
}

function Modal({ tipo, saldoAtual, onClose, onConfirm, loading }: ModalProps) {
  const [quantidade, setQuantidade] = useState(tipo === "entrada" ? LOTE_PADRAO : 1);
  const [descricao, setDescricao] = useState("");

  const isEntrada = tipo === "entrada";
  const semEstoque = !isEntrada && quantidade > saldoAtual;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (semEstoque) return;
    onConfirm(quantidade, descricao);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isEntrada ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
              {isEntrada
                ? <PackagePlus className="h-5 w-5 text-emerald-500" />
                : <PackageMinus className="h-5 w-5 text-rose-500" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-card-foreground">
                {isEntrada ? "Registrar Compra" : "Registrar Venda"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEntrada ? "Entrada de pares no estoque" : `${saldoAtual} pares disponíveis`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Quantidade de pares
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted hover:bg-muted/70 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={1}
                max={isEntrada ? undefined : saldoAtual}
                value={quantidade}
                onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                className="input-pro text-center text-lg font-bold flex-1"
              />
              <button
                type="button"
                onClick={() => setQuantidade((q) => q + 1)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted hover:bg-muted/70 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {isEntrada && (
              <button
                type="button"
                onClick={() => setQuantidade(LOTE_PADRAO)}
                className="mt-1.5 text-xs text-primary hover:underline"
              >
                Usar lote padrão (100 pares)
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Observação <span className="normal-case">(opcional)</span>
            </label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder={isEntrada ? "Ex: Lote de Janeiro" : "Ex: Pedido #123"}
              className="input-pro mt-1.5"
            />
          </div>

          {semEstoque && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/8 px-3 py-2 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Quantidade maior que o saldo disponível ({saldoAtual} pares).
            </div>
          )}

          <button
            type="submit"
            disabled={loading || semEstoque}
            className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              isEntrada
                ? "bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50"
                : "bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-50"
            }`}
          >
            {loading ? "Salvando…" : isEntrada ? "Registrar Entrada" : "Registrar Saída"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function Estoque() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<"entrada" | "saida" | null>(null);

  const { data: movimentacoes = [], isLoading } = useQuery({
    queryKey: ["estoque", "palmilhas", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("palmilha_movimentacoes")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Movimentacao[];
    },
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: async ({ tipo, quantidade, descricao }: { tipo: "entrada" | "saida"; quantidade: number; descricao: string }) => {
      const { error } = await supabase.from("palmilha_movimentacoes").insert({
        user_id: user!.id,
        tipo,
        quantidade,
        descricao: descricao || null,
      });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["estoque", "palmilhas"] });
      toast.success(
        variables.tipo === "entrada"
          ? `+${variables.quantidade} pares adicionados ao estoque.`
          : `${variables.quantidade} ${variables.quantidade === 1 ? "par vendido" : "pares vendidos"}.`,
      );
      setModal(null);
    },
    onError: () => {
      toast.error("Erro ao salvar movimentação.");
    },
  });

  // ── Calculated totals ──────────────────────────────────────────────────
  const totalComprado = movimentacoes
    .filter((m) => m.tipo === "entrada")
    .reduce((acc, m) => acc + m.quantidade, 0);

  const totalVendido = movimentacoes
    .filter((m) => m.tipo === "saida")
    .reduce((acc, m) => acc + m.quantidade, 0);

  const saldoAtual = totalComprado - totalVendido;

  // Progress within the most recent batch
  // Find last batch size by scanning entries until cumulative entries >= lote
  const ultimoLoteTotal = (() => {
    const entradas = movimentacoes.filter((m) => m.tipo === "entrada");
    return entradas[0]?.quantidade ?? LOTE_PADRAO;
  })();

  // How many were sold after the last entry
  const ultimaEntradaAt = movimentacoes.find((m) => m.tipo === "entrada")?.created_at;
  const vendidasNoLoteAtual = ultimaEntradaAt
    ? movimentacoes
        .filter((m) => m.tipo === "saida" && m.created_at > ultimaEntradaAt)
        .reduce((acc, m) => acc + m.quantidade, 0)
    : totalVendido;

  const progressoPct = ultimoLoteTotal > 0
    ? Math.min(100, Math.round((vendidasNoLoteAtual / ultimoLoteTotal) * 100))
    : 0;

  const stockAlerta = saldoAtual <= 10 && saldoAtual > 0;
  const semEstoque = saldoAtual === 0 && totalComprado > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Estoque de Palmilhas</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle de entradas, saídas e saldo</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModal("saida")}
            disabled={saldoAtual === 0}
            className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/8 px-4 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-500/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <PackageMinus className="h-4 w-4" />
            Registrar Venda
          </button>
          <button
            onClick={() => setModal("entrada")}
            className="btn-primary"
          >
            <PackagePlus className="h-4 w-4" />
            Nova Compra
          </button>
        </div>
      </motion.div>

      {/* Alertas */}
      <AnimatePresence>
        {(stockAlerta || semEstoque) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
              semEstoque
                ? "bg-destructive/10 text-destructive border border-destructive/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
            }`}
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {semEstoque
              ? "Estoque zerado! Registre uma nova compra para continuar vendendo."
              : `Atenção: apenas ${saldoAtual} par${saldoAtual === 1 ? "" : "es"} restante${saldoAtual === 1 ? "" : "s"}. Considere repor o estoque.`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Comprado",
            value: totalComprado,
            icon: Boxes,
            color: "text-primary",
            bg: "bg-primary/8",
            suffix: "pares",
          },
          {
            label: "Total Vendido",
            value: totalVendido,
            icon: ShoppingBag,
            color: "text-emerald-500",
            bg: "bg-emerald-500/8",
            suffix: "pares",
          },
          {
            label: "Saldo em Estoque",
            value: saldoAtual,
            icon: TrendingDown,
            color: semEstoque ? "text-destructive" : stockAlerta ? "text-amber-500" : "text-blue-500",
            bg: semEstoque ? "bg-destructive/8" : stockAlerta ? "bg-amber-500/8" : "bg-blue-500/8",
            suffix: saldoAtual === 1 ? "par" : "pares",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="card-pro px-5 py-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold tabular-nums ${stat.color}`}>
              {isLoading ? "—" : stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.suffix}</p>
          </motion.div>
        ))}
      </div>

      {/* Batch progress */}
      {movimentacoes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="card-pro px-5 py-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-card-foreground">Progresso do lote atual</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {vendidasNoLoteAtual} de {ultimoLoteTotal} pares vendidos desde a última compra
              </p>
            </div>
            <span className="text-lg font-bold tabular-nums text-card-foreground">{progressoPct}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressoPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              className={`h-full rounded-full ${
                progressoPct >= 90 ? "bg-emerald-500" : progressoPct >= 50 ? "bg-primary" : "bg-primary/60"
              }`}
            />
          </div>
          {progressoPct >= 90 && (
            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Lote quase esgotado — hora de planejar a próxima compra!
            </p>
          )}
        </motion.div>
      )}

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="card-pro overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-card-foreground">Histórico de Movimentações</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{movimentacoes.length} registro{movimentacoes.length !== 1 ? "s" : ""}</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
            Carregando…
          </div>
        ) : movimentacoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center px-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <Boxes className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">Nenhuma movimentação ainda</p>
              <p className="text-xs text-muted-foreground mt-1">Clique em "Nova Compra" para registrar seu primeiro lote.</p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {movimentacoes.map((m, i) => (
                <motion.li
                  key={m.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    m.tipo === "entrada" ? "bg-emerald-500/10" : "bg-rose-500/10"
                  }`}>
                    {m.tipo === "entrada"
                      ? <PackagePlus className="h-4 w-4 text-emerald-500" />
                      : <PackageMinus className="h-4 w-4 text-rose-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-card-foreground capitalize">{m.tipo}</span>
                      {m.descricao && (
                        <span className="text-xs text-muted-foreground truncate">— {m.descricao}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(m.created_at)}</p>
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${
                    m.tipo === "entrada" ? "text-emerald-500" : "text-rose-500"
                  }`}>
                    {m.tipo === "entrada" ? "+" : "−"}{m.quantidade} par{m.quantidade !== 1 ? "es" : ""}
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <Modal
            tipo={modal}
            saldoAtual={saldoAtual}
            onClose={() => setModal(null)}
            onConfirm={(quantidade, descricao) =>
              mutation.mutate({ tipo: modal, quantidade, descricao })
            }
            loading={mutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
