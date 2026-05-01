import { useNavigate } from "react-router-dom";
import { FormEvent, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types/auth";
import { Radio, X } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("operator");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Veuillez renseigner votre email et votre mot de passe.");
      return;
    }
    setLoading(true);
    try {
      // Mock auth — accept any credentials
      await new Promise((r) => setTimeout(r, 400));
      const name = email.split("@")[0].replace(/\W+/g, " ").trim() || "Utilisateur";
      const token = `mock.${btoa(email)}.${Date.now()}`;
      login(token, {
        id: crypto.randomUUID(),
        email,
        name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
        role,
      });
      navigate("/map");
    } catch {
      setError("Échec de la connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Brand panel */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between bg-navy p-10 text-white">
        <div className="flex items-center gap-2">
          <Radio className="h-6 w-6 text-blue-accent" />
          <span className="text-lg font-semibold tracking-tight">RadioGeo</span>
        </div>

        <div className="mx-auto my-12 max-w-md">
          <svg viewBox="0 0 240 240" className="mx-auto h-56 w-56 text-blue-accent/80" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M120 200 L90 60 L150 60 Z" />
            <line x1="100" y1="120" x2="140" y2="120" />
            <line x1="105" y1="160" x2="135" y2="160" />
            <circle cx="120" cy="50" r="4" fill="currentColor" />
            <path d="M70 50 Q120 0 170 50" opacity="0.6" />
            <path d="M55 60 Q120 -15 185 60" opacity="0.35" />
            <path d="M40 70 Q120 -30 200 70" opacity="0.2" />
          </svg>
          <h1 className="text-3xl font-semibold leading-tight">Géolocalisation radio en temps réel</h1>
          <p className="mt-3 text-sm text-white/70">
            Surveillez, analysez et intervenez avec une plateforme conçue pour les opérations critiques.
          </p>
        </div>

        <p className="text-xs text-white/40">© {new Date().getFullYear()} RadioGeo POC</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden flex items-center gap-2">
            <Radio className="h-6 w-6 text-blue-accent" />
            <span className="text-lg font-semibold">RadioGeo</span>
          </div>

          <h2 className="text-2xl font-semibold text-foreground">Connexion</h2>
          <p className="mt-1 text-sm text-slate">Accédez à votre espace de supervision.</p>

          {error && (
            <div className="mt-6 flex items-start justify-between gap-3 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              <span>{error}</span>
              <button onClick={() => setError(null)} aria-label="Fermer">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <FloatingInput label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
            <FloatingInput label="Mot de passe" type="password" value={password} onChange={setPassword} autoComplete="current-password" />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-accent/90 disabled:opacity-60"
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function FloatingInput({ label, type, value, onChange, autoComplete }: Readonly<{
  type: string,
  value: string,
  onChange: (v: string) => void,
  autoComplete?: string,
  label?: string
}>) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder=" "
        className="peer w-full rounded-md border border-border bg-white px-3 pt-5 pb-2 text-sm outline-none transition-colors focus:border-blue-accent focus:ring-2 focus:ring-blue-accent/30"
      />
      <label className="pointer-events-none absolute left-3 top-1.5 text-[11px] font-medium text-slate transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-blue-accent">
        {label}
      </label>
    </div>
  );
}
