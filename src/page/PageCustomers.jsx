import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { FiArchive, FiChevronLeft, FiChevronRight, FiDownload, FiEdit3, FiEye, FiPlus, FiSearch } from "react-icons/fi";
import { downloadFullExport, getAllCustomers } from "@/API";
import { useAuth } from "@/context/AuthContext";
import { CHANNEL_LABELS, phoneText, preferredPhone, telHref } from "@/utils/contact";

const PageCustomers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [archived, setArchived] = useState(false);
  const isAdmin = ["ADMIN", "SUPERADMIN"].includes(user?.role);
  const showArchived = isAdmin && archived;
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["customers", page, search, showArchived],
    queryFn: () => getAllCustomers({ page, ...(search ? { q: search } : {}), ...(showArchived ? { archived: true } : {}) }),
  });

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(query.trim());
  };

  return (
    <main className="page">
      <header className="page-header">
        <div><p className="page-kicker">Pacientes</p><h1 className="page-title">Clientes</h1><p className="page-subtitle">Datos personales, citas y documentación clínica en un solo lugar.</p></div>
        <div className="page-header-actions">
          {isAdmin && <button type="button" className="button-secondary hide-on-mobile" disabled={exporting} onClick={async () => { setExporting(true); try { await downloadFullExport(); } finally { setExporting(false); } }}><FiDownload /> {exporting ? "Generando…" : "Exportar todo"}</button>}
          <button type="button" className="button-primary" onClick={() => navigate("/customers/create")}><FiPlus /> Nuevo cliente</button>
        </div>
      </header>

      <section className="card" style={{ marginBottom: 16, padding: 14 }}>
        <form onSubmit={submitSearch} className="customer-search-form">
          <label className="field" style={{ flex: 1 }}><span className="sr-only">Buscar cliente por nombre, teléfono o email</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, teléfono o email…" /></label>
          <button className="button-secondary"><FiSearch /> Buscar</button>
          {search && <button type="button" className="button-ghost" onClick={() => { setQuery(""); setSearch(""); setPage(1); }}>Limpiar</button>}
        </form>
        {isAdmin && (
          <div role="group" aria-label="Mostrar pacientes" style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <button type="button" className={archived ? "button-ghost" : "button-secondary"} aria-pressed={!archived} onClick={() => { setArchived(false); setPage(1); }}>Activos</button>
            <button type="button" className={archived ? "button-secondary" : "button-ghost"} aria-pressed={archived} onClick={() => { setArchived(true); setPage(1); }}><FiArchive /> Archivados</button>
          </div>
        )}
      </section>

      <section className="card data-table-wrap">
        {isLoading ? <div className="empty-state">Cargando clientes…</div> : isError ? <div className="empty-state">No se han podido cargar los clientes.</div> : data.length === 0 ? <div className="empty-state">{showArchived ? (search ? "No hay pacientes archivados que coincidan." : "No hay pacientes archivados.") : "No hay clientes que coincidan con la búsqueda."}</div> : (
          <table className="data-table mobile-card-table customers-table">
            <thead><tr><th>ID</th><th>Cliente</th><th>Contacto</th><th>Comunicación</th><th style={{ textAlign: "right" }}>Acciones</th></tr></thead>
            <tbody>
              {data.map((customer) => {
                const preferred = preferredPhone(customer.phones);
                const tel = preferred && telHref(preferred);
                return (
                  <tr key={customer.id}>
                    <td data-label="ID"><span className="badge">ID-{String(customer.customerNumber || 0).padStart(6, "0")}</span></td>
                    <td data-label="Cliente"><button type="button" className="customer-name-link" onClick={() => navigate(`/customers/${customer.id}`)}><strong>{customer.fullName || "Sin nombre"}</strong></button><span className="helper mobile-only"> · ID-{String(customer.customerNumber || 0).padStart(6, "0")}</span>{customer.archivedAt && <span className="badge" style={{ marginLeft: 8 }}>Archivado</span>}<div className="helper">{customer.emailAddress || "Sin email"}</div></td>
                    <td data-label="Contacto">{preferred ? (tel ? <a href={tel} className="phone-link" aria-label={`Llamar a ${customer.fullName || "cliente"}`}>{phoneText(preferred)}</a> : phoneText(preferred)) : <span className="helper">Sin teléfono</span>}</td>
                    <td data-label="Comunicación">{CHANNEL_LABELS[customer.preferredCommunication] || customer.preferredCommunication || "—"}</td>
                    <td data-label="Acciones"><div className="table-actions"><button type="button" className="icon-button" title="Ver cliente" aria-label={`Ver a ${customer.fullName || "cliente"}`} onClick={() => navigate(`/customers/${customer.id}`)}><FiEye /></button><button type="button" className="icon-button" title="Editar datos" aria-label={`Editar a ${customer.fullName || "cliente"}`} onClick={() => navigate(`/customers/edit/${customer.id}`)}><FiEdit3 /></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <div className="pagination-controls">
        <button type="button" className="icon-button" aria-label="Página anterior" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><FiChevronLeft /></button>
        <span className="helper">Página {page}</span>
        <button type="button" className="icon-button" aria-label="Página siguiente" disabled={data.length < 10} onClick={() => setPage((value) => value + 1)}><FiChevronRight /></button>
      </div>
    </main>
  );
};

export default PageCustomers;
