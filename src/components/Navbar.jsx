import { Outlet, NavLink } from "react-router";
import { tryLogout } from "../API";
import { useAtom } from "jotai";
import modalEditDate from "../context/ModalEditDate";
import CustomerSelet from "../context/CustomerSelet";
import ModalDeleteCustomer from "../context/ModalDeleteCustomer";

const pages = [
  { title: "Home", path: "/home" },
  { title: "Clientes", path: "/customers" },
  { title: "Crear cita", path: "/date/create" },
];

const Navbar = () => {
  const [showModalEdit, setShowModalEdit] = useAtom(modalEditDate);
  const [customerId, setCustomerId] = useAtom(CustomerSelet);
  const [showModalDelete, setShowModalDelete] = useAtom(ModalDeleteCustomer);
  return (
    <>
      <div className="w-full">
        <div className="sticky top-0 flex justify-center w-full h-20 items-center bg-emerald-400 gap-10 z-100">
          {pages.map((page, i) => {
            return (
              <NavLink
                key={i}
                to={page.path}
                onClick={() => {
                  setShowModalEdit(false);
                  setCustomerId("");
                  setShowModalDelete(false);
                }}
                className="text-white text-lg"
              >
                {page.title}
              </NavLink>
            );
          })}
          <NavLink
            to={"/"}
            onClick={() => {
              tryLogout()
              setShowModalEdit(false);
              setCustomerId("");
              setShowModalDelete(false);
            }}
            className="text-white text-lg"
          >
            LogOut
          </NavLink>
        </div>
        <Outlet />
      </div>
    </>
  );
};

export default Navbar;
