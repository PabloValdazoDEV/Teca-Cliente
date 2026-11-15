import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router";
import { FiArrowLeft, FiInfo, FiShield } from "react-icons/fi";
import { getDocumentBlob, getDocumentMetadata, uploadDocumentVersion } from "@/API";

const PageOfficeEditor = () => {
  const { docId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const frameRef = useRef(null);
  const openedRef = useRef(false);
  const [state, setState] = useState({ label: "Preparando el editor…", error: false });
  const [dirty, setDirty] = useState(false);
  const { data, isLoading, isError } = useQuery({ queryKey: ["document", docId], queryFn: () => getDocumentMetadata(docId) });
  const document = data?.document;
  const runtime = import.meta.env.VITE_ZETA_OFFICE_RUNTIME_URL || "/office/runtime/";
  const frameUrl = `/office/editor.html?runtime=${encodeURIComponent(runtime)}`;

  useEffect(() => {
    const receive = async (event) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow || event.data?.source !== "teca-office") return;
      if (event.data.cmd === "runtime_ready" && document && !openedRef.current) {
        openedRef.current = true;
        setState({ label: "Abriendo el documento…", error: false });
        try {
          const blob = await getDocumentBlob(docId);
          const buffer = await blob.arrayBuffer();
          frameRef.current.contentWindow.postMessage({ source: "teca", cmd: "open", filename: document.originalName || document.fileName || "documento", buffer }, window.location.origin, [buffer]);
        } catch (error) {
          setState({ label: error.response?.data?.message || "No se ha podido abrir el documento", error: true });
        }
      } else if (event.data.cmd === "save") {
        setState({ label: "Guardando una nueva versión…", error: false });
        try {
          const file = new File([event.data.buffer], event.data.filename, { type: document.mimeType || "application/octet-stream" });
          await uploadDocumentVersion(docId, file);
          setDirty(false);
          frameRef.current?.contentWindow?.postMessage({ source: "teca", cmd: "saved" }, window.location.origin);
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["document", docId] }),
            queryClient.invalidateQueries({ queryKey: ["customer", document.customerId] }),
          ]);
          setState({ label: "Nueva versión guardada en TECA", error: false });
        } catch (error) {
          frameRef.current?.contentWindow?.postMessage({ source: "teca", cmd: "save_failed" }, window.location.origin);
          setState({ label: error.response?.data?.message || "No se ha podido guardar la nueva versión", error: true });
        }
      } else if (event.data.cmd === "progress") {
        if (event.data.percent < 100) setState({ label: `Cargando el editor… ${event.data.percent} %`, error: false });
      } else if (event.data.cmd === "modified") {
        setDirty(Boolean(event.data.modified));
        if (event.data.modified) setState({ label: "Cambios sin guardar", error: false });
      } else if (event.data.cmd === "document_ready") {
        setState({ label: "Documento listo para editar", error: false });
      } else if (event.data.cmd === "error") {
        // El detalle se muestra dentro del editor; aquí basta un aviso corto.
        setState({ label: "No se ha podido iniciar el editor", error: true });
      }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [docId, document, queryClient]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const goBack = () => {
    if (dirty && !window.confirm("Hay cambios sin guardar en el documento. ¿Salir sin guardar?")) return;
    navigate(`/customers/${document.customerId}`, { state: { appointmentReturn: location.state?.appointmentReturn } });
  };

  if (isLoading) return <main className="page"><div className="card empty-state">Cargando documento…</div></main>;
  if (isError || !document) return <main className="page"><div className="card empty-state">No se ha encontrado el documento.</div></main>;

  return (
    <main className="office-editor">
      <header className="office-editor-header">
        <button className="icon-button" onClick={goBack} title="Volver al paciente" aria-label="Volver al paciente"><FiArrowLeft /></button>
        <div style={{ minWidth: 0, flex: 1 }}><strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{document.originalName || document.fileName}</strong><span className="helper">{document.customer.fullName} · versión {document.versions?.[0]?.version || 1}</span></div>
        <span className={`status-message office-editor-status ${state.error ? "is-error" : ""}`}>{state.error ? <FiInfo /> : <FiShield />} {state.label}</span>
      </header>
      <iframe
        ref={frameRef}
        title={`Editor de ${document.originalName || document.fileName}`}
        src={frameUrl}
        className="office-editor-frame"
      />
    </main>
  );
};

export default PageOfficeEditor;
