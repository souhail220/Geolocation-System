import { useNavigate } from "react-router-dom";
import { FormEvent, useState } from "react";
import { useAuthStore } from "@/store/authStore.ts";
import type { Role } from "@/types/auth.ts";
import { Radio, X } from "lucide-react";
import RegisterForm from "@/pages/registerPage/registerForm.tsx";

interface FormState {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  phone_number: string;
  role: Role;
  team_id: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState<FormState>({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    phone_number: "",
    role: "operator",
    team_id: "",
  });
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.email || !form.password || !form.first_name || !form.last_name || !form.team_id) {
      setError("Veuillez renseigner tous les champs obligatoires.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Adresse email invalide.");
      return;
    }
    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    const teamId = parseInt(form.team_id, 10);
    if (Number.isNaN(teamId)) {
      setError("L'identifiant d'équipe doit être un nombre.");
      return;
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const token = `mock.${btoa(form.email)}.${Date.now()}`;
      login(token, {
        id: crypto.randomUUID(),
        email: form.email,
        name: `${form.first_name} ${form.last_name}`.trim(),
        role: form.role,
      });
      console.log(form)
      navigate("/map");
    } catch {
      setError("Échec de l'inscription. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      <div className="hidden md:flex md:w-1/2 flex-col justify-between bg-navy p-10 text-white">
        <div className="flex items-center gap-2">
          <Radio className="h-6 w-6 text-blue-accent" />
          <span className="text-lg font-semibold tracking-tight">RadioGeo</span>
        </div>
        <div className="mx-auto my-12 max-w-md">
          <h1 className="text-3xl font-semibold leading-tight">Créez votre compte</h1>
          <p className="mt-3 text-sm text-white/70">
            Rejoignez la plateforme de géolocalisation radio en temps réel.
          </p>
        </div>
        <p className="text-xs text-white/40">© {new Date().getFullYear()} RadioGeo POC</p>
      </div>

      <div className="flex w-full md:w-1/2 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 md:hidden flex items-center gap-2">
            <Radio className="h-6 w-6 text-blue-accent" />
            <span className="text-lg font-semibold">RadioGeo</span>
          </div>

          <h2 className="text-2xl font-semibold text-foreground">Inscription</h2>
          <p className="mt-1 text-sm text-slate">Créez votre compte opérateur.</p>

          {error && (
            <div className="mt-6 flex items-start justify-between gap-3 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              <span>{error}</span>
              <button onClick={() => setError(null)} aria-label="Fermer">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <RegisterForm form={form} onSubmit={onSubmit} isLoading={loading} setForm={setForm} />
        </div>
      </div>
    </div>
  );
}
