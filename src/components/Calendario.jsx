/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery } from "@tanstack/react-query";
import { FiCalendar, FiX } from "react-icons/fi";
import { getFormDateUser } from "@/API";
import {
  appointmentFitsExtendedHours,
  appointmentFitsUsualHours,
  getExtendedDayRange,
  getUsualDayRanges,
  minutesToTime,
  timeToMinutes,
} from "@/utils/appointmentSchedule";

const DEFAULT_APPOINTMENT_COLOR = "#087655";
const URGENT_APPOINTMENT_COLOR = "#d97706";
const ADVANCE_APPOINTMENT_COLOR = "#2563eb";

const formatPhone = (phone) =>
  phone.rawValue ||
  [phone.label, phone.countryCode, phone.phoneNumber].filter(Boolean).join(" ");

const overlaps = (start, end, otherStart, otherEnd) =>
  start < otherEnd && end > otherStart;

const CalendarioVista = ({
  allowOutsideHours,
  businessHours,
  draftAppointment,
  focusDate,
  onCancelAvailability,
  onCreateAt,
  onSelectEvent,
  practitioner,
  selectingAvailability,
}) => {
  const calendarRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState(null);
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia("(max-width: 700px)").matches,
  );
  const { data: appointments = [], isFetching } = useQuery({
    queryKey: ["appointments", practitioner?.id],
    queryFn: async () =>
      practitioner?.id ? (await getFormDateUser(practitioner.id)) || [] : [],
    enabled: Boolean(practitioner?.id),
    retry: (count, error) => error?.response?.status !== 404 && count < 2,
  });

  const appointmentEvents = useMemo(
    () =>
      appointments.map((appointment) => {
        const start = new Date(appointment.citaDate);
        const end = new Date(start.getTime() + appointment.time * 60_000);
        const color = appointment.urgent_date
          ? URGENT_APPOINTMENT_COLOR
          : appointment.advance_date === "TRUE"
            ? ADVANCE_APPOINTMENT_COLOR
            : practitioner?.color || DEFAULT_APPOINTMENT_COLOR;
        return {
          id: appointment.id,
          title: appointment.customer?.fullName || "Sin nombre",
          start,
          end,
          backgroundColor: color,
          borderColor: color,
          extendedProps: {
            appointment,
            phones:
              appointment.customer?.phones?.map(formatPhone).filter(Boolean) ||
              [],
          },
        };
      }),
    [appointments, practitioner],
  );

  const durationMinutes = Math.max(
    15,
    Number(draftAppointment?.durationMinutes) || 60,
  );

  useEffect(() => {
    const calendar = calendarRef.current?.getApi();
    if (focusDate) {
      const date = new Date(focusDate);
      if (!Number.isNaN(date.getTime())) calendar?.gotoDate(date);
    }
    window.requestAnimationFrame(() => calendar?.updateSize());
  }, [focusDate, selectingAvailability]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 700px)");
    const updateMobileView = (event) => setIsMobile(event.matches);
    mediaQuery.addEventListener("change", updateMobileView);
    return () => mediaQuery.removeEventListener("change", updateMobileView);
  }, []);

  useEffect(() => {
    const calendar = calendarRef.current?.getApi();
    if (!calendar) return;
    const targetView = isMobile ? "timeGridDay" : "timeGridWeek";
    if (calendar.view.type !== targetView) calendar.changeView(targetView);
    window.requestAnimationFrame(() => calendar.updateSize());
  }, [isMobile]);

  const availabilityEvents = useMemo(() => {
    if (!selectingAvailability || !visibleRange) return [];
    const durationMs = durationMinutes * 60_000;
    const result = [];
    const day = new Date(visibleRange.start);

    while (day < visibleRange.end) {
      const regularRanges = getUsualDayRanges(day, businessHours);
      const extendedRange = allowOutsideHours
        ? getExtendedDayRange(day, businessHours)
        : null;
      const ranges = extendedRange ? [extendedRange] : regularRanges;
      for (const range of ranges) {
        const rangeStart = range.start;
        const rangeEnd = range.end;
        const blockers = appointmentEvents
          .filter((event) =>
            overlaps(rangeStart, rangeEnd, event.start, event.end),
          )
          .sort((left, right) => left.start - right.start);
        let cursor = rangeStart;

        for (const blocker of blockers) {
          const freeUntil = new Date(
            Math.min(rangeEnd.getTime(), blocker.start.getTime()),
          );
          while (cursor.getTime() + durationMs <= freeUntil.getTime()) {
            const end = new Date(cursor.getTime() + durationMs);
            result.push({
              id: `availability-${cursor.toISOString()}`,
              title: "Disponible",
              start: new Date(cursor),
              end,
              classNames: ["availability-slot-event"],
              editable: false,
              extendedProps: { isAvailabilitySlot: true },
            });
            cursor = end;
          }
          if (blocker.end > cursor) cursor = new Date(blocker.end);
          if (cursor >= rangeEnd) break;
        }

        while (cursor.getTime() + durationMs <= rangeEnd.getTime()) {
          const end = new Date(cursor.getTime() + durationMs);
          result.push({
            id: `availability-${cursor.toISOString()}`,
            title: "Disponible",
            start: new Date(cursor),
            end,
            classNames: ["availability-slot-event"],
            editable: false,
            extendedProps: { isAvailabilitySlot: true },
          });
          cursor = end;
        }
      }
      day.setDate(day.getDate() + 1);
    }

    return result;
  }, [
    allowOutsideHours,
    appointmentEvents,
    businessHours,
    durationMinutes,
    selectingAvailability,
    visibleRange,
  ]);

  const events = useMemo(() => {
    if (selectingAvailability)
      return [...appointmentEvents, ...availabilityEvents];

    if (!draftAppointment?.start) return appointmentEvents;
    const start = new Date(draftAppointment.start);
    const end = new Date(
      start.getTime() + draftAppointment.durationMinutes * 60_000,
    );
    return [
      ...appointmentEvents,
      {
        id: "draft-appointment",
        title: draftAppointment.title,
        start,
        end,
        backgroundColor: "rgba(8, 118, 85, .7)",
        borderColor: "#087655",
        classNames: ["draft-appointment-event"],
        editable: false,
        extendedProps: { isDraft: true },
      },
    ];
  }, [
    appointmentEvents,
    availabilityEvents,
    draftAppointment,
    selectingAvailability,
  ]);

  const calendarHours = useMemo(() => {
    const starts = businessHours
      .map((range) => timeToMinutes(range.startTime))
      .filter(Number.isInteger);
    const ends = businessHours
      .map((range) => timeToMinutes(range.endTime))
      .filter(Number.isInteger);
    if (!starts.length || !ends.length) {
      return { min: "08:00:00", max: "22:30:00", scroll: "08:00:00" };
    }
    const margin = allowOutsideHours ? 60 : 0;
    const min = minutesToTime(Math.max(0, Math.min(...starts) - margin));
    const max = minutesToTime(Math.min(24 * 60, Math.max(...ends) + margin));
    return { min, max, scroll: min };
  }, [allowOutsideHours, businessHours]);

  const canFitAt = (date) => {
    const end = new Date(date.getTime() + durationMinutes * 60_000);
    const fitsAllowedHours = allowOutsideHours
      ? appointmentFitsExtendedHours(date, durationMinutes, businessHours)
      : appointmentFitsUsualHours(date, durationMinutes, businessHours);
    return (
      fitsAllowedHours &&
      !appointmentEvents.some((event) =>
        overlaps(date, end, event.start, event.end),
      )
    );
  };

  return (
    <div
      className={`card calendar-card ${selectingAvailability ? "is-selecting-availability" : ""}`}
      aria-busy={isFetching}
    >
      {selectingAvailability && (
        <div className="availability-banner" role="status">
          <FiCalendar aria-hidden="true" />
          <div>
            <strong>Disponibilidad general</strong>
            <span>
              Agenda de {practitioner?.name}. Selecciona arriba otro profesional
              o pulsa un hueco libre.
            </span>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onCancelAvailability}
            aria-label="Cerrar disponibilidad general"
          >
            <FiX />
          </button>
        </div>
      )}
      <div
        className="calendar-legend"
        role="list"
        aria-label="Leyenda de colores de las citas"
      >
        <span className="calendar-legend-item" role="listitem">
          <i
            className="calendar-legend-swatch"
            style={{
              backgroundColor: practitioner?.color || DEFAULT_APPOINTMENT_COLOR,
            }}
            aria-hidden="true"
          />
          {practitioner?.name} {practitioner?.lastName || ""}
        </span>
        <span className="calendar-legend-item" role="listitem">
          <i
            className="calendar-legend-swatch"
            style={{ backgroundColor: URGENT_APPOINTMENT_COLOR }}
            aria-hidden="true"
          />
          Urgente
        </span>
        <span className="calendar-legend-item" role="listitem">
          <i
            className="calendar-legend-swatch"
            style={{ backgroundColor: ADVANCE_APPOINTMENT_COLOR }}
            aria-hidden="true"
          />
          Se puede adelantar
        </span>
        {selectingAvailability && (
          <span className="calendar-legend-item" role="listitem">
            <i
              className="calendar-legend-swatch is-available"
              aria-hidden="true"
            />
            Hueco disponible
          </span>
        )}
        {!selectingAvailability && draftAppointment?.start && (
          <span className="calendar-legend-item" role="listitem">
            <i className="calendar-legend-swatch is-draft" aria-hidden="true" />
            Propuesta actual
          </span>
        )}
      </div>
      <FullCalendar
        ref={calendarRef}
        locale="es"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
        firstDay={1}
        hiddenDays={[0, 6]}
        nowIndicator
        selectable={false}
        selectMirror={false}
        allDaySlot={false}
        slotDuration="00:30:00"
        snapDuration="00:15:00"
        slotMinTime={calendarHours.min}
        slotMaxTime={calendarHours.max}
        scrollTime={calendarHours.scroll}
        businessHours={businessHours}
        events={events}
        datesSet={(info) => {
          setVisibleRange((current) =>
            current?.start?.getTime() === info.start.getTime() &&
            current?.end?.getTime() === info.end.getTime()
              ? current
              : { start: info.start, end: info.end },
          );
        }}
        height="100%"
        expandRows
        headerToolbar={isMobile
          ? { left: "prev,next", center: "title", right: "today" }
          : {
              left: "prev,next today",
              center: "title",
              right: "timeGridWeek,timeGridDay,dayGridMonth",
            }}
        buttonText={{ today: "Hoy", week: "Semana", day: "Día", month: "Mes" }}
        eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        dateClick={(info) => {
          if (!selectingAvailability && canFitAt(info.date))
            onCreateAt(info.date);
        }}
        eventClick={(info) => {
          if (info.event.extendedProps.isAvailabilitySlot) {
            onCreateAt(info.event.start);
            return;
          }
          if (selectingAvailability || info.event.extendedProps.isDraft) return;
          onSelectEvent({
            ...info.event.extendedProps.appointment,
            start: info.event.start,
            end: info.event.end,
            phones: info.event.extendedProps.phones,
          });
        }}
        eventContent={(arg) => {
          const shortTitle = arg.event.title.split(/\s+/).slice(0, 2).join(" ");
          return (
            <div className="calendar-event-content">
              <strong>
                {arg.event.extendedProps.isDraft
                  ? `Propuesta · ${arg.event.title}`
                  : shortTitle}
              </strong>
              <span>{arg.timeText}</span>
            </div>
          );
        }}
      />
    </div>
  );
};

export default CalendarioVista;
