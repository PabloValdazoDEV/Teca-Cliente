import { useState, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { deleteDate, getFormDateUser } from "../API";
import PageEditDate from "../page/PageEditDate";
import { useAtom } from "jotai";
import modalEditDate from "../context/ModalEditDate";
import { useNavigate } from "react-router";

const CalendarioVista = ({ userId, userName }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModalEdit, setShowModalEdit] = useAtom(modalEditDate);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);

  const { data: citasDisponiblesEmpleado, error } = useQuery({
    queryKey: ["citasDisponible", userId],
    queryFn: async () => {
      if (userId) {
        return getFormDateUser(userId);
      }
      return [];
    },
    enabled: !!userId,
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      deleteDate(data);
    },
    onSuccess: () => {
      console.log("Cita eliminada");
      queryClient.invalidateQueries();
    },
  });

  useEffect(() => {
    if (userId) {
      queryClient.invalidateQueries();
    }
  }, [userId]);

  const businessHours = [
    { daysOfWeek: [1, 2, 3, 4], startTime: "10:00", endTime: "14:01" },
    { daysOfWeek: [1, 2, 3, 4], startTime: "16:00", endTime: "22:00" },
    { daysOfWeek: [5], startTime: "10:00", endTime: "16:01" },
  ];

  const getOccupiedSlots = (appointments) => {
    return appointments
      .filter((appointment) => appointment.citaDate && appointment.time)
      .map((appointment) => {
        const start = new Date(appointment.citaDate);
        const end = new Date(start.getTime() + appointment.time * 60 * 1000);

        return {
          id: appointment.id,
          title: `Paciente: ${appointment.customer.fullName || "Sin nombre"}`,
          start,
          end,
          patientName: appointment.customer.fullName || "Sin nombre",
          time: appointment.time,
          dateObservation: appointment.dateObservation || "Sin observaciones",
          advanceDate: appointment.advance_date === "TRUE" ? "Sí" : "No",
          color: appointment.urgent_date
            ? "#ff8000"
            : appointment.advance_date === "TRUE"
            ? "#3788d8"
            : "#03D492",
          phone: appointment.customer.phones,
          // phone: appointment.customer.phones.map((phone) => {if(phone.isCommunicationPhone === true)return `${phone.countryCode} ${phone.phoneNumber}`}),
          customer: appointment.customer,
          user: userId,
          urgent_date: appointment.urgent_date,
          price: +appointment.sessionPrice,
        };
      });
  };

  const occupiedSlots = useMemo(() => {
    if (citasDisponiblesEmpleado) {
      setShowAvailability(true);
      return getOccupiedSlots(citasDisponiblesEmpleado);
    }
    return [];
  }, [citasDisponiblesEmpleado]);

  const handleEventClick = (info) => {
    const selected = occupiedSlots.find((event) => event.id === info.event.id);
    if (selected) {
      setSelectedEvent(selected);
      setShowModal(true);
    }
  };

  useEffect(() => {
    setShowModal(false);
  }, [showModalEdit]);

  return (
    <div className="relative bg-white p-5 rounded-lg shadow-lg">
      {!showAvailability && (
        <div className="absolute inset-0 bg-white/90 flex rounded-lg items-center justify-center z-50"></div>
      )}
      <FullCalendar
        locale="es"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        slotDuration="00:30:00"
        slotMinTime="10:00:00"
        slotMaxTime="22:00:00"
        hiddenDays={[0, 6]}
        businessHours={businessHours}
        height="auto"
        events={occupiedSlots.map((cita) => ({
          id: cita.id,
          title: cita.title,
          start: cita.start.toISOString(),
          end: cita.end.toISOString(),
          color: cita.color,
          extendedProps: {
            patientName: cita.patientName,
          },
        }))}
        eventClick={handleEventClick}
        allDaySlot={false}
        eventContent={(arg) => {
          const startTime = new Date(arg.event.start).toLocaleTimeString(
            "es-ES",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          );
          const endTime = new Date(arg.event.end).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const patientName =
            arg.event.extendedProps.patientName || "Sin nombre";

          return (
            <div
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                display: "flex",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
                gap: "5px",
                color: "#fff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {startTime} - {endTime} | {patientName}
            </div>
          );
        }}
      />

      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg w-2/5">
            <h2 className="text-xl font-bold mb-3">Detalles de la cita</h2>
            <p>
              <strong>Paciente:</strong> {selectedEvent.patientName}
            </p>
            <p>
              <strong>Fecha:</strong> {selectedEvent.start.toLocaleString()}
            </p>
            <p>
              <strong>Duración:</strong> {selectedEvent.time} minutos
            </p>
            {selectedEvent.price == 0 ? (
              <p>
                {" "}
                <strong>Precio:</strong> No aplicado
              </p>
            ) : (
              <p>
                {" "}
                <strong>Precio:</strong> {selectedEvent.price} €{" "}
              </p>
            )}
            <p>
              <strong>Observación:</strong> {selectedEvent.dateObservation}
            </p>
            <p>
              <strong>Avanzar cita:</strong> {selectedEvent.advanceDate}
            </p>
            {selectedEvent.phone.map((phone, index) => {
              return (
                <p key={index}>
                  <strong>Teléfono {index + 1}:</strong> {phone.countryCode}{" "}
                  {phone.phoneNumber}
                </p>
              );
            })}

            <div className="flex justify-center gap-5 mt-4">
              <button
                onClick={() => {
                  setShowModalDelete(true);
                  setShowModal(false);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded  transition-transform duration-200 hover:scale-105"
              >
                Eliminar cita
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded  transition-transform duration-200 hover:scale-105"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  navigate(`/docs/${selectedEvent.customer.id}`)
                }}
                className="bg-emerald-500 text-white px-4 py-2 rounded  transition-transform duration-200 hover:scale-105"
              >
                Ver Documentos
              </button>
              <button
                onClick={() => 
                  setShowModalEdit(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded  transition-transform duration-200 hover:scale-105"
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {showModalDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-3">Eliminar cita</h2>
            <p>
              <strong>Paciente:</strong> {selectedEvent.patientName}
            </p>
            <p>
              <strong>Fecha:</strong> {selectedEvent.start.toLocaleString()}
            </p>
            <div className="flex justify-center gap-5 mt-4">
              <button
                onClick={() => setShowModalDelete(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded  transition-transform duration-200 hover:scale-105"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  mutation.mutate(selectedEvent.id);
                  setShowModalDelete(false);
                  queryClient.invalidateQueries({
                    queryKey: ["citasDisponible", userId],
                  });
                }}
                className="bg-red-500 text-white px-4 py-2 rounded  transition-transform duration-200 hover:scale-105"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showModalEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <PageEditDate
            customer={selectedEvent?.customer}
            date={selectedEvent?.start}
            time={selectedEvent?.time}
            observation={selectedEvent?.dateObservation}
            price={selectedEvent?.price}
            advance={selectedEvent?.advanceDate}
            userId={userId}
            userName={userName}
            dateId={selectedEvent?.id}
            urgentDate={selectedEvent?.urgent_date}
          />
        </div>
      )}
    </div>
  );
};

export default CalendarioVista;
