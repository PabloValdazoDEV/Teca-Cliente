import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { FiPlus } from "react-icons/fi";
import { getClinic, getPractitioners } from "@/API";
import CalendarioVista from "@/components/Calendario";
import AppointmentPanel from "@/components/AppointmentPanel";

const PageHome = () => {
  const location = useLocation();
  const [selectedId, setSelectedId] = useState("");
  const [panel, setPanel] = useState({ mode: "empty", selected: null, start: null, customerId: "" });
  const { data, isLoading, isError } = useQuery({ queryKey: ["practitioners"], queryFn: () => getPractitioners(false) });
  const { data: clinicData } = useQuery({ queryKey: ["clinic"], queryFn: getClinic });
  const practitioners = useMemo(() => data?.practitioners || [], [data]);

  useEffect(() => {
    if (practitioners.length && !practitioners.some((item) => item.id === selectedId)) setSelectedId(practitioners[0].id);
  }, [practitioners, selectedId]);

  useEffect(() => {
    if (location.state?.createAppointment) {
      setPanel({ mode: "create", selected: null, start: new Date(), customerId: location.state.customerId || "" });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const practitioner = practitioners.find((item) => item.id === selectedId);
  const businessHours = useMemo(() => {
    const hours = clinicData?.clinic?.hours || [];
    return hours.flatMap((day) => {
      if (!day.enabled) return [];
      const ranges = [];
      if (day.firstStart && day.firstEnd) ranges.push({ daysOfWeek: [day.weekday], startTime: day.firstStart, endTime: day.firstEnd });
      if (day.secondStart && day.secondEnd) ranges.push({ daysOfWeek: [day.weekday], startTime: day.secondStart, endTime: day.secondEnd });
      return ranges;
    });
  }, [clinicData]);

  return (
    <main className="page agenda-page">
      <header className="page-header" style={{ marginBottom: 14, alignItems: "center" }}>
        <div><p className="page-kicker">Agenda del centro</p><h1 className="page-title">Citas</h1></div>
        <button type="button" className="button-primary" onClick={() => setPanel({ mode: "create", selected: null, start: new Date() })}><FiPlus /> Crear cita</button>
      </header>

      <div className="practitioner-bar" role="group" aria-label="Seleccionar profesional" style={{ marginBottom: 14 }}>
        {isLoading && <span className="helper">Cargando profesionales…</span>}
        {isError && <span className="status-message is-error">No se ha podido cargar la agenda</span>}
        {practitioners.map((item) => (
          <button key={item.id} type="button" className={`practitioner-button ${item.id === selectedId ? "is-active" : ""}`} onClick={() => { setSelectedId(item.id); setPanel({ mode: "empty", selected: null, start: null }); }}>
            {item.name} {item.lastName || ""}
          </button>
        ))}
      </div>

      <section className="agenda-layout">
        {practitioner ? (
          <CalendarioVista
            practitioner={practitioner}
            businessHours={businessHours}
            onCreateAt={(start) => setPanel({ mode: "create", selected: null, start })}
            onSelectEvent={(selected) => setPanel({ mode: "detail", selected, start: null })}
          />
        ) : <div className="card empty-state">Crea un profesional en “Clínica y agendas” para empezar.</div>}
        <AppointmentPanel
          mode={panel.mode}
          selected={panel.selected}
          draftStart={panel.start}
          initialCustomerId={panel.customerId}
          practitioner={practitioner}
          onClose={() => setPanel({ mode: "empty", selected: null, start: null })}
          onCreated={() => setPanel({ mode: "empty", selected: null, start: null })}
        />
      </section>
    </main>
  );
};

export default PageHome;
