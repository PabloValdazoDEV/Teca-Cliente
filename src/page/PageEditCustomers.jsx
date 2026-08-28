import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { FiArrowLeft, FiPlus, FiSave, FiTrash2 } from "react-icons/fi";
import { getCustomerEdit, putCustomerEdit } from "@/API";

const phoneDisplay = (phone) => phone.rawValue || [phone.countryCode, phone.phoneNumber].filter(Boolean).join(" ");

const PageEditCustomers = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [phones, setPhones] = useState([]);
  const [newPhone, setNewPhone] = useState({ label: "Móvil", rawValue: "", kind: "MOBILE" });
  const [status, setStatus] = useState("");
  const { data, isLoading, isError } = useQuery({ queryKey: ["customer-edit", id], queryFn: () => getCustomerEdit(id) });

  useEffect(() => {
    if (!data) return;
    setForm({
      fullName: data.fullName || "", dateBirth: data.dateBirth ? String(data.dateBirth).slice(0, 10) : "",
      emailAddress: data.emailAddress || "", preferredCommunication: data.preferredCommunication || "",
      profession: data.profession || "", address: data.address || "", population: data.population || "",
      province: data.province || "", cD: data.cD || "", weight: data.weight || "", height: data.height || "",
    });
    setPhones((data.phones || []).map((phone, index) => ({ label: phone.label || (phone.kind === "LANDLINE" ? "Teléfono" : "Móvil"), rawValue: phoneDisplay(phone), kind: phone.kind || "OTHER", isCommunicationPhone: phone.isCommunicationPhone || (index === 0 && !data.phones.some((item) => item.isCommunicationPhone)) })));
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => putCustomerEdit({ id, ...form, dateBirth: form.dateBirth || null, cD: form.cD || null, weight: form.weight || null, height: form.height || null, province: form.province || null, PhoneNumber: phones }),
    onSuccess: async () => { await Promise.all([queryClient.invalidateQueries({ queryKey: ["customer", id] }), queryClient.invalidateQueries({ queryKey: ["customers"] })]); navigate(`/customers/${id}`); },
    onError: (error) => setStatus(error.response?.data?.message || "No se han podido guardar los cambios"),
  });

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const addPhone = () => { if (!newPhone.rawValue.trim()) return; setPhones((current) => [...current, { ...newPhone, rawValue: newPhone.rawValue.trim(), isCommunicationPhone: current.length === 0 }]); setNewPhone({ label: "Móvil", rawValue: "", kind: "MOBILE" }); };
  if (isError) return <main className="page"><div className="card empty-state">No se ha podido abrir el cliente.</div></main>;
  if (isLoading || !form) return <main className="page"><div className="card empty-state">Cargando datos…</div></main>;

  return (
    <main className="page" style={{ maxWidth: 980 }}>
      <button className="button-ghost" style={{ paddingLeft: 0, marginBottom: 10 }} onClick={() => navigate(`/customers/${id}`)}><FiArrowLeft /> Volver al cliente</button>
      <header className="page-header"><div><p className="page-kicker">Datos personales</p><h1 className="page-title">Editar cliente</h1><p className="page-subtitle">El nombre es el único campo obligatorio.</p></div></header>
      <form className="card card-pad" style={{ display: "grid", gap: 22 }} onSubmit={(event) => { event.preventDefault(); setStatus(""); mutation.mutate(); }}>
        <section className="responsive-two" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 14 }}>
          <label className="field" style={{ gridColumn: "1 / -1" }}><span>Nombre completo *</span><input required name="fullName" value={form.fullName} onChange={change} /></label>
          <label className="field"><span>Fecha de nacimiento</span><input type="date" name="dateBirth" value={form.dateBirth} onChange={change} /></label>
          <label className="field"><span>Email</span><input type="email" name="emailAddress" value={form.emailAddress} onChange={change} /></label>
          <label className="field"><span>Comunicación preferida</span><select name="preferredCommunication" value={form.preferredCommunication} onChange={change}><option value="">Sin definir</option><option value="EMAIL">Email</option><option value="PHONE">Llamada</option><option value="WHATSAPP">WhatsApp</option><option value="SMS">SMS</option></select></label>
          <label className="field"><span>Profesión</span><input name="profession" value={form.profession} onChange={change} /></label>
          <label className="field"><span>Dirección</span><input name="address" value={form.address} onChange={change} /></label>
          <label className="field"><span>Población</span><input name="population" value={form.population} onChange={change} /></label>
          <label className="field"><span>Provincia</span><input name="province" value={form.province} onChange={(event) => setForm((current) => ({ ...current, province: event.target.value.toUpperCase().replaceAll(" ", "_") }))} /></label>
          <label className="field"><span>Código postal</span><input inputMode="numeric" name="cD" value={form.cD} onChange={change} /></label>
          <label className="field"><span>Peso (kg)</span><input type="number" min="0" name="weight" value={form.weight} onChange={change} /></label>
          <label className="field"><span>Altura (cm)</span><input type="number" min="0" name="height" value={form.height} onChange={change} /></label>
        </section>

        <section style={{ display: "grid", gap: 11, paddingTop: 18, borderTop: "1px solid var(--line)" }}><div><h2 style={{ margin: 0, fontSize: 18 }}>Teléfonos</h2><p className="helper">Puedes mantener varios, etiquetarlos y escribir el dato tal como figure en el archivo antiguo.</p></div><div className="phone-entry-grid" style={{ display: "grid", gridTemplateColumns: "130px 1fr auto", gap: 9, alignItems: "end" }}><label className="field"><span>Etiqueta</span><input value={newPhone.label} onChange={(event) => setNewPhone((current) => ({ ...current, label: event.target.value }))} /></label><label className="field"><span>Teléfono o anotación</span><input value={newPhone.rawValue} onChange={(event) => setNewPhone((current) => ({ ...current, rawValue: event.target.value }))} /></label><button type="button" className="button-secondary" onClick={addPhone}><FiPlus /> Añadir</button></div>{phones.map((phone, index) => <div key={`${phone.rawValue}-${index}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 9, background: "#f7faf8" }}><label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="radio" checked={phone.isCommunicationPhone} onChange={() => setPhones((values) => values.map((value, position) => ({ ...value, isCommunicationPhone: position === index }))} /><strong>{phone.label}</strong> {phone.rawValue}</label><button type="button" className="icon-button" onClick={() => setPhones((values) => values.filter((_, position) => position !== index))}><FiTrash2 /></button></div>)}</section>
        {status && <p className="status-message is-error">{status}</p>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}><button type="button" className="button-secondary" onClick={() => navigate(`/customers/${id}`)}>Cancelar</button><button className="button-primary" disabled={mutation.isPending}><FiSave /> {mutation.isPending ? "Guardando…" : "Guardar cambios"}</button></div>
      </form>
    </main>
  );
};

export default PageEditCustomers;
