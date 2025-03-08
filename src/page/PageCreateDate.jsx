import { useForm } from "react-hook-form";
import InputForm from "../components/InputForm";
import AutocompleteInput from "../components/AutocompleteInput";
import { useEffect, useState } from "react";
import Calendario from "../components/CalendarioFormCreate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getFormDateCreate, postDataCreate } from "../API";
import { useAtomValue } from "jotai";
import citaSeleccionada from "../context/CitaSeleccionada";
import { useNavigate } from "react-router";

const PageCreateDate = () => {
  const navigate = useNavigate();
  const valorCitaSeleccionada = useAtomValue(citaSeleccionada);
  const [dataCita, setDataCita] = useState(null);
  const [idUser, setIdUser] = useState(null);
  const [timeUser, setTimeUser] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(false);

  const {
    data: dataForm,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dataForm"],
    queryFn: async () => {
      return getFormDateCreate();
    },
  });

  useEffect(() => {
    function convertToCustomFormat(date) {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return null;
      }

      return (
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0") +
        " " +
        String(date.getHours()).padStart(2, "0") +
        ":" +
        String(date.getMinutes()).padStart(2, "0") +
        ":" +
        String(date.getSeconds()).padStart(2, "0") +
        ".000"
      );
    }

    if (valorCitaSeleccionada) {
      const fecha = new Date(valorCitaSeleccionada);
      setDataCita(convertToCustomFormat(fecha));
    }
  }, [valorCitaSeleccionada]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      return await postDataCreate(data);
    },
    onSuccess: () => {
      reset();
      setDataCita(null);
      setIdUser(null);
      setTimeUser(null);
      setResetTrigger(true);
      navigate("/home");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm();

  const watchAllFields = watch();

  useEffect(() => {
    if (watchAllFields.userId) {
      setIdUser(watchAllFields.userId);
    }
    if (watchAllFields.time) {
      setTimeUser(watchAllFields.time);
    }
  }, [watchAllFields]);

  const times = [
    { name: "10 minutos", id: 10 },
    { name: "20 minutos", id: 20 },
    { name: "30 minutos", id: 30 },
    { name: "40 minutos", id: 40 },
    { name: "50 minutos", id: 50 },
    { name: "1 hora", id: 60 },
    { name: "1 hora 10 minutos", id: 70 },
    { name: "1 hora 20 minutos", id: 80 },
    { name: "1 hora 30 minutos", id: 90 },
    { name: "1 hora 40 minutos", id: 100 },
    { name: "1 hora 50 minutos", id: 110 },
    { name: "2 horas", id: 120 },
  ];

  const onSubmit = (data) => {
    if (!dataCita) {
      return alert("Seleccione una cita");
    }

    mutation.mutate({ ...data, citaDate: dataCita });
  };

  if (isLoading) {
    return <h1>Cargando...</h1>;
  }

  if (error) {
    return <h1>Ha habido un error, lo sentimos. Recargue la página.</h1>;
  }

  return (
    <>
      <div className="flex justify-center w-6xl mx-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-center justify-center gap-10 w-auto bg-gray-100 mt-10 p-5 rounded-lg shadow-lg"
        >
          <div className="flex flex-row items-start justify-center gap-10 w-auto">
            <AutocompleteInput
              label="Buscar Cliente"
              id="customerId"
              placeholder="Nombre o teléfono"
              textError="Seleccione un cliente"
              register={register}
              setValue={setValue}
              error={errors.customerId}
              options={dataForm.dataCustomers}
              resetTrigger={resetTrigger}
            />

            <InputForm
              label="Trabajador"
              textError="Seleccione al trabajador"
              type="select"
              id="userId"
              {...register("userId", { required: true })}
              error={errors.userId}
              options={dataForm.dataUsers}
            />

            <InputForm
              label="Tiempo de la sesión"
              textError="Seleccione el tiempo"
              type="select"
              id="time"
              {...register("time", { required: true })}
              error={errors.time}
              options={times}
            />
          </div>

          <div className="flex flex-row items-start justify-center gap-10 w-auto">
            <InputForm
              label="Observaciones de la cita"
              placeholder="Escriba observaciones..."
              type="text"
              id="dateObservation"
              {...register("dateObservation")}
            />

            <InputForm
              label="Avanzar cita"
              textAltInput="Se avisará si hay posibilidad de avanzar la cita"
              type="checkbox"
              id="dateAdvance"
              {...register("dateAdvance")}
            />
          </div>

          <div className="flex flex-row items-start justify-center gap-10 w-auto">
            <Calendario userId={idUser} timeSession={timeUser} />
          </div>

          {dataCita ? (
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Crear
            </button>
          ) : (
            <button
              disabled
              className="bg-blue-500/50 text-white px-4 py-2 rounded"
            >
              Crear
            </button>
          )}
        </form>
      </div>
    </>
  );
};

export default PageCreateDate;
