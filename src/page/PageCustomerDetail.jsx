import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router";
import {
  FiArrowLeft,
  FiCalendar,
  FiDownload,
  FiEdit3,
  FiFile,
  FiFileText,
  FiPlus,
  FiUploadCloud,
} from "react-icons/fi";
import {
  createCustomerTemplates,
  downloadDocument,
  getCustomerDetail,
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
const phoneText = (phone) =>
  phone.rawValue ||
  [phone.label, phone.countryCode, phone.phoneNumber].filter(Boolean).join(" ");

const PageCustomerDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("summary");
  const [status, setStatus] = useState("");
  const appointmentReturn = location.state?.appointmentReturn;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerDetail(id),
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
              {customer.phones.map(phoneText).filter(Boolean).join(" · ") ||
                "Sin teléfono"}
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
        </div>
      </section>

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
            {console.log(nextAppointment)}
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
    </main>
  );
};

export default PageCustomerDetail;
