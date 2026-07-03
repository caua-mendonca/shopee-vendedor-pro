import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Factory, Plus, Mail, Phone, Building2, X, Pencil, Trash2,
  Clock, FileText, User, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useFornecedores, type Fornecedor, type FornecedorInput } from "@/hooks/useFornecedores";

const EMPTY: FornecedorInput = {
  nome: "",
  cnpj: "",
  contato_nome: "",
  contato_telefone: "",
  contato_email: "",
  prazo_pagamento_dias: 30,
  observacoes: "",
};

function formatCNPJ(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function formatPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  return d.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
}

// ── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  initial?: Fornecedor | null;
  onClose: () => void;
  onSave: (data: FornecedorInput) => void;
  loading: boolean;
}

function FornecedorModal({ initial, onClose, onSave, loading }: ModalProps) {
  const [form, setForm] = useState<FornecedorInput>(() =>
    initial
      ? {
          nome: initial.nome,
          cnpj: initial.cnpj ?? "",
          contato_nome: initial.contato_nome ?? "",
          contato_telefone: initial.contato_telefone ?? "",
          contato_email: initial.contato_email ?? "",
          prazo_pagamento_dias: initial.prazo_pagamento_dias,
          observacoes: initial.observacoes ?? "",
        }
      : EMPTY,
  );

  const set = (k: keyof FornecedorInput, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

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
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Factory className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-base font-semibold text-card-foreground">
              {initial ? "Editar Fornecedor" : "Novo Fornecedor"}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nome *</label>
            <input value={form.nome} onChange={(e) => set("nome", e.target.value)}
              placeholder="Nome da empresa" className="input-pro mt-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">CNPJ</label>
              <input value={form.cnpj ?? ""} onChange={(e) => set("cnpj", formatCNPJ(e.target.value))}
                placeholder="00.000.000/0001-00" className="input-pro mt-1.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prazo (dias)</label>
              <input type="number" min={0} value={form.prazo_pagamento_dias}
                onChange={(e) => set("prazo_pagamento_dias", parseInt(e.target.value) || 0)}
                className="input-pro mt-1.5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contato</label>
              <input value={form.contato_nome ?? ""} onChange={(e) => set("contato_nome", e.target.value)}
                placeholder="Nome do contato" className="input-pro mt-1.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Telefone</label>
              <input value={form.contato_telefone ?? ""} onChange={(e) => set("contato_telefone", formatPhone(e.target.value))}
                placeholder="(11) 99999-9999" className="input-pro mt-1.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">E-mail</label>
            <input type="email" value={form.contato_email ?? ""} onChange={(e) => set("contato_email", e.target.value)}
              placeholder="contato@empresa.com" className="input-pro mt-1.5" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Observações</label>
            <textarea value={form.observacoes ?? ""} onChange={(e) => set("observacoes", e.target.value)}
              rows={2} placeholder="Informações adicionais…" className="input-pro mt-1.5 resize-none" />
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
            {loading ? "Salvando…" : initial ? "Salvar alterações" : "Cadastrar fornecedor"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ── Fornecedor Card ──────────────────────────────────────────────────────────
function FornecedorCard({ f, onEdit, onDelete }: { f: Fornecedor; onEdit: () => void; onDelete: () => void }) {
  const initials = f.nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-pro p-5 group">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-card-foreground truncate">{f.nome}</h3>
            {f.cnpj && <p className="text-xs text-muted-foreground mt-0.5">{f.cnpj}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {f.contato_nome && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{f.contato_nome}</span>
          </div>
        )}
        {f.contato_email && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{f.contato_email}</span>
          </div>
        )}
        {f.contato_telefone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{f.contato_telefone}</span>
          </div>
        )}
        {f.prazo_pagamento_dias > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Prazo: {f.prazo_pagamento_dias} dias</span>
          </div>
        )}
        {f.observacoes && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{f.observacoes}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function Suppliers() {
  const { fornecedores, isLoading, criar, editar, excluir } = useFornecedores();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Fornecedor | null>(null);

  function openNew() { setEditing(null); setModalOpen(true); }
  function openEdit(f: Fornecedor) { setEditing(f); setModalOpen(true); }
  function close() { setModalOpen(false); setEditing(null); }

  function handleSave(data: FornecedorInput) {
    if (editing) {
      editar.mutate({ id: editing.id, ...data }, {
        onSuccess: () => { toast.success("Fornecedor atualizado!"); close(); },
        onError: (e) => toast.error(e.message),
      });
    } else {
      criar.mutate(data, {
        onSuccess: () => { toast.success("Fornecedor cadastrado!"); close(); },
        onError: (e) => toast.error(e.message),
      });
    }
  }

  function handleDelete(f: Fornecedor) {
    if (!confirm(`Remover "${f.nome}"?`)) return;
    excluir.mutate(f.id, {
      onSuccess: () => toast.success("Fornecedor removido."),
      onError: (e) => toast.error(e.message),
    });
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Fornecedores</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Carregando…" : `${fornecedores.length} fornecedor${fornecedores.length !== 1 ? "es" : ""} cadastrado${fornecedores.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button onClick={openNew} className="btn-primary w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Novo Fornecedor
        </button>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Carregando…</div>
      ) : fornecedores.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-card-foreground">Nenhum fornecedor cadastrado</p>
            <p className="text-xs text-muted-foreground mt-1">Adicione seu primeiro fornecedor para começar.</p>
          </div>
          <button onClick={openNew} className="btn-primary">
            <Plus className="h-4 w-4" /> Cadastrar fornecedor
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {fornecedores.map((f) => (
            <FornecedorCard key={f.id} f={f} onEdit={() => openEdit(f)} onDelete={() => handleDelete(f)} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <FornecedorModal
            initial={editing}
            onClose={close}
            onSave={handleSave}
            loading={criar.isPending || editar.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
