import { useAtom } from "jotai";
import { useNavigate } from "react-router";
import ModalDeleteCustomer from "../context/ModalDeleteCustomer";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deteleCustomeRelation, getCustomerDate } from "../API";
import DeleteCustomer from "../context/DeleteCustomer";

const Tablet = ({ data }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModalDelete, setShowModalDelete] = useAtom(ModalDeleteCustomer);
  const [dataCustomer, setDataCustomer] = useState(null);
  const [modalDateCustomer, setModalDateCustomer] = useState(false);
  const [isDeleteCustomer, setIsDeleteCustomer] = useAtom(DeleteCustomer);

  const isEvent = (num) => {
    if (Number.isInteger(num / 2)) {
      return true;
    }
    return false;
  };

  const mutation = useMutation({
    mutationFn: async (id) => {
      return deteleCustomeRelation(id);
    },
    onSuccess: () => {
      setModalDateCustomer(false);

    },
  });
  

  const { data: datefindCustomer } = useQuery({
    queryKey: ["findDateCustomer", dataCustomer?.id],
    queryFn: async () => {
      if (!dataCustomer.id) return null;
      return getCustomerDate(dataCustomer.id);
    },
    enabled: !!dataCustomer,
  });

  const findDateCustomer = (id) => {
    const customer = data.find((c) => c.id === id);
    setDataCustomer(customer);
  };

  function formatCustomDate(dateString) {
    const date = new Date(dateString.replace(" ", "T"));

    const dayOfWeek = date.toLocaleDateString("es-ES", { weekday: "long" });
    const day = date.getDate();
    const month = date.toLocaleDateString("es-ES", { month: "long" });
    const hour = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${dayOfWeek}, ${day} de ${month}, ${hour}:${minutes}`;
  }
if(data?.length === 0){
  return (<h2>No se han encontrado coincidencias</h2>)
}
  return (
    <>
      <div className="overflow-hidden rounded-lg shadow-lg w-full">
        <table className="w-full bg-white">
          <thead className="bg-emerald-500 text-white">
            <tr className="text-left">
              <th className="p-5">Nombre</th>
              <th className="p-5">Edad</th>
              <th className="p-5">Teléfono</th>
              <th className="p-5">Comunicación</th>
              <th className="p-5">Otros Teléfono</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          
          <tbody>
            {data.map((customer, i) => (
              <tr
                key={customer.id}
                className={`text-left border-solid border-1 w-full border-gray-200 ${
                  isEvent(i) ? "bg-gray-300" : "bg-gray-200"
                }`}
              >
                <td className="px-5 py-3">{customer.fullName}</td>
                <td className="px-5 py-3">{customer.age}</td>
                <td className="px-5 py-3">{customer.phones.map((phone) => {
                    if (phone.isCommunicationPhone == true) {
                      return (`${phone.countryCode} ${phone.phoneNumber}`);
                    }
                  })}</td>
                <td className="px-5 py-3">{customer.preferredCommunication}</td>
                <td className="px-5 py-3">
                  {customer.phones.map((phone,i) => {
                    return (
                      <div key={i}>
                        {phone.countryCode} {phone.phoneNumber} <br />
                      </div>
                    );
                  })}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => console.log("Ver fichas")}
                    className="bg-emerald-500 text-white px-4 py-2 rounded cursor-pointer  transition-transform duration-200 hover:scale-105"
                  >
                    Ver fichas
                  </button>
                </td>
                <td className="p-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/customers/edit/${customer.id}`);
                      console.log("Editar");
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer  transition-transform duration-200 hover:scale-105"
                  >
                    Editar
                  </button>
                </td>
                <td className="p-2">
                  <button
                    onClick={() => {
                      //   setDataCustomer(customer);
                      findDateCustomer(customer.id);
                      setShowModalDelete(true);
                      //   deleteSubmit(customer);

                      //   mutation.mutate(customer.id)
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer  transition-transform duration-200 hover:scale-105"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {showModalDelete && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
         <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
           <h2 className="text-xl font-bold mb-4 text-red-500">⚠️ Eliminar cliente</h2>
           <p className="text-gray-800 mb-4">
             Estás a punto de eliminar todos los datos asociados como fichas, documentos y citas pasadas del paciente <strong className="text-black">{dataCustomer.fullName}</strong>.
           </p>
           <p className="text-red-500 font-medium">
             Esta acción es irreversible. Una vez eliminados, los datos no podrán recuperarse.
           </p>
           <p className="mt-4 font-semibold">
             ¿Estás seguro de que deseas continuar?
           </p>
       
           <div className="flex justify-center gap-5 mt-6">
             <button
               onClick={() => {
                 setShowModalDelete(false);
                 setDataCustomer(null);
               }}
               className="bg-gray-500 text-white px-4 py-2 rounded transition-transform duration-200 hover:scale-105"
             >
               Cancelar
             </button>
       
             {datefindCustomer?.length ? (
               <button
                 onClick={() => {
                   setShowModalDelete(false);
                   setModalDateCustomer(true);
                   setIsDeleteCustomer(true)
                 }}
                  className="bg-red-500 text-white px-4 py-2 rounded transition-transform duration-200 hover:scale-105"
               >
                 Confirmar eliminación
               </button>
             ) : (
               <button
                 onClick={() => {
                   setShowModalDelete(false);
                   setIsDeleteCustomer(true)
                   mutation.mutate(dataCustomer.id);
                 }}
                 className="bg-red-500 text-white px-4 py-2 rounded transition-transform duration-200 hover:scale-105"
               >
                 Confirmar eliminación
               </button>
             )}
           </div>
         </div>
       </div>
       
       
        )}

        {modalDateCustomer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h3 className="text-xl font-semibold mb-3">
              El cliente <strong>{dataCustomer.fullName}</strong> tiene{" "}
              <strong>{datefindCustomer.length}</strong> citas programadas:
            </h3>
            <ul className="mt-2">
              {datefindCustomer.map((date) => (
                <li
                  key={date.id}
                  className="p-2 border-b border-gray-200 flex items-center gap-2"
                >
                  📅 {formatCustomDate(date.citaDate)}
                </li>
              ))}
            </ul>
            <p className="text-red-500 mt-2">
              ⚠️ Esta acción es irreversible. Una vez eliminado, no podrás recuperar la información.
            </p>
            <div className="flex justify-center gap-5 mt-4">
              <button
                onClick={() => {
                  setModalDateCustomer(false);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded transition-transform duration-200 hover:scale-105"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setModalDateCustomer(false);
                  mutation.mutate(dataCustomer.id);
                  setIsDeleteCustomer(true)
                }}
                className="bg-red-500 text-white px-4 py-2 rounded transition-transform duration-200 hover:scale-105"
              >
                Confirmar eliminación
              </button>
            </div>
          </div>
        </div>
        
        )}
      </div>
    </>
  );
};

export default Tablet;
