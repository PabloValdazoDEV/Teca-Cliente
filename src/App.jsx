import { Route, Routes, Navigate } from "react-router";
// import HomeAuth from "@/components/HomeAuth";
import PageLogin from "@/page/PageLogin";
import FormRegister from "@/components/FormRegister";
import isAuth from "@/API/middleware/isAuth";
import PageCreateDate from "./page/PageCreateDate";
import Navbar from "./components/Navbar";
import PageCustomers from "./page/PageCustomers";
import PageCreateCustomers from "./page/PageCreateCustomers";
import PageEditCustomers from "./page/PageEditCustomers";
import PageHome from "./page/PageHome";

const PrivateRoute = ({ element }) => {
  return isAuth() ? element : <Navigate to="/" />;
};

const PublicRoute = ({ element }) => {
  return !isAuth() ? element : <Navigate to="/home" />;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/">
          <Route path="" element={<PublicRoute element={<PageLogin />} />} />

          <Route element={<Navbar />}>
            <Route
              path="date/create"
              element={<PrivateRoute element={<PageCreateDate />} />}
            />
            <Route
              path="home"
              element={<PrivateRoute element={<PageHome />} />}
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
            </Route>
            <Route
              path="register"
              element={<PrivateRoute element={<FormRegister />} />}
            />
          </Route>

          <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
