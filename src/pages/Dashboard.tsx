import StatCard from "@/components/StatCard";
import { DollarSign, TrendingUp, ShoppingCart, Target, ArrowUpRight, AlertTriangle, Boxes, Bell } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Legend,
} from "recharts";
import { useEstoqueData } from "@/hooks/useEstoque";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { useProfile } from "@/hooks/useProfile";
import { useProdutos } from "@/hooks/useProdutos";
import { Link } from "react-router-dom";

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

const BRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Dashboard() {
  const { stats } = useEstoqueData();
  const { data: fin } = useFinanceiro();
  const { profile } = useProfile();
  const { alertas: prodAlertas } = useProdutos();

  const threshold = profile?.stock_alert_threshold ?? 3;
  const sizeAlertas = Object.entries(stats.stockMap)
    .filter(([, qty]) => qty > 0 && qty <= threshold)
    .map(([size]) => `Nº ${size}`);
  const totalAlertas = sizeAlertas.length + prodAlertas.length;

  // Notificação de estoque baixo ao abrir o dashboard
  const chartData = fin?.mensal.length ? fin.mensal : monthlyData;
  const hasRealData = (fin?.mensal.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do seu negócio Shopee</p>
      </motion.div>

      {/* Alertas de estoque */}
      {totalAlertas > 0 && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm text-amber-500">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium">Estoque baixo detectado</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {sizeAlertas.map(s => <span key={s} className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-xs font-bold">{s}</span>)}
              {prodAlertas.map(p => <span key={p.id} className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-xs font-bold">{p.nome}</span>)}
            </div>
          </div>
          <Link to="/estoque" className="shrink-0 text-xs font-semibold underline underline-offset-2 hover:text-amber-400 transition-colors">Ver estoque</Link>
        </motion.div>
      )}

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        <StatCard title="Investido em Estoque" value={BRL(stats.totalInvestido || 0)} change={`${stats.totalEstoque} pares disponíveis`} changeType="neutral" icon={Boxes} index={0} />
        <StatCard title="Receita de Vendas" value={BRL(fin?.totalReceita ?? 0)} change={fin?.hasRevenueData ? `${fin.totalVendas} pares vendidos` : "sem dados ainda"} changeType={fin?.hasRevenueData ? "positive" : "neutral"} icon={DollarSign} index={1} />
        <StatCard title="Taxas Shopee" value={BRL(fin?.totalTaxas ?? 0)} changeType="negative" icon={TrendingUp} index={2} />
        <StatCard title="Lucro Líquido" value={BRL(fin?.lucroLiquido ?? 0)} change={fin?.hasRevenueData ? `${fin.margemMedia.toFixed(1)}% margem` : "—"} changeType={(fin?.lucroLiquido ?? 0) >= 0 ? "positive" : "negative"} icon={ShoppingCart} index={3} />
      </div>

      {/* Meta do mês */}
      {((profile?.meta_pares_mes ?? 0) > 0 || (profile?.meta_receita_mes ?? 0) > 0) && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="card-static p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Meta do Mês</h3>
            <span className="ml-auto text-xs text-muted-foreground">{new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" })}</span>
          </div>
          <div className="space-y-5">
            {(profile?.meta_pares_mes ?? 0) > 0 && (() => {
              const atual = fin?.mesAtual.pares ?? 0;
              const meta = profile!.meta_pares_mes;
              const pct = Math.min(100, (atual / meta) * 100);
              const done = atual >= meta;
              return (
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Pares vendidos</span>
                    <span className={`font-semibold tabular-nums ${done ? "text-success" : "text-card-foreground"}`}>
                      {atual} / {meta} pares
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${done ? "bg-success" : "bg-primary"}`}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{pct.toFixed(0)}% da meta{done ? " — Concluída!" : ""}</p>
                </div>
              );
            })()}
            {(profile?.meta_receita_mes ?? 0) > 0 && (() => {
              const atual = fin?.mesAtual.receita ?? 0;
              const meta = profile!.meta_receita_mes;
              const pct = Math.min(100, (atual / meta) * 100);
              const done = atual >= meta;
              return (
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Faturamento</span>
                    <span className={`font-semibold tabular-nums ${done ? "text-success" : "text-card-foreground"}`}>
                      {BRL(atual)} / {BRL(meta)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                      className={`h-full rounded-full ${done ? "bg-success" : "bg-orange-500"}`}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{pct.toFixed(0)}% da meta{done ? " — Concluída!" : ""}</p>
                </div>
              );
            })()}
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-static p-4 sm:p-6">
          <h3 className="mb-1 text-sm font-semibold text-card-foreground">
            {hasRealData ? "Receita vs Custo (real)" : "Receita vs Custo Mensal"}
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">{hasRealData ? "Dados reais do seu estoque" : "Dados ilustrativos — registre vendas para ver dados reais"}</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={hasRealData ? chartData : monthlyData} barGap={2}>
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
            <LineChart data={hasRealData ? chartData.map(d => ({ month: d.mes ?? d.month, lucro: d.lucro })) : profitData}>
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
