import { useForm } from "react-hook-form";
import InputForm from "../components/InputForm";
import AutocompleteInput from "../components/AutocompleteInput";
import { useState } from "react";

const PageCreateDate = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  const [resetTrigger, setResetTrigger] = useState(false);

  const onSubmit = (data) => {
    console.log(data);
    reset();
    setResetTrigger(true);
  };

  const clientes = [
    { id: 1, name: "Pablo" },
    { id: 2, name: "Pepe" },
    { id: 3, name: "Juan" },
    { id: 4, name: "María" },
    { id: 5, name: "Carlos" },
    { id: 6, name: "Ana" },
    { id: 7, name: "Luis" },
    { id: 8, name: "Sofía" },
    { id: 9, name: "Miguel" },
    { id: 10, name: "Lucía" }
  ];
  
  const users = [
    { name: "Natalia", id: "aweda" },
    { name: "Antonio", id: "aweqweda" },
    { name: "Dani", id: "aweqwwda" },
  ];
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

  return (
    <>
      <div className="flex justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-center justify-center gap-10 w-auto bg-gray-100 mt-10 p-5 rounded-lg shadow-lg"
        >
          <div className="flex flex-row items-start justify-center gap-10 w-auto">
            <AutocompleteInput
              label="Buscar Cliente"
              id="cliente"
              placeholder="Escribe un nombre..."
              textError="Seleccione un cliente"
              register={register}
              setValue={setValue}
              error={errors.cliente}
              options={clientes}
              resetTrigger={resetTrigger}
            />
            <InputForm
              label="Trabajador"
              textError="Seleccione al trabajador"
              type="select"
              id="surname"
              {...register("surname", { required: true })}
              error={errors.surname}
              options={users}
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
              placeholder="Esciba observaciones..."
              type="text"
              id="dateObservation"
              {...register("dateObservation")}
            />
            <InputForm
              label="Avanzar cita"
              textAltInput="Si hay posibilidad se avanzara la cita"
              type="checkbox"
              id="dateAdvance"
              {...register("dateAdvance")}
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Enviar
          </button>
        </form>
      </div>
    </>
  );
};

export default PageCreateDate;
