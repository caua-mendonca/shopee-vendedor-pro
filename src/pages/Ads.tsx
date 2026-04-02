import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import { Megaphone, DollarSign, Eye, MousePointerClick } from "lucide-react";

const ads = [
  { id: 1, product: "Fone Bluetooth TWS", budget: 150, spent: 128.5, impressions: 12400, clicks: 340, sales: 18, status: "Ativo" },
  { id: 2, product: "Carregador Turbo 65W", budget: 200, spent: 195.0, impressions: 18200, clicks: 520, sales: 24, status: "Ativo" },
  { id: 3, product: "Smartwatch D20", budget: 100, spent: 87.3, impressions: 8600, clicks: 210, sales: 9, status: "Pausado" },
];

export default function Ads() {
  const totalSpent = ads.reduce((a, b) => a + b.spent, 0);
  const totalClicks = ads.reduce((a, b) => a + b.clicks, 0);
  const totalImpressions = ads.reduce((a, b) => a + b.impressions, 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-foreground">Anúncios</h1>
        <p className="text-sm text-muted-foreground">Gestão de campanhas Shopee Ads</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Investimento Total" value={`R$ ${totalSpent.toFixed(2)}`} icon={DollarSign} index={0} />
        <StatCard title="Impressões" value={totalImpressions.toLocaleString()} icon={Eye} index={1} />
        <StatCard title="Cliques" value={totalClicks.toLocaleString()} icon={MousePointerClick} index={2} />
        <StatCard title="CTR Médio" value={`${((totalClicks / totalImpressions) * 100).toFixed(1)}%`} icon={Megaphone} index={3} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produto</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Budget</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Gasto</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Impressões</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Cliques</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Vendas</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {ads.map((a) => (
              <tr key={a.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-card-foreground">{a.product}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">R$ {a.budget.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">R$ {a.spent.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{a.impressions.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{a.clicks}</td>
                <td className="px-4 py-3 text-right font-medium text-card-foreground">{a.sales}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${a.status === "Ativo" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
