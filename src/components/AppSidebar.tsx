import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Factory,
  Calculator,
  ShoppingCart,
  Megaphone,
  DollarSign,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/fornecedores", label: "Fornecedores", icon: Factory },
  { to: "/calculadora", label: "Calculadora", icon: Calculator },
  { to: "/vendas", label: "Vendas", icon: ShoppingCart },
  { to: "/anuncios", label: "Anúncios", icon: Megaphone },
  { to: "/financeiro", label: "Financeiro", icon: DollarSign },
];

interface Props {
  onClose: () => void;
  dark: boolean;
  onToggleTheme: () => void;
}

export default function AppSidebar({ onClose, dark, onToggleTheme }: Props) {
  return (
    <aside className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <ShoppingCart className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">SHOPEE DASHBOARD</span>
        </div>
        <button onClick={onClose} className="lg:hidden text-sidebar-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 pt-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4">
        <button
          onClick={onToggleTheme}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {dark ? "Modo Claro" : "Modo Escuro"}
        </button>
      </div>
    </aside>
  );
}
