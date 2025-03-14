import { useForm } from "react-hook-form";
import InputForm from "../components/InputForm";
import { useEffect, useState } from "react";
import Calendario from "../components/CalendarioFormCreate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFormDateCreate, postDataEdit } from "../API";
import { useAtom } from "jotai";
import citaSeleccionada from "../context/CitaSeleccionada";
import { useNavigate } from "react-router";
import modalEditDate from "../context/ModalEditDate";

const PageEditDate = ({
  customer,
  time,
  observation,
  advance,
  userId,
  userName,
  dateId,
  date,
}) => {
  const queryClient = useQueryClient();

  const [showModalEdit, setShowModalEdit] = useAtom(modalEditDate);
  const navigate = useNavigate();
  const [valorCitaSeleccionada, setValorCitaSeleccionada] =
    useAtom(citaSeleccionada);

  const [dataCita, setDataCita] = useState(valorCitaSeleccionada);
  const [idUser, setIdUser] = useState(userId);
  const [timeUser, setTimeUser] = useState(time);
  const [showCalenda, setShowCalenda] = useState(false);
  const [advanceValue, setAdvanceValue] = useState(advance || "No"); 
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

  const { data: citasOcupdasEmpleado, error: error2 } = useQuery({
    queryKey: ["citasDisponible", idUser],
    queryFn: async () => {
      if (idUser) {
        setCitaSeleccionadaContext(null);
        return getFormDateUser(idUser);
      }
      return [];
    },
    enabled: !!idUser && !!timeUser,
  });

  const convertToCustomFormat = (date) => {
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
  };

  useEffect(() => {
    const convertToCustomFormat = (date) => {
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
    };
    if(!valorCitaSeleccionada){
      const fecha = new Date(date);
      setDataCita(convertToCustomFormat(fecha));
      setShowCalenda(true);
      return
    }

    if (valorCitaSeleccionada) {
      const fecha = new Date(valorCitaSeleccionada);
      setDataCita(convertToCustomFormat(fecha));
      setShowCalenda(true);
    }
  }, [valorCitaSeleccionada, date]);

  function formatCustomDate(dateString) {
    const date = new Date(dateString.replace(" ", "T"));

    const dayOfWeek = date.toLocaleDateString("es-ES", { weekday: "long" });
    const day = date.getDate();
    const month = date.toLocaleDateString("es-ES", { month: "long" });
    const hour = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${dayOfWeek}, ${day} de ${month}, ${hour}:${minutes}`;
  }

  const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      console.log("edit",data);
      return await postDataEdit(data);
    },
    onSuccess: () => {
      reset();
      setDataCita(null);
      setIdUser(null);
      setTimeUser(null);
      setShowCalenda(false);
      setValorCitaSeleccionada(null);
      queryClient.invalidateQueries();
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
    data,
  } = useForm();

  const watchAllFields = watch();

  const watchDate = watch("date");
  const watchHour = watch("hour");
  const watchUserId = watch("userId");
  const watchTime = watch("time");

  useEffect(() => {
    if (watchAllFields.userId) {
      setIdUser(watchAllFields.userId);
    }
    if (watchAllFields.time) {
      setTimeUser(watchAllFields.time);
    }
  }, [watchUserId, watchTime]);

  useEffect(() => {
    if (watchAllFields.hour && watchAllFields.date) {
      setValorCitaSeleccionada(
        convertToCustomFormat(
          new Date(`${watchAllFields.date} ${watchAllFields.hour}`)
        )
      );
      setShowCalenda(true);
      setValue("hour", "");
    }
  }, [watchHour, watchDate]);

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
    // console.log(data);
    if (!dataCita) {
      return alert("Seleccione una cita");
    }

    mutation.mutate({
      ...data,
      citaDate: dataCita,
      message: `Hola ${
        removeAccents(customer.fullName).split(" ")[0]
      }, le informamos que tiene cita en el Centro Teca el dia ${removeAccents(
        formatCustomDate(dataCita)
      )}.`,
      customerId: userId,
      customer: {
        customerName: customer.fullName,
        customerPhone: customer.phone[0],
      },
      dateId: dateId,
    });
    setShowModalEdit(false);
  };

  const [availableTimes, setAvailableTimes] = useState([]);

  useEffect(() => {
    const generateAvailableTimes = () => {
      if (!watchAllFields.date || !timeUser || !citasOcupdasEmpleado) return;

      const selectedDate = new Date(watchAllFields.date);
      const dayOfWeek = selectedDate.getDay();

      let startHour = 10;
      let endHour = 0;
      let endMinutes = 0;

      if (dayOfWeek >= 1 && dayOfWeek <= 4) {
        endHour = 22;
        endMinutes = 0;
      } else if (dayOfWeek === 5) {
        endHour = 14;
        endMinutes = 0;
      } else {
        setAvailableTimes([]);
        return;
      }

      const horasOcupadasDia = citasOcupdasEmpleado
        .filter((cita) => {
          const formData = new Date(cita.citaDate);
          return formData.getDate() === selectedDate.getDate();
        })
        .map((cita) => {
          const formData = new Date(cita.citaDate);
          return {
            time: cita.time,
            hour: formData.getHours(),
            minutes: formData.getMinutes(),
            endHour: new Date(formData.getTime() + cita.time * 60000),
          };
        });
      const startTime = new Date(selectedDate);

      const endTime = new Date(selectedDate);
      startTime.setHours(startHour, 0, 0, 0);
      endTime.setHours(endHour, endMinutes, 0, 0);

      const times = [];
      const currentTime = new Date(startTime);

      while (currentTime < endTime) {
        const formattedTime = `${String(currentTime.getHours()).padStart(
          2,
          "0"
        )}:${String(currentTime.getMinutes()).padStart(2, "0")}`;
        times.push(formattedTime);
        currentTime.setMinutes(currentTime.getMinutes() + 15);
      }

      const availableTimes = times.filter((time) => {
        const [timeHours, timeMinutes] = time.split(":").map(Number);

        const sessionTime = new Date(selectedDate);
        sessionTime.setHours(timeHours, timeMinutes, 0, 0);

        const endSessionTime = new Date(
          sessionTime.getTime() + timeUser * 60000
        );

        if (endSessionTime > endTime) {
          return false;
        }

        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          const blockStart = new Date(selectedDate);
          blockStart.setHours(14, 0, 0, 0);

          const blockEnd = new Date(selectedDate);
          blockEnd.setHours(16, 0, 0, 0);

          if (
            (sessionTime >= blockStart && sessionTime < blockEnd) ||
            (endSessionTime > blockStart && endSessionTime <= blockEnd) ||
            (sessionTime <= blockStart && endSessionTime >= blockEnd)
          ) {
            return false;
          }
        }

        const isOverlapping = horasOcupadasDia.some(
          ({ hour, minutes, endHour }) => {
            const citaStart = new Date(selectedDate);
            citaStart.setHours(hour, minutes, 0, 0);

            return (
              (sessionTime >= citaStart && sessionTime < endHour) ||
              (endSessionTime > citaStart && endSessionTime <= endHour) ||
              (sessionTime <= citaStart && endSessionTime >= endHour)
            );
          }
        );

        return !isOverlapping;
      });

      setAvailableTimes(availableTimes);
    };

    generateAvailableTimes();
  }, [watchAllFields.date, timeUser, citasOcupdasEmpleado]);

  const isHourSelectEnabled = watchAllFields.date && timeUser && idUser;

  const handleCheckboxChange = (e) => {
    setAdvanceValue(e.target.checked ? "Sí" : "No");
  };

  if (isLoading) {
    return <h1>Cargando...</h1>;
  }

  if (error) {
    return <h1>Ha habido un error, lo sentimos. Recargue la página.</h1>;
  }

  return (
    <>
      <div className="flex justify-center max-w-350 w-full mx-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-row-reverse items-center justify-center gap-5 w-full bg-gray-100 mt-10 p-5 rounded-lg shadow-lg pr-10"
        >
          <div className="flex flex-col items-start justify-center gap-10 w-96">
            {!showCalenda ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setValorCitaSeleccionada(null);
                  setShowCalenda(false);
                }}
                disabled
                className="bg-blue-500/50 text-white px-4 py-2 rounded w-full"
              >
                Ver Disponibilidad General
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setValorCitaSeleccionada(null);
                  setShowCalenda(false);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded  w-full"
              >
                Ver Disponibilidad General
              </button>
            )}
            <InputForm
              label="Buscar Cliente"
              textError="Seleccione al trabajador"
              type="text"
              id="customer"
              defaultValue={`${customer.fullName} - ${customer.phone[0]}`}
              // error={errors.userId}
              // options={dataForm.dataUsers}
              disabled={true}
            />

            <InputForm
              label="Trabajador"
              textError="Seleccione al trabajador"
              type="select"
              id="userId"
              defaultValue={userId}
              {...register("userId", { required: true })}
              error={errors.userId}
              options={dataForm.dataUsers}
            />

            <InputForm
              label="Tiempo de la sesión"
              textError="Seleccione el tiempo"
              type="select"
              id="time"
              defaultValue={timeUser}
              {...register("time", { required: true })}
              error={errors.time}
              options={times}
            />
            <div className="flex flex-row items-end gap-5 w-full">
              <InputForm
                label="Fecha preferida"
                placeholder="Escriba observaciones..."
                type="date"
                min={new Date().toISOString().split("T")[0]}
                id="date"
                {...register("date")}
              />
              <InputForm
                label="Hora disponible"
                type="select"
                id="hour"
                {...register("hour")}
                options={availableTimes.map((time) => ({
                  name: time,
                  id: time,
                }))}
                error={errors.hour}
                disabled={!isHourSelectEnabled}
              />
            </div>
            <InputForm
              label="Observaciones de la cita"
              placeholder="Escriba observaciones..."
              type="text"
              defaultValue={observation}
              id="dateObservation"
              {...register("dateObservation")}
            />

            <InputForm
              label="Avanzar cita"
              textAltInput="Se avisará si hay posibilidad de avanzar la cita"
              type="checkbox"
              id="dateAdvance"
              {...register("dateAdvance")}
              checked={advanceValue === "Sí"}
              onChange={handleCheckboxChange}
              // onClick={}
              // error={errors.dateAdvance}
            />
            {dataCita ? (
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Editar cita
              </button>
            ) : (
              <button
                disabled
                className="bg-blue-500/50 text-white px-4 py-2 rounded"
              >
                Editar cita
              </button>
            )}
          </div>

          <div className="flex flex-row items-start justify-center gap-10 w-auto"></div>

          <div className="flex flex-row items-start justify-center gap-10 w-full">
            <Calendario
              userId={idUser}
              timeSession={timeUser}
              selectedDateId={dateId}
              date
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default PageEditDate;
