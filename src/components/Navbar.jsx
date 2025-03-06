import { Outlet, NavLink } from "react-router";

const pages = [
  { title: "Home", path: "/home" },
  { title: "Clientes", path: "/customers" },
  { title: "Calendario", path: "/date" },
];

const Navbar = () => {
  return (
    <>
      <div className="w-full">
        <div className="sticky top-0 flex justify-center w-full h-20 items-center bg-emerald-400 gap-10">
          {pages.map((page, i) => {
            return (
              <NavLink key={i} to={page.path} className="text-white text-lg">
                {page.title}
              </NavLink>
            );
          })}
        </div>
        <Outlet />
      </div>
    </>
  );
};

export default Navbar;
