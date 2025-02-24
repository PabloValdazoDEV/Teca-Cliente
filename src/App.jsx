import { Route, Routes, Navigate } from "react-router";
import "@/App.css";
import Home from "@/components/Home";
import HomeAuth from "@/components/HomeAuth";
import FormLogin from "@/components/FormLogin";
import FormRegister from "@/components/FormRegister";
import isAuth from "@/API/middleware/isAuth";

const PrivateRoute = ({ element }) => {
  return isAuth() ? element : <Navigate to="/login" />;
};

const PublicRoute = ({ element }) => {
  return !isAuth() ? element : <Navigate to="/home" />;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/">
          <Route path="" element={<Home />} />

          <Route path="login" element={<PublicRoute element={<FormLogin />} />} />

          <Route path="register" element={<PrivateRoute element={<FormRegister />} />} />
          <Route path="home" element={<PrivateRoute element={<HomeAuth />} />} />

          <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
