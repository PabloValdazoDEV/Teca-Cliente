import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { FiArrowRight, FiClock, FiDownload, FiSave, FiShield, FiUsers } from "react-icons/fi";
import { downloadFullExport, getClinic, updateClinic } from "@/API";

const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const hourShifts = [
  {
    label: "Primer turno (mañana)",
    fields: [
      { field: "firstStart", label: "Desde" },
      { field: "firstEnd", label: "Hasta" },
    ],
  },
  {
    label: "Segundo turno (tarde)",
    fields: [
      { field: "secondStart", label: "Desde" },
      { field: "secondEnd", label: "Hasta" },
    ],
  },
];

const PageClinic = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { data: clinicData, isLoading } = useQuery({ queryKey: ["clinic"], queryFn: getClinic });

  useEffect(() => {
    if (clinicData?.clinic) setForm(clinicData.clinic);
  }, [clinicData]);

  const saveClinic = useMutation({
    mutationFn: () => updateClinic({ name: form.name, allowOutsideHours: form.allowOutsideHours, defaultHourlyRate: Number(form.defaultHourlyRate) || 0, hours: form.hours }),
    onSuccess: async () => { setMessageIsError(false); setMessage("Configuración guardada correctamente"); await queryClient.invalidateQueries({ queryKey: ["clinic"] }); },
    onError: (error) => { setMessageIsError(true); setMessage(error.response?.data?.message || "No se ha podido guardar el horario"); },
  });
  const updateHour = (index, field, value) => setForm((current) => ({ ...current, hours: current.hours.map((hour, position) => position === index ? { ...hour, [field]: value } : hour) }));
  const downloadWeeklyBackup = async () => {
    setExporting(true);
    setMessageIsError(false);
    setMessage("");
    try {
      const result = await downloadFullExport();
      setForm((current) => ({ ...current, lastBackupExportAt: result.exportedAt }));
      setMessage("Copia semanal descargada correctamente");
      await queryClient.invalidateQueries({ queryKey: ["clinic"] });
    } catch (error) {
      setMessageIsError(true);
      setMessage(error.response?.data?.message || "No se ha podido generar la copia semanal");
    } finally {
      setExporting(false);
    }
  };
  if (isLoading || !form) return <main className="page"><div className="card empty-state">Cargando configuración…</div></main>;
  const lastBackupDate = form.lastBackupExportAt ? new Date(form.lastBackupExportAt) : null;
  const backupIsCurrent = lastBackupDate && Date.now() - lastBackupDate.getTime() < 7 * 24 * 60 * 60 * 1_000;

  return (
    <main className="page">
      <header className="page-header"><div><p className="page-kicker">Administración</p><h1 className="page-title">Clínica y agendas</h1><p className="page-subtitle">Configura horarios y profesionales aunque todavía no tengan usuario de acceso.</p></div></header>
      {message && <p className={`status-message ${messageIsError ? "is-error" : ""}`} style={{ marginBottom: 16 }}>{message}</p>}

      <div className="responsive-two" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.55fr) minmax(300px, .9fr)", gap: 18, alignItems: "start" }}>
        <section className="card card-pad">
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}><FiClock color="var(--primary)" /><div><h2 style={{ margin: 0, fontSize: 19 }}>Horario de apertura</h2><p className="helper" style={{ margin: 0 }}>Configura un primer turno de mañana y un segundo turno de tarde.</p></div></div>
          <label className="field" style={{ marginBottom: 16 }}><span>Nombre del centro</span><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
          <label className="field" style={{ maxWidth: 300, marginBottom: 16 }}><span>Precio predeterminado por hora (€)</span><input type="number" min="0" max="10000" step="1" value={form.defaultHourlyRate ?? 0} onChange={(event) => setForm((current) => ({ ...current, defaultHourlyRate: event.target.value }))} /><small className="helper">Las citas nuevas calcularán el precio proporcionalmente a su duración.</small></label>
          <div style={{ display: "grid", gap: 8 }}>
            {form.hours.map((hour, index) => ![0, 6].includes(hour.weekday) && (
              <div className="hours-row" key={hour.weekday} style={{ display: "grid", gridTemplateColumns: "115px 62px repeat(2, minmax(190px, 1fr))", gap: 10, alignItems: "center", padding: "11px 0", borderBottom: "1px solid #eef2f0" }}>
                <strong style={{ fontSize: 13 }}>{days[hour.weekday]}</strong>
                <label style={{ fontSize: 11, display: "flex", gap: 5, alignItems: "center" }}><input type="checkbox" checked={hour.enabled} onChange={(event) => updateHour(index, "enabled", event.target.checked)} /> Abre</label>
                {hourShifts.map((shift) => (
                  <div className="hours-shift" key={shift.label}>
                    <span className="hours-shift-title">{shift.label}</span>
                    <div className="hours-shift-times">
                      {shift.fields.map(({ field, label }) => (
                        <label className="hour-field" key={field}>
                          <span>{label}</span>
                          <input className="control" style={{ minHeight: 36, padding: "0 7px" }} type="time" aria-label={`${days[hour.weekday]}: ${shift.label}, ${label}`} disabled={!hour.enabled} value={hour[field] || ""} onChange={(event) => updateHour(index, field, event.target.value || null)} />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 9, marginTop: 16, fontSize: 13 }}><input type="checkbox" checked={form.allowOutsideHours} onChange={(event) => setForm((current) => ({ ...current, allowOutsideHours: event.target.checked }))} /><span><strong>Permitir citas fuera de horario</strong><span className="helper" style={{ display: "block" }}>Útil para excepciones. Las horas seguirán apareciendo diferenciadas en el calendario.</span></span></label>
          <button className="button-primary clinic-save-button" style={{ marginTop: 18 }} disabled={saveClinic.isPending} onClick={() => saveClinic.mutate()}><FiSave /> Guardar configuración</button>
        </section>

        <div style={{ display: "grid", gap: 18 }}>
          <section className="card card-pad">
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}><FiShield color="var(--primary)" /><h2 style={{ margin: 0, fontSize: 19 }}>Copia semanal</h2></div>
            <p className="helper" style={{ lineHeight: 1.55 }}>Descarga un ZIP privado con el Excel de pacientes, citas, documentos y versiones anteriores, organizado como “Ejemplos clientes”.</p>
            <p className={`status-message ${backupIsCurrent ? "" : "is-error"}`}>
              {lastBackupDate
                ? `${backupIsCurrent ? "Copia de esta semana realizada" : "La copia semanal está pendiente"} · ${lastBackupDate.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}`
                : "Todavía no se ha registrado ninguna copia completa."}
            </p>
            <button type="button" className="button-secondary" style={{ width: "100%", marginTop: 12 }} disabled={exporting} onClick={downloadWeeklyBackup}><FiDownload /> {exporting ? "Generando ZIP…" : "Descargar copia ahora"}</button>
            <small className="helper" style={{ display: "block", marginTop: 9 }}>TECA no envía esta copia a servicios externos. Guárdala en una ubicación cifrada.</small>
          </section>

          <section className="card card-pad">
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}><FiUsers color="var(--primary)" /><h2 style={{ margin: 0, fontSize: 19 }}>Profesionales y accesos</h2></div>
            <p className="helper">Quién tiene agenda y quién puede entrar en TECA se gestiona ahora desde una sola pantalla.</p>
            <Link to="/team" className="button-secondary" style={{ width: "100%", marginTop: 8 }}>Ir a Equipo <FiArrowRight /></Link>
          </section>
        </div>
      </div>
    </main>
  );
};

export default PageClinic;
