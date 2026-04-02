import { motion } from "framer-motion";
import { Factory, Plus, Mail, Phone, Package } from "lucide-react";

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
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Fornecedores</h1>
          <p className="text-sm text-muted-foreground mt-1">{suppliers.length} fornecedores cadastrados</p>
        </div>
        <button className="btn-primary w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Novo Fornecedor
        </button>
      </motion.div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="card-pro p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Factory className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-card-foreground truncate">{s.name}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Package className="h-3 w-3" />
                  <span>{s.products} produtos</span>
                </div>
              </div>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5 text-muted-foreground min-w-0">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate text-xs sm:text-sm">{s.contact}</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs sm:text-sm">{s.phone}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
