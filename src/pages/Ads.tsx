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
        <p className="text-sm text-muted-foreground mt-1">Gestão de campanhas Shopee Ads</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Investimento Total" value={`R$ ${totalSpent.toFixed(2)}`} icon={DollarSign} index={0} />
        <StatCard title="Impressões" value={totalImpressions.toLocaleString()} icon={Eye} index={1} />
        <StatCard title="Cliques" value={totalClicks.toLocaleString()} icon={MousePointerClick} index={2} />
        <StatCard title="CTR Médio" value={`${((totalClicks / totalImpressions) * 100).toFixed(1)}%`} icon={Megaphone} index={3} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-static overflow-hidden">
        <table className="table-pro">
          <thead>
            <tr>
              <th>Produto</th>
              <th className="text-right">Budget</th>
              <th className="text-right">Gasto</th>
              <th className="text-right">Impressões</th>
              <th className="text-right">Cliques</th>
              <th className="text-right">Vendas</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {ads.map((a) => (
              <tr key={a.id}>
                <td className="font-medium text-card-foreground">{a.product}</td>
                <td className="text-right text-muted-foreground tabular-nums">R$ {a.budget.toFixed(2)}</td>
                <td className="text-right text-muted-foreground tabular-nums">R$ {a.spent.toFixed(2)}</td>
                <td className="text-right text-muted-foreground tabular-nums">{a.impressions.toLocaleString()}</td>
                <td className="text-right text-muted-foreground tabular-nums">{a.clicks}</td>
                <td className="text-right font-semibold text-card-foreground tabular-nums">{a.sales}</td>
                <td className="text-center">
                  <span className={`badge ${a.status === "Ativo" ? "badge-success" : "badge-warning"}`}>
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
