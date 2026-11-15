import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { FiArrowRight, FiCheckCircle, FiPlus } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { getClinic, getPractitioners } from "@/API";
import CalendarioVista from "@/components/Calendario";
import AppointmentPanel from "@/components/AppointmentPanel";
import TodayAppointments from "@/components/TodayAppointments";
import PrintAgendaMenu from "@/components/PrintAgendaMenu";

const emptyPanel = () => ({ mode: "empty", selected: null, start: null, customerId: "", draftSeed: null });

const createPanel = (start, customerId = "", practitionerId = "", defaultHourlyRate = 0) => ({
  mode: "create",
  selected: null,
  start,
  customerId,
  draftSeed: { customerId, practitionerId, start, defaultHourlyRate },
});

const nextOpening = (businessHours, from = new Date()) => {
  if (!businessHours.length) return from;
  const roundedNow = new Date(from);
  roundedNow.setSeconds(0, 0);
  roundedNow.setMinutes(Math.ceil(roundedNow.getMinutes() / 15) * 15);

  for (let offset = 0; offset < 15; offset += 1) {
    const day = new Date(from);
    day.setDate(day.getDate() + offset);
    day.setHours(0, 0, 0, 0);
    const ranges = businessHours
      .filter((range) => range.daysOfWeek.includes(day.getDay()))
      .sort((left, right) => left.startTime.localeCompare(right.startTime));

    for (const range of ranges) {
      const [startHour, startMinute] = range.startTime.split(":").map(Number);
      const [endHour, endMinute] = range.endTime.split(":").map(Number);
      const start = new Date(day);
      const end = new Date(day);
      start.setHours(startHour, startMinute, 0, 0);
      end.setHours(endHour, endMinute, 0, 0);
      const candidate = offset === 0 && roundedNow > start ? new Date(roundedNow) : start;
      if (candidate.getTime() + 60 * 60_000 <= end.getTime()) return candidate;
    }
  }

  return from;
};

