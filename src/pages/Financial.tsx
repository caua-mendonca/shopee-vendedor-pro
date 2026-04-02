import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import { DollarSign, TrendingDown, Megaphone, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const profitByProduct = [
  { name: "Fone Bluetooth TWS", lucro: 3830 },
  { name: "Capinha iPhone 15", lucro: 2163 },
  { name: "Carregador Turbo 65W", lucro: 1266 },
];

const expenses = [
  { name: "Custo Produto", value: 4492 },
  { name: "Taxas Shopee", value: 2273 },
  { name: "Anúncios", value: 195 },
  { name: "Lucro", value: 7259 },
];

const COLORS = ["hsl(0, 84%, 60%)", "hsl(38, 92%, 50%)", "hsl(14, 100%, 50%)", "hsl(142, 71%, 45%)"];

const detailData = [
  { produto: "Fone Bluetooth TWS", receita: 7787, custo: 2587, taxas: 1245, ads: 125, lucro: 3830, margem: 49.2 },
  { produto: "Capinha iPhone 15", receita: 3735, custo: 945, taxas: 597, ads: 30, lucro: 2163, margem: 57.9 },
  { produto: "Carregador Turbo 65W", receita: 2697, custo: 960, taxas: 431, ads: 40, lucro: 1266, margem: 46.9 },
];

const totals = {
  receita: detailData.reduce((a, b) => a + b.receita, 0),
  custo: detailData.reduce((a, b) => a + b.custo, 0),
  taxas: detailData.reduce((a, b) => a + b.taxas, 0),
  ads: detailData.reduce((a, b) => a + b.ads, 0),
  lucro: detailData.reduce((a, b) => a + b.lucro, 0),
};

const fmtBRL = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export default function Financial() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
        <p className="text-sm text-muted-foreground">Análise detalhada de receitas e despesas</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Receita Total" value={fmtBRL(totals.receita)} icon={DollarSign} index={0} />
        <StatCard title="Custos + Taxas" value={fmtBRL(totals.custo + totals.taxas)} icon={TrendingDown} index={1} />
        <StatCard title="Investimento Ads" value={fmtBRL(totals.ads)} icon={Megaphone} index={2} />
        <StatCard title="Lucro Líquido" value={fmtBRL(totals.lucro)} change={`${((totals.lucro / totals.receita) * 100).toFixed(1)}% margem`} changeType="positive" icon={TrendingUp} index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Lucro por Produto</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={profitByProduct} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `R$${v}`} />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={120} />
              <Tooltip formatter={(value: number) => [fmtBRL(value), "Lucro"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--card-foreground))" }} />
              <Bar dataKey="lucro" name="Lucro" fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Composição dos Gastos</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={expenses} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={4}>
                {expenses.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [fmtBRL(value)]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--card-foreground))" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Detail Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="overflow-x-auto rounded-xl border border-border bg-card">
        <div className="p-5 pb-0">
          <h3 className="text-base font-semibold text-card-foreground">Detalhamento por Produto</h3>
        </div>
        <table className="w-full text-sm mt-4">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Produto</th>
              <th className="px-5 py-3 text-right font-medium text-muted-foreground">Receita</th>
              <th className="px-5 py-3 text-right font-medium text-muted-foreground">Custo</th>
              <th className="px-5 py-3 text-right font-medium text-muted-foreground">Taxas</th>
              <th className="px-5 py-3 text-right font-medium text-muted-foreground">Ads</th>
              <th className="px-5 py-3 text-right font-medium text-muted-foreground">Lucro</th>
              <th className="px-5 py-3 text-right font-medium text-muted-foreground">Margem</th>
            </tr>
          </thead>
          <tbody>
            {detailData.map((d) => (
              <tr key={d.produto} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3 font-medium text-card-foreground">{d.produto}</td>
                <td className="px-5 py-3 text-right text-success">{fmtBRL(d.receita)}</td>
                <td className="px-5 py-3 text-right text-destructive">{fmtBRL(d.custo)}</td>
                <td className="px-5 py-3 text-right text-destructive">{fmtBRL(d.taxas)}</td>
                <td className="px-5 py-3 text-right text-destructive">{fmtBRL(d.ads)}</td>
                <td className="px-5 py-3 text-right font-semibold text-success">{fmtBRL(d.lucro)}</td>
                <td className="px-5 py-3 text-right font-semibold text-success">{d.margem}%</td>
              </tr>
            ))}
            <tr className="bg-muted/30 font-bold">
              <td className="px-5 py-3 text-card-foreground">TOTAL</td>
              <td className="px-5 py-3 text-right text-success">{fmtBRL(totals.receita)}</td>
              <td className="px-5 py-3 text-right text-destructive">{fmtBRL(totals.custo)}</td>
              <td className="px-5 py-3 text-right text-destructive">{fmtBRL(totals.taxas)}</td>
              <td className="px-5 py-3 text-right text-destructive">{fmtBRL(totals.ads)}</td>
              <td className="px-5 py-3 text-right text-success">{fmtBRL(totals.lucro)}</td>
              <td className="px-5 py-3 text-right text-success">{((totals.lucro / totals.receita) * 100).toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
