import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Eye, EyeOff, TrendingUp, Package, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const FEATURES = [
  { icon: TrendingUp,  label: "Vendas em tempo real",    desc: "Dashboard atualizado ao vivo" },
  { icon: Package,     label: "Controle de estoque",     desc: "Por produto, variação e tamanho" },
  { icon: ShieldCheck, label: "Dados seguros",           desc: "Criptografia de ponta a ponta" },
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, store_name: storeName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setSuccess("Conta criada! Verifique seu email para confirmar o cadastro.");
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">

      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between px-16 py-14">

        {/* Gradient mesh */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a02] via-background to-background" />
          <div className="absolute top-[-80px] left-[-60px] h-[500px] w-[500px] rounded-full bg-primary/12 blur-[120px]" />
          <div className="absolute top-[30%] left-[20%] h-[300px] w-[300px] rounded-full bg-primary/7 blur-[100px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[140px]" />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <span className="text-sm font-semibold tracking-widest text-primary/70 uppercase">
            Seller Pro
          </span>
        </motion.div>

        {/* Center content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative z-10 flex-1 flex flex-col justify-center items-center"
        >
          <div className="w-full max-w-[320px]">
          <h1 className="text-[72px] font-bold leading-[1.05] tracking-tight text-foreground">
            Gerencie<br />
            suas<br />
            <span className="text-primary">vendas.</span>
          </h1>
          <p className="mt-6 text-muted-foreground text-base leading-relaxed max-w-[280px]">
            Tudo que você precisa para vender mais na Shopee em um único painel.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          </div>
        </motion.div>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 text-xs text-muted-foreground/40"
        >
          © {new Date().getFullYear()} Seller Pro · Todos os direitos reservados
        </motion.p>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile brand */}
          <div className="lg:hidden mb-10">
            <span className="text-sm font-semibold tracking-widest text-primary/70 uppercase">
              Seller Pro
            </span>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground">
              Gerencie suas<br />
              <span className="text-primary">vendas.</span>
            </h1>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl shadow-black/20 px-8 py-8">

            {/* Heading */}
            <div className="mb-7">
              <h2 className="text-xl font-semibold tracking-tight text-card-foreground">
                {isLogin ? "Bem-vindo de volta" : "Criar sua conta"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isLogin ? "Entre para acessar o painel" : "Preencha os dados abaixo"}
              </p>
            </div>

            {/* Alerts */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 rounded-lg bg-success/8 border border-success/20 px-4 py-3 text-sm text-success"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="signup-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Nome completo
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Seu nome"
                        required
                        className="input-pro"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Nome da loja
                      </label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Sua loja Shopee"
                        className="input-pro"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="input-pro"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Senha</label>
                  {isLogin && (
                    <Link
                      to="/auth/forgot-password"
                      className="text-xs text-muted-foreground/50 hover:text-primary transition-colors"
                    >
                      Esqueceu a senha?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="input-pro pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 !mt-6 group"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    {isLogin ? "Entrar" : "Criar conta"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground/40">ou</span>
              </div>
            </div>

            {/* Switch mode */}
            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                {isLogin ? "Cadastre-se" : "Entrar"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
