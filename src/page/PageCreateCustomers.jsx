import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { FiArrowLeft, FiChevronDown, FiChevronUp, FiPlus, FiTrash2 } from "react-icons/fi";
import { postCustomerCreate } from "@/API";

const initial = {
  fullName: "", dateBirth: "", emailAddress: "", preferredCommunication: "",
  profession: "", address: "", population: "", province: "", cD: "", weight: "", height: "",
};

const PageCreateCustomers = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [phones, setPhones] = useState([]);
  const [phone, setPhone] = useState({ rawValue: "", label: "Móvil", kind: "MOBILE" });
  const [more, setMore] = useState(false);
  const mutation = useMutation({
    mutationFn: postCustomerCreate,
    onSuccess: (response) => navigate(`/customers/${response.customer.id}`),
  });

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const addPhone = () => {
    if (!phone.rawValue.trim()) return;
    setPhones((current) => [...current, { ...phone, rawValue: phone.rawValue.trim(), isCommunicationPhone: current.length === 0 }]);
    setPhone({ rawValue: "", label: "Móvil", kind: "MOBILE" });
  };

  const submit = (event) => {
    event.preventDefault();
    mutation.mutate({
      ...form,
      dateBirth: form.dateBirth || null,
      cD: form.cD || null,
      weight: form.weight || null,
      height: form.height || null,
      province: form.province || null,
      PhoneNumber: phones,
    });
  };

  return (
    <main className="page" style={{ maxWidth: 980 }}>
      <button type="button" className="button-ghost" style={{ marginBottom: 12, paddingLeft: 0 }} onClick={() => navigate("/customers")}><FiArrowLeft /> Volver a clientes</button>
      <header className="page-header"><div><p className="page-kicker">Alta de paciente</p><h1 className="page-title">Nuevo cliente</h1><p className="page-subtitle">Solo el nombre completo es imprescindible. Podrás completar lo demás cuando quieras.</p></div></header>

      <form onSubmit={submit} className="card card-pad" style={{ display: "grid", gap: 22 }}>
        <section style={{ display: "grid", gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Datos imprescindibles</h2>
          <label className="field"><span>Nombre completo *</span><input name="fullName" value={form.fullName} onChange={change} required maxLength={200} autoFocus placeholder="Nombre y apellidos" /></label>
        </section>

        <section style={{ display: "grid", gap: 14, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
          <div><h2 style={{ margin: 0, fontSize: 18 }}>Contacto <span className="helper">(opcional)</span></h2><p className="helper">Acepta números antiguos, texto libre y varios teléfonos con el mismo nombre.</p></div>
          <div className="phone-entry-grid" style={{ display: "grid", gridTemplateColumns: "130px minmax(0,1fr) auto", gap: 9, alignItems: "end" }}>
            <label className="field"><span>Etiqueta</span><input value={phone.label} onChange={(event) => setPhone((value) => ({ ...value, label: event.target.value }))} placeholder="Móvil, casa…" /></label>
            <label className="field"><span>Teléfono o anotación</span><input value={phone.rawValue} onChange={(event) => setPhone((value) => ({ ...value, rawValue: event.target.value }))} placeholder="600 123 456 / madre: 91…" /></label>
            <button type="button" className="button-secondary" onClick={addPhone}><FiPlus /> Añadir</button>
          </div>
          {phones.map((item, index) => (
            <div key={`${item.rawValue}-${index}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "9px 12px", borderRadius: 9, background: "#f7faf8" }}>
              <label style={{ display: "flex", gap: 9, alignItems: "center" }}><input type="radio" checked={item.isCommunicationPhone} onChange={() => setPhones((values) => values.map((value, position) => ({ ...value, isCommunicationPhone: position === index })))} /> <strong>{item.label || "Teléfono"}</strong> {item.rawValue}</label>
              <button type="button" className="icon-button" onClick={() => setPhones((values) => values.filter((_, position) => position !== index))}><FiTrash2 /></button>
            </div>
          ))}
          <div className="responsive-two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label className="field"><span>Email</span><input type="email" name="emailAddress" value={form.emailAddress} onChange={change} /></label>
            <label className="field"><span>Comunicación preferida</span><select name="preferredCommunication" value={form.preferredCommunication} onChange={change}><option value="">Sin definir</option><option value="EMAIL">Email</option><option value="PHONE">Llamada</option><option value="WHATSAPP">WhatsApp</option><option value="SMS">SMS</option></select></label>
          </div>
        </section>

        <button type="button" className="button-secondary" onClick={() => setMore((value) => !value)}>{more ? <FiChevronUp /> : <FiChevronDown />} {more ? "Ocultar datos opcionales" : "Añadir más datos opcionales"}</button>
        {more && (
          <section className="responsive-two" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 14 }}>
            <label className="field"><span>Fecha de nacimiento</span><input type="date" name="dateBirth" value={form.dateBirth} onChange={change} /></label>
            <label className="field"><span>Profesión</span><input name="profession" value={form.profession} onChange={change} /></label>
            <label className="field"><span>Dirección</span><input name="address" value={form.address} onChange={change} /></label>
            <label className="field"><span>Población</span><input name="population" value={form.population} onChange={change} /></label>
            <label className="field"><span>Provincia</span><input name="province" value={form.province} onChange={(event) => setForm((current) => ({ ...current, province: event.target.value.toUpperCase().replaceAll(" ", "_") }))} placeholder="MADRID" /></label>
            <label className="field"><span>Código postal</span><input name="cD" inputMode="numeric" value={form.cD} onChange={change} /></label>
            <label className="field"><span>Peso (kg)</span><input type="number" min="0" name="weight" value={form.weight} onChange={change} /></label>
            <label className="field"><span>Altura (cm)</span><input type="number" min="0" name="height" value={form.height} onChange={change} /></label>
          </section>
        )}

        {mutation.isError && <p className="status-message is-error">{mutation.error.response?.data?.message || "No se ha podido crear el cliente"}</p>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}><button type="button" className="button-secondary" onClick={() => navigate("/customers")}>Cancelar</button><button className="button-primary" disabled={mutation.isPending}>{mutation.isPending ? "Creando…" : "Crear cliente"}</button></div>
      </form>
    </main>
  );
};

export default PageCreateCustomers;
