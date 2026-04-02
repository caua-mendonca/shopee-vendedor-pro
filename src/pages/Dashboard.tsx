import StatCard from "@/components/StatCard";
import { DollarSign, TrendingUp, ShoppingCart, Target, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";

const monthlyData = [
  { month: "Jan", receita: 12400, custo: 7200 },
  { month: "Fev", receita: 15800, custo: 8900 },
  { month: "Mar", receita: 19200, custo: 9800 },
  { month: "Abr", receita: 16800, custo: 9600 },
  { month: "Mai", receita: 21500, custo: 10500 },
  { month: "Jun", receita: 24600, custo: 12800 },
];

const profitData = monthlyData.map((d) => ({
  month: d.month,
  lucro: d.receita - d.custo,
}));

const ranking = [
  { name: "Fone Bluetooth TWS", vendas: 245, lucro: 3200 },
  { name: "Capinha iPhone 15", vendas: 520, lucro: 2800 },
  { name: "Carregador Turbo 65W", vendas: 180, lucro: 2100 },
  { name: "Película Galaxy S24", vendas: 410, lucro: 1900 },
];

const fmt = (v: number) => `R$${(v / 1000).toFixed(0)}k`;

const chartTooltipStyle = {
  background: "hsl(0 0% 7%)",
  border: "1px solid hsl(0 0% 15%)",
  borderRadius: 10,
  color: "hsl(0 0% 92%)",
  boxShadow: "0 8px 24px -4px rgba(0,0,0,0.5)",
  padding: "10px 14px",
  fontSize: 13,
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do seu negócio Shopee</p>
      </motion.div>

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        <StatCard title="Receita Total" value="R$ 24.600" change="24.2% vs mês anterior" changeType="positive" icon={DollarSign} index={0} />
        <StatCard title="Custos Totais" value="R$ 12.800" change="21.9%" changeType="negative" icon={TrendingUp} index={1} />
        <StatCard title="Lucro Líquido" value="R$ 11.800" change="26.9%" changeType="positive" icon={DollarSign} index={2} />
        <StatCard title="Total Pedidos" value="384" change="18.5%" changeType="positive" icon={ShoppingCart} index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-static p-4 sm:p-6">
          <h3 className="mb-1 text-sm font-semibold text-card-foreground">Receita vs Custo Mensal</h3>
          <p className="mb-4 text-xs text-muted-foreground">Últimos 6 meses</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(0 0% 40%)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(0 0% 40%)" fontSize={11} tickFormatter={fmt} tickLine={false} axisLine={false} width={45} />
              <Tooltip
                formatter={(value: number, name: string) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, name === "receita" ? "Receita" : "Custo"]}
                contentStyle={chartTooltipStyle}
                cursor={{ fill: "hsl(0 0% 15%)", radius: 4 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="receita" name="Receita" fill="hsl(152, 69%, 40%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="custo" name="Custo" fill="hsl(0, 70%, 55%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-static p-4 sm:p-6">
          <h3 className="mb-1 text-sm font-semibold text-card-foreground">Evolução do Lucro</h3>
          <p className="mb-4 text-xs text-muted-foreground">Tendência mensal</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(0 0% 40%)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(0 0% 40%)" fontSize={11} tickFormatter={fmt} tickLine={false} axisLine={false} width={45} />
              <Tooltip
                formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Lucro"]}
                contentStyle={chartTooltipStyle}
              />
              <Line
                type="monotone"
                dataKey="lucro"
                name="Lucro"
                stroke="hsl(14, 100%, 50%)"
                strokeWidth={3}
                dot={{ r: 4, fill: "hsl(14, 100%, 50%)", stroke: "hsl(0 0% 7%)", strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: "hsl(14, 100%, 50%)", strokeWidth: 2, fill: "hsl(0 0% 7%)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Ranking */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card-static p-4 sm:p-6">
        <div className="mb-4 sm:mb-5 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-card-foreground">Ranking de Lucro por Produto</h3>
        </div>
        <div className="space-y-2.5">
          {ranking.map((item, i) => (
            <div key={item.name} className="group flex items-center justify-between rounded-lg border border-border/50 bg-background px-3 py-3 sm:px-5 sm:py-3.5 transition-all hover:border-border hover:bg-muted/30">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs sm:text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-card-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.vendas} vendas</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-xs sm:text-sm font-bold text-success tabular-nums">R$ {item.lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                <ArrowUpRight className="h-4 w-4 text-success opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
