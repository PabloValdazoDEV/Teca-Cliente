/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { FiCalendar, FiClock, FiEdit3, FiFileText, FiPlus, FiTrash2, FiUser } from "react-icons/fi";
import { deleteDate, getFormDateCreate, postDataCreate, putDataEdit } from "@/API";

const toInputValue = (date) => {
  if (!date) return "";
  const value = new Date(date);
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

const toApiDate = (value) => value ? `${value.replace("T", " ")}:00`.slice(0, 19) : "";

const emptyForm = (practitionerId, start, customerId = "") => ({
  customerId,
  citaDate: toInputValue(start || new Date()),
  userId: practitionerId || "",
  time: 60,
  sessionPrice: "",
  dateObservation: "",
  dateAdvance: false,
  urgent_date: false,
});

const AppointmentPanel = ({ draftStart, initialCustomerId, mode, onClose, onCreated, practitioner, selected }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState(() => emptyForm(practitioner?.id, draftStart, initialCustomerId));
  const { data: formData } = useQuery({ queryKey: ["appointment-form"], queryFn: getFormDateCreate });

  const effectiveMode = mode === "detail" && !editing ? "detail" : "form";
  useEffect(() => {
    setStatus("");
    setEditing(false);
    if (mode === "detail" && selected) {
      setForm({
        customerId: selected.customerId,
        citaDate: toInputValue(selected.start || selected.citaDate),
        userId: selected.practitionerId || practitioner?.id || "",
        time: selected.time || 60,
        sessionPrice: selected.sessionPrice ?? "",
        dateObservation: selected.dateObservation || "",
        dateAdvance: selected.advance_date === "TRUE",
        urgent_date: Boolean(selected.urgent_date),
      });
    } else {
      setForm(emptyForm(practitioner?.id, draftStart, initialCustomerId));
    }
  }, [draftStart, initialCustomerId, mode, practitioner?.id, selected]);

  const customers = useMemo(() => formData?.dataCustomers || [], [formData]);
  const currentCustomer = useMemo(
    () => selected?.customer || customers.find((customer) => customer.id === form.customerId),
    [customers, form.customerId, selected]
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        citaDate: toApiDate(form.citaDate),
        time: Number(form.time),
        sessionPrice: form.sessionPrice === "" ? 0 : Number(form.sessionPrice),
        customer: currentCustomer,
      };
      return selected?.id
        ? putDataEdit({ ...payload, dateId: selected.id })
        : postDataCreate(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setStatus(selected?.id ? "Cita actualizada" : "Cita creada correctamente");
      onCreated?.();
    },
    onError: (error) => setStatus(error.response?.data?.message || "No se ha podido guardar la cita"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteDate(selected.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["appointments"] });
      onClose();
    },
  });

  const change = (event) => {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  if (mode === "empty") {
    return (
      <aside className="card appointment-panel">
        <div className="appointment-panel-inner empty-state">
          <div>
            <FiCalendar size={30} style={{ margin: "0 auto 12px", color: "var(--primary)" }} />
            <strong>Selecciona una cita</strong>
            <p className="helper">Pulsa una hora libre para crearla o una cita para consultar sus datos.</p>
          </div>
        </div>
      </aside>
    );
  }

  if (effectiveMode === "detail") {
    const date = new Date(selected.start || selected.citaDate);
    return (
      <aside className="card appointment-panel">
        <div className="appointment-panel-inner">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div><p className="page-kicker">Detalle de cita</p><h2>{currentCustomer?.fullName || "Paciente"}</h2></div>
            <button type="button" className="button-ghost" onClick={onClose}>Cerrar</button>
          </div>
          <div className="panel-section" style={{ display: "grid", gap: 12 }}>
            <div><FiCalendar /> <strong>{date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</strong></div>
            <div><FiClock /> {date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} · {selected.time} min</div>
            <div><FiUser /> {practitioner?.name} {practitioner?.lastName}</div>
          </div>
          <div className="panel-section">
            <p className="helper">Observaciones</p>
            <p>{selected.dateObservation || "Sin observaciones"}</p>
            {selected.phones?.map((phone) => <p key={phone} className="helper">{phone}</p>)}
          </div>
          <div className="panel-actions">
            <button type="button" className="button-primary" onClick={() => setEditing(true)}><FiEdit3 /> Editar cita</button>
            <button type="button" className="button-secondary" onClick={() => navigate(`/customers/${selected.customerId}`)}><FiFileText /> Abrir paciente y documentos</button>
            <button type="button" className="button-danger" disabled={deleteMutation.isPending} onClick={() => window.confirm("¿Eliminar esta cita?") && deleteMutation.mutate()}><FiTrash2 /> Eliminar cita</button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="card appointment-panel">
      <form className="appointment-panel-inner" onSubmit={(event) => { event.preventDefault(); setStatus(""); saveMutation.mutate(); }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div><p className="page-kicker">{selected?.id ? "Editar" : "Nueva cita"}</p><h2>{selected?.id ? currentCustomer?.fullName : "Crear cita"}</h2></div>
          <button type="button" className="button-ghost" onClick={onClose}>Cerrar</button>
        </div>
        <div className="panel-section" style={{ display: "grid", gap: 12 }}>
          <label className="field"><span>Paciente *</span><select name="customerId" value={form.customerId} onChange={change} required disabled={Boolean(selected?.id)}><option value="">Selecciona un paciente</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.fullName || `ID-${String(customer.customerNumber).padStart(6, "0")}`}</option>)}</select></label>
          <label className="field"><span>Fecha y hora *</span><input type="datetime-local" name="citaDate" value={form.citaDate} onChange={change} required /></label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label className="field"><span>Duración</span><select name="time" value={form.time} onChange={change}>{[30,45,60,75,90,120].map((value) => <option key={value} value={value}>{value} min</option>)}</select></label>
            <label className="field"><span>Precio (€)</span><input name="sessionPrice" type="number" min="0" value={form.sessionPrice} onChange={change} /></label>
          </div>
          <label className="field"><span>Observaciones</span><textarea name="dateObservation" value={form.dateObservation} onChange={change} placeholder="Motivo o notas para la sesión" /></label>
          <label style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 13 }}><input type="checkbox" name="dateAdvance" checked={form.dateAdvance} onChange={change} /> Cita avanzada</label>
          <label style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 13 }}><input type="checkbox" name="urgent_date" checked={form.urgent_date} onChange={change} /> Marcar como urgente</label>
        </div>
        {status && <p className={`status-message ${saveMutation.isError ? "is-error" : ""}`} role="status">{status}</p>}
        <div className="panel-actions">
          <button className="button-primary" disabled={saveMutation.isPending}><FiPlus /> {saveMutation.isPending ? "Guardando…" : selected?.id ? "Guardar cambios" : "Crear cita"}</button>
          {selected?.id && <button type="button" className="button-secondary" onClick={() => setEditing(false)}>Cancelar edición</button>}
        </div>
      </form>
    </aside>
  );
};

export default AppointmentPanel;
