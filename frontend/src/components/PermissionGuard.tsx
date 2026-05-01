import type { ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types/auth";

interface Props {
  roles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ roles, children, fallback = null }: Props) {
  const role = useAuthStore((s) => s.role);
  if (!role || !roles.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}
