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
      <div className=" top-0 relative flex justify-center items-center w-full h-20 bg-emerald-400 z-100">
  {/* Links centrados */}
  <div className="flex gap-10">
    {pages.map((page, i) => (
      <NavLink
        key={i}
        to={page.path}
        onClick={resetContext}
        className="text-white text-lg transition-transform duration-200 hover:scale-105"
      >
        {page.title}
      </NavLink>
    ))}
  </div>

  {/* Cerrar sesión a la derecha */}
  <NavLink
    to={"/"}
    onClick={ ()=>{
      tryLogout()
      resetContext()
    }}
    className="absolute right-10 text-white text-lg transition-transform duration-200 hover:scale-105"
  >
    Cerrar sesión
  </NavLink>
</div>

        <Outlet />
      </div>
    </>
  );
};

export default Navbar;
