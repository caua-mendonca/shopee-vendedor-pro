import { NavLink, useNavigate } from "react-router-dom";
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
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

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
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <aside className="flex h-full flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <ShoppingCart className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Shopee</span>
            <p className="text-[10px] font-medium text-muted-foreground -mt-0.5">Seller Dashboard</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden rounded-md p-1 text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Section label */}
      <div className="px-5 pt-2 pb-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Menu</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "group flex items-center justify-between rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {label}
                </div>
                {!isActive && (
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User & Actions */}
      <div className="border-t border-sidebar-border divider-glow p-3 space-y-1">
        {user && (
          <div className="px-3 py-2 mb-1">
            <p className="text-[11px] font-medium text-sidebar-foreground/80 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={onToggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {dark ? "Modo Claro" : "Modo Escuro"}
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-destructive/60 hover:bg-destructive/8 hover:text-destructive transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
