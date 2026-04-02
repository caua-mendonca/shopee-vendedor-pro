import { motion } from "framer-motion";
import { useState } from "react";
import { Calculator as CalcIcon } from "lucide-react";

export default function Calculator() {
  const [cost, setCost] = useState("");
  const [margin, setMargin] = useState("30");
  const [shopeeRate, setShopeeRate] = useState("12");
  const [adsCost, setAdsCost] = useState("0");

  const costNum = parseFloat(cost) || 0;
  const marginNum = parseFloat(margin) || 0;
  const rateNum = parseFloat(shopeeRate) || 0;
  const adsNum = parseFloat(adsCost) || 0;

  const idealPrice = costNum > 0 ? (costNum + adsNum) / (1 - (marginNum + rateNum) / 100) : 0;
  const profit = idealPrice - costNum - (idealPrice * rateNum) / 100 - adsNum;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-foreground">Calculadora de Precificação</h1>
        <p className="text-sm text-muted-foreground">Calcule o preço ideal para seus produtos</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="mx-auto max-w-lg rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-accent p-2.5"><CalcIcon className="h-5 w-5 text-primary" /></div>
          <h3 className="text-lg font-semibold text-card-foreground">Simulação de Preço</h3>
        </div>

        <div className="space-y-4">
          {[
            { label: "Custo do Produto (R$)", value: cost, set: setCost, placeholder: "Ex: 32.00" },
            { label: "Margem Desejada (%)", value: margin, set: setMargin, placeholder: "Ex: 30" },
            { label: "Taxa Shopee (%)", value: shopeeRate, set: setShopeeRate, placeholder: "Ex: 12" },
            { label: "Custo de Ads (R$)", value: adsCost, set: setAdsCost, placeholder: "Ex: 5.00" },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label}>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">{label}</label>
              <input
                type="number"
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
        </div>

        {costNum > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 rounded-lg bg-accent p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Preço Ideal</p>
                <p className="text-xl font-bold text-primary">R$ {idealPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lucro Estimado</p>
                <p className="text-xl font-bold text-success">R$ {profit.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
