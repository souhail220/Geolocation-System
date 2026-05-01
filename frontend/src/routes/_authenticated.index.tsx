import { useAuthStore } from "@/store/authStore";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const stats = [
    { label: "Capteurs actifs", value: "128", tone: "text-success" },
    { label: "Alertes ouvertes", value: "7", tone: "text-danger" },
    { label: "Couverture", value: "94%", tone: "text-blue-accent" },
    { label: "Latence moyenne", value: "42 ms", tone: "text-warning" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bonjour, {user?.name ?? "Utilisateur"}</h1>
        <p className="text-sm text-slate">Aperçu en temps réel de votre réseau de géolocalisation.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-white p-5">
            <div className="text-xs uppercase tracking-wide text-slate">{s.label}</div>
            <div className={`mt-2 text-3xl font-semibold ${s.tone}`}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-white p-6">
        <h2 className="text-lg font-semibold">Activité récente</h2>
        <p className="mt-1 text-sm text-slate">Aucune activité à afficher pour le moment.</p>
      </div>
    </div>
  );
}
