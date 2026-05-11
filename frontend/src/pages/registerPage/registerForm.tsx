import FloatingInput from "@/components/ui/forms-inputs/FloatingInput.tsx";
import type { Role } from "@/types/auth.ts";
import { Link } from "react-router-dom";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { LoginFormState } from "@/pages/loginPage/login.tsx";

interface RegisterFormState {
  email: string; first_name: string; last_name: string;
  password: string; phone_number: string;
  role: Role; team_id: string;
}

interface RegisterFormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  form: LoginFormState;
  isLoading: boolean;
  setForm: Dispatch<SetStateAction<LoginFormState>>;
}

export default function RegisterForm({ onSubmit, form, isLoading, setForm } : Readonly<RegisterFormProps>){

  const set = <K extends keyof RegisterFormState>(k: string, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FloatingInput label="Prénom" value={form.first_name} onChange={(v) => set("first_name", v)} autoComplete="given-name"  type="text"/>
        <FloatingInput label="Nom" value={form.last_name} onChange={(v) => set("last_name", v)} autoComplete="family-name" />
      </div>
      <FloatingInput label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} autoComplete="email" />
      <FloatingInput label="Téléphone" type="tel" value={form.phone_number} onChange={(v) => set("phone_number", v)} autoComplete="tel" />
      <FloatingInput label="Mot de passe" type="password" value={form.password} onChange={(v) => set("password", v)} autoComplete="new-password" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="role" className="mb-1 block text-xs font-medium text-slate">Rôle</label>
          <select id="role"
            value={form.role}
            onChange={(e) => set("role", e.target.value as Role)}
            className="w-full rounded-md border border-border bg-white px-2 py-3 text-md outline-none focus:border-blue-accent focus:ring-2 focus:ring-blue-accent/30"
          >
            <option value="ADMINISTRATOR">Administrator</option>
            <option value="MANAGER">Supervisor</option>
            <option value="OBSERVER">Operator</option>
          </select>
        </div>
        <div>
          <label htmlFor="teamId" className="mb-1 block text-xs font-medium text-slate">Choisir l'equipe</label>
          <FloatingInput id="teamId" label="ID d'équipe" type="number" value={form.team_id} onChange={(v) => set("team_id", v)} />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-accent/90 disabled:opacity-60"
      >
        {isLoading ? "Création…" : "Créer mon compte"}
      </button>

      <p className="text-center text-sm text-slate">
        Déjà inscrit ?{" "}
        <Link to="/login" className="font-medium text-blue-accent hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}