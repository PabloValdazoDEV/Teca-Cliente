/* eslint-disable react/prop-types */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiPhone } from "react-icons/fi";
import { getFormDateUser } from "@/API";
import { phoneText, preferredPhone, telHref } from "@/utils/contact";

const URGENT_COLOR = "#d97706";

// Resumen de las citas de hoy para consultarlo de un vistazo en el móvil
// (en pantallas grandes se oculta por CSS y se usa la agenda completa).
const TodayAppointments = ({ practitioner, onSelect }) => {
  const range = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }, []);

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["appointments", practitioner?.id, "today", range.start.getTime()],
    queryFn: () => getFormDateUser(practitioner.id, range),
    // Solo se pide en móvil, que es donde se muestra.
    enabled: Boolean(practitioner?.id) && window.matchMedia("(max-width: 600px)").matches,
  });

  const today = data
    .filter((appointment) => {
      const start = new Date(appointment.citaDate);
      return start >= range.start && start < range.end;
    })
    .sort((a, b) => new Date(a.citaDate) - new Date(b.citaDate));

  return (
    <section className="today-list card card-pad" aria-labelledby="today-list-title">
      <h2 id="today-list-title" style={{ margin: 0, fontSize: 17 }}>
        Hoy · {practitioner?.name}
        {!isLoading && !isError && <span className="helper" style={{ fontWeight: 600 }}> · {today.length} {today.length === 1 ? "cita" : "citas"}</span>}
      </h2>
      {isLoading ? (
        <p className="helper">Cargando…</p>
      ) : isError ? (
        <p className="status-message is-error" style={{ marginTop: 8 }}>
          No se han podido cargar las citas de hoy.{" "}
          <button type="button" className="button-ghost" onClick={() => refetch()}>Reintentar</button>
        </p>
      ) : today.length === 0 ? (
        <p className="helper">No hay citas hoy.</p>
      ) : (
        <ul>
          {today.map((appointment) => {
            const start = new Date(appointment.citaDate);
            const end = new Date(start.getTime() + appointment.time * 60_000);
            const phone = preferredPhone(appointment.customer?.phones);
            const tel = phone && telHref(phone);
            return (
              <li key={appointment.id} style={{ "--item-color": appointment.urgent_date ? URGENT_COLOR : practitioner?.color }}>
                <span className="today-time">{start.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>
                <button
                  type="button"
                  className="today-who"
                  onClick={() => onSelect({ ...appointment, start, end, phones: (appointment.customer?.phones || []).map(phoneText).filter(Boolean) })}
                >
                  <strong>{appointment.customer?.fullName || "Sin nombre"}</strong>
                  <span className="helper">
                    {appointment.time} min{appointment.urgent_date ? " · Urgente" : ""}
                    {appointment.dateObservation ? ` · ${appointment.dateObservation}` : ""}
                  </span>
                </button>
                {tel && (
                  <a href={tel} className="icon-button" aria-label={`Llamar a ${appointment.customer?.fullName || "paciente"}`}>
                    <FiPhone />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default TodayAppointments;
