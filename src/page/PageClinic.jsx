import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiClock, FiPlus, FiSave, FiUserCheck, FiUsers } from "react-icons/fi";
import { createPractitioner, getClinic, getPractitioners, invitePractitioner, updateClinic, updatePractitioner } from "@/API";

const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const emptyPractitioner = { name: "", lastName: "", email: "", color: "#087655" };

const PageClinic = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [professional, setProfessional] = useState(emptyPractitioner);
  const [message, setMessage] = useState("");
  const { data: clinicData, isLoading } = useQuery({ queryKey: ["clinic"], queryFn: getClinic });
  const { data: practitionersData } = useQuery({ queryKey: ["practitioners", "all"], queryFn: () => getPractitioners(true) });

  useEffect(() => {
    if (clinicData?.clinic) setForm(clinicData.clinic);
  }, [clinicData]);

  const saveClinic = useMutation({
    mutationFn: () => updateClinic({ name: form.name, allowOutsideHours: form.allowOutsideHours, hours: form.hours }),
    onSuccess: async () => { setMessage("Horario guardado correctamente"); await queryClient.invalidateQueries({ queryKey: ["clinic"] }); },
    onError: (error) => setMessage(error.response?.data?.message || "No se ha podido guardar el horario"),
  });
  const createMutation = useMutation({
    mutationFn: () => createPractitioner(professional),
    onSuccess: async () => { setProfessional(emptyPractitioner); setMessage("Profesional añadido a la agenda"); await queryClient.invalidateQueries({ queryKey: ["practitioners"] }); },
    onError: (error) => setMessage(error.response?.data?.message || "No se ha podido crear el profesional"),
  });
  const toggleMutation = useMutation({
    mutationFn: (item) => updatePractitioner(item.id, { name: item.name, lastName: item.lastName || "", email: item.email || "", color: item.color, active: !item.active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["practitioners"] }),
  });
  const inviteMutation = useMutation({
    mutationFn: (item) => invitePractitioner(item.id, item.email),
    onSuccess: async () => { setMessage("Invitación enviada. El enlace será válido durante 48 horas"); await queryClient.invalidateQueries({ queryKey: ["practitioners"] }); },
    onError: (error) => setMessage(error.response?.data?.message || "No se ha podido enviar la invitación"),
  });

  const updateHour = (index, field, value) => setForm((current) => ({ ...current, hours: current.hours.map((hour, position) => position === index ? { ...hour, [field]: value } : hour) }));
  if (isLoading || !form) return <main className="page"><div className="card empty-state">Cargando configuración…</div></main>;
  const practitioners = practitionersData?.practitioners || [];

  return (
    <main className="page">
      <header className="page-header"><div><p className="page-kicker">Administración</p><h1 className="page-title">Clínica y agendas</h1><p className="page-subtitle">Configura horarios y profesionales aunque todavía no tengan usuario de acceso.</p></div></header>
      {message && <p className={`status-message ${(saveClinic.isError || createMutation.isError) ? "is-error" : ""}`} style={{ marginBottom: 16 }}>{message}</p>}

      <div className="responsive-two" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.55fr) minmax(300px, .9fr)", gap: 18, alignItems: "start" }}>
        <section className="card card-pad">
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}><FiClock color="var(--primary)" /><div><h2 style={{ margin: 0, fontSize: 19 }}>Horario de apertura</h2><p className="helper" style={{ margin: 0 }}>Puedes dividir cada día en mañana y tarde.</p></div></div>
          <label className="field" style={{ marginBottom: 16 }}><span>Nombre del centro</span><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
          <div style={{ display: "grid", gap: 8 }}>
            {form.hours.map((hour, index) => (
              <div className="hours-row" key={hour.weekday} style={{ display: "grid", gridTemplateColumns: "115px 62px repeat(4, minmax(75px, 1fr))", gap: 7, alignItems: "center", padding: "9px 0", borderBottom: "1px solid #eef2f0" }}>
                <strong style={{ fontSize: 13 }}>{days[hour.weekday - 1]}</strong>
                <label style={{ fontSize: 11, display: "flex", gap: 5, alignItems: "center" }}><input type="checkbox" checked={hour.enabled} onChange={(event) => updateHour(index, "enabled", event.target.checked)} /> Abre</label>
                {["firstStart", "firstEnd", "secondStart", "secondEnd"].map((field) => <input key={field} className="control" style={{ minHeight: 36, padding: "0 7px" }} type="time" disabled={!hour.enabled} value={hour[field] || ""} onChange={(event) => updateHour(index, field, event.target.value || null)} />)}
              </div>
            ))}
          </div>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 9, marginTop: 16, fontSize: 13 }}><input type="checkbox" checked={form.allowOutsideHours} onChange={(event) => setForm((current) => ({ ...current, allowOutsideHours: event.target.checked }))} /><span><strong>Permitir citas fuera de horario</strong><span className="helper" style={{ display: "block" }}>Útil para excepciones. Las horas seguirán apareciendo diferenciadas en el calendario.</span></span></label>
          <button className="button-primary" style={{ marginTop: 18 }} disabled={saveClinic.isPending} onClick={() => saveClinic.mutate()}><FiSave /> Guardar horario</button>
        </section>

        <div style={{ display: "grid", gap: 18 }}>
          <section className="card card-pad">
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}><FiPlus color="var(--primary)" /><h2 style={{ margin: 0, fontSize: 19 }}>Añadir profesional</h2></div>
            <p className="helper">Se crea solo su agenda. No necesita email ni contraseña.</p>
            <form onSubmit={(event) => { event.preventDefault(); createMutation.mutate(); }} style={{ display: "grid", gap: 11, marginTop: 14 }}>
              <label className="field"><span>Nombre *</span><input required value={professional.name} onChange={(event) => setProfessional((current) => ({ ...current, name: event.target.value }))} /></label>
              <label className="field"><span>Apellidos</span><input value={professional.lastName} onChange={(event) => setProfessional((current) => ({ ...current, lastName: event.target.value }))} /></label>
              <label className="field"><span>Email (opcional)</span><input type="email" value={professional.email} onChange={(event) => setProfessional((current) => ({ ...current, email: event.target.value }))} /></label>
              <label className="field"><span>Color de agenda</span><input type="color" value={professional.color} onChange={(event) => setProfessional((current) => ({ ...current, color: event.target.value }))} /></label>
              <button className="button-primary" disabled={createMutation.isPending}><FiUserCheck /> Crear agenda</button>
            </form>
          </section>

          <section className="card card-pad">
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}><FiUsers color="var(--primary)" /><h2 style={{ margin: 0, fontSize: 19 }}>Profesionales</h2></div>
            <div style={{ display: "grid", gap: 8 }}>
              {practitioners.map((item) => <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: 10, border: "1px solid var(--line)", borderRadius: 9, opacity: item.active ? 1 : .58 }}><div style={{ display: "flex", alignItems: "center", gap: 9 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: item.color }} /><div><strong style={{ fontSize: 13 }}>{item.name} {item.lastName}</strong><small className="helper" style={{ display: "block" }}>{item.status === "INVITED" ? "Invitación pendiente" : item.userId ? "Con acceso" : "Solo agenda"}</small></div></div><div style={{ display: "flex", gap: 4 }}>{!item.userId && item.email && <button className="button-ghost" onClick={() => inviteMutation.mutate(item)}>Invitar</button>}<button className="button-ghost" onClick={() => toggleMutation.mutate(item)}>{item.active ? "Desactivar" : "Activar"}</button></div></div>)}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default PageClinic;
