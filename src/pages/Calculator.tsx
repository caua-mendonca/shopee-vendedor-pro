import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Calculator as CalcIcon,
  Sparkles,
  Info,
  TrendingUp,
} from "lucide-react";
import { useEstoqueData } from "@/hooks/useEstoque";
import { useProfile } from "@/hooks/useProfile";

const BRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Calculator() {
  const { stats, isLoading } = useEstoqueData();
  const { profile } = useProfile();

  const [useRealCost, setUseRealCost] = useState(true);
  const [cost, setCost] = useState("");
  const [commission, setCommission] = useState("14");
  const [transactionRate, setTransactionRate] = useState("2");
  const [shippingSubsidy, setShippingSubsidy] = useState("5");
  const [packaging, setPackaging] = useState("2");
  const [otherCosts, setOtherCosts] = useState("0");
  const [desiredMargin, setDesiredMargin] = useState("30");

  // Sync defaults from profile preferences
  useEffect(() => {
    if (!profile) return;
    setCommission(String(profile.shopee_commission));
    setDesiredMargin(String(profile.target_margin));
  }, [profile]);

  // Sync real cost from stock whenever toggle or data changes
  useEffect(() => {
    if (useRealCost && stats.custoMedioPorPar > 0) {
      setCost(stats.custoMedioPorPar.toFixed(2));
    }
  }, [useRealCost, stats.custoMedioPorPar]);

  const costNum        = parseFloat(cost)          || 0;
  const commissionNum  = parseFloat(commission)    || 0;
  const transactionNum = parseFloat(transactionRate) || 0;
  const shippingNum    = parseFloat(shippingSubsidy) || 0;
  const packagingNum   = parseFloat(packaging)     || 0;
  const otherNum       = parseFloat(otherCosts)    || 0;
  const marginNum      = parseFloat(desiredMargin) || 0;

  const totalFeePercent = commissionNum + transactionNum;
  const totalFixedCost  = costNum + shippingNum + packagingNum + otherNum;
  const divisor         = 1 - totalFeePercent / 100 - marginNum / 100;

  // Price that yields exactly the desired margin after Shopee fees
  const recommendedPrice = divisor > 0 ? totalFixedCost / divisor : 0;
  const minPrice         = totalFeePercent < 100
    ? totalFixedCost / (1 - totalFeePercent / 100) : 0;
  const estimatedProfit  = recommendedPrice > 0
    ? recommendedPrice - totalFixedCost - (recommendedPrice * totalFeePercent / 100) : 0;
  const realMargin       = recommendedPrice > 0
    ? (estimatedProfit / recommendedPrice) * 100 : 0;

  const isViable = divisor > 0 && recommendedPrice > 0;

  // Quick comparison: 3 margin scenarios
  const scenarios = [20, 30, 40].map((m) => {
    const d = 1 - totalFeePercent / 100 - m / 100;
    const price = d > 0 ? totalFixedCost / d : 0;
    const profit = price - totalFixedCost - price * totalFeePercent / 100;
    return { margin: m, price, profit };
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          Calculadora de Preço
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Precifique com base no seu custo real e defina sua margem ideal
        </p>
      </motion.div>

      {/* Real cost toggle */}
      {stats.custoMedioPorPar > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Custo médio real do estoque:{" "}
                <span className="font-bold text-primary">
                  {BRL(stats.custoMedioPorPar)}
                </span>{" "}
                / par
              </p>
              <p className="text-xs text-muted-foreground">
                Calculado a partir de {stats.totalComprado} pares em{" "}
                {BRL(stats.totalInvestido)} investidos
              </p>
            </div>
          </div>
          <button
            onClick={() => setUseRealCost((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              useRealCost ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                useRealCost ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </motion.div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Carregando custo do estoque…
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 card-static p-5 sm:p-6"
        >
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-card-foreground">
              Custos e Taxas
            </h3>
          </div>

          <div className="grid gap-4 grid-cols-2">
            {/* Custo */}
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Custo por par (R$)
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => {
                  setUseRealCost(false);
                  setCost(e.target.value);
                }}
                placeholder="0,00"
                className="input-pro"
              />
              {useRealCost && stats.custoMedioPorPar > 0 && (
                <p className="mt-1 text-[11px] text-primary/70 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Usando custo real do estoque
                </p>
              )}
            </div>

            {/* Margem desejada */}
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Margem desejada (%)
              </label>
              <input
                type="number"
                value={desiredMargin}
                onChange={(e) => setDesiredMargin(e.target.value)}
                placeholder="30"
                className="input-pro"
              />
            </div>

            {/* Comissão */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Comissão Shopee (%)
              </label>
              <input
                type="number"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="input-pro"
              />
            </div>

            {/* Taxa transação */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Taxa transação (%)
              </label>
              <input
                type="number"
                value={transactionRate}
                onChange={(e) => setTransactionRate(e.target.value)}
                className="input-pro"
              />
            </div>

            {/* Frete */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Subsídio frete (R$)
              </label>
              <input
                type="number"
                value={shippingSubsidy}
                onChange={(e) => setShippingSubsidy(e.target.value)}
                className="input-pro"
              />
            </div>

            {/* Embalagem */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Embalagem (R$)
              </label>
              <input
                type="number"
                value={packaging}
                onChange={(e) => setPackaging(e.target.value)}
                className="input-pro"
              />
            </div>

            {/* Outros */}
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Outros custos (R$)
              </label>
              <input
                type="number"
                value={otherCosts}
                onChange={(e) => setOtherCosts(e.target.value)}
                className="input-pro"
              />
            </div>
          </div>

          {/* Info row */}
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              Taxas Shopee ({totalFeePercent.toFixed(1)}%) são descontadas do preço de venda.
              O preço recomendado garante exatamente a margem desejada após todos os descontos.
            </span>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="card-static p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <CalcIcon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-card-foreground">Resultado</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Custo total / par</span>
                <span className="font-medium text-card-foreground tabular-nums">
                  {BRL(totalFixedCost)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxas Shopee</span>
                <span className="text-muted-foreground tabular-nums">
                  {totalFeePercent.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Preço mínimo (sem lucro)</span>
                <span className="flex items-center gap-1.5 text-warning tabular-nums font-medium">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {BRL(minPrice)}
                </span>
              </div>

              <div className="h-px bg-border/60" />

              {isViable ? (
                <div className="rounded-xl border border-success/20 bg-success/5 p-4">
                  <div className="flex items-center gap-2 text-success mb-3">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Preço Recomendado
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-success tabular-nums">
                    {BRL(recommendedPrice)}
                  </p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Lucro líquido:{" "}
                      <span className="font-semibold text-success">
                        {BRL(estimatedProfit)}
                      </span>{" "}
                      / par
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Margem real:{" "}
                      <span className="font-semibold text-success">
                        {realMargin.toFixed(1)}%
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4 mb-1" />
                  A margem + taxas superam 100%. Reduza a margem ou os custos.
                </div>
              )}
            </div>
          </div>

          {/* Cenários comparativos */}
          {totalFixedCost > 0 && (
            <div className="card-static p-5">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-card-foreground">
                  Cenários de Margem
                </h3>
              </div>
              <div className="space-y-2">
                {scenarios.map((s) => (
                  <div
                    key={s.margin}
                    onClick={() => setDesiredMargin(String(s.margin))}
                    className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 transition-colors ${
                      String(s.margin) === desiredMargin
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-muted/40 hover:bg-muted/70"
                    }`}
                  >
                    <span className="text-sm font-medium text-card-foreground">
                      {s.margin}% de margem
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-card-foreground tabular-nums">
                        {BRL(s.price)}
                      </p>
                      <p className="text-[11px] text-muted-foreground tabular-nums">
                        +{BRL(s.profit)} / par
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
