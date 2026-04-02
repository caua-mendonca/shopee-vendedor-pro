import { motion } from "framer-motion";
import { useState } from "react";
import { FileText, AlertTriangle, CheckCircle } from "lucide-react";

const products = [
  { name: "Fone Bluetooth TWS", cost: 19.9 },
  { name: "Capinha iPhone 15", cost: 5.0 },
  { name: "Carregador Turbo 65W", cost: 22.0 },
  { name: "Película Galaxy S24", cost: 2.5 },
];

export default function Calculator() {
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [cost, setCost] = useState("19.9");
  const [commission, setCommission] = useState("14");
  const [transactionRate, setTransactionRate] = useState("2");
  const [shippingSubsidy, setShippingSubsidy] = useState("5");
  const [packaging, setPackaging] = useState("2");
  const [otherCosts, setOtherCosts] = useState("0");

  const costNum = parseFloat(cost) || 0;
  const commissionNum = parseFloat(commission) || 0;
  const transactionNum = parseFloat(transactionRate) || 0;
  const shippingNum = parseFloat(shippingSubsidy) || 0;
  const packagingNum = parseFloat(packaging) || 0;
  const otherNum = parseFloat(otherCosts) || 0;

  const totalFeePercent = commissionNum + transactionNum;
  const totalFixedCost = costNum + shippingNum + packagingNum + otherNum;
  const minPrice = totalFixedCost / (1 - totalFeePercent / 100);
  const recommendedPrice = minPrice * 1.22;
  const estimatedProfit = recommendedPrice - totalFixedCost - (recommendedPrice * totalFeePercent / 100);
  const marginPercent = recommendedPrice > 0 ? (estimatedProfit / recommendedPrice) * 100 : 0;

  const handleProductChange = (idx: number) => {
    setSelectedProduct(idx);
    setCost(products[idx].cost.toString());
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-foreground">Calculadora Shopee</h1>
        <p className="text-sm text-muted-foreground">Calcule preços e margens considerando todas as taxas</p>
      </motion.div>

      <select
        value={selectedProduct}
        onChange={(e) => handleProductChange(Number(e.target.value))}
        className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {products.map((p, i) => (
          <option key={i} value={i}>{p.name}</option>
        ))}
      </select>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Custos e Taxas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-3 rounded-xl border border-border bg-card card-gradient p-6">
          <div className="mb-5 flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-base font-semibold text-card-foreground">Custos e Taxas</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Custo de Compra (R$)", value: cost, set: setCost, hint: `Melhor fornecedor: R$ ${products[selectedProduct].cost.toFixed(2).replace(".", ",")}` },
              { label: "Comissão Shopee (%)", value: commission, set: setCommission },
              { label: "Taxa Transação (%)", value: transactionRate, set: setTransactionRate },
              { label: "Subsídio Frete (R$)", value: shippingSubsidy, set: setShippingSubsidy },
              { label: "Embalagem (R$)", value: packaging, set: setPackaging },
              { label: "Outros Custos (R$)", value: otherCosts, set: setOtherCosts },
            ].map(({ label, value, set, hint }) => (
              <div key={label}>
                <label className="mb-1.5 block text-sm font-medium text-card-foreground">{label}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Resultado */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-xl border border-border bg-card card-gradient p-6">
          <h3 className="mb-5 text-base font-semibold text-card-foreground">Resultado</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-card-foreground">Custo Total por Unidade</span>
              <span className="font-semibold text-card-foreground">R$ {totalFixedCost.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Taxas Shopee</span>
              <span className="text-muted-foreground">{totalFeePercent.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-card-foreground">Preço Mínimo (sem prejuízo)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="font-semibold text-card-foreground">R$ {minPrice.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-success/30 bg-success/5 p-4">
              <div className="flex items-center gap-1.5 text-success">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-semibold">Preço Recomendado</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-success">R$ {recommendedPrice.toFixed(2).replace(".", ",")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Lucro estimado de R$ {estimatedProfit.toFixed(2).replace(".", ",")} ({marginPercent.toFixed(1)}% de margem)
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
