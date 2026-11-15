import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router";
import {
  FiArchive,
  FiArrowLeft,
  FiCalendar,
  FiDownload,
  FiEdit3,
  FiFile,
  FiFileText,
  FiPlus,
  FiRotateCcw,
  FiUploadCloud,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { phoneText, telHref } from "@/utils/contact";
import {
  archiveCustomer,
  createCustomerTemplates,
  downloadDocument,
  getCustomerAccessLog,
  getCustomerDetail,
  restoreCustomer,
  uploadCustomerDocument,
} from "@/API";

const officeExtensions = new Set([
  "doc",
  "docx",
  "odt",
  "rtf",
  "xls",
  "xlsx",
  "xlsm",
  "ods",
  "csv",
]);
const extension = (name = "") => name.split(".").pop()?.toLowerCase();

const ACCESS_ACTION_LABELS = {
  VIEW_PATIENT: "Abrió la ficha",
  VIEW_DOCUMENT: "Abrió un documento",
  DOWNLOAD_DOCUMENT: "Descargó un documento",
  EDIT_DOCUMENT: "Guardó una versión de un documento",
  UPLOAD_DOCUMENT: "Subió un documento",
  ARCHIVE_PATIENT: "Archivó al paciente",
  RESTORE_PATIENT: "Restauró al paciente",
};

const PageCustomerDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("summary");
  const [status, setStatus] = useState("");
  const [archiveStatus, setArchiveStatus] = useState({ text: "", error: false });
  const { user } = useAuth();
  const isAdmin = ["ADMIN", "SUPERADMIN"].includes(user?.role);
  const appointmentReturn = location.state?.appointmentReturn;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerDetail(id),
  });
  const accessLog = useQuery({
    queryKey: ["customer-access-log", id],
    queryFn: () => getCustomerAccessLog(id),
    enabled: isAdmin && tab === "access",
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => uploadCustomerDocument(id, file),
    onSuccess: async () => {
      setStatus("Documento guardado correctamente");
      await queryClient.invalidateQueries({ queryKey: ["customer", id] });
    },
    onError: (error) =>
      setStatus(
        error.response?.data?.message || "No se ha podido subir el archivo",
      ),
  });
  const templateMutation = useMutation({
    mutationFn: () => createCustomerTemplates(id),
    onSuccess: async (response) => {
      setStatus(response.message);
      await queryClient.invalidateQueries({ queryKey: ["customer", id] });
    },
    onError: (error) =>
      setStatus(
        error.response?.data?.message ||
          "No se han podido crear las plantillas",
      ),
  });

  const refreshAfterArchive = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["customer", id] }),
      queryClient.invalidateQueries({ queryKey: ["customers"] }),
      queryClient.invalidateQueries({ queryKey: ["appointments"] }),
    ]);
  const archiveMutation = useMutation({
    mutationFn: ({ cancelFutureAppointments = false } = {}) =>
      archiveCustomer(id, { cancelFutureAppointments }),
    onSuccess: async (response) => {
      setArchiveStatus({
        text: response.cancelledAppointments
          ? `Paciente archivado. Se han cancelado ${response.cancelledAppointments} citas futuras.`
          : "Paciente archivado.",
        error: false,
      });
      await refreshAfterArchive();
    },
    onError: (error) => {
      const body = error.response?.data;
      if (body?.code === "HAS_FUTURE_APPOINTMENTS") {
        const confirmed = window.confirm(
          `Este paciente tiene ${body.futureAppointments} cita(s) futura(s).\n\nSi lo archivas, esas citas se cancelarán y desaparecerán de la agenda. No se avisa al paciente.\n\n¿Archivar y cancelar las citas?`,
        );
        if (confirmed) archiveMutation.mutate({ cancelFutureAppointments: true });
        return;
      }
      setArchiveStatus({ text: body?.message || "No se ha podido archivar el paciente", error: true });
    },
  });
  const restoreMutation = useMutation({
    mutationFn: () => restoreCustomer(id),
    onSuccess: async () => {
      setArchiveStatus({ text: "Paciente restaurado. Vuelve a aparecer en los listados.", error: false });
      await refreshAfterArchive();
    },
    onError: (error) =>
      setArchiveStatus({ text: error.response?.data?.message || "No se ha podido restaurar el paciente", error: true }),
  });
  const confirmArchive = () => {
    if (
      window.confirm(
        "¿Archivar este paciente?\n\nDejará de aparecer en el listado de clientes y en el buscador de citas. Su historia clínica, documentos y citas pasadas se conservan, y puedes restaurarlo cuando quieras desde Clientes › Archivados.",
      )
    ) {
      archiveMutation.mutate({});
    }
  };

  if (isLoading)
    return (
      <main className="page">
        <div className="card empty-state">Cargando ficha del cliente…</div>
      </main>
    );
  if (isError || !data?.customer)
    return (
      <main className="page">
        <div className="card empty-state">
          No se ha podido abrir este cliente.
        </div>
      </main>
    );
  const customer = data.customer;
  const initials = (customer.fullName || "SN")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const nextAppointment =
    data.nextAppointment !== undefined
      ? data.nextAppointment
      : [...customer.appointments]
          .filter((item) => new Date(item.citaDate) >= new Date())
          .sort((a, b) => new Date(a.citaDate) - new Date(b.citaDate))[0];
  const goBack = () =>
    appointmentReturn
      ? navigate("/home", { state: { resumeAppointment: appointmentReturn } })
      : navigate("/customers");

  return (
    <main className="page">
      <button
        type="button"
        className="button-ghost customer-detail-back"
        style={{ paddingLeft: 0, marginBottom: 10 }}
        onClick={goBack}
      >
        <FiArrowLeft />{" "}
        {appointmentReturn ? "Volver a la cita" : "Volver a clientes"}
      </button>
      <section
        className="card card-pad customer-hero"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <div className="customer-identity">
          <div
            className="avatar"
            style={{ width: 68, height: 68, fontSize: 20 }}
          >
            {initials}
          </div>
          <div className="customer-identity-copy">
            <span className="badge">
              ID-{String(customer.customerNumber).padStart(6, "0")}
            </span>
            <h1 className="page-title" style={{ fontSize: 28, marginTop: 7 }}>
              {customer.fullName || "Sin nombre"}
            </h1>
            <p className="page-subtitle">
              {customer.phones.length
                ? customer.phones.map((phone, index) => {
                    const tel = telHref(phone);
                    return (
                      <span key={phone.id || index}>
                        {index > 0 && " · "}
                        {tel ? <a href={tel} className="phone-link">{phoneText(phone)}</a> : phoneText(phone)}
                      </span>
                    );
                  })
                : "Sin teléfono"}
              {customer.emailAddress ? ` · ${customer.emailAddress}` : ""}
            </p>
          </div>
        </div>
        <div className="customer-hero-actions">
          <button
            className="button-secondary"
            onClick={() =>
              navigate(`/customers/edit/${id}`, { state: location.state })
            }
          >
            <FiEdit3 /> Editar datos
          </button>
          {!customer.archivedAt && (
            <button
              className="button-primary"
              onClick={() =>
                navigate("/home", {
                  state: { createAppointment: true, customerId: id },
                })
              }
            >
              <FiPlus /> Crear cita
            </button>
          )}
          {isAdmin && !customer.archivedAt && (
            <button
              type="button"
              className="button-ghost archive-button"
              disabled={archiveMutation.isPending}
              onClick={confirmArchive}
            >
              <FiArchive /> {archiveMutation.isPending ? "Archivando…" : "Archivar"}
            </button>
          )}
        </div>
      </section>
      {customer.archivedAt && (
        <div className="appointment-past-warning" role="status" style={{ marginBottom: 18, alignItems: "center" }}>
          <FiArchive aria-hidden="true" />
          <span style={{ flex: 1 }}>
            <strong>
              Paciente archivado el{" "}
              {new Date(customer.archivedAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </strong>
            No aparece en los listados ni puede recibir citas nuevas. Su historia clínica se conserva.
          </span>
          {isAdmin && (
            <button
              type="button"
              className="button-secondary"
              disabled={restoreMutation.isPending}
              onClick={() => restoreMutation.mutate()}
            >
              <FiRotateCcw /> {restoreMutation.isPending ? "Restaurando…" : "Restaurar"}
            </button>
          )}
        </div>
      )}
      {archiveStatus.text && (
        <p className={`status-message ${archiveStatus.error ? "is-error" : ""}`} role="status" style={{ marginBottom: 18 }}>
          {archiveStatus.text}
        </p>
      )}

      <nav
        className="customer-tabs"
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid var(--line)",
          marginBottom: 18,
          overflowX: "auto",
        }}
      >
        {[
          { id: "summary", label: "Resumen" },
          { id: "appointments", label: "Citas" },
          { id: "documents", label: `Documentación (${customer.docs.length})` },
          { id: "data", label: "Datos personales" },
          ...(isAdmin ? [{ id: "access", label: "Accesos" }] : []),
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            className="button-ghost"
            style={{
              borderRadius: 0,
              borderBottom:
                tab === item.id
                  ? "2px solid var(--primary)"
                  : "2px solid transparent",
              color: tab === item.id ? "var(--primary)" : "var(--muted)",
              whiteSpace: "nowrap",
            }}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "summary" && (
        <div
          className="responsive-two"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.7fr) minmax(260px, 1fr)",
            gap: 18,
          }}
        >
          <section className="card card-pad">
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <FiCalendar color="var(--primary)" />
              <h2 style={{ margin: 0, fontSize: 18 }}>Próxima cita</h2>
            </div>
            {nextAppointment ? (
              <div style={{ marginTop: 20 }}>
                <strong>
                  {new Date(nextAppointment.citaDate).toLocaleString("es-ES", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </strong>
                <p className="helper">
                  {nextAppointment.practitioner?.name ||
                    nextAppointment.user?.name}{" "}
                  · {nextAppointment.time} minutos
                </p>
              </div>
            ) : (
              <p className="helper" style={{ marginTop: 20 }}>
                No tiene citas futuras.
              </p>
            )}
          </section>
          <section className="card card-pad">
            <h2 style={{ margin: 0, fontSize: 18 }}>Documentación</h2>
            <p style={{ fontSize: 28, fontWeight: 750, margin: "16px 0 2px" }}>
              {customer.docs.length}
            </p>
            <p className="helper">
              archivos activos con historial de versiones
            </p>
            <button
              className="button-secondary"
              style={{ marginTop: 12 }}
              onClick={() => setTab("documents")}
            >
              <FiFileText /> Abrir documentación
            </button>
          </section>
        </div>
      )}

      {tab === "appointments" && (
        <section className="card data-table-wrap">
          {customer.appointments.length ? (
            <table className="data-table mobile-card-table appointments-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Profesional</th>
                  <th>Duración</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {customer.appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td data-label="Fecha">
                      {new Date(appointment.citaDate).toLocaleString("es-ES", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td data-label="Profesional">
                      {appointment.practitioner?.name || appointment.user?.name}
                    </td>
                    <td data-label="Duración">{appointment.time} min</td>
                    <td data-label="Observaciones">{appointment.dateObservation || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">Todavía no hay citas.</div>
          )}
        </section>
      )}

      {tab === "documents" && (
        <section className="card">
          <div
            className="card-pad document-toolbar"
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              borderBottom: "1px solid var(--line)",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 18 }}>Documentación clínica</h2>
              <p className="helper">
                Los archivos originales se conservan y cada guardado crea una
                versión nueva.
              </p>
            </div>
            <input
              ref={inputRef}
              hidden
              type="file"
              accept=".doc,.docx,.odt,.rtf,.xls,.xlsx,.xlsm,.ods,.csv,.pdf,.jpg,.jpeg,.png,.webp,.txt"
              onChange={(event) =>
                event.target.files?.[0] &&
                uploadMutation.mutate(event.target.files[0])
              }
            />
            <div className="document-toolbar-actions">
              <button
                className="button-secondary"
                disabled={templateMutation.isPending}
                onClick={() => templateMutation.mutate()}
              >
                <FiPlus /> Crear plantillas
              </button>
              <button
                className="button-primary"
                disabled={uploadMutation.isPending}
                onClick={() => inputRef.current?.click()}
              >
                <FiUploadCloud />{" "}
                {uploadMutation.isPending ? "Subiendo…" : "Subir documento"}
              </button>
            </div>
          </div>
          {status && (
            <p
              className={`status-message ${uploadMutation.isError || templateMutation.isError ? "is-error" : ""}`}
              style={{ margin: 14 }}
            >
              {status}
            </p>
          )}
          {customer.docs.length ? (
            <div className="data-table-wrap">
              <table className="data-table mobile-card-table documents-table">
                <thead>
                  <tr>
                    <th>Archivo</th>
                    <th>Tipo</th>
                    <th>Versión</th>
                    <th>Tamaño</th>
                    <th style={{ textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.docs.map((document) => {
                    const fileName =
                      document.originalName || document.fileName || "Documento";
                    const canEdit =
                      officeExtensions.has(extension(fileName)) &&
                      document.storageKey;
                    return (
                      <tr key={document.id}>
                        <td data-label="Archivo">
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 9,
                            }}
                          >
                            <FiFile color="var(--primary)" />
                            <div>
                              <strong>{fileName}</strong>
                              <div className="helper">
                                {document.fixedType?.replaceAll("_", " ") ||
                                  "Archivo adjunto"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td data-label="Tipo">{document.typeDoc}</td>
                        <td data-label="Versión">v{document.versions?.[0]?.version || 1}</td>
                        <td data-label="Tamaño">
                          {document.sizeBytes
                            ? `${(document.sizeBytes / 1024).toFixed(0)} KB`
                            : "—"}
                        </td>
                        <td data-label="Acciones">
                          <div className="table-actions">
                            {canEdit && (
                              <button
                                className="button-secondary"
                                onClick={() =>
                                  navigate(`/office/${document.id}`, {
                                    state: {
                                      appointmentReturn,
                                      customerId: id,
                                      fileName,
                                    },
                                  })
                                }
                              >
                                <FiEdit3 /> Editar
                              </button>
                            )}
                            <button
                              className="icon-button"
                              title="Descargar"
                              onClick={() =>
                                downloadDocument(document.id, fileName)
                              }
                            >
                              <FiDownload />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div>
                <FiUploadCloud size={30} style={{ margin: "0 auto 10px" }} />
                <strong>No hay documentos</strong>
                <p className="helper">Sube el primer archivo del paciente.</p>
              </div>
            </div>
          )}
        </section>
      )}

      {tab === "data" && (
        <section
          className="card card-pad responsive-two"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0,1fr))",
            gap: 18,
          }}
        >
          {[
            [
              "Fecha de nacimiento",
              customer.dateBirth
                ? new Date(customer.dateBirth).toLocaleDateString("es-ES")
                : "—",
            ],
            ["Email", customer.emailAddress || "—"],
            ["Dirección", customer.address || "—"],
            ["Población", customer.population || "—"],
            ["Provincia", customer.province || "—"],
            ["Profesión", customer.profession || "—"],
            ["Peso", customer.weight ? `${customer.weight} kg` : "—"],
            ["Altura", customer.height ? `${customer.height} cm` : "—"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="helper" style={{ margin: 0 }}>
                {label}
              </p>
              <strong>{value}</strong>
            </div>
          ))}
        </section>
      )}

      {tab === "access" && isAdmin && (
        <section className="card card-pad">
          <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>Registro de accesos</h2>
          <p className="helper" style={{ marginTop: 0 }}>Quién ha consultado o modificado los datos clínicos de este paciente (últimos 100 movimientos).</p>
          {accessLog.isLoading ? (
            <div className="empty-state">Cargando registro…</div>
          ) : accessLog.isError ? (
            <div className="empty-state">No se ha podido cargar el registro de accesos.</div>
          ) : !accessLog.data?.entries?.length ? (
            <div className="empty-state">Todavía no hay accesos registrados.</div>
          ) : (
            <table className="data-table mobile-card-table">
              <thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th></tr></thead>
              <tbody>
                {accessLog.data.entries.map((entry) => (
                  <tr key={entry.id}>
                    <td data-label="Fecha">{new Date(entry.createdAt).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}</td>
                    <td data-label="Usuario">{entry.userName}</td>
                    <td data-label="Acción">{ACCESS_ACTION_LABELS[entry.action] || entry.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </main>
  );
};

export default PageCustomerDetail;
