import { useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DeleteDoc, DeleteFciha, getAllFcihas } from "../API";
import PageCreateDoc from "./PageCreateDoc";
import { useAtom } from "jotai";
import ModalCreateFicha from "../context/ModalCreateFicha";
import ModalEditFicha from "../context/ModalEditFicha";
import { useQueryClient } from "@tanstack/react-query";
import PageEditDoc from "./PageEditDoc";
import ModalDeleteDoc from "../context/ModalDeleteDoc";

const PageViewDoc = () => {
  const queryClient = useQueryClient();
  const [showModalCreate, setShowModalCreate] = useAtom(ModalCreateFicha);
  const [showModalEdit, setShowModalEdit] = useAtom(ModalEditFicha);
  const [showModalDelete, setShowModalDelete] = useAtom(ModalDeleteDoc)

  const navigate = useNavigate();
  const { id: docId } = useParams();
  const [registroSelected, setRegistroSelected] = useState({})

  function formatCustomDate(dateString) {
    const date = new Date(dateString.replace(" ", "T"));

    const dayOfWeek = date.toLocaleDateString("es-ES", { weekday: "long" });
    const day = date.getDate();
    const month = date.toLocaleDateString("es-ES", { month: "long" });
    const hour = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${dayOfWeek}, ${day} de ${month}, ${hour}:${minutes}`;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["getAllFcihas", docId],
    queryFn: () => {
      return getAllFcihas(docId);
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
 
      DeleteFciha(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (data) => {
      DeleteDoc(data)
    },
    onSuccess: () => {
      setShowModalDelete(false);
      navigate(-1)
    },
  });
  


  useEffect(() => {
    queryClient.invalidateQueries();
  }, [showModalCreate, showModalEdit]);

  if (isLoading) {
    return <h1>Cargando</h1>;
  }
  if (error) {
    return <h1>Error</h1>;
  }
  if (data) {

    return (
      <div className="flex justify-center items-center flex-col w-6xl mx-auto gap-5 bg-gray-100 mt-10 p-5 rounded-lg shadow-lg">
        <div className="flex flex-row gap-5 justify-between w-full">
          <h3 className="text-xl font-normal mb-5">
            Fichas asociados al <b>{data.customer.fullName}</b>
          </h3>
          <div className="flex flex-row gap-5">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowModalCreate(true);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              Agregar nuevo registro
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowModalDelete(true)
              }}
              className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              Eliminar Ficha
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate(-1);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              Volver
            </button>
            
          </div>
        </div>
        {data.fichas.map((ficha) => {
   
          return (
            <div
              key={ficha.id}
              className="flex flex-col w-full gap-5 items-center"
            >
              <div className="flex flex-col w-full items-start">
                <p>Fecha: {formatCustomDate(ficha.date.citaDate)}</p>
                <p>
                  Observaciones:{" "}
                  {ficha.observations
                    ? ficha.observations
                    : "No tiene observaciones"}
                </p>
                <p>
                  Tratamiento:{" "}
                  {ficha.treatmentPlan
                    ? ficha.treatmentPlan
                    : "No tiene tratamiento"}
                </p>
              </div>

              <table className="w-full bg-white h-40">
                <thead>
                  <tr className="bg-gray-300 text-left">
                    <th
                      className="border border-black px-2 py-1 text-sm w-1/7"
                      colSpan="2"
                    >
                      PELVIS
                    </th>
                    <th
                      className="border border-black px-2 py-1 text-sm w-1/7"
                      colSpan="2"
                    >
                      COLUMNA
                    </th>
                    <th
                      className="border border-black px-2 py-1 text-sm w-1/7"
                      colSpan="2"
                    >
                      CLAVÍCULA
                    </th>
                    <th
                      className="border border-black px-2 py-1 text-sm w-1/7"
                      colSpan="2"
                    >
                      RODILLA
                    </th>
                    <th className="border border-black px-2 py-1 text-sm w-1/7">
                      F.S.
                    </th>
                    <th className="border border-black px-2 py-1 text-sm w-1/7">
                      E.S
                    </th>
                    <th
                      className="border border-black px-2 py-1 text-sm w-1/7"
                      colSpan="2"
                    >
                      CERVICALES
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-left">
                    <td className="border border-black px-2 pb-1 text-xs">
                      LFX:
                    </td>
                    <td className="border border-black px-2 text-xs bg-emerald-50 w-40">

                      {ficha.bodyAssessments.map((part) => {
                        if (
                          part.bodyPart == "PELVIS" &&
                          part.subBodyPart == "LFX"
                        ) {

                          return part.description;
                        }
                      })}
                    </td>
                    <td className="border border-black px-2 pb-1 text-xs">
                      F:
                    </td>
                    <td className="border border-black px-2 text-xs bg-emerald-50 w-40">

                      {ficha.bodyAssessments.map((part) => {
                        if (
                          part.bodyPart == "COLUMNA" &&
                          part.subBodyPart == "F"
                        ) {

                          return part.description;
                        }
                      })}
                    </td>
                    <td className="border border-black px-2 pb-1 text-xs">
                      H:
                    </td>
                    <td className="border border-black px-2 text-xs bg-emerald-50 w-40">
                      {ficha.bodyAssessments.map((part) => {
                        if (
                          part.bodyPart == "CLAVICULA" &&
                          part.subBodyPart == "H"
                        ) {

                          return part.description;
                        }
                      })}
                    </td>
                    <td className="border border-black px-2 pb-1 text-xs">
                      H:
                    </td>
                    <td className="border border-black px-2 text-xs bg-emerald-50 w-40">
                      {ficha.bodyAssessments.map((part) => {
                        if (
                          part.bodyPart == "RODILLA" &&
                          part.subBodyPart == "H"
                        ) {

                          return part.description;
                        }
                      })}
                    </td>
                    <td
                      rowSpan="3"
                      className="border border-black px-2 text-xs bg-emerald-50 w-40"
                    >
                    
                          {ficha.bodyAssessments.map((part) => {
                        if (
                          part.bodyPart == "FS" &&
                          part.subBodyPart == "OTRO"
                        ) {

                          return part.description;
                        }
                      })}
                    </td>
                    <td
                      rowSpan="3"
                      className="border border-black px-2 text-xs bg-emerald-50 w-40"
                    >

                       {ficha.bodyAssessments.map((part) => {
                        if (
                          part.bodyPart == "ES" &&
                          part.subBodyPart == "OTRO"
                        ) {

                          return part.description;
                        }
                      })}
                    </td>
                    <td className="border border-black px-2 pb-1 text-xs">
                      TRS:
                    </td>
                    <td className="border border-black px-2 text-xs bg-emerald-50 w-40">

                      {ficha.bodyAssessments.map((part) => {
                        if (
                          part.bodyPart == "CERVICALES" &&
                          part.subBodyPart == "TRS"
                        ) {

                          return part.description;
                        }
                      })}
                    </td>
                  </tr>
                  <tr className="text-left">
                    <td className="border border-black px-2 pb-1 text-xs">
                      _I_:
                    </td>
                    <td className="border border-black px-2 text-xs bg-emerald-50 w-40">

                      {ficha.bodyAssessments.map((part) => {
                        if (
                          part.bodyPart == "PELVIS" &&
                          part.subBodyPart == "I"
                        ) {

                          return part.description;
                        }
                      })}
                    </td>
                    <td className="border border-black px-2 pb-1 text-xs">
                      E:
                    </td>
                    <td className="border border-black px-2 text-xs bg-emerald-50 w-40">

                      {ficha.bodyAssessments.map((part) => {
                        if (
                          part.bodyPart == "COLUMNA" &&
                          part.subBodyPart == "E"
                        ) {

                          return part.description;
                        }
                      })}
                    </td>
                    <td className="border border-black px-2 pb-1 text-xs">
                      IZQ:
                    </td>
                    <td className="border border-black px-2 text-xs bg-emerald-50 w-40">

                      {ficha.bodyAssessments.map((part) => {
                        if (
                          part.bodyPart == "CLAVICULA" &&
                          part.subBodyPart == "IZQ"
                        ) {

                          return part.description;
                        }
                      })}
                    </td>
                    <td className="border border-black px-2 pb-1 text-xs">
                      IZQ:
                    </td>
                    <td className="border border-black px-2 text-xs bg-emerald-50 w-40">

                      {ficha.bodyAssessments.map((part) => {
                        if (
                          part.bodyPart == "RODILLA" &&
                          part.subBodyPart == "IZQ"
                        ) {

                          return part.description;
                        }
                      })}
                    </td>
                    <td
                      colSpan="2"
                      className="border border-black px-2 pb-1 text-xs"
                    ></td>
                  </tr>
                  <tr className="text-left">
                    <td className="border border-black px-2 pb-1 text-xs">
                      ILI:
                    </td>
                    <td className="border border-black px-2 text-xs bg-emerald-50 w-40">

                      {ficha.bodyAssessments.map((part) => {
                        if (
                          part.bodyPart == "PELVIS" &&
                          part.subBodyPart == "ILI"
                        ) {

                          return part.description;
                        }
                      })}
                    </td>
                    <td className="border border-black px-2 pb-1 text-xs">
                      R.O:
                    </td>
                    <td className="border border-black px-2 text-xs bg-emerald-50 w-40">

                      {ficha.bodyAssessments.map((part) => {
                        if (
                          part.bodyPart == "COLUMNA" &&
                          part.subBodyPart == "RO"
                        ) {

                          return part.description;
                        }
                      })}
                    </td>
                    <td className="border border-black px-2 pb-1 text-xs">
                      DCH:
                    </td>
                    <td className="border border-black px-2 text-xs bg-emerald-50 w-40">

                       {ficha.bodyAssessments.map((part) => {
                        if (
                          part.bodyPart == "CLAVICULA" &&
                          part.subBodyPart == "DCH"
                        ) {

                          return part.description;
                        }
                      })}
                    </td>
                    <td className="border border-black px-2 pb-1 text-xs">
                      DCH:
                    </td>
                    <td className="border border-black px-2 text-xs bg-emerald-50 w-40">

                       {ficha.bodyAssessments.map((part) => {
                        if (
                          part.bodyPart == "RODILLA" &&
                          part.subBodyPart == "DCH"
                        ) {

                          return part.description;
                        }
                      })}
                    </td>
                    <td className="border border-black px-2 pb-1 text-xs">
                      R.O:
                    </td>
                    <td className="border border-black px-2 text-xs bg-emerald-50 w-40">
                      {ficha.bodyAssessments.map((part) => {
                        if (
                          part.bodyPart == "CERVICALES" &&
                          part.subBodyPart == "RO"
                        ) {

                          return part.description;
                        }
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex flex-row w-full gap-5 justify-center">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Editar");
                    setRegistroSelected(ficha)
                    setShowModalEdit(true)
                  }}
                  className=" text-white px-4 py-2 rounded bg-blue-500 cursor-pointer transition-transform duration-200 hover:scale-105"
                >
                  Editar registro
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Borrar");
                    mutation.mutate(ficha.id)
                  }}
                  className=" text-white px-4 py-2 rounded bg-red-500 cursor-pointer transition-transform duration-200 hover:scale-105"
                >
                  Borrar registro
                </button>
              </div>
              <hr className="w-2xl my-5 border-gray-400 border-1" />
            </div>
          );
        })}

        {showModalCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <PageCreateDoc customer={data.customer} docId={docId} />
          </div>
        )}
        {showModalEdit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <PageEditDoc customer={data.customer} docId={docId} registro={registroSelected}/>
          </div>
        )}
        {showModalDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Eliminar ficha</h3>
            <p className="text-gray-800 mb-4">
              Estás a punto de eliminar todos los datos asociados esta ficha.
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
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded transition-transform duration-200 hover:scale-105"
              >
                Cancelar
              </button>
        
              
                <button
                  onClick={() => {
                    deleteMutation.mutate(data.docId)
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
    );
  }
};

export default PageViewDoc;
