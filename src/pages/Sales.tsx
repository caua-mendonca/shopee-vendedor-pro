import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import { ShoppingCart, DollarSign, TrendingUp, Package } from "lucide-react";

const sales = [
  { id: 1, date: "2026-03-28", product: "Fone Bluetooth TWS", qty: 5, price: 89.9, total: 449.5 },
  { id: 2, date: "2026-03-27", product: "Carregador Turbo 65W", qty: 3, price: 129.9, total: 389.7 },
  { id: 3, date: "2026-03-26", product: "Capa iPhone 15 Pro", qty: 12, price: 49.9, total: 598.8 },
  { id: 4, date: "2026-03-25", product: "Smartwatch D20", qty: 4, price: 79.9, total: 319.6 },
  { id: 5, date: "2026-03-24", product: "Película Cerâmica", qty: 20, price: 24.9, total: 498.0 },
];

export default function Sales() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Vendas</h1>
        <p className="text-sm text-muted-foreground mt-1">Histórico de vendas e métricas</p>
      </motion.div>

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        <StatCard title="Unidades Vendidas" value="44" icon={Package} index={0} />
        <StatCard title="Receita Total" value="R$ 2.255,60" icon={DollarSign} index={1} />
        <StatCard title="Custo Total" value="R$ 987,00" icon={TrendingUp} index={2} />
        <StatCard title="Lucro Líquido" value="R$ 1.268,60" change="56.2% margem" changeType="positive" icon={DollarSign} index={3} />
      </div>

      {/* Mobile: card layout / Desktop: table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        {/* Desktop table */}
        <div className="hidden md:block card-static overflow-hidden">
          <table className="table-pro">
            <thead>
              <tr>
                <th>Data</th>
                <th>Produto</th>
                <th className="text-right">Qtd</th>
                <th className="text-right">Preço Unit.</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td className="text-muted-foreground tabular-nums">{new Date(s.date).toLocaleDateString("pt-BR")}</td>
                  <td className="font-medium text-card-foreground">{s.product}</td>
                  <td className="text-right text-muted-foreground tabular-nums">{s.qty}</td>
                  <td className="text-right text-muted-foreground tabular-nums">R$ {s.price.toFixed(2)}</td>
                  <td className="text-right font-semibold text-card-foreground tabular-nums">R$ {s.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {sales.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card-pro p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold text-card-foreground">{s.product}</p>
                <span className="text-sm font-bold text-card-foreground tabular-nums">R$ {s.total.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="tabular-nums">{new Date(s.date).toLocaleDateString("pt-BR")}</span>
                <span className="text-border">•</span>
                <span>{s.qty} un × R$ {s.price.toFixed(2)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
