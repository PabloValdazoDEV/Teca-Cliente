import { useForm } from "react-hook-form";
import InputForm from "../components/InputForm";
import { useEffect, useState } from "react";
import Calendario from "../components/CalendarioFormCreate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFormDateCreate, putDataEdit } from "../API";
import { useAtom } from "jotai";
import citaSeleccionada from "../context/CitaSeleccionada";
import { useNavigate } from "react-router";
import modalEditDate from "../context/ModalEditDate";
import { RESET } from "jotai/utils";

const PageEditDate = ({
  customer,
  time,
  observation,
  price,
  advance,
  userId,
  userName,
  dateId,
  date,
  urgentDate,
}) => {
  const queryClient = useQueryClient();

  const dateNow = new Date(Date.now());

  const [showModalEdit, setShowModalEdit] = useAtom(modalEditDate);
  const navigate = useNavigate();
  const [valorCitaSeleccionada, setValorCitaSeleccionada] =
    useAtom(citaSeleccionada);

  const [dataCita, setDataCita] = useState(valorCitaSeleccionada);
  const [idUser, setIdUser] = useState(userId);
  const [timeUser, setTimeUser] = useState(time);
  const [showCalenda, setShowCalenda] = useState(false);
  const [advanceValue, setAdvanceValue] = useState(advance || "No");
  const [citaUrgenteValue, setCitaUrgenteValue] = useState(
    urgentDate ? "Sí" : "No"
  );
  const [modalError, setModalError] = useState(false);
  const [modalCerrar, setModalCerrar] = useState(false);
  const [oldDate, setOldDate] = useState({
    citaDate: date,
    userId: userId,
    advance_date: advance === "Sí" ? true : false,
    urgent_date: urgentDate,
    time: time,
    dateObservation: observation,
    sessionPrice: price,
  });

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    data,
    getValues,
  } = useForm();

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
    if (!valorCitaSeleccionada) {
      const fecha = new Date(date);
      setDataCita(convertToCustomFormat(fecha));
      setShowCalenda(true);
      return;
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
      return await putDataEdit(data);
    },
    onSuccess: () => {
      reset();
      setDataCita(null);
      setIdUser(null);
      setTimeUser(null);
      setShowCalenda(false);
      setValorCitaSeleccionada(null);
      setShowModalEdit(false);
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      if (error.response && error.response.status === 409) {
        console.log("Ya hay una cita a esa hora. Por favor, elige otra hora.");
      } else {
        setModalError(true);
        console.log("Error en la mutación:", error);
      }
      reset();
      setDataCita(null);
      setIdUser(null);
      setTimeUser(null);
      setShowCalenda(false);
      setValorCitaSeleccionada(null);
    },
  });

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
    if (!dataCita) {
      return alert("Seleccione una cita");
    }

    mutation.mutate({
      ...data,
      citaDate: dataCita,
      message: `Hola ${
        removeAccents(customer.fullName).split(" ")[0]
      }, le informamos que su cita a cambiado de fecha al ${removeAccents(
        formatCustomDate(dataCita)
      )}.`,
      customerId: customer.id,
      dateId: dateId,
      urgent_date: citaUrgenteValue == "Sí" ? true : false,
    });
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
        endHour = 16;
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

      // Generar horas disponibles en incrementos de 5 minutos
      while (currentTime < endTime) {
        const formattedTime = `${String(currentTime.getHours()).padStart(
          2,
          "0"
        )}:${String(currentTime.getMinutes()).padStart(2, "0")}`;
        times.push(formattedTime);
        currentTime.setMinutes(currentTime.getMinutes() + 10); // Incremento de 5 minutos
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
    if (e.target.id === "dateAdvance") {
      setAdvanceValue(e.target.checked ? "Sí" : "No");
    }
    if (e.target.id === "urgent_date") {
      setCitaUrgenteValue(e.target.checked ? "Sí" : "No");
    }
  };
  const allValue = getValues();

  const btnCerrar = (e) => {
    e.preventDefault();
    if (
      (allValue.userId === oldDate.userId &&
        allValue.time == oldDate.time &&
        allValue.sessionPrice == oldDate.sessionPrice &&
        allValue.dateObservation === oldDate.dateObservation &&
        // advanceValue === oldDate.advance_date &&
        // citaUrgenteValue === oldDate.urgent_date &&
        !new Date(valorCitaSeleccionada).getTime()) ||
      allValue.userId === undefined
    ) {
      setShowModalEdit(false);
      setValorCitaSeleccionada(null);
      setDataCita(null);
    } else {
      setModalCerrar(true);
    }
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
              defaultValue={`${customer?.fullName} / ${customer?.phones
                .filter(
                  (phone) =>
                    phone.isCommunicationPhone === true && phone.phoneNumber
                )
                .map((phone) => `${phone.countryCode} ${phone.phoneNumber}`)
                .join(" ")}`}
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
              disabled={date < dateNow}
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
              disabled={date < dateNow}
            />
            <div className="flex flex-row items-end gap-5 w-full">
              <InputForm
                label="Fecha preferida"
                placeholder="Escriba observaciones..."
                type="date"
                min={new Date().toISOString().split("T")[0]}
                id="date"
                disabled={date < dateNow}
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
                disabled={!isHourSelectEnabled && date < dateNow}
              />
            </div>
            <div className="flex flex-row items-end gap-5 w-full">
              <InputForm
                label="Observaciones de la cita"
                placeholder="Escriba observaciones..."
                type="text"
                defaultValue={observation}
                id="dateObservation"
                {...register("dateObservation")}
              />

              <div className="w-1/3">
                <InputForm
                  label="Precio (€)"
                  placeholder="Ej. 00"
                  type="number"
                  defaultValue={+price}
                  id="sessionPrice"
                  {...register("sessionPrice")}
                />
              </div>
            </div>

            <div className="flex flex-row items-end gap-5 w-full">
              <InputForm
                label="Avanzar cita"
                type="checkbox"
                id="dateAdvance"
                {...register("dateAdvance")}
                checked={advanceValue === "Sí"}
                onChange={handleCheckboxChange}
                disabled={date < dateNow}
              />
              <InputForm
                label="Cita Urgente"
                type="checkbox"
                id="urgent_date"
                {...register("urgent_date")}
                checked={citaUrgenteValue === "Sí"}
                onChange={handleCheckboxChange}
                disabled={date < dateNow}
              />
            </div>
            <div className="flex flex-row items-end justify-between gap-5 w-full">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Guardar cambios
              </button>

              <button
                onClick={btnCerrar}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>

          <div className="flex flex-row items-start justify-center gap-10 w-auto"></div>

          <div className="flex flex-row items-start justify-center gap-10 w-full">
            <Calendario
              userId={idUser}
              timeSession={timeUser}
              selectedDateId={dateId}
              date
              dateDetails={date}
              dateBefore={date < dateNow}
            />
          </div>
          {modalError && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-2xl w-96 shadow-lg animate-fadeIn">
                <h2 className="text-xl font-bold mb-3">
                  Error al editar la cita
                </h2>
                <button
                  onClick={() => setModalError(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cerrar ventana
                </button>
              </div>
            </div>
          )}
          {modalCerrar && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-5 rounded-lg w-96 flex flex-col gap-5">
                <h2 className="text-xl font-bold">
                  Cambios detectados en la cita
                </h2>

                {allValue.userId !== oldDate.userId && (
                  <p>
                    El profesional asignado era:{" "}
                    {
                      dataForm.dataUsers.find(
                        (user) => user.id === oldDate.userId
                      ).name
                    }{" "}
                    y ahora es:{" "}
                    {
                      dataForm.dataUsers.find(
                        (user) => user.id === allValue.userId
                      ).name
                    }
                  </p>
                )}

                {allValue.time != oldDate.time && (
                  <p>
                    La duración anterior era: {oldDate.time} y ahora es:{" "}
                    {allValue.time}
                  </p>
                )}

                {allValue.sessionPrice != oldDate.sessionPrice && (
                  <p>
                    El precio anterior era: {oldDate.sessionPrice} y ahora es:{" "}
                    {allValue.sessionPrice}
                  </p>
                )}

                {allValue.dateObservation !== oldDate.dateObservation && (
                  <p>
                    Observaciones anteriores: {oldDate.dateObservation} <br />
                    Nuevas observaciones: {allValue.dateObservation}
                  </p>
                )}

                {allValue.dateAdvance !== oldDate.advance_date && (
                  <p>
                   Cita adelantada: de{" "}
                    {oldDate.advance_date ? "Sí" : "No"} 
                    {" "}a{" "} {allValue.dateAdvance ? "Sí" : "No"}
                  </p>
                )}

                {allValue.urgent_date !== oldDate.urgent_date && (
                  <p>
                    Cita urgente: de{" "}{oldDate.urgent_date ? "Sí" : "No"}{" "}
                    {" "}a{" "} {allValue.urgent_date ? "Sí" : "No"}
                  </p>
                )}

                {!!new Date(valorCitaSeleccionada).getTime() && (
                  <p>
                    Fecha original:{" "}
                    {formatCustomDate(
                      convertToCustomFormat(new Date(oldDate.citaDate))
                    )}{" "}
                    <br />
                    Nueva fecha:{" "}
                    {formatCustomDate(
                      convertToCustomFormat(new Date(valorCitaSeleccionada))
                    )}
                  </p>
                )}

                <p>Se han realizado cambios en los campos de la cita.</p>

                <div className="flex flex-row items-end justify-between gap-5 w-full">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setModalCerrar(false);
                      setShowModalEdit(false);
                      setValorCitaSeleccionada(null);
                      setDataCita(null);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cerrar sin guardar
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setModalCerrar(false);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Volver a editar
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default PageEditDate;
