import { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SIZES } from "@/hooks/useEstoque";

// ── Types ────────────────────────────────────────────────────────────────────

interface ParsedRow {
  id: string;
  orderSn: string;
  variacao: string;
  numeracao: number | null;
  quantidade: number;
  status: string;
  valid: boolean;
}

// ── Shopee CSV detection helpers ─────────────────────────────────────────────

const COL_CANDIDATES = {
  order:    ["no. do pedido", "order id", "order sn", "número do pedido", "pedido"],
  status:   ["status do pedido", "order status", "status"],
  variacao: ["nome da variação", "variação", "variation name", "variacao", "tamanho", "size"],
  qty:      ["quantidade", "quantity", "qtd", "qty"],
};

function findCol(headers: string[], candidates: string[]): string | null {
  const h = headers.map((x) => x.toLowerCase().trim());
  for (const c of candidates) {
    const idx = h.findIndex((x) => x.includes(c));
    if (idx !== -1) return headers[idx];
  }
  return null;
}

// Extract shoe size (33-48) from a variation string like "37", "Tamanho: 37", "N 37", "37/Branco"
function extractSize(value: string): number | null {
  const matches = value.match(/\b(3[3-9]|4[0-8])\b/);
  return matches ? parseInt(matches[1], 10) : null;
}

const COMPLETED_STATUSES = ["concluído", "concluido", "completed", "delivered", "entregue"];
function isCompleted(status: string): boolean {
  return COMPLETED_STATUSES.some((s) => status.toLowerCase().includes(s));
}

// ── Modal ────────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
}

type Step = "upload" | "preview" | "done";

