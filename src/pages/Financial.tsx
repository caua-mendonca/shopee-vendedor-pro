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

const COLORS = ["hsl(0, 70%, 55%)", "hsl(38, 92%, 50%)", "hsl(14, 100%, 50%)", "hsl(152, 69%, 40%)"];

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

const chartTooltipStyle = {
  background: "hsl(0 0% 7%)",
  border: "1px solid hsl(0 0% 15%)",
  borderRadius: 10,
  color: "hsl(0 0% 92%)",
  boxShadow: "0 8px 24px -4px rgba(0,0,0,0.5)",
  padding: "10px 14px",
  fontSize: 13,
};

export default function Financial() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Financeiro</h1>
        <p className="text-sm text-muted-foreground mt-1">Análise detalhada de receitas e despesas</p>
      </motion.div>

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        <StatCard title="Receita Total" value={fmtBRL(totals.receita)} icon={DollarSign} index={0} />
        <StatCard title="Custos + Taxas" value={fmtBRL(totals.custo + totals.taxas)} icon={TrendingDown} index={1} />
        <StatCard title="Investimento Ads" value={fmtBRL(totals.ads)} icon={Megaphone} index={2} />
        <StatCard title="Lucro Líquido" value={fmtBRL(totals.lucro)} change={`${((totals.lucro / totals.receita) * 100).toFixed(1)}% margem`} changeType="positive" icon={TrendingUp} index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-static p-4 sm:p-6">
          <h3 className="mb-1 text-sm font-semibold text-card-foreground">Lucro por Produto</h3>
          <p className="mb-4 text-xs text-muted-foreground">Comparativo entre produtos</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={profitByProduct} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" horizontal={false} />
              <XAxis type="number" stroke="hsl(0 0% 40%)" fontSize={11} tickFormatter={(v) => `R$${v}`} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="hsl(0 0% 40%)" fontSize={10} width={100} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value: number) => [fmtBRL(value), "Lucro"]} contentStyle={chartTooltipStyle} />
              <Bar dataKey="lucro" name="Lucro" fill="hsl(152, 69%, 40%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-static p-4 sm:p-6">
          <h3 className="mb-1 text-sm font-semibold text-card-foreground">Composição dos Gastos</h3>
          <p className="mb-4 text-xs text-muted-foreground">Distribuição percentual</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={expenses} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3} strokeWidth={0}>
                {expenses.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [fmtBRL(value)]} contentStyle={chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Detail — Desktop table / Mobile cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="hidden md:block card-static overflow-hidden">
          <div className="p-6 pb-0">
            <h3 className="text-sm font-semibold text-card-foreground">Detalhamento por Produto</h3>
            <p className="text-xs text-muted-foreground mt-1">Breakdown completo de receitas e custos</p>
          </div>
          <table className="table-pro mt-4">
            <thead>
              <tr>
                <th>Produto</th>
                <th className="text-right">Receita</th>
                <th className="text-right">Custo</th>
                <th className="text-right">Taxas</th>
                <th className="text-right">Ads</th>
                <th className="text-right">Lucro</th>
                <th className="text-right">Margem</th>
              </tr>
            </thead>
            <tbody>
              {detailData.map((d) => (
                <tr key={d.produto}>
                  <td className="font-medium text-card-foreground">{d.produto}</td>
                  <td className="text-right text-success tabular-nums">{fmtBRL(d.receita)}</td>
                  <td className="text-right text-destructive tabular-nums">{fmtBRL(d.custo)}</td>
                  <td className="text-right text-destructive tabular-nums">{fmtBRL(d.taxas)}</td>
                  <td className="text-right text-destructive tabular-nums">{fmtBRL(d.ads)}</td>
                  <td className="text-right font-semibold text-success tabular-nums">{fmtBRL(d.lucro)}</td>
                  <td className="text-right">
                    <span className="badge badge-success">{d.margem}%</span>
                  </td>
                </tr>
              ))}
              <tr className="!border-t-2 !border-border font-bold">
                <td className="text-card-foreground">TOTAL</td>
                <td className="text-right text-success tabular-nums">{fmtBRL(totals.receita)}</td>
                <td className="text-right text-destructive tabular-nums">{fmtBRL(totals.custo)}</td>
                <td className="text-right text-destructive tabular-nums">{fmtBRL(totals.taxas)}</td>
                <td className="text-right text-destructive tabular-nums">{fmtBRL(totals.ads)}</td>
                <td className="text-right text-success tabular-nums">{fmtBRL(totals.lucro)}</td>
                <td className="text-right">
                  <span className="badge badge-success">{((totals.lucro / totals.receita) * 100).toFixed(1)}%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-card-foreground">Detalhamento por Produto</h3>
            <p className="text-xs text-muted-foreground mt-1">Breakdown completo</p>
          </div>
          {detailData.map((d, i) => (
            <motion.div key={d.produto} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card-pro p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-card-foreground">{d.produto}</p>
                <span className="badge badge-success">{d.margem}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between rounded-lg bg-muted/30 px-3 py-2">
                  <span className="text-muted-foreground">Receita</span>
                  <span className="font-medium text-success tabular-nums">{fmtBRL(d.receita)}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-muted/30 px-3 py-2">
                  <span className="text-muted-foreground">Custo</span>
                  <span className="font-medium text-destructive tabular-nums">{fmtBRL(d.custo)}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-muted/30 px-3 py-2">
                  <span className="text-muted-foreground">Taxas</span>
                  <span className="font-medium text-destructive tabular-nums">{fmtBRL(d.taxas)}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-muted/30 px-3 py-2">
                  <span className="text-muted-foreground">Lucro</span>
                  <span className="font-bold text-success tabular-nums">{fmtBRL(d.lucro)}</span>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Total card */}
          <div className="card-pro-accent p-4">
            <p className="text-sm font-bold text-card-foreground mb-3">TOTAL</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between rounded-lg bg-muted/30 px-3 py-2">
                <span className="text-muted-foreground">Receita</span>
                <span className="font-bold text-success tabular-nums">{fmtBRL(totals.receita)}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-muted/30 px-3 py-2">
                <span className="text-muted-foreground">Lucro</span>
                <span className="font-bold text-success tabular-nums">{fmtBRL(totals.lucro)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
