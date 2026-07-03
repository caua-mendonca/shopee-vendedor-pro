import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import {
  DollarSign, TrendingDown, TrendingUp, ShoppingBag, Info, BarChart2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, AreaChart, Area,
} from "recharts";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { useEstoqueData } from "@/hooks/useEstoque";

const BRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtK = (v: number) => v >= 1000 ? `R$${(v / 1000).toFixed(1)}k` : `R$${v.toFixed(0)}`;

const tooltipStyle = {
  background: "hsl(0 0% 7%)",
  border: "1px solid hsl(0 0% 15%)",
  borderRadius: 10,
  color: "hsl(0 0% 92%)",
  boxShadow: "0 8px 24px -4px rgba(0,0,0,0.5)",
  padding: "10px 14px",
  fontSize: 13,
};

export default function Financial() {
  const { data: fin, isLoading } = useFinanceiro();
  const { stats } = useEstoqueData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
        Carregando dados financeiros…
      </div>
    );
  }

  const d = fin!;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Financeiro</h1>
        <p className="text-sm text-muted-foreground mt-1">P&L real com base no seu estoque e vendas registradas</p>
      </motion.div>

      {/* Aviso quando ainda não há preço de venda registrado */}
      {!d.hasRevenueData && d.totalVendas > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm text-amber-500">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Receita ainda não monitorada</p>
            <p className="text-xs text-amber-500/80 mt-0.5">
              Para calcular o P&L completo, informe o preço de venda ao registrar cada venda em Estoque.
              Vendas sem preço contam apenas como saídas de estoque.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        <StatCard title="Investido em Estoque" value={BRL(d.totalInvestido)} icon={DollarSign} index={0} />
        <StatCard
          title="Receita de Vendas"
          value={BRL(d.totalReceita)}
          change={d.hasRevenueData ? `${d.totalVendas} pares vendidos` : "sem preços registrados"}
          changeType={d.hasRevenueData ? "positive" : "neutral"}
          icon={TrendingUp}
          index={1}
        />
        <StatCard
          title="Taxas Shopee"
          value={BRL(d.totalTaxas)}
          change={d.hasRevenueData ? `sobre R$ ${BRL(d.totalReceita)} receita` : "—"}
          changeType="negative"
          icon={TrendingDown}
          index={2}
        />
        <StatCard
          title="Lucro Líquido"
          value={BRL(d.lucroLiquido)}
          change={d.hasRevenueData ? `${d.margemMedia.toFixed(1)}% margem` : "—"}
          changeType={d.lucroLiquido >= 0 ? "positive" : "negative"}
          icon={ShoppingBag}
          index={3}
        />
      </div>

      {/* Resumo de estoque */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="grid gap-3 grid-cols-3">
        {[
          { label: "Total em estoque", value: `${stats.totalEstoque} pares` },
          { label: "Custo médio/par", value: BRL(d.custoMedio) },
          { label: "Pares vendidos", value: `${d.totalVendas} pares` },
        ].map((item) => (
          <div key={item.label} className="card-pro px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-base font-bold text-card-foreground tabular-nums mt-0.5">{item.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Gráficos */}
      {d.mensal.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="card-static p-4 sm:p-6">
            <h3 className="mb-1 text-sm font-semibold text-card-foreground">Vendas por Mês</h3>
            <p className="mb-4 text-xs text-muted-foreground">Pares vendidos nos últimos meses</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={d.mensal} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" vertical={false} />
                <XAxis dataKey="mes" stroke="hsl(0 0% 40%)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(0 0% 40%)" fontSize={11} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, "Pares"]} />
                <Bar dataKey="vendas" name="Pares vendidos" fill="hsl(14, 100%, 50%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {d.hasRevenueData && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="card-static p-4 sm:p-6">
              <h3 className="mb-1 text-sm font-semibold text-card-foreground">Receita vs Custo</h3>
              <p className="mb-4 text-xs text-muted-foreground">Evolução mensal</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={d.mensal}>
                  <defs>
                    <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(152,69%,40%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(152,69%,40%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="custoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0,70%,55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0,70%,55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" vertical={false} />
                  <XAxis dataKey="mes" stroke="hsl(0 0% 40%)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(0 0% 40%)" fontSize={11} tickFormatter={fmtK} tickLine={false} axisLine={false} width={45} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [BRL(v), name === "receita" ? "Receita" : "Custo"]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="receita" name="receita" stroke="hsl(152,69%,40%)" fill="url(#receitaGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="custo" name="custo" stroke="hsl(0,70%,55%)" fill="url(#custoGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 gap-3 card-static text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <BarChart2 className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-card-foreground">Nenhuma venda registrada ainda</p>
            <p className="text-xs text-muted-foreground mt-1">
              Registre vendas em Estoque → Registrar Venda para ver os gráficos aqui.
            </p>
          </div>
        </motion.div>
      )}

      {/* Ranking por numeração */}
      {d.porNumeracao.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="card-static p-4 sm:p-6">
          <h3 className="mb-1 text-sm font-semibold text-card-foreground">Ranking de Vendas por Numeração</h3>
          <p className="mb-4 text-xs text-muted-foreground">Palmilhas mais vendidas</p>
          <ResponsiveContainer width="100%" height={Math.min(d.porNumeracao.length * 44, 300)}>
            <BarChart data={d.porNumeracao} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" horizontal={false} />
              <XAxis type="number" stroke="hsl(0 0% 40%)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis dataKey="numeracao" type="category" stroke="hsl(0 0% 40%)" fontSize={11} width={32} tickLine={false} axisLine={false} tickFormatter={(v) => `Nº ${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, "Pares"]} />
              <Bar dataKey="quantidade" name="Pares" fill="hsl(14, 100%, 50%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
