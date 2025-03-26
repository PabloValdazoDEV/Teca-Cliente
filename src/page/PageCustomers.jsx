import InputForm from "../components/InputForm";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAllCustomers } from "../API";
import { useNavigate, useSearchParams } from "react-router";
import Tablet from "../components/tablet";
import TabletSkeleton from "../components/TabletSkeleton";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import DeleteCustomer from "../context/DeleteCustomer";

const PageCustomers = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(searchParams.get("page") || 1);
  const [isDeleteCustomer, setIsDeleteCustomer] = useAtom(DeleteCustomer);

  const { data: dataForm, register, handleSubmit, reset } = useForm();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["getAllCustomers"],
    queryFn: async () => getAllCustomers(),
  });

  const { mutate, data: dataMutation } = useMutation({
    mutationFn: async (params) => getAllCustomers(params),
  });

  const search = (data) => {
    setPage(1);
    const params = {};
    if (data.name) params.name = data.name;
    if (page) params.page = page;
    setSearchParams(params);
    mutate(params);
  };

  useEffect(() => {
    const params = {};
    if (page) params.page = page;
    setSearchParams(params);
    mutate(params);
    if(isDeleteCustomer === true)setIsDeleteCustomer(false)
  }, [page, isDeleteCustomer]);

  const clearSearch = () => {
    setPage(1);
    setSearchParams({});
    mutate();
    reset();
  }; 

  const paginationHtml = [];

  {
    for (let i = 0; i < 5; i++) {
      if (+page + i - 2 > 0) {
        paginationHtml.push(
          <button
            key={i}
            onClick={() => setPage(+page + i - 2)}
            disabled={i == 2 || (dataMutation?.length != 10 && i > 2)}
            className={`bg-gray-500 text-sm text-white px-2 py-1 rounded  ${
              i == 2 || (dataMutation?.length != 10 && i > 2)
                ? "bg-gray-500/50"
                : "bg-gray-500 cursor-pointer transition-transform duration-200 hover:scale-105"
            }`}
          >
            {+page + i - 2}
          </button>
        );
      }
    }
  }

  return (
    <>
      <div className="flex justify-center items-center flex-col w-7xl mx-auto gap-5 bg-gray-100 mt-10 p-5 rounded-lg shadow-lg">
        <div className="w-full flex flex-row justify-between items-center">
          <div className="w-full flex flex-row justify-left gap-5 items-end">
            <form
              onSubmit={handleSubmit(search)}
              className="w-86 flex flex-row justify-left gap-5 items-end"
            >
              <InputForm
                label={"Nombre del cliete"}
                type="text"
                {...register("name")}
                placeholder="Ej: Juan Pérez"
              />
              {/* <InputForm
              label={"Telefóno"}
              type="number"
              min={0}
              {...register("phone")}
            /> */}
              <button
                onClick={search}
                className="bg-emerald-500 text-white px-4 py-2 rounded cursor-pointer transition-transform duration-200 hover:scale-105"
              >
                Buscar
              </button>
            </form>
            <button
              onClick={clearSearch}
              className="bg-gray-500 text-white px-4 py-2 rounded cursor-pointer  transition-transform duration-200 hover:scale-105"
            >
              Limpiar
            </button>
          </div>
          <div className="w-full flex flex-row justify-end">
            <button
              onClick={() => navigate("/customers/create")}
              className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              Dar de alta
            </button>
          </div>
        </div>

        {isLoading ? (
          <TabletSkeleton />
        ) : (
          <Tablet data={dataMutation || data || []} />
        )}

        <div className="flex flex-row justify-center items-center w-full py-5 gap-3">
          <button
            onClick={() => setPage((prev) => prev - 1)}
            className={`bg-gray-500 text-sm text-white px-2 py-1 rounded  ${
              page <= 1
                ? "bg-blue-gray/50"
                : "cursor-pointer transition-transform duration-200 hover:scale-105"
            }`}
            disabled={page == 1}
          >
            Anterior
          </button>
          {paginationHtml.map((pagination) => pagination)}
          <button
            onClick={() => setPage((prev) => +prev + 1)}
            className={`bg-gray-500 text-sm text-white px-2 py-1 rounded  ${
              dataMutation?.length != 10
                ? "bg-blue-gray/50"
                : "cursor-pointer transition-transform duration-200 hover:scale-105"
            }`}
            disabled={dataMutation?.length != 10}
          >
            Siguiente
          </button>
        </div>
      </div>
    </>
  );
};

export default PageCustomers;
