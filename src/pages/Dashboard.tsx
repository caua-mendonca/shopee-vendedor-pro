import StatCard from "@/components/StatCard";
import { DollarSign, TrendingUp, ShoppingCart, Package } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";

const monthlyData = [
  { month: "Jan", receita: 12400, custo: 7200 },
  { month: "Fev", receita: 15800, custo: 8900 },
  { month: "Mar", receita: 18200, custo: 9800 },
  { month: "Abr", receita: 21500, custo: 11200 },
  { month: "Mai", receita: 19800, custo: 10500 },
  { month: "Jun", receita: 24600, custo: 12800 },
];

const profitData = monthlyData.map((d) => ({
  month: d.month,
  lucro: d.receita - d.custo,
}));

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral do seu negócio Shopee</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Receita Total" value="R$ 24.600" change="↑ 24.2% vs mês anterior" changeType="positive" icon={DollarSign} index={0} />
        <StatCard title="Custos Totais" value="R$ 12.800" change="↑ 21.9%" changeType="negative" icon={TrendingUp} index={1} />
        <StatCard title="Lucro Líquido" value="R$ 11.800" change="↑ 26.9%" changeType="positive" icon={DollarSign} index={2} />
        <StatCard title="Total Pedidos" value="384" change="↑ 18.5%" changeType="positive" icon={ShoppingCart} index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Receita vs Custo Mensal</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--card-foreground))" }} />
              <Legend />
              <Bar dataKey="receita" name="Receita" fill="hsl(14, 100%, 50%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="custo" name="Custo" fill="hsl(220, 14%, 70%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Evolução do Lucro</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--card-foreground))" }} />
              <Line type="monotone" dataKey="lucro" name="Lucro" stroke="hsl(142, 71%, 45%)" strokeWidth={3} dot={{ r: 5, fill: "hsl(142, 71%, 45%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
