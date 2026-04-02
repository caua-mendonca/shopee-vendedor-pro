import { motion } from "framer-motion";
import { Package, Search, Plus } from "lucide-react";

const products = [
  { id: 1, name: "Fone Bluetooth TWS", sku: "FB-001", category: "Eletrônicos", price: 89.9, cost: 32.0, status: "Ativo" },
  { id: 2, name: "Capa iPhone 15 Pro", sku: "CI-002", category: "Acessórios", price: 49.9, cost: 12.5, status: "Ativo" },
  { id: 3, name: "Carregador Turbo 65W", sku: "CT-003", category: "Eletrônicos", price: 129.9, cost: 48.0, status: "Ativo" },
  { id: 4, name: "Película Cerâmica", sku: "PC-004", category: "Acessórios", price: 24.9, cost: 5.0, status: "Inativo" },
  { id: 5, name: "Smartwatch D20", sku: "SW-005", category: "Eletrônicos", price: 79.9, cost: 28.0, status: "Ativo" },
];

export default function Products() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="text-sm text-muted-foreground">{products.length} produtos cadastrados</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Novo Produto
        </button>
      </motion.div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Buscar produto ou SKU..." className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produto</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">SKU</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoria</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Custo</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Preço</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-card-foreground">{p.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.sku}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">R$ {p.cost.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-medium text-card-foreground">R$ {p.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.status === "Ativo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
