import { Route, Routes } from "react-router-dom";
import { PublicOnly } from "@/components/auth/PublicOnly";
import { RequireAdmin } from "@/components/auth/RequireAdmin";
import { RequireAuth } from "@/components/auth/RequireAuth";
import NotFound from "@/pages/NotFound";
import AdminPage from "@/routes/_authenticated.admin";
import AlertsPage from "@/routes/_authenticated.alerts";
import HistoryPage from "@/routes/_authenticated.history";
import Dashboard from "@/routes/_authenticated.index";
import MapRoute from "@/routes/_authenticated.map";
import LoginPage from "@/pages/loginPage/login.tsx";
import RegisterPage from "@/pages/registerPage/register.tsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route path="/register"
             element={
               <PublicOnly>
                 <RegisterPage />
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
