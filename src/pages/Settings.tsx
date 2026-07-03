import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Store,
  Camera,
  Save,
  Percent,
  TrendingUp,
  Bell,
  Mail,
  Lock,
  CheckCircle2,
  AlertTriangle,
  BellRing,
  BellOff,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";

function Section({
  title,
  description,
  children,
  delay = 0,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card-static p-6"
    >
      <div className="mb-5 pb-4 border-b border-border/60">
        <h2 className="text-sm font-semibold text-card-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {children}
    </motion.div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { profile, isLoading, updateProfile, uploadAvatar } = useProfile();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Perfil
  const [fullName, setFullName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Notificações
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  async function handleRequestNotif() {
    if (typeof Notification === "undefined") { toast.error("Seu navegador não suporta notificações."); return; }
    const result = await Notification.requestPermission();
    setNotifPermission(result);
    if (result === "granted") {
      new Notification("Seller Pro", { body: "Alertas de estoque ativados!", icon: "/icons/icon.svg" });
      toast.success("Notificações ativadas!");
    } else {
      toast.error("Permissão negada. Ative manualmente nas configurações do navegador.");
    }
  }

  // Metas mensais
  const [metaPares, setMetaPares] = useState("0");
  const [metaReceita, setMetaReceita] = useState("0");

  // Preferências
  const [commission, setCommission] = useState("14");
  const [margin, setMargin] = useState("30");
  const [alertThreshold, setAlertThreshold] = useState("3");

  // Sync quando perfil carrega
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setStoreName(profile.store_name ?? "");
    setAvatarUrl(profile.avatar_url);
    setCommission(String(profile.shopee_commission));
    setMargin(String(profile.target_margin));
    setAlertThreshold(String(profile.stock_alert_threshold));
    setMetaPares(String(profile.meta_pares_mes));
    setMetaReceita(String(profile.meta_receita_mes));
  }, [profile]);

  async function handleSavePerfil(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({ full_name: fullName || null, store_name: storeName || null });
      toast.success("Perfil atualizado com sucesso.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar perfil.");
    }
  }

  async function handleSavePreferencias(e: React.FormEvent) {
    e.preventDefault();
    const c = parseFloat(commission);
    const m = parseFloat(margin);
    const t = parseInt(alertThreshold, 10);
    if (isNaN(c) || isNaN(m) || isNaN(t)) {
      toast.error("Verifique os valores inseridos.");
      return;
    }
    try {
      await updateProfile.mutateAsync({
        shopee_commission: c,
        target_margin: m,
        stock_alert_threshold: t,
      });
      toast.success("Preferências salvas com sucesso.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar preferências.");
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo de 5 MB.");
      return;
    }
    setAvatarUploading(true);
    try {
      const url = await uploadAvatar.mutateAsync(file);
      setAvatarUrl(url);
      toast.success("Avatar atualizado.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao fazer upload do avatar.");
    } finally {
      setAvatarUploading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent mr-3" />
        Carregando configurações…
      </div>
    );
  }

  const initials = (fullName || user?.email || "U")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-2xl space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie seu perfil e as preferências do sistema
        </p>
      </motion.div>

      {/* ── Perfil ── */}
      <Section title="Perfil" description="Informações da sua conta e loja" delay={0.05}>
        <form onSubmit={handleSavePerfil} className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-primary/10 border-2 border-border flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-primary">{initials}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-lg text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {avatarUploading ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-card-foreground">Foto de perfil</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                JPG, PNG ou WEBP até 5 MB
              </p>
            </div>
          </div>

          {/* Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <User className="h-3.5 w-3.5" /> Nome completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome"
                className="input-pro"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Store className="h-3.5 w-3.5" /> Nome da loja
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Sua loja Shopee"
                className="input-pro"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="btn-primary"
            >
              {updateProfile.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <><Save className="h-4 w-4" /> Salvar perfil</>
              )}
            </button>
          </div>
        </form>
      </Section>

      {/* ── Preferências ── */}
      <Section
        title="Preferências da Calculadora"
        description="Valores padrão pré-carregados na calculadora de preços"
        delay={0.1}
      >
        <form onSubmit={handleSavePreferencias} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Percent className="h-3.5 w-3.5" /> Comissão Shopee padrão
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  className="input-pro pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Geralmente 14% para palmilhas</p>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> Margem alvo padrão
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="99"
                  step="1"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  className="input-pro pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Bell className="h-3.5 w-3.5" /> Alerta de estoque baixo
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="input-pro pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">pares</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Alerta quando numeração ficar abaixo desse valor</p>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl bg-muted/40 border border-border/60 px-4 py-3 flex flex-wrap gap-4">
            {[
              { label: "Comissão", value: `${commission || 0}%`, color: "text-primary" },
              { label: "Margem alvo", value: `${margin || 0}%`, color: "text-success" },
              { label: "Alerta ≤", value: `${alertThreshold || 0} pares`, color: "text-warning" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{item.label}:</span>
                <span className={`text-sm font-semibold tabular-nums ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="btn-primary"
            >
              {updateProfile.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <><Save className="h-4 w-4" /> Salvar preferências</>
              )}
            </button>
          </div>
        </form>
      </Section>

      {/* ── Metas mensais ── */}
      <Section title="Metas Mensais" description="Define metas de pares vendidos e faturamento exibidas no Dashboard" delay={0.12}>
        <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            await updateProfile.mutateAsync({
              meta_pares_mes: parseInt(metaPares) || 0,
              meta_receita_mes: parseFloat(metaReceita) || 0,
            });
            toast.success("Metas salvas!");
          } catch (err: any) { toast.error(err.message); }
        }} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Target className="h-3.5 w-3.5" /> Meta de pares / mês
              </label>
              <div className="relative">
                <input type="number" min="0" value={metaPares} onChange={(e) => setMetaPares(e.target.value)} className="input-pro pr-14" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">pares</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">0 = sem meta de pares</p>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Target className="h-3.5 w-3.5" /> Meta de faturamento / mês
              </label>
              <div className="relative">
                <input type="number" min="0" step="0.01" value={metaReceita} onChange={(e) => setMetaReceita(e.target.value)} className="input-pro pl-8" />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">0 = sem meta de faturamento</p>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={updateProfile.isPending} className="btn-primary">
              {updateProfile.isPending
                ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                : <><Save className="h-4 w-4" /> Salvar metas</>}
            </button>
          </div>
        </form>
      </Section>

      {/* ── Notificações ── */}
      <Section title="Notificações" description="Alertas de estoque baixo no navegador e celular (PWA)" delay={0.13}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${notifPermission === "granted" ? "bg-emerald-500/10" : "bg-muted"}`}>
              {notifPermission === "granted"
                ? <BellRing className="h-5 w-5 text-emerald-500" />
                : <BellOff className="h-5 w-5 text-muted-foreground" />}
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">
                {notifPermission === "granted" ? "Notificações ativas" : notifPermission === "denied" ? "Permissão bloqueada" : "Notificações desativadas"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {notifPermission === "granted"
                  ? "Você receberá alertas quando o estoque ficar baixo."
                  : notifPermission === "denied"
                  ? "Desbloqueie nas configurações do seu navegador."
                  : "Ative para receber alertas de estoque baixo."}
              </p>
            </div>
          </div>
          {notifPermission !== "denied" && notifPermission !== "granted" && (
            <button onClick={handleRequestNotif} className="btn-primary shrink-0">
              <Bell className="h-4 w-4" /> Ativar alertas
            </button>
          )}
          {notifPermission === "granted" && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-500 shrink-0">
              <CheckCircle2 className="h-4 w-4" /> Ativo
            </span>
          )}
        </div>
      </Section>

      {/* ── Conta ── */}
      <Section title="Conta" description="Informações de acesso e segurança" delay={0.15}>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> Email
            </label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="input-pro flex-1 opacity-60 cursor-default"
              />
              {user?.email_confirmed_at ? (
                <div className="flex items-center gap-1.5 text-xs text-success shrink-0">
                  <CheckCircle2 className="h-4 w-4" /> Verificado
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-warning shrink-0">
                  <AlertTriangle className="h-4 w-4" /> Não verificado
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">Senha</p>
                <p className="text-xs text-muted-foreground">Altere sua senha de acesso</p>
              </div>
            </div>
            <Link
              to="/auth/forgot-password"
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Alterar senha
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
