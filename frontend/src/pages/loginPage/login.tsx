import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore.ts";
import { Radio, X } from "lucide-react";
import LoginForm from "@/pages/loginPage/loginForm.tsx";
import { LoginApi } from "@/services/authentication/authService.tsx";
import { ApiResponseUser } from "@/types/authTypes/authResponse.ts";
import type { User } from "@/types/auth.ts";

export interface LoginFormState {
  email: string;
  password: string;
}

function normalizeLoginUser(data: User, emailFallback: string): User {
  const responseUser = data.result ?? data.message;
  const email = responseUser?.email ?? emailFallback;

  return {
    id: String(responseUser?.id ?? crypto.randomUUID()),
    email,
    firstname: responseUser?.firstName?.trim(),
    lastname: responseUser?.firstName?.trim(),
    role: responseUser?.role ?? "OBSERVER",
  };
}

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.email || !form.password) {
      setError("Veuillez renseigner votre email et votre mot de passe.");
      return;
    }
    setLoading(true);
    try {
      const data : ApiResponseUser = await LoginApi(form.email, form.password);

      if (!data.token) {
        throw new Error("Missing login token");
      }

      login(data.token, normalizeLoginUser(data.result, form.email));
      navigate("/");
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

          <LoginForm onSubmit={onSubmit} isLoading={loading} form={form} setForm={setForm} />
          <p className="mt-3 text-center text-sm text-slate">
            Pas encore de compte ?{" "}
            <Link to="/register" className="font-medium text-blue-accent hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
