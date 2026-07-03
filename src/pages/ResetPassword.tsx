import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Eye, EyeOff, TrendingUp, Package, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";

const FEATURES = [
  { icon: TrendingUp,  label: "Vendas em tempo real",  desc: "Dashboard atualizado ao vivo" },
  { icon: Package,     label: "Controle de estoque",   desc: "Por produto, variação e tamanho" },
  { icon: ShieldCheck, label: "Dados seguros",         desc: "Criptografia de ponta a ponta" },
];

function strengthLabel(password: string): { label: string; color: string; width: string } {
  if (password.length === 0) return { label: "", color: "", width: "0%" };
  if (password.length < 6)   return { label: "Muito fraca", color: "bg-destructive", width: "20%" };
  if (password.length < 8)   return { label: "Fraca",       color: "bg-warning",     width: "40%" };
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password))
                             return { label: "Média",        color: "bg-amber-400",   width: "65%" };
  if (password.length < 12) return { label: "Boa",          color: "bg-success",     width: "80%" };
  return                          { label: "Forte",          color: "bg-emerald-400", width: "100%" };
}

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  // Supabase fires PASSWORD_RECOVERY after it parses the hash token
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Also check if session already exists (user landed with valid token)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const strength = strengthLabel(password);
  const match = confirm.length > 0 && password === confirm;
  const mismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    if (password.length < 6)  { setError("A senha deve ter ao menos 6 caracteres."); return; }
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => navigate("/"), 3000);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between px-16 py-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a02] via-background to-background" />
          <div className="absolute top-[-80px] left-[-60px] h-[500px] w-[500px] rounded-full bg-primary/12 blur-[120px]" />
          <div className="absolute top-[30%] left-[20%] h-[300px] w-[300px] rounded-full bg-primary/7 blur-[100px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[140px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
          <span className="text-sm font-semibold tracking-widest text-primary/70 uppercase">Seller Pro</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative z-10 flex-1 flex flex-col justify-center items-center"
        >
          <div className="w-full max-w-[320px]">
            <h1 className="text-[72px] font-bold leading-[1.05] tracking-tight text-foreground">
              Gerencie<br />suas<br />
              <span className="text-primary">vendas.</span>
            </h1>
            <p className="mt-6 text-muted-foreground text-base leading-relaxed max-w-[280px]">
              Tudo que você precisa para vender mais na Shopee em um único painel.
            </p>
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

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="relative z-10 text-xs text-muted-foreground/40">
          © {new Date().getFullYear()} Seller Pro · Todos os direitos reservados
        </motion.p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile brand */}
          <div className="lg:hidden mb-10">
            <span className="text-sm font-semibold tracking-widest text-primary/70 uppercase">Seller Pro</span>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground">
              Gerencie suas<br /><span className="text-primary">vendas.</span>
            </h1>
          </div>

          <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl shadow-black/20 px-8 py-8">
            <AnimatePresence mode="wait">

              {/* Invalid / expired token */}
              {!ready && !done && (
                <motion.div key="invalid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20">
                    <ShieldCheck className="h-7 w-7 text-destructive" />
                  </div>
                  <h3 className="text-base font-semibold text-card-foreground">Link inválido ou expirado</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Este link de redefinição expirou. Solicite um novo.
                  </p>
                  <Link to="/auth/forgot-password" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    Solicitar novo link <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              )}

              {/* Success */}
              {done && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="py-4 text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 border border-success/20">
                    <CheckCircle2 className="h-7 w-7 text-success" />
                  </div>
                  <h3 className="text-base font-semibold text-card-foreground">Senha redefinida</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Sua senha foi atualizada com sucesso. Redirecionando para o painel…
                  </p>
                </motion.div>
              )}

              {/* Form */}
              {ready && !done && (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="mb-7">
                    <h2 className="text-xl font-semibold tracking-tight text-card-foreground">Nova senha</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Escolha uma senha segura para sua conta.</p>
                  </div>

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
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* New password */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Nova senha</label>
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
                      {/* Strength bar */}
                      {password.length > 0 && (
                        <div className="mt-2">
                          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${strength.color}`}
                              initial={{ width: 0 }}
                              animate={{ width: strength.width }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground">{strength.label}</p>
                        </div>
                      )}
                    </div>

                    {/* Confirm password */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Confirmar senha</label>
                      <div className="relative">
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          placeholder="••••••••"
                          required
                          className={`input-pro pr-11 ${mismatch ? "border-destructive/50 focus:border-destructive/70" : match ? "border-success/50 focus:border-success/70" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <AnimatePresence>
                        {mismatch && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-1 text-[11px] text-destructive"
                          >
                            As senhas não coincidem
                          </motion.p>
                        )}
                        {match && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-1 text-[11px] text-success flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Senhas coincidem
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || mismatch || password.length < 6}
                      className="btn-primary w-full py-3 !mt-6 group"
                    >
                      {loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      ) : (
                        <>Redefinir senha <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" /></>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
