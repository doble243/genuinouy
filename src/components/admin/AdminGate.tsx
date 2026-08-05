import { useEffect, useRef, useState } from "react";
import { getAuthUser, hasAdminRole, signInAdmin } from "../../lib/auth";
import { AdminPanel } from "./AdminPanel";
import { AdminLogin } from "./AdminLogin";

type GateStatus = "loading" | "login" | "denied" | "ready";

export function AdminGate({ onExitAdmin }: { onExitAdmin: () => void }) {
  const [status, setStatus] = useState<GateStatus>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Al entrar al panel: si ya hay sesión, validar rol; si no, mostrar login.
  useEffect(() => {
    let cancelled = false;

    async function checkExistingSession() {
      try {
        const user = await getAuthUser();
        if (!user) {
          if (!cancelled) setStatus("login");
          return;
        }
        const admin = await hasAdminRole(user.id);
        if (!cancelled) setStatus(admin ? "ready" : "denied");
      } catch {
        if (!cancelled) setStatus("login");
      }
    }

    checkExistingSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSignIn = async () => {
    if (busy) return;
    setBusy(true);
    setError(undefined);

    const result = await signInAdmin(email.trim(), password);

    if (mounted.current) {
      setBusy(false);
      if (result.ok) {
        setStatus("ready");
      } else {
        setStatus("login");
        setError(result.error || "Error al iniciar sesión.");
      }
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-obsidian text-bone flex flex-col items-center justify-center gap-4">
        <div className="h-9 w-9 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
        <p className="text-xs text-smoke uppercase tracking-widest">
          Verificando sesión…
        </p>
      </div>
    );
  }

  if (status === "ready") {
    return <AdminPanel onExitAdmin={onExitAdmin} />;
  }

  return (
    <AdminLogin
      status={status}
      error={error}
      busy={busy}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSignIn={handleSignIn}
      onExit={onExitAdmin}
    />
  );
}