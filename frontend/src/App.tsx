import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AuthenticatedLayout from "./routes/_authenticated";
import Dashboard from "./routes/_authenticated.index";
import MapRoute from "./routes/_authenticated.map";
import HistoryPage from "./routes/_authenticated.history";
import AlertsPage from "./routes/_authenticated.alerts";
import AdminPage from "./routes/_authenticated.admin";
import LoginPage from "./routes/login";
import { useAuthStore } from "@/store/authStore";

function getStoredRole() {
  if (globalThis.window === "undefined") return null;
  const rawUser = localStorage.getItem("auth_user");
  if (!rawUser) return null;
  try {
    return JSON.parse(rawUser).role;
  } catch {
    return null;
  }
}

function RequireAuth() {
  const hasStoredToken = globalThis.window !== "undefined" && Boolean(localStorage.getItem("auth_token"));

  if (!hasStoredToken) {
    return <Navigate to="/login" replace />;
  }

  return <AuthenticatedLayout />;
}

function RequireAdmin({ children }: Readonly<{ children: ReactNode }>) {
  const role = useAuthStore((s) => s.role);
  const storedRole = getStoredRole();

  if ((role ?? storedRole) !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function PublicOnly({ children }: Readonly<{ children: ReactNode }>) {
  const hasStoredToken = globalThis.window !== "undefined" && Boolean(localStorage.getItem("auth_token"));
  if (hasStoredToken) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route element={<RequireAuth />}>
        <Route index element={<Dashboard />} />
        <Route path="map" element={<MapRoute />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route
          path="admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
