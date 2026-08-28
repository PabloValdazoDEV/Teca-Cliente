import { useEffect, useState } from "react";
import { Link } from "react-router";
import { FiArrowLeft, FiKey } from "react-icons/fi";
import { resetPassword } from "@/API";

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const PageResetPassword = () => {
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get("token") || "");
  const [form, setForm] = useState({ password: "", confirmation: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: "", error: false });
  const [success, setSuccess] = useState(false);
  useEffect(() => { window.history.replaceState({}, "", "/reset-password"); }, []);
  const submit = async (event) => { event.preventDefault(); if (!token) return setStatus({ text: "El enlace no es válido.", error: true }); if (!PASSWORD_PATTERN.test(form.password)) return setStatus({ text: "Usa 8 caracteres o más, mayúscula, minúscula, número y símbolo.", error: true }); if (form.password !== form.confirmation) return setStatus({ text: "Las contraseñas no coinciden.", error: true }); setLoading(true); try { await resetPassword(token, form.password); setSuccess(true); setStatus({ text: "Contraseña actualizada. Ya puedes iniciar sesión.", error: false }); window.dispatchEvent(new Event("teca:unauthorized")); } catch { setStatus({ text: "El enlace ha caducado, ya fue utilizado o no es válido.", error: true }); } finally { setLoading(false); } };
  return <main className="auth-simple"><section className="auth-card"><span className="auth-icon"><FiKey /></span><div><p className="page-kicker">Nueva contraseña</p><h2>Restablece tu acceso</h2><p className="page-subtitle">El enlace se puede utilizar una sola vez.</p></div>{!success && <form onSubmit={submit} style={{ display: "grid", gap: 14 }}><label className="field"><span>Nueva contraseña</span><input type="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} /></label><label className="field"><span>Repite la contraseña</span><input type="password" autoComplete="new-password" minLength={8} required value={form.confirmation} onChange={(event) => setForm((current) => ({ ...current, confirmation: event.target.value }))} /></label><button className="button-primary" disabled={loading}>{loading ? "Actualizando…" : "Cambiar contraseña"}</button></form>}{status.text && <p className={`status-message ${status.error ? "is-error" : ""}`}>{status.text}</p>}<Link className="button-ghost" to="/"><FiArrowLeft /> Ir al inicio de sesión</Link></section></main>;
};

export default PageResetPassword;
