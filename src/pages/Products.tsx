import { motion } from "framer-motion";
import { Package, Search, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

const products = [
  { id: 1, name: "Fone Bluetooth TWS", sku: "FBT-001", category: "Eletrônicos", price: 25.9, status: "ativo" },
  { id: 2, name: "Capinha iPhone 15", sku: "CIP-002", category: "Acessórios", price: 8.5, status: "ativo" },
  { id: 3, name: "Carregador Turbo 65W", sku: "CT6-003", category: "Eletrônicos", price: 32.0, status: "ativo" },
  { id: 4, name: "Película Galaxy S24", sku: "PGS-004", category: "Acessórios", price: 3.2, status: "inativo" },
];

const categories = ["Todas Categorias", "Eletrônicos", "Acessórios"];

export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas Categorias");

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Todas Categorias" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} produtos cadastrados</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Novo Produto
        </button>
      </motion.div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou SKU..."
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-card-foreground">{p.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{p.sku}</span>
                  <span>•</span>
                  <span>{p.category}</span>
                  <span className={`ml-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${p.status === "ativo" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-card-foreground">R$ {p.price.toFixed(2).replace(".", ",")}</span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <button className="hover:text-foreground transition-colors"><Eye className="h-4 w-4" /></button>
                <button className="hover:text-foreground transition-colors"><Pencil className="h-4 w-4" /></button>
                <button className="hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
