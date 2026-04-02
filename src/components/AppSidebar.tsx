import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Factory,
  ShoppingCart,
  Megaphone,
  DollarSign,
  Calculator,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/fornecedores", label: "Fornecedores", icon: Factory },
  { to: "/vendas", label: "Vendas", icon: ShoppingCart },
  { to: "/anuncios", label: "Anúncios", icon: Megaphone },
  { to: "/financeiro", label: "Financeiro", icon: DollarSign },
  { to: "/calculadora", label: "Calculadora", icon: Calculator },
];

export default function AppSidebar({ onClose }: { onClose: () => void }) {
  return (
    <aside className="flex h-full flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <ShoppingCart className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-foreground leading-tight">Shopee Seller</h1>
            <p className="text-[10px] font-medium text-muted-foreground">Dashboard Pro</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden text-sidebar-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )
            }
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <p className="text-[10px] text-muted-foreground text-center">© 2026 Shopee Seller Dashboard</p>
      </div>
    </aside>
  );
}
