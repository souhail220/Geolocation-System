import { useAuthStore } from "@/store/authStore";

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Administration</h1>
      <p className="text-sm text-slate">Connecté en tant que {user?.email}.</p>
      <div className="rounded-lg border border-border bg-white p-6 text-slate">
        Panneau d'administration réservé aux admins.
      </div>
    </div>
  );
}
