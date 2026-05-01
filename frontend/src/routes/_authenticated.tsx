import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { PermissionGuard } from "@/components/PermissionGuard";
import type { Role } from "@/types/auth";
import { LayoutDashboard, Map as MapIcon, History, Bell, Shield, LogOut, ChevronLeft, ChevronRight, Radio, Menu } from "lucide-react";

type NavItem = {
  to: "/" | "/map" | "/history" | "/alerts" | "/admin";
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  roles?: Role[];
};
const NAV: NavItem[] = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/map", label: "Carte en direct", icon: MapIcon },
  { to: "/history", label: "Historique", icon: History },
  { to: "/alerts", label: "Alertes", icon: Bell },
  { to: "/admin", label: "Administration", icon: Shield, roles: ["admin"] },
];

const ROLE_BADGE: Record<Role, { label: string; cls: string }> = {
  admin: { label: "Admin", cls: "bg-[#DBEAFE] text-[#1E3A5F]" },
  supervisor: { label: "Supervisor", cls: "bg-[#CCFBF1] text-[#134E4A]" },
  operator: { label: "Operator", cls: "bg-[#FEF3C7] text-[#78350F]" },
  viewer: { label: "Viewer", cls: "bg-[#F3F4F6] text-[#1F2937]" },
};

export default function AuthenticatedLayout() {
  const navigate = useNavigate();
  const { user, logout, hydrate, isAuthenticated } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined" && !localStorage.getItem("auth_token")) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const breadcrumb =
    NAV.find((n) => (n.exact ? pathname === n.to : pathname.startsWith(n.to)))?.label ?? "Tableau de bord";

  const sidebarWidth = collapsed ? "w-14" : "w-60";

  return (
    <div className="flex min-h-screen w-full bg-surface text-foreground">
      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${sidebarWidth} fixed inset-y-0 left-0 z-50 flex flex-col bg-navy text-white transition-all duration-200 md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0 w-60" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className={`flex h-14 items-center gap-2 border-b border-white/10 px-4 ${collapsed ? "justify-center px-0" : ""}`}>
          <Radio className="h-5 w-5 text-blue-accent shrink-0" />
          {!collapsed && <span className="font-semibold tracking-tight">RadioGeo</span>}
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const link = (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-blue-accent/15 text-white before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-r before:bg-blue-accent"
                    : "text-white/80 hover:bg-navy-mid hover:text-white"
                } ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
            if (item.roles) {
              return (
                <PermissionGuard key={item.to} roles={item.roles}>
                  {link}
                </PermissionGuard>
              );
            }
            return link;
          })}
        </nav>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden md:flex items-center justify-center gap-2 border-t border-white/10 py-3 text-xs text-white/70 hover:bg-navy-mid hover:text-white"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : (<><ChevronLeft className="h-4 w-4" /> Réduire</>)}
        </button>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center justify-between border-b border-border bg-white px-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden rounded p-1 hover:bg-muted"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <nav className="text-sm text-slate truncate">
              <span className="text-slate">RadioGeo</span>
              <span className="mx-2 text-border">/</span>
              <span className="text-foreground font-medium">{breadcrumb}</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative rounded-full p-2 hover:bg-muted" aria-label="Notifications">
              <Bell className="h-5 w-5 text-slate" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger" />
            </button>

            {user && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-accent text-xs font-semibold text-white">
                  {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className={`mt-0.5 inline-block w-fit rounded-full px-2 py-0.5 text-[10px] font-medium ${ROLE_BADGE[user.role].cls}`}>
                    {ROLE_BADGE[user.role].label}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="rounded p-2 text-slate hover:bg-muted hover:text-danger"
              aria-label="Se déconnecter"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
