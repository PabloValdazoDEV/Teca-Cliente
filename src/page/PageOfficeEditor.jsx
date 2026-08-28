import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { FiArrowLeft, FiInfo, FiShield } from "react-icons/fi";
import { getDocumentBlob, getDocumentMetadata, uploadDocumentVersion } from "@/API";

const PageOfficeEditor = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const frameRef = useRef(null);
  const openedRef = useRef(false);
  const [state, setState] = useState({ label: "Preparando el editor…", error: false });
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
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["document", docId] }),
            queryClient.invalidateQueries({ queryKey: ["customer", document.customerId] }),
          ]);
          setState({ label: "Nueva versión guardada en TECA", error: false });
        } catch (error) {
          setState({ label: error.response?.data?.message || "No se ha podido guardar la nueva versión", error: true });
        }
      } else if (event.data.cmd === "error") {
        setState({ label: event.data.message || "No se ha podido iniciar el editor", error: true });
      }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [docId, document, queryClient]);

  if (isLoading) return <main className="page"><div className="card empty-state">Cargando documento…</div></main>;
  if (isError || !document) return <main className="page"><div className="card empty-state">No se ha encontrado el documento.</div></main>;

  return (
    <main style={{ height: "100vh", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <header style={{ minHeight: 62, display: "flex", alignItems: "center", gap: 12, padding: "9px 18px", borderBottom: "1px solid var(--line)", background: "#fff" }}>
        <button className="icon-button" onClick={() => navigate(`/customers/${document.customerId}`)} title="Volver al paciente"><FiArrowLeft /></button>
        <div style={{ minWidth: 0, flex: 1 }}><strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{document.originalName || document.fileName}</strong><span className="helper">{document.customer.fullName} · versión {document.versions?.[0]?.version || 1}</span></div>
        <span className={`status-message ${state.error ? "is-error" : ""}`} style={{ padding: "7px 10px" }}>{state.error ? <FiInfo /> : <FiShield />} {state.label}</span>
      </header>
      <iframe
        ref={frameRef}
        title={`Editor de ${document.originalName || document.fileName}`}
        src={frameUrl}
        style={{ flex: 1, width: "100%", minHeight: 0, border: 0, background: "#f6f8f7" }}
      />
    </main>
  );
};

export default PageOfficeEditor;
