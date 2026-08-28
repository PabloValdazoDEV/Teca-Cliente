import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { FiChevronLeft, FiChevronRight, FiDownload, FiEdit3, FiEye, FiPlus, FiSearch } from "react-icons/fi";
import { downloadFullExport, getAllCustomers } from "@/API";
import { useAuth } from "@/context/AuthContext";

const displayPhone = (phone) =>
  phone.rawValue || [phone.label, phone.countryCode, phone.phoneNumber].filter(Boolean).join(" ");

const PageCustomers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["customers", page, search],
    queryFn: () => getAllCustomers({ page, ...(search ? { name: search } : {}) }),
  });
  const isAdmin = ["ADMIN", "SUPERADMIN"].includes(user?.role);

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(name.trim());
  };

  return (
    <main className="page">
      <header className="page-header">
        <div><p className="page-kicker">Pacientes</p><h1 className="page-title">Clientes</h1><p className="page-subtitle">Datos personales, citas y documentación clínica en un solo lugar.</p></div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          {isAdmin && <button type="button" className="button-secondary" disabled={exporting} onClick={async () => { setExporting(true); try { await downloadFullExport(); } finally { setExporting(false); } }}><FiDownload /> {exporting ? "Generando…" : "Exportar todo"}</button>}
          <button type="button" className="button-primary" onClick={() => navigate("/customers/create")}><FiPlus /> Nuevo cliente</button>
        </div>
      </header>

      <section className="card" style={{ marginBottom: 16, padding: 14 }}>
        <form onSubmit={submitSearch} style={{ display: "flex", gap: 9, maxWidth: 520 }}>
          <label className="field" style={{ flex: 1 }}><span className="sr-only">Buscar cliente</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Buscar por nombre…" /></label>
          <button className="button-secondary"><FiSearch /> Buscar</button>
          {search && <button type="button" className="button-ghost" onClick={() => { setName(""); setSearch(""); setPage(1); }}>Limpiar</button>}
        </form>
      </section>

      <section className="card data-table-wrap">
        {isLoading ? <div className="empty-state">Cargando clientes…</div> : isError ? <div className="empty-state">No se han podido cargar los clientes.</div> : data.length === 0 ? <div className="empty-state">No hay clientes que coincidan con la búsqueda.</div> : (
          <table className="data-table">
            <thead><tr><th>ID</th><th>Cliente</th><th>Contacto</th><th>Comunicación</th><th style={{ textAlign: "right" }}>Acciones</th></tr></thead>
            <tbody>
              {data.map((customer) => {
                const preferred = customer.phones?.find((phone) => phone.isCommunicationPhone) || customer.phones?.[0];
                return (
                  <tr key={customer.id}>
                    <td><span className="badge">ID-{String(customer.customerNumber || 0).padStart(6, "0")}</span></td>
                    <td><strong>{customer.fullName || "Sin nombre"}</strong><div className="helper">{customer.emailAddress || "Sin email"}</div></td>
                    <td>{preferred ? displayPhone(preferred) : <span className="helper">Sin teléfono</span>}</td>
                    <td>{customer.preferredCommunication || "—"}</td>
                    <td><div className="table-actions"><button className="icon-button" title="Ver cliente" onClick={() => navigate(`/customers/${customer.id}`)}><FiEye /></button><button className="icon-button" title="Editar datos" onClick={() => navigate(`/customers/edit/${customer.id}`)}><FiEdit3 /></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 16 }}>
        <button className="icon-button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><FiChevronLeft /></button>
        <span className="helper">Página {page}</span>
        <button className="icon-button" disabled={data.length < 10} onClick={() => setPage((value) => value + 1)}><FiChevronRight /></button>
      </div>
    </main>
  );
};

export default PageCustomers;