const PageHome = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState("");
  const [panel, setPanel] = useState(emptyPanel);
  const [draftAppointment, setDraftAppointment] = useState(null);
  const [calendarFocusDate, setCalendarFocusDate] = useState(null);
  const [availabilityMode, setAvailabilityMode] = useState(false);
  const [notice, setNotice] = useState("");
  const { user } = useAuth();
  const isAdmin = ["ADMIN", "SUPERADMIN"].includes(user?.role);

  // Aviso breve tras guardar una cita: el panel se cierra y, sin esto, no
  // quedaba constancia visible de que se había guardado.
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  const { data, isLoading, isError } = useQuery({ queryKey: ["practitioners"], queryFn: () => getPractitioners(false) });
  const { data: clinicData } = useQuery({ queryKey: ["clinic"], queryFn: getClinic });
  const practitioners = useMemo(() => data?.practitioners || [], [data]);
  const allowOutsideHours = Boolean(clinicData?.clinic?.allowOutsideHours);
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

  useEffect(() => {
    if (practitioners.length && !practitioners.some((item) => item.id === selectedId)) setSelectedId(practitioners[0].id);
  }, [practitioners, selectedId]);

  useEffect(() => {
    const appointmentReturn = location.state?.resumeAppointment;
    if (appointmentReturn?.appointment?.id) {
      const selected = {
        ...appointmentReturn.appointment,
        start: appointmentReturn.appointment.start ? new Date(appointmentReturn.appointment.start) : null,
        end: appointmentReturn.appointment.end ? new Date(appointmentReturn.appointment.end) : null,
      };
      setSelectedId(appointmentReturn.practitionerId || selected.practitionerId || "");
      setPanel({ mode: "detail", selected, start: null, customerId: "", draftSeed: null });
      setCalendarFocusDate(selected.start || selected.citaDate);
      setDraftAppointment(null);
      setAvailabilityMode(false);
      navigate("/home", { replace: true, state: null });
    } else if (location.state?.createAppointment) {
      if (!clinicData?.clinic) return;
      setPanel(createPanel(nextOpening(businessHours), location.state.customerId || "", selectedId, clinicData.clinic.defaultHourlyRate));
      setDraftAppointment(null);
      setAvailabilityMode(false);
      navigate("/home", { replace: true, state: null });
      window.setTimeout(() => {
        document.querySelector(".appointment-panel.is-active")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }, [businessHours, clinicData, location.state, navigate, selectedId]);

  const practitioner = practitioners.find((item) => item.id === selectedId);

  const scrollTo = (selector) => {
    window.setTimeout(() => {
      document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const selectCalendarTime = (start) => {
    setPanel((current) => current.mode === "create"
      ? { ...current, start }
      : createPanel(start, "", selectedId, clinicData?.clinic?.defaultHourlyRate));
    setAvailabilityMode(false);
    scrollTo(".appointment-panel");
  };

  const showAvailability = () => {
    setAvailabilityMode(true);
    scrollTo(".calendar-card");
  };

  const closePanel = () => {
    setAvailabilityMode(false);
    setDraftAppointment(null);
    setPanel(emptyPanel());
  };

  return (
    <main className="page agenda-page">
      <header className="page-header" style={{ marginBottom: 14, alignItems: "center" }}>
        <div><p className="page-kicker">Agenda del centro</p><h1 className="page-title">Citas</h1></div>
        {availabilityMode ? (
          <button type="button" className="button-secondary availability-return" onClick={() => { setAvailabilityMode(false); scrollTo(".appointment-panel"); }}><FiArrowRight /> Volver al formulario</button>
        ) : (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {practitioners.length > 0 && <PrintAgendaMenu practitioners={practitioners} selectedId={selectedId} />}
            <button type="button" className="button-primary" onClick={() => { setDraftAppointment(null); setPanel(createPanel(nextOpening(businessHours), "", selectedId, clinicData?.clinic?.defaultHourlyRate)); scrollTo(".appointment-panel.is-active"); }}><FiPlus /> Crear cita</button>
          </div>
        )}
      </header>

      <div className="practitioner-bar" role="group" aria-label="Seleccionar profesional" style={{ marginBottom: 14 }}>
        {isLoading && <span className="helper">Cargando profesionales…</span>}
        {isError && <span className="status-message is-error">No se ha podido cargar la agenda</span>}
        {practitioners.map((item) => (
          <button key={item.id} type="button" className={`practitioner-button ${item.id === selectedId ? "is-active" : ""}`} onClick={() => { setSelectedId(item.id); if (!availabilityMode) { setDraftAppointment(null); setPanel(emptyPanel()); } }}>
            {item.name} {item.lastName || ""}
          </button>
        ))}
      </div>

      {practitioner && !availabilityMode && (
        <TodayAppointments
          practitioner={practitioner}
          onSelect={(selected) => { setDraftAppointment(null); setPanel({ mode: "detail", selected, start: null, customerId: "", draftSeed: null }); scrollTo(".appointment-panel.is-active"); }}
        />
      )}

      <section className={`agenda-layout ${availabilityMode ? "is-availability-mode" : ""}`}>
        {practitioner ? (
          <CalendarioVista
            practitioner={practitioner}
            allowOutsideHours={allowOutsideHours}
            businessHours={businessHours}
            focusDate={calendarFocusDate}
            draftAppointment={panel.mode === "create" ? draftAppointment : null}
            selectingAvailability={availabilityMode}
            onCancelAvailability={() => { setAvailabilityMode(false); scrollTo(".appointment-panel"); }}
            onCreateAt={selectCalendarTime}
            onSelectEvent={(selected) => { setAvailabilityMode(false); setDraftAppointment(null); setPanel({ mode: "detail", selected, start: null, customerId: "", draftSeed: null }); scrollTo(".appointment-panel.is-active"); }}
          />
        ) : isLoading ? <div className="card empty-state">Cargando agendas…</div>
          : isError ? <div className="card empty-state">No se han podido cargar las agendas. Recarga la página.</div>
          : <div className="card empty-state">{isAdmin ? "Crea un profesional en “Clínica y agendas” para empezar." : "Todavía no hay agendas. Pide a la administración que cree un profesional."}</div>}
        <AppointmentPanel
          allowOutsideHours={allowOutsideHours}
          businessHours={businessHours}
          defaultHourlyRate={clinicData?.clinic?.defaultHourlyRate || 0}
          mode={panel.mode}
          selected={panel.selected}
          draftStart={panel.start}
          draftSeed={panel.draftSeed}
          initialCustomerId={panel.customerId}
          practitioner={practitioner}
          onDraftChange={setDraftAppointment}
          onShowAvailability={showAvailability}
          onClose={closePanel}
          onCreated={(message) => { closePanel(); setNotice(message || "Cita guardada"); }}
        />
        {notice && (
          <div className="status-message" role="status" aria-live="polite" style={{ position: "fixed", right: 20, bottom: 20, zIndex: 50, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,.12)", fontWeight: 700 }}>
            <FiCheckCircle aria-hidden="true" /> {notice}
          </div>
        )}
      </section>
    </main>
  );
};

export default PageHome;
