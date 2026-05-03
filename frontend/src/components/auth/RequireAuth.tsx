import { Navigate } from "react-router-dom";
import AuthenticatedLayout from "@/routes/_authenticated";
import { hasStoredAuthToken } from "@/lib/authStorage";

export function RequireAuth() {
  if (!hasStoredAuthToken()) {
    return <Navigate to="/login" replace />;
  }

  return <AuthenticatedLayout />;
}
