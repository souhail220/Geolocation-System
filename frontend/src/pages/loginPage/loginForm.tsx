import type { FormEvent, Dispatch, SetStateAction } from "react";
import FloatingInput from "@/components/ui/forms-inputs/FloatingInput.tsx";
import type { LoginFormState } from "@/pages/loginPage/login.tsx";

interface LoginFormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  form: LoginFormState;
  isLoading: boolean;
  setForm: Dispatch<SetStateAction<LoginFormState>>;
}

const LoginForm = ({ onSubmit, form, isLoading, setForm }: Readonly<LoginFormProps>) => {
  const set = (k: keyof LoginFormState, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <FloatingInput label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} autoComplete="email" />
      <FloatingInput label="Mot de passe" type="password" value={form.password} onChange={(v) => set("password", v)} autoComplete="current-password" />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-accent/90 disabled:opacity-60"
      >
        {isLoading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
};

export default LoginForm;
