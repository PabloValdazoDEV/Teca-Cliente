/* eslint-disable react/prop-types */
import { Route, Routes, Navigate } from "react-router";
// import HomeAuth from "@/components/HomeAuth";
import PageLogin from "@/page/PageLogin";
import { useAuth } from "@/context/AuthContext";
import Navbar from "./components/Navbar";
import PageCustomers from "./page/PageCustomers";
import PageCreateCustomers from "./page/PageCreateCustomers";
import PageEditCustomers from "./page/PageEditCustomers";
import PageHome from "./page/PageHome";
import PageViewDoc from "./page/PageViewDoc";
import PageForgotPassword from "./page/PageForgotPassword";
import PageResetPassword from "./page/PageResetPassword";
import PageProfile from "./page/PageProfile";
import PageEmployees from "./page/PageEmployees";
import PageClinic from "./page/PageClinic";
import PageCustomerDetail from "./page/PageCustomerDetail";
import PageOfficeEditor from "./page/PageOfficeEditor";
import PageSystemStatus from "./page/PageSystemStatus";

const PrivateRoute = ({ element }) => {
  const { loading, user } = useAuth();

  if (loading) {
    return <div className="p-6">Comprobando sesión…</div>;
  }

  return user ? element : <Navigate to="/" replace />;
};

const PublicRoute = ({ element }) => {
  const { loading, user } = useAuth();

  if (loading) {
    return <div className="p-6">Comprobando sesión…</div>;
  }

  return !user ? element : <Navigate to="/home" replace />;
};

const RoleRoute = ({ allowedRoles, element }) => {
  const { loading, user } = useAuth();

  if (loading) {
    return <div className="p-6">Comprobando permisos…</div>;
  }

  return user && allowedRoles.includes(user.role)
    ? element
    : <Navigate to="/home" replace />;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/">
          <Route path="" element={<PublicRoute element={<PageLogin />} />} />
          <Route
            path="forgot-password"
            element={<PublicRoute element={<PageForgotPassword />} />}
          />
          <Route path="reset-password" element={<PageResetPassword />} />
          <Route
            path="office/:docId"
            element={<PrivateRoute element={<PageOfficeEditor />} />}
          />

          <Route element={<Navbar />}>
            <Route
              path="date/create"
              element={<PrivateRoute element={<Navigate to="/home" replace state={{ createAppointment: true }} />} />}
            />
            <Route
              path="home"
              element={<PrivateRoute element={<PageHome />} />}
            />
            <Route
              path="profile"
              element={<PrivateRoute element={<PageProfile />} />}
            />
            <Route
              path="employees"
              element={
                <RoleRoute
                  allowedRoles={["SUPERADMIN", "ADMIN"]}
                  element={<PageEmployees />}
                />
              }
            />
            <Route
              path="clinic"
              element={
                <RoleRoute
                  allowedRoles={["SUPERADMIN", "ADMIN"]}
                  element={<PageClinic />}
                />
              }
            />
            <Route
              path="system"
              element={
                <RoleRoute
                  allowedRoles={["SUPERADMIN", "ADMIN"]}
                  element={<PageSystemStatus />}
                />
              }
            />

            <Route path="customers">
              <Route
                path=""
                element={<PrivateRoute element={<PageCustomers />} />}
              />
              <Route
                path="create"
                element={<PrivateRoute element={<PageCreateCustomers />} />}
              />
              <Route
                path="edit/:id"
                element={<PrivateRoute element={<PageEditCustomers />} />}
              />
              <Route
                path=":id"
                element={<PrivateRoute element={<PageCustomerDetail />} />}
              />
            </Route>
            <Route path="docs">
              <Route
                path="fichas/edit/:id"
                element={<PrivateRoute element={<PageCustomers />} />}
              />
              <Route
                path="fichas/:id"
                element={<PrivateRoute element={<PageViewDoc />} />}
              />
              <Route
                path=":id"
                element={<PrivateRoute element={<PageCustomerDetail />} />}
              />
            </Route>
            <Route
              path="register"
              element={
                <RoleRoute
                  allowedRoles={["SUPERADMIN", "ADMIN"]}
                  element={<Navigate to="/employees" replace />}
                />
              }
            />
          </Route>

          <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
