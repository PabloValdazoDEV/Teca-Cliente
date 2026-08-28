/* eslint-disable react/prop-types */
import { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery } from "@tanstack/react-query";
import { getFormDateUser } from "@/API";

const formatPhone = (phone) =>
  phone.rawValue || [phone.label, phone.countryCode, phone.phoneNumber].filter(Boolean).join(" ");

const CalendarioVista = ({ businessHours, onCreateAt, onSelectEvent, practitioner }) => {
  const { data: appointments = [], isFetching } = useQuery({
    queryKey: ["appointments", practitioner?.id],
    queryFn: async () => (practitioner?.id ? (await getFormDateUser(practitioner.id)) || [] : []),
    enabled: Boolean(practitioner?.id),
    retry: (count, error) => error?.response?.status !== 404 && count < 2,
  });

  const events = useMemo(
    () => appointments.map((appointment) => {
      const start = new Date(appointment.citaDate);
      const end = new Date(start.getTime() + appointment.time * 60_000);
      const color = appointment.urgent_date
        ? "#d97706"
        : appointment.advance_date === "TRUE"
          ? "#2563eb"
          : practitioner?.color || "#087655";
      return {
        id: appointment.id,
        title: appointment.customer?.fullName || "Sin nombre",
        start,
        end,
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          appointment,
          phones: appointment.customer?.phones?.map(formatPhone).filter(Boolean) || [],
        },
      };
    }),
    [appointments, practitioner]
  );

  return (
    <div className="card calendar-card" aria-busy={isFetching}>
      <FullCalendar
        locale="es"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        firstDay={1}
        nowIndicator
        selectable
        selectMirror
        allDaySlot={false}
        slotDuration="00:30:00"
        snapDuration="00:15:00"
        slotMinTime="08:00:00"
        slotMaxTime="22:30:00"
        scrollTime="09:30:00"
        businessHours={businessHours}
        events={events}
        height="100%"
        expandRows
        headerToolbar={{ left: "prev,next today", center: "title", right: "timeGridWeek,timeGridDay,dayGridMonth" }}
        buttonText={{ today: "Hoy", week: "Semana", day: "Día", month: "Mes" }}
        dateClick={(info) => onCreateAt(info.date)}
        select={(info) => onCreateAt(info.start)}
        eventClick={(info) => {
          onSelectEvent({
            ...info.event.extendedProps.appointment,
            start: info.event.start,
            end: info.event.end,
            phones: info.event.extendedProps.phones,
          });
        }}
        eventContent={(arg) => (
          <div style={{ overflow: "hidden" }}>
            <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>{arg.event.title}</strong>
            <span>{arg.timeText}</span>
          </div>
        )}
      />
    </div>
  );
};

export default CalendarioVista;
