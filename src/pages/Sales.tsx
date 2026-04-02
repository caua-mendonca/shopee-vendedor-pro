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
        <h1 className="text-2xl font-bold text-foreground">Vendas</h1>
        <p className="text-sm text-muted-foreground">Histórico de vendas e métricas</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Unidades Vendidas" value="44" icon={Package} index={0} />
        <StatCard title="Receita Total" value="R$ 2.255,60" icon={DollarSign} index={1} />
        <StatCard title="Custo Total" value="R$ 987,00" icon={TrendingUp} index={2} />
        <StatCard title="Lucro Líquido" value="R$ 1.268,60" change="↑ 56.2% margem" changeType="positive" icon={DollarSign} index={3} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produto</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Qtd</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Preço Unit.</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 text-muted-foreground">{new Date(s.date).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3 font-medium text-card-foreground">{s.product}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{s.qty}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">R$ {s.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-medium text-card-foreground">R$ {s.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
