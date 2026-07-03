import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import SearchModal from "./SearchModal";
import NotificationsPanel from "./NotificationsPanel";
import { useState, useEffect, useRef } from "react";
import { Menu, Bell, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/produtos": "Produtos",
  "/fornecedores": "Fornecedores",
  "/vendas": "Vendas",
  "/anuncios": "Anúncios",
  "/financeiro": "Financeiro",
  "/calculadora": "Calculadora",
  "/estoque": "Estoque",
  "/configuracoes": "Configurações",
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light") return false;
      document.documentElement.classList.add("dark");
      return true;
    }
    return true;
  });

  const toggleTheme = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  // Ctrl+K / Cmd+K abre busca
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
        setNotifOpen(false);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const pageTitle = pageTitles[location.pathname] ?? "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className={`fixed inset-y-0 left-0 z-40 w-60 transform transition-transform duration-200 lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <AppSidebar onClose={() => setSidebarOpen(false)} dark={dark} onToggleTheme={toggleTheme} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b border-border divider-glow bg-card/80 backdrop-blur-md px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden rounded-lg p-1.5 text-foreground hover:bg-muted transition-colors">
            <Menu className="h-5 w-5" />
          </button>

          <h2 className="text-sm font-semibold text-foreground hidden lg:block">{pageTitle}</h2>

          <div className="flex-1" />

          {/* Barra de busca hint — desktop */}
          <button
            onClick={() => { setSearchOpen(true); setNotifOpen(false); }}
            className="hidden sm:flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-all w-44"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-left">Buscar…</span>
            <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[10px]">⌃K</kbd>
          </button>

          <div className="flex items-center gap-1">
            {/* Botão busca — mobile */}
            <button
              onClick={() => { setSearchOpen(true); setNotifOpen(false); }}
              className="sm:hidden rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Botão notificações */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => { setNotifOpen((v) => !v); setSearchOpen(false); }}
                className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Bell className="h-4 w-4" />
                {notifCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>

              <NotificationsPanel
                open={notifOpen}
                onClose={() => setNotifOpen(false)}
                onCountChange={setNotifCount}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
