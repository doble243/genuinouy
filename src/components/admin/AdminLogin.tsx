import { useState, type FormEvent } from "react";
import { LOGO } from "../../lib/data";

type Status = "loading" | "login" | "denied" | "ready";

interface AdminLoginProps {
  status: Status;
  error?: string;
  busy: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSignIn: () => void;
  onExit: () => void;
}

export function AdminLogin({
  status,
  error,
  busy,
  onEmailChange,
  onPasswordChange,
  onSignIn,
  onExit,
}: AdminLoginProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSignIn();
  };

  return (
    <div className="min-h-screen bg-obsidian text-bone font-sans flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src={LOGO}
            alt="GENUINOS"
            className="h-12 w-auto object-contain"
            style={{
              filter:
                "drop-shadow(0 0 10px rgba(212,168,83,0.5)) drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
            }}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-obsidian-700 p-7 md:p-8 shadow-2xl">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold tracking-widest px-2 py-0.5 rounded border border-gold-500/30 uppercase">
                Acceso Restringido
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-[-0.02em]">
              Panel de Administración
            </h1>
            <p className="text-sm text-smoke mt-1.5">
              Ingresá con tu cuenta de administrador para gestionar la tienda.
            </p>
          </div>

          {status === "denied" ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-100 flex items-start gap-3">
                <svg
                  className="w-5 h-5 shrink-0 text-red-300 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
                  />
                </svg>
                <div>
                  <p className="font-semibold">Permiso denegado</p>
                  <p className="mt-1 text-red-200/80">
                    Ya tenés una sesión iniciada, pero esta cuenta no tiene rol de
                    administrador. Solo los usuarios con rol{" "}
                    <span className="font-semibold text-gold-300">admin</span>{" "}
                    pueden entrar al panel.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onExit}
                className="w-full bg-bone/10 hover:bg-bone/15 text-bone font-bold text-sm py-3 rounded-lg transition-colors"
              >
                Volver a la tienda
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold text-smoke mb-1.5 uppercase tracking-wider"
                >
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="admin@genuinos.com"
                  className="w-full bg-bone/5 border border-white/15 rounded-lg px-3.5 py-3 text-sm text-bone placeholder:text-smoke/60 outline-none focus:border-gold-500/60 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="admin-password"
                    className="text-xs font-semibold text-smoke uppercase tracking-wider"
                  >
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-[11px] text-smoke hover:text-gold-400 transition-colors"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  onChange={(e) => onPasswordChange(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-bone/5 border border-white/15 rounded-lg px-3.5 py-3 text-sm text-bone placeholder:text-smoke/60 focus:border-gold-500/60 transition-colors"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-900/60 bg-red-950/40 px-3.5 py-2.5 text-xs text-red-200 flex items-start gap-2">
                  <svg
                    className="w-4 h-4 shrink-0 text-red-300 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-gold-500 hover:bg-gold-400 text-obsidian font-bold text-sm uppercase tracking-wider py-3.5 rounded-lg shadow-lg shadow-gold-500/10 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none transition-all mt-2 flex items-center justify-center gap-2"
              >
                {busy && (
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3a9 9 0 1 0 9 9"
                    />
                  </svg>
                )}
                {busy ? "Verificando…" : "Ingresar"}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={onExit}
              className="text-xs text-smoke hover:text-bone transition-colors inline-flex items-center gap-1.5"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
              Volver a la tienda
            </button>
            <span className="text-[10px] text-smoke/70 uppercase tracking-widest">
              Super Admin
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}