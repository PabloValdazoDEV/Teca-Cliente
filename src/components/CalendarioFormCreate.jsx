import { useState, useEffect, useRef, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery } from "@tanstack/react-query";
import { getFormDateUser } from "../API";
import { useAtom } from "jotai";
import citaSeleccionada from "../context/CitaSeleccionada";

const Calendario = ({
  userId,
  timeSession,
  selectedDateId,
  date,
  dateDetails,
  dateBefore,
}) => {
  const [citaSeleccionadaContext, setCitaSeleccionadaContext] =
    useAtom(citaSeleccionada);
  const [selectedCita, setSelectedCita] = useState(selectedDateId);
  const [showAvailability, setShowAvailability] = useState(false);

  const currentStartDateRef = useRef(new Date());
  const { data: citasDisponiblesEmpleado, error } = useQuery({
    queryKey: ["citasDisponible", userId],
    queryFn: async () => {
      if (userId) {
        handleShowAvailableSlots();
        const result = await getFormDateUser(userId);
        return result || [];
      }
      return [];
    },
    enabled: !!userId && !!timeSession,
    onSuccess: () => {
      handleShowAvailableSlots();
    },
    onError: (error) => {},
  });

  const businessHours = [
    { daysOfWeek: [1, 2, 3, 4], startTime: "10:00", endTime: "14:01" },
    { daysOfWeek: [1, 2, 3, 4], startTime: "16:00", endTime: "22:00" },
    { daysOfWeek: [5], startTime: "10:00", endTime: "16:01" },
  ];
  const getNextAvailableTime = (currentTime) => {
    const limitDate = new Date(currentTime);
    limitDate.setDate(limitDate.getDate() + 21);

    while (currentTime < limitDate) {
      const dayOfWeek = currentTime.getDay();

      const availableBlocks = businessHours.filter((block) =>
        block.daysOfWeek.includes(dayOfWeek)
      );

      for (const block of availableBlocks) {
        const blockStart = new Date(currentTime);
        blockStart.setHours(...block.startTime.split(":").map(Number), 0, 0);

        const blockEnd = new Date(currentTime);
        blockEnd.setHours(...block.endTime.split(":").map(Number), 0, 0);

        if (
          currentTime >= blockStart &&
          currentTime.getTime() + timeSession * 60 * 1000 <= blockEnd.getTime()
        ) {
          return currentTime;
        }

        if (currentTime < blockStart) {
          currentTime = blockStart;
          return currentTime;
        }
      }

      currentTime.setMinutes(0);
      currentTime.setHours(10);
      currentTime.setDate(currentTime.getDate() + 1);

      while (currentTime.getDay() === 0 || currentTime.getDay() === 6) {
        currentTime.setDate(currentTime.getDate() + 1);
      }
    }
    return null;
  };

  const getAvailableSlots = (occupiedAppointments, startDate) => {
    if (!timeSession) {
      return;
    }
    let currentTime = new Date(startDate);
    const endOfPeriod = new Date(startDate);
    endOfPeriod.setDate(startDate.getDate() + 21);
    endOfPeriod.setHours(20, 0, 0, 0);

    if (!timeSession || timeSession <= 0) {
      console.error("⚠️ Error: timeSession debe ser mayor que 0");
      return [];
    }

    const slotDuration = timeSession * 60 * 1000;
    let availableSlots = [];

    const adjustedAppointments = occupiedAppointments
      .filter((appointment) => appointment.citaDate && appointment.time)
      .map((appointment) => {
        const actualDate = selectedDateId === appointment.id;

        const start = new Date(appointment.citaDate);
        const end = new Date(start.getTime() + appointment.time * 60 * 1000);

        if (actualDate) {
          return {
            id: appointment.id,
            start,
            end,
            title: "Tu Cita",
            color: "#32CD32",
            isOccupied: false,
            youCita: true,
          };
        }
        return {
          id: appointment.id,
          start,
          end,
          title: "Ocupado",
          color: "#FF5733",
          isOccupied: true,
        };
      });

    let lastTime = null;

    while (currentTime < endOfPeriod) {
      currentTime = getNextAvailableTime(currentTime);

      if (!currentTime) break;

      if (lastTime && currentTime.getTime() === lastTime.getTime()) {
        console.warn(
          "⚠️ getNextAvailableTime está devolviendo el mismo valor. Saliendo del bucle para evitar infinito."
        );
        break;
      }

      let nextTime = new Date(currentTime.getTime() + slotDuration);

      if (nextTime > endOfPeriod) break;

      const overlappingAppointments = adjustedAppointments.filter(
        (appointment) =>
          currentTime < appointment.end && nextTime > appointment.start
      );

      if (overlappingAppointments.length > 0) {
        const latestEnd = new Date(
          Math.max(...overlappingAppointments.map((a) => a.end.getTime()))
        );
        currentTime = new Date(latestEnd);
        continue;
      }
      if (!dateBefore) {
        availableSlots.push({
          id: `${currentTime.getTime()}`,
          start: new Date(currentTime),
          end: new Date(nextTime),
          title: "Disponible",
          isOccupied: false,
        });
      }

      lastTime = currentTime;
      currentTime = nextTime;
    }

    return [...availableSlots, ...adjustedAppointments];
  };

  const availableSlots = useMemo(() => {
    if (citaSeleccionadaContext) {
      const citaSeleccionada = {
        id: `${new Date(citaSeleccionadaContext).getTime()}`,
        start: new Date(citaSeleccionadaContext),
        end: new Date(
          new Date(citaSeleccionadaContext).getTime() + timeSession * 60 * 1000
        ),
        title: "Cita Seleccionada",
        color: "#32CD32",
        isOccupied: false,
        select: true,
      };

      if (citasDisponiblesEmpleado) {
        const allAppointments = getAvailableSlots(
          citasDisponiblesEmpleado,
          currentStartDateRef.current
        ).filter((slot) => slot.id !== citaSeleccionada.id);

        return [
          citaSeleccionada,
          ...allAppointments.filter((slot) => slot.isOccupied),
        ];
      }

      return [citaSeleccionada];
    } else if (citasDisponiblesEmpleado && showAvailability) {
      return getAvailableSlots(
        citasDisponiblesEmpleado,
        currentStartDateRef.current
      ).filter((slot) => slot.id !== selectedCita);
    }

    return [];
  }, [
    citasDisponiblesEmpleado,
    timeSession,
    showAvailability,
    citaSeleccionadaContext,
  ]);

  const handleEventClick = (info) => {
    if (info.event.extendedProps.isOccupied) return;

    // ✅ Limpiar cualquier cita previamente seleccionada
    setCitaSeleccionadaContext(null);
    setSelectedCita(null);

    // ✅ Establecer la nueva cita
    setCitaSeleccionadaContext(info.event.start || date);
    setSelectedCita(info.event.id || selectedDateId);
  };

  const handleShowAvailableSlots = () => {
    if (!userId || !timeSession) {
      alert("Seleccione un trabajador y el tiempo de sesión primero.");
      return;
    }
    setShowAvailability(true);
  };

  useEffect(() => {
    handleShowAvailableSlots;
  }, [citasDisponiblesEmpleado]);

  const calendarRef = useRef(null);

  useEffect(() => {
    setSelectedCita(null);

    if (citaSeleccionadaContext && calendarRef.current) {
      requestAnimationFrame(() => {
        if (calendarRef.current) {
          const calendarApi = calendarRef.current.getApi();
          calendarApi.gotoDate(new Date(citaSeleccionadaContext));
        }
      });
    }
  }, [citaSeleccionadaContext]);

  useEffect(() => {
    setSelectedCita(null);

    if (dateDetails && calendarRef.current) {
      requestAnimationFrame(() => {
        if (calendarRef.current) {
          const calendarApi = calendarRef.current.getApi();
          calendarApi.gotoDate(new Date(dateDetails));
        }
      });
    }
  }, [dateDetails]);

  return (
    <div className="relative bg-white p-5 rounded-lg shadow-lg">
      {!showAvailability && (
        <div className="absolute inset-0 bg-white/90 flex rounded-lg items-center justify-center z-50"></div>
      )}

      <FullCalendar
        ref={calendarRef}
        locale="es"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        slotDuration="00:30:00"
        slotMinTime="10:00:00"
        slotMaxTime="22:00:00"
        hiddenDays={[0, 6]}
        businessHours={businessHours}
        height="auto"
        events={availableSlots.map((cita) => ({
          id: cita.id,
          title: cita.title,
          start: cita.start.toISOString(),
          end: cita.end.toISOString(),
          color: cita.isOccupied
            ? "#FF5733"
            : selectedCita === cita.id || cita.select || cita.youCita
            ? "#32CD32"
            : "#3788d8",
          isOccupied: cita.isOccupied,
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
              {startTime} - {endTime} | {arg.event.title}
            </div>
          );
        }}
      />
    </div>
  );
};

export default Calendario;
