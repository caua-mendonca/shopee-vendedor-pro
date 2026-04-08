import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, User, Store, ArrowRight, Eye, EyeOff, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import shopeeLogo from "@/assets/shopee-logo.png";

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
      {/* Left side — branding panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
      {/* Warm amber/orange gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a1508] via-background to-background" />
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-[#ee4d2d]/15 blur-[120px]" />
        <div className="absolute top-[50px] left-1/3 w-[400px] h-[400px] rounded-full bg-[#c0392b]/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#ee4d2d]/5 blur-[80px]" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 flex flex-col items-center gap-8 px-12 text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl scale-150" />
            <img src={shopeeLogo} alt="Shopee" className="relative h-28 w-28 rounded-3xl shadow-2xl shadow-primary/30" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-foreground">Seller Dashboard</h2>
            <p className="text-muted-foreground text-lg max-w-sm leading-relaxed">
              Gerencie suas vendas, produtos e anúncios em um só lugar.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="mt-4 grid gap-3 w-full max-w-xs text-left">
            {[
              "📊 Dashboard em tempo real",
              "📦 Gestão de produtos e estoque",
              "📈 Análise de anúncios e ROI",
              "💰 Calculadora de preços Shopee",
            ].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 rounded-xl bg-card/50 border border-border/50 px-4 py-3 text-sm text-muted-foreground backdrop-blur-sm"
              >
                {feature}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side — form */}
      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
        {/* Subtle glow on mobile */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden lg:hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[500px] rounded-full bg-[#ee4d2d]/10 blur-[100px]" />
          <div className="absolute top-[-50px] left-1/3 h-[300px] w-[300px] rounded-full bg-[#c0392b]/8 blur-[80px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center gap-4 mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl scale-150" />
              <img src={shopeeLogo} alt="Shopee" className="relative h-16 w-16 rounded-2xl shadow-xl shadow-primary/20" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-foreground">Seller Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Gerencie suas vendas Shopee</p>
            </div>
          </div>

          {/* Form card */}
          <div className="card-pro-accent rounded-2xl p-6 sm:p-8">
            <div className="mb-6 hidden lg:block">
              <h1 className="text-2xl font-bold text-foreground">
                {isLogin ? "Bem-vindo de volta" : "Criar conta"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                {isLogin ? "Entre com suas credenciais para continuar" : "Preencha os dados para criar sua conta"}
              </p>
            </div>

            <div className="mb-6 lg:hidden text-center">
              <h2 className="text-lg font-bold text-foreground">
                {isLogin ? "Entrar na sua conta" : "Criar sua conta"}
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="mb-4 rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

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
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome Completo</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome completo" required className="input-pro pl-11" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome da Loja</label>
                      <div className="relative">
                        <Store className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                        <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Nome da sua loja Shopee" className="input-pro pl-11" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className="input-pro pl-11" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Senha</label>
                  {isLogin && (
                    <button type="button" className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    className="input-pro pl-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-sm font-semibold mt-2 group"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    {isLogin ? "Entrar" : "Criar Conta"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground/60 uppercase tracking-wider">ou</span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                {isLogin ? "Cadastre-se gratuitamente" : "Fazer login"}
              </button>
            </p>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-muted-foreground/50">
            Ao continuar, você concorda com os Termos de Uso e Política de Privacidade.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
