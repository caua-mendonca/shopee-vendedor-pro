import { motion } from "framer-motion";
import { Factory, Plus, Mail, Phone } from "lucide-react";

const suppliers = [
  { id: 1, name: "Tech Supply LTDA", contact: "contato@techsupply.com", phone: "(11) 98765-4321", products: 12 },
  { id: 2, name: "Import Express", contact: "vendas@importexpress.com", phone: "(21) 91234-5678", products: 8 },
  { id: 3, name: "Global Accessories", contact: "global@accessories.com", phone: "(31) 99876-5432", products: 15 },
];

export default function Suppliers() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fornecedores</h1>
          <p className="text-sm text-muted-foreground">{suppliers.length} fornecedores cadastrados</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Novo Fornecedor
        </button>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg bg-accent p-2"><Factory className="h-5 w-5 text-primary" /></div>
              <h3 className="font-semibold text-card-foreground">{s.name}</h3>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{s.contact}</div>
              <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{s.phone}</div>
              <p className="mt-2 text-xs">{s.products} produtos associados</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
