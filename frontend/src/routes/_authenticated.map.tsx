import { lazy, Suspense } from "react";

const MapPage = lazy(() => import("@/components/map/MapPage"));

export default function MapRoute() {
  return (
    <Suspense fallback={<div className="p-6 text-slate">Chargement de la carte…</div>}>
      <MapPage />
    </Suspense>
  );
}