import { Outlet, NavLink } from "react-router";
import { tryLogout } from "../API";
import { useAtom } from "jotai";
import modalEditDate from "../context/ModalEditDate";
import CustomerSelet from "../context/CustomerSelet";
import ModalDeleteCustomer from "../context/ModalDeleteCustomer";
import ModalEditFicha from "../context/ModalEditFicha";
import ModalCreateFicha from "../context/ModalCreateFicha";
import ModalDeleteDoc from "../context/ModalDeleteDoc";

const pages = [
  { title: "Home", path: "/home" },
  { title: "Clientes", path: "/customers" },
  { title: "Crear cita", path: "/date/create" },
];

const Navbar = () => {
  const [showModalEdit, setShowModalEdit] = useAtom(modalEditDate);
  const [customerId, setCustomerId] = useAtom(CustomerSelet);
  const [showModalDelete, setShowModalDelete] = useAtom(ModalDeleteCustomer);
  const [showModalCreate, setShowModalCreate] = useAtom(ModalCreateFicha);
  const [showModalEditFicha, setShowModalEditFicha] = useAtom(ModalEditFicha);
  const [showModalDeleteDoc, setShowModalDeleteDoc] = useAtom(ModalDeleteDoc);

  const resetContext = () => {
    setShowModalEdit(false);
    setCustomerId("");
    setShowModalDelete(false);
    setShowModalEditFicha(false);
    setShowModalCreate(false);
    setShowModalDeleteDoc(false);
  };
  return (
    <>
      <div className="w-full">
        <nav className="bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-md h-20 flex items-center justify-center relative z-50 rounded-b-xl">
          {/* Links centrados */}
          <div className="absolute left-0 right-0 flex justify-center gap-8">
            {pages.map((page, i) => (
              <NavLink
                key={i}
                to={page.path}
                onClick={resetContext}
                className={({ isActive }) =>
                  `text-white text-lg font-medium transition-all duration-200 hover:scale-105 hover:text-gray-100 ${
                    isActive ? "underline underline-offset-4" : ""
                  }`
                }
              >
                {page.title}
              </NavLink>
            ))}
          </div>

          {/* Cerrar sesión a la derecha */}
          <div className="absolute right-6">
          <NavLink
            to={"/"}
            onClick={() => {
              tryLogout();
              resetContext();
            }}
            className="inline-block text-white text-lg font-medium transition-transform duration-200 hover:scale-105 hover:text-gray-100"

          >
            Cerrar sesión
          </NavLink>
          </div>
        </nav>

        <Outlet />
      </div>
    </>
  );
};

export default Navbar;
