import { useState } from "react";
import { Link } from "react-router";
import { FiArrowLeft, FiMail } from "react-icons/fi";
import { forgotPassword } from "@/API";

const PageForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: "", error: false });
  const submit = async (event) => { event.preventDefault(); setLoading(true); setStatus({ text: "", error: false }); try { await forgotPassword(email.trim()); setStatus({ text: "Si existe una cuenta con ese email, recibirás un enlace válido durante 30 minutos.", error: false }); } catch (error) { setStatus({ text: error.response?.status === 429 ? "Has realizado demasiadas solicitudes. Inténtalo más tarde." : "No se ha podido procesar la solicitud.", error: true }); } finally { setLoading(false); } };
  return <main className="auth-simple"><section className="auth-card"><span className="auth-icon"><FiMail /></span><div><p className="page-kicker">Recuperación segura</p><h2>¿Has olvidado tu contraseña?</h2><p className="page-subtitle">Te enviaremos un enlace de un solo uso. La respuesta no revelará si el email existe.</p></div><form onSubmit={submit} style={{ display: "grid", gap: 16 }}><label className="field"><span>Email</span><input autoFocus type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><button className="button-primary" disabled={loading}>{loading ? "Enviando…" : "Enviar enlace"}</button></form>{status.text && <p className={`status-message ${status.error ? "is-error" : ""}`}>{status.text}</p>}<Link className="button-ghost" to="/"><FiArrowLeft /> Volver al inicio de sesión</Link></section></main>;
};

export default PageForgotPassword;
