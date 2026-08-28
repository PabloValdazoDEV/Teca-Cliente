import { useQuery } from "@tanstack/react-query";
import { FiAlertTriangle, FiCheckCircle, FiDatabase, FiHardDrive, FiMail, FiRefreshCw } from "react-icons/fi";
import { getSystemStatus } from "@/API";

const icons = { database: FiDatabase, documents: FiHardDrive, email: FiMail };

const PageSystemStatus = () => {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({ queryKey: ["system-status"], queryFn: getSystemStatus, refetchInterval: 60_000 });
  return (
    <main className="page" style={{ maxWidth: 980 }}>
      <header className="page-header"><div><p className="page-kicker">Administración</p><h1 className="page-title">Estado del sistema</h1><p className="page-subtitle">Comprobaciones internas sin mostrar contraseñas ni valores sensibles del servidor.</p></div><button className="button-secondary" disabled={isFetching} onClick={() => refetch()}><FiRefreshCw /> Actualizar</button></header>
      {isLoading ? <div className="card empty-state">Comprobando servicios…</div> : isError ? <div className="card empty-state">No se ha podido consultar el sistema.</div> : <><section className="card card-pad" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>{data.status === "ok" ? <FiCheckCircle size={28} color="var(--primary)" /> : <FiAlertTriangle size={28} color="#b54708" />}<div><strong>{data.status === "ok" ? "Todo funciona correctamente" : "Hay servicios que requieren atención"}</strong><p className="helper" style={{ margin: 0 }}>Última comprobación: {new Date(data.checkedAt).toLocaleString("es-ES")} · {data.responseMs} ms</p></div></section><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>{data.checks.map((check) => { const Icon = icons[check.id] || FiCheckCircle; return <article key={check.id} className="card card-pad"><Icon size={23} color={check.status === "ok" ? "var(--primary)" : "#b54708"} /><h2 style={{ fontSize: 16 }}>{check.label}</h2><span className="badge" style={check.status !== "ok" ? { color: "#8a3708", background: "#fff0e5" } : undefined}>{check.status === "ok" ? "Operativo" : "Revisar"}</span><p className="helper">{check.detail}</p></article>; })}</div></>}
    </main>
  );
};

export default PageSystemStatus;