export default function ImportarCSVModal({ onClose }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>("upload");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // ── Parse CSV ──────────────────────────────────────────────────────────────

  const parseFile = useCallback((file: File) => {
    setParseError("");
    setFileName(file.name);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const headers = result.meta.fields ?? [];
        const colOrder   = findCol(headers, COL_CANDIDATES.order);
        const colStatus  = findCol(headers, COL_CANDIDATES.status);
        const colVariacao = findCol(headers, COL_CANDIDATES.variacao);
        const colQty     = findCol(headers, COL_CANDIDATES.qty);

        if (!colVariacao || !colQty) {
          setParseError(
            "Não foi possível detectar as colunas de variação/tamanho e quantidade. " +
            "Verifique se o arquivo é o relatório de pedidos da Shopee.",
          );
          return;
        }

        const parsed: ParsedRow[] = result.data.map((row, i) => {
          const status = colStatus ? (row[colStatus] ?? "") : "concluído";
          const variacao = row[colVariacao] ?? "";
          const qty = parseInt(row[colQty] ?? "1", 10) || 1;
          const numeracao = extractSize(variacao);
          return {
            id: String(i),
            orderSn: colOrder ? (row[colOrder] ?? `#${i + 1}`) : `#${i + 1}`,
            variacao,
            numeracao,
            quantidade: qty,
            status,
            valid: !!numeracao && SIZES.includes(numeracao) && isCompleted(status),
          };
        });

        const valid = parsed.filter((r) => r.valid);
        if (valid.length === 0) {
          setParseError(
            "Nenhum pedido concluído com numeração reconhecida (33-48) foi encontrado. " +
            "Verifique se o arquivo está correto ou ajuste as linhas manualmente.",
          );
          // Still show all rows for manual editing
        }
        setRows(parsed);
        setStep("preview");
      },
      error: (err) => {
        setParseError(`Erro ao ler o arquivo: ${err.message}`);
      },
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) parseFile(file);
    },
    [parseFile],
  );

  // ── Row editing ────────────────────────────────────────────────────────────

  function setRowSize(id: string, numeracao: number) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, numeracao, valid: SIZES.includes(numeracao) && isCompleted(r.status) }
          : r,
      ),
    );
  }

  function setRowQty(id: string, delta: number) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, quantidade: Math.max(1, r.quantidade + delta) } : r,
      ),
    );
  }

  function toggleRow(id: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, valid: !r.valid } : r)),
    );
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  // ── Import ─────────────────────────────────────────────────────────────────

  const validRows = rows.filter((r) => r.valid);

  async function handleImport() {
    if (!user || validRows.length === 0) return;
    setLoading(true);
    try {
      const inserts = validRows.map((r) => ({
        user_id: user.id,
        numeracao: r.numeracao!,
        quantidade: r.quantidade,
        descricao: `Importado CSV — Pedido ${r.orderSn}`,
      }));

      const { error } = await supabase.from("palmilha_saidas").insert(inserts);
      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["estoque"] });
      setImported(validRows.length);
      setStep("done");
    } catch (err: any) {
      toast.error(err.message || "Erro ao importar");
    } finally {
      setLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

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
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        className="relative z-10 w-full max-w-2xl rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Upload className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-card-foreground">
                Importar Pedidos CSV
              </h2>
              <p className="text-xs text-muted-foreground">
                Relatório de pedidos exportado da Shopee
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 80px)" }}>
          <AnimatePresence mode="wait">

            {/* ── Step 1: Upload ── */}
            {step === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 space-y-4"
              >
                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-14 transition-colors ${
                    dragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                    <FileText className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-card-foreground">
                      Arraste o arquivo CSV aqui
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ou clique para selecionar
                    </p>
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".csv,.xls,.xlsx,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) parseFile(f);
                    }}
                  />
                </div>

                {parseError && (
                  <div className="flex items-start gap-2 rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    {parseError}
                  </div>
                )}

                {/* How to export */}
                <div className="rounded-xl bg-muted/40 px-4 py-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <Info className="h-3.5 w-3.5" /> Como exportar da Shopee
                  </div>
                  {[
                    "Acesse Central do Vendedor → Meus Pedidos",
                    "Filtre pelo período desejado",
                    'Clique em "Exportar" → "Exportar pedidos" → formato CSV',
                    "Faça o upload do arquivo aqui",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Preview ── */}
            {step === "preview" && (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {fileName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {validRows.length} de {rows.length} linhas serão importadas
                    </p>
                  </div>
                  <button
                    onClick={() => { setStep("upload"); setRows([]); setFileName(""); }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Trocar arquivo
                  </button>
                </div>

                {parseError && (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    {parseError}
                  </div>
                )}

                {/* Rows table */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted/40 px-4 py-2.5 border-b border-border">
                    <span>Pedido / Variação</span>
                    <span className="text-center">Tamanho</span>
                    <span className="text-center">Qtd</span>
                    <span className="text-center">Status</span>
                    <span />
                  </div>

                  <div className="divide-y divide-border">
                    {rows.map((row) => (
                      <div
                        key={row.id}
                        className={`grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-3 px-4 py-3 transition-colors ${
                          !row.valid ? "opacity-40" : ""
                        }`}
                      >
                        {/* Order / variation */}
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-card-foreground truncate">
                            {row.orderSn}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {row.variacao || "—"}
                          </p>
                        </div>

                        {/* Size select */}
                        <select
                          value={row.numeracao ?? ""}
                          onChange={(e) => setRowSize(row.id, Number(e.target.value))}
                          className={`rounded-lg border px-2 py-1 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-ring ${
                            row.numeracao ? "border-input text-foreground" : "border-destructive/50 text-destructive"
                          }`}
                        >
                          <option value="">—</option>
                          {SIZES.map((s) => (
                            <option key={s} value={s}>Nº {s}</option>
                          ))}
                        </select>

                        {/* Qty stepper */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setRowQty(row.id, -1)}
                            className="h-6 w-6 rounded flex items-center justify-center bg-muted hover:bg-muted/70 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold tabular-nums">
                            {row.quantidade}
                          </span>
                          <button
                            onClick={() => setRowQty(row.id, 1)}
                            className="h-6 w-6 rounded flex items-center justify-center bg-muted hover:bg-muted/70 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Toggle */}
                        <button
                          onClick={() => toggleRow(row.id)}
                          className={`text-[11px] px-2 py-0.5 rounded-full border font-medium transition-colors ${
                            row.valid
                              ? "bg-success/10 border-success/20 text-success"
                              : "bg-muted border-border text-muted-foreground"
                          }`}
                        >
                          {row.valid ? "Incluir" : "Ignorar"}
                        </button>

                        {/* Remove */}
                        <button
                          onClick={() => removeRow(row.id)}
                          className="text-muted-foreground/40 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    {validRows.length} saída{validRows.length !== 1 ? "s" : ""} serão registradas no estoque
                  </p>
                  <button
                    onClick={handleImport}
                    disabled={loading || validRows.length === 0}
                    className="btn-primary group"
                  >
                    {loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    ) : (
                      <>
                        Importar {validRows.length} pedido{validRows.length !== 1 ? "s" : ""}
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Done ── */}
            {step === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center gap-5 px-6 py-16 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 border border-success/20">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Importação concluída
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {imported} saída{imported !== 1 ? "s" : ""} registrada{imported !== 1 ? "s" : ""} no estoque com sucesso.
                  </p>
                </div>
                <button onClick={onClose} className="btn-primary">
                  Ver estoque atualizado
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
