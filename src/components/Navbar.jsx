import { Outlet, NavLink } from "react-router";
import { tryLogout } from "../API";

const pages = [
  { title: "Home", path: "/home" },
  { title: "Clientes", path: "/customers" },
  { title: "Crear cita", path: "/date/create" },
];

const Navbar = () => {
  return (
    <>
      <div className="w-full">
        <div className="sticky top-0 flex justify-center w-full h-20 items-center bg-emerald-400 gap-10 z-100">
          {pages.map((page, i) => {
            return (
              <NavLink key={i} to={page.path} className="text-white text-lg">
                {page.title}
              </NavLink>
            );
          })}
          <NavLink to={"/"} onClick={tryLogout} className="text-white text-lg">
          LogOut
              </NavLink>
        </div>
        <Outlet />
      </div>
    </>
  );
};

export default Navbar;
