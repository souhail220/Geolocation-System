import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { hasStoredAuthToken } from "@/lib/authStorage";

export function PublicOnly({ children }: Readonly<{ children: ReactNode }>) {
  if (hasStoredAuthToken()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
