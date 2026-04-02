import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import { DollarSign, TrendingDown, Megaphone, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const profitByProduct = [
  { name: "Fone TWS", lucro: 2890 },
  { name: "Carregador 65W", lucro: 2460 },
  { name: "Capa iPhone", lucro: 2244 },
  { name: "Smartwatch D20", lucro: 2076 },
  { name: "Película", lucro: 1990 },
];

const expenses = [
  { name: "Custo Produto", value: 12800 },
  { name: "Taxas Shopee", value: 3200 },
  { name: "Anúncios", value: 1850 },
  { name: "Lucro", value: 6750 },
];

const COLORS = ["hsl(14, 100%, 50%)", "hsl(38, 92%, 50%)", "hsl(220, 14%, 70%)", "hsl(142, 71%, 45%)"];

export default function Financial() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-foreground">Relatório Financeiro</h1>
        <p className="text-sm text-muted-foreground">Análise detalhada de receitas e despesas</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Receita Total" value="R$ 24.600" icon={DollarSign} index={0} />
        <StatCard title="Custos + Taxas" value="R$ 16.000" icon={TrendingDown} index={1} />
        <StatCard title="Investimento Ads" value="R$ 1.850" icon={Megaphone} index={2} />
        <StatCard title="Lucro Líquido" value="R$ 6.750" change="27.4% margem" changeType="positive" icon={TrendingUp} index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Lucro por Produto</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={profitByProduct} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--card-foreground))" }} />
              <Bar dataKey="lucro" name="Lucro" fill="hsl(14, 100%, 50%)" radius={[0, 4, 4, 0]} />
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
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--card-foreground))" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
