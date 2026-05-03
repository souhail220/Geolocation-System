import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getStoredUserRole } from "@/lib/authStorage";
import { useAuthStore } from "@/store/authStore";

export function RequireAdmin({ children }: Readonly<{ children: ReactNode }>) {
  const role = useAuthStore((s) => s.role);
  const storedRole = getStoredUserRole();

  if ((role ?? storedRole) !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
