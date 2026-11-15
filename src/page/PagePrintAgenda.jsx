/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { getClinic, getFormDateUser, getPractitioners } from "@/API";
import { phoneText, preferredPhone } from "@/utils/contact";

// Agenda para imprimir o guardar como PDF en A4: un día (todos o un profesional)
// o una semana de un profesional. Blanco y negro, legible y sin adornos.
//   /print?view=day&date=2026-11-16&p=all
//   /print?view=week&date=2026-11-16&p=<id>

const startOfDay = (date) => { const d = new Date(date); d.setHours(0, 0, 0, 0); return d; };
const addDays = (date, days) => { const d = new Date(date); d.setDate(d.getDate() + days); return d; };
const parseDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : startOfDay(new Date());
};
const time = (date) => date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
const longDate = (date) => date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const shortDay = (date) => date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" });

const toItems = (appointments, range) =>
  appointments
    .map((appointment) => {
      const start = new Date(appointment.citaDate);
      return { ...appointment, start, end: new Date(start.getTime() + appointment.time * 60_000) };
    })
    .filter((item) => item.start >= range.start && item.start < range.end)
    .sort((a, b) => a.start - b.start);

const Flags = ({ item }) => (
  <>
    {item.urgent_date && <span className="print-flag is-urgent">URGENTE</span>}
    {item.advance_date === "TRUE" && <span className="print-flag">Se puede adelantar</span>}
  </>
);

const DayTable = ({ items }) =>
  items.length === 0 ? <p className="print-empty">Sin citas.</p> : (
    <table className="print-table">
      <thead><tr><th>Hora</th><th>Paciente</th><th>Teléfono</th><th>Motivo / notas</th></tr></thead>
      <tbody>
        {items.map((item) => {
          const phone = preferredPhone(item.customer?.phones);
          return (
            <tr key={item.id} className={item.urgent_date ? "is-urgent" : ""}>
              <td className="print-time">{time(item.start)}–{time(item.end)}<small>{item.time} min</small></td>
              <td><strong>{item.customer?.fullName || "Sin nombre"}</strong> <Flags item={item} /></td>
              <td className="print-phone">{phone ? phoneText(phone) : "—"}</td>
              <td>{item.dateObservation || ""}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

const PagePrintAgenda = () => {
  const [params] = useSearchParams();
  const view = params.get("view") === "week" ? "week" : "day";
  const practitionerParam = params.get("p") || "all";
  const baseDate = parseDate(params.get("date"));
  const printed = useRef(false);

  const range = useMemo(() => {
    if (view === "day") return { start: baseDate, end: addDays(baseDate, 1) };
    const monday = addDays(baseDate, -((baseDate.getDay() + 6) % 7));
    return { start: monday, end: addDays(monday, 7) };
  }, [view, baseDate.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: clinicData } = useQuery({ queryKey: ["clinic"], queryFn: getClinic });
  const { data: practitionersData, isLoading: loadingPractitioners } = useQuery({ queryKey: ["practitioners"], queryFn: () => getPractitioners(false) });
  const practitioners = (practitionersData?.practitioners || []).filter((item) => practitionerParam === "all" || item.id === practitionerParam);

  const results = useQueries({
    queries: practitioners.map((practitioner) => ({
      queryKey: ["appointments", practitioner.id, "print", range.start.getTime(), range.end.getTime()],
      queryFn: () => getFormDateUser(practitioner.id, range),
    })),
  });
  const ready = !loadingPractitioners && results.every((result) => !result.isLoading);
  const failed = results.some((result) => result.isError);

  // Días a mostrar en la semana: lunes a viernes, y sábado/domingo solo si la
  // clínica abre o hay citas.
  const hours = clinicData?.clinic?.hours || [];
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(range.start, index));

  useEffect(() => {
    if (ready && !failed && !printed.current) {
      printed.current = true;
      setTimeout(() => window.print(), 400);
    }
  }, [ready, failed]);

  const clinicName = clinicData?.clinic?.name || "Centro";
  const title = view === "day" ? `Agenda · ${longDate(range.start)}` : `Semana del ${range.start.toLocaleDateString("es-ES", { day: "numeric", month: "long" })} al ${addDays(range.end, -1).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`;

  return (
    <div className={`print-page ${view === "week" ? "is-week" : ""}`}>
      <style>{`@page { size: A4 ${view === "week" ? "landscape" : "portrait"}; margin: 11mm; }`}</style>
      <div className="print-toolbar">
        <button type="button" className="button-primary" onClick={() => window.print()} disabled={!ready}>Imprimir / Guardar PDF</button>
        <button type="button" className="button-ghost" onClick={() => window.close()}>Cerrar</button>
        {!ready && <span className="helper">Cargando citas…</span>}
        {failed && <span className="status-message is-error">No se han podido cargar todas las citas. Revisa la conexión antes de imprimir.</span>}
      </div>

      <header className="print-header">
        <div><strong>{clinicName}</strong><span>{title}</span></div>
        <small>Impreso el {new Date().toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}</small>
      </header>

      {ready && practitioners.length === 0 && <p className="print-empty">No hay profesionales activos.</p>}

      {ready && practitioners.map((practitioner, index) => {
        const items = toItems(results[index]?.data || [], range);
        if (view === "day") {
          return (
            <section key={practitioner.id} className="print-section">
              <h2>{practitioner.name} {practitioner.lastName || ""} <small>{items.length} {items.length === 1 ? "cita" : "citas"}</small></h2>
              <DayTable items={items} />
            </section>
          );
        }
        const days = weekDays.filter((day) => {
          const weekday = day.getDay();
          const open = hours.find((hour) => hour.weekday === weekday)?.enabled;
          const hasItems = items.some((item) => startOfDay(item.start).getTime() === day.getTime());
          return (weekday >= 1 && weekday <= 5) || open || hasItems;
        });
        return (
          <section key={practitioner.id} className="print-section print-week-section">
            <h2>{practitioner.name} {practitioner.lastName || ""} <small>{items.length} {items.length === 1 ? "cita" : "citas"} esta semana</small></h2>
            <div className="print-week" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
              {days.map((day) => {
                const dayItems = items.filter((item) => startOfDay(item.start).getTime() === day.getTime());
                return (
                  <div key={day.getTime()} className="print-day">
                    <h3>{shortDay(day)}</h3>
                    {dayItems.length === 0 ? <p className="print-empty">—</p> : dayItems.map((item) => {
                      const phone = preferredPhone(item.customer?.phones);
                      return (
                        <div key={item.id} className={`print-card ${item.urgent_date ? "is-urgent" : ""}`}>
                          <div className="print-card-time">{time(item.start)}–{time(item.end)}</div>
                          <strong>{item.customer?.fullName || "Sin nombre"}</strong>
                          {phone && <div className="print-phone">{phoneText(phone)}</div>}
                          {item.dateObservation && <div className="print-notes">{item.dateObservation}</div>}
                          <Flags item={item} />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default PagePrintAgenda;
