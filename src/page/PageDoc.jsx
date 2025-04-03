import { useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllDoc, postDocCreate } from "../API";
import { useAtom } from "jotai";
import ModalDeleteDoc from "../context/ModalDeleteDoc";

const PageDoc = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id: customerId } = useParams();
  const [showModalDeleteDoc, setShowModalDateCustomer] =
    useAtom(ModalDeleteDoc);

  const { data, isLoading, error } = useQuery({
    queryKey: ["getAllDoc", customerId],
    queryFn: () => {
      return getAllDoc(customerId);
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await postDocCreate(customerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  useEffect(() => {
    queryClient.invalidateQueries();
  }, [showModalDeleteDoc]);
  
  if (isLoading) {
    return <h1>Cargando</h1>;
  }
  if (error) {
    return <h1>Error</h1>;
  }
  if (data) {
    return (
      <div className="flex justify-center items-center flex-col w-6xl mx-auto gap-5 bg-gray-100 mt-10 p-5 rounded-lg shadow-lg">
        {data.length === 0 ? (
          <>
            <h2 className="text-xl font-medium mb-3">
              No hay documentos asociados a este cliente
            </h2>
            <div className="flex flex-row gap-5">
              {" "}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  mutation.mutate();
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer transition-transform duration-200 hover:scale-105"
              >
                Agregar una ficha
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
          </>
        ) : (
          <div className="flex flex-col w-full">
            <div className="flex flex-row justify-between mb-5">
              {" "}
              <h3 className="text-xl font-normal mb-5">
                Documentos asociados al <b>{data[0]?.customer.fullName}</b>
              </h3>
              <div className="flex flex-row gap-5 ">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    mutation.mutate();
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer transition-transform duration-200 hover:scale-105"
                >
                  Agregar nueva ficha
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
            <div className="grid grid-cols-5 gap-5 w-full">
              {data.map((doc, i) => {
                return (
                  <div key={doc.id}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/docs/fichas/${doc.id}`);
                      }}
                      className="bg-emerald-500 text-white px-4 py-2 rounded cursor-pointer transition-transform duration-200 hover:scale-105"
                    >
                      {i + 1}. {doc.fileName || doc.fixedType}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default PageDoc;
