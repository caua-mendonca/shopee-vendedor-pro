import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Bell, X, AlertTriangle, Package, Boxes, CheckCheck, ChevronRight,
} from "lucide-react";
import { useEstoqueData, SIZES } from "@/hooks/useEstoque";
import { useProdutos } from "@/hooks/useProdutos";
import { useProfile } from "@/hooks/useProfile";

interface Notif {
  id: string;
  tipo: "palmilha" | "produto";
  titulo: string;
  desc: string;
  to: string;
}

function buildNotifs(
  stockMap: Record<number, number>,
  threshold: number,
  alertas: ReturnType<typeof useProdutos>["alertas"],
  dismissed: Set<string>,
): Notif[] {
  const list: Notif[] = [];

  for (const size of SIZES) {
    const qty = stockMap[size] ?? 0;
    if (qty > 0 && qty <= threshold) {
      const id = `palmilha-${size}`;
      if (!dismissed.has(id)) {
        list.push({
          id,
          tipo: "palmilha",
          titulo: `Palmilha Nº ${size} com estoque baixo`,
          desc: `Apenas ${qty} par${qty !== 1 ? "es" : ""} disponível${qty !== 1 ? "is" : ""}`,
          to: "/estoque",
        });
      }
    }
  }

  for (const p of alertas) {
    const id = `produto-${p.id}`;
    if (!dismissed.has(id)) {
      list.push({
        id,
        tipo: "produto",
        titulo: `${p.nome} com estoque baixo`,
        desc: `${p.estoque_atual} ${p.unidade} (mínimo: ${p.estoque_minimo})`,
        to: "/estoque",
      });
    }
  }

  return list;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCountChange: (n: number) => void;
}

export default function NotificationsPanel({ open, onClose, onCountChange }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { stats } = useEstoqueData();
  const { alertas } = useProdutos();
  const { profile } = useProfile();
  const threshold = profile?.stock_alert_threshold ?? 3;

  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("notif_dismissed");
      return new Set(saved ? JSON.parse(saved) : []);
    } catch { return new Set(); }
  });

  const notifs = buildNotifs(stats.stockMap, threshold, alertas, dismissed);

  useEffect(() => { onCountChange(notifs.length); }, [notifs.length]);

  function dismiss(id: string) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("notif_dismissed", JSON.stringify([...next]));
      return next;
    });
  }

  function dismissAll() {
    const ids = notifs.map((n) => n.id);
    setDismissed((prev) => {
      const next = new Set([...prev, ...ids]);
      localStorage.setItem("notif_dismissed", JSON.stringify([...next]));
      return next;
    });
    onClose();
  }

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ type: "spring", damping: 28, stiffness: 350 }}
          className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-foreground" />
              <span className="text-sm font-semibold text-foreground">Notificações</span>
              {notifs.length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {notifs.length}
                </span>
              )}
            </div>
            {notifs.length > 0 && (
              <button onClick={dismissAll}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                <CheckCheck className="h-3.5 w-3.5" /> Marcar todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-card-foreground">Tudo em ordem!</p>
                <p className="text-xs text-muted-foreground">Nenhuma notificação pendente.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {notifs.map((n) => (
                  <div key={n.id} className="group flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${n.tipo === "palmilha" ? "bg-amber-500/10" : "bg-blue-500/10"}`}>
                      {n.tipo === "palmilha"
                        ? <Boxes className="h-4 w-4 text-amber-500" />
                        : <Package className="h-4 w-4 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-card-foreground leading-snug">{n.titulo}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{n.desc}</p>
                      <Link to={n.to} onClick={onClose}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors">
                        Ver estoque <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <button onClick={() => dismiss(n.id)}
                      className="shrink-0 p-1 rounded-md opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifs.length > 0 && (
            <div className="border-t border-border px-4 py-2.5">
              <Link to="/estoque" onClick={onClose}
                className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                Ver todos os alertas de estoque <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
