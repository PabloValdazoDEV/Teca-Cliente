import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiShield } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

const PageLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { rememberMe: false } });

  const submit = async (data) => {
    setLoginError("");
    try {
      await login({ ...data, email: data.email.trim() });
      const from = location.state?.from;
      navigate(typeof from === "string" && from.startsWith("/") && !from.startsWith("//") ? from : "/home", { replace: true });
    }
    catch (error) {
      const status = error.response?.status;
      if (status === 429) setLoginError("Demasiados intentos. Espera unos minutos.");
      else if (error.response?.data?.code === "ACCOUNT_DISABLED") setLoginError(error.response.data.message);
      else if (status === 401 || status === 400) setLoginError("Email o contraseña incorrectos.");
      else setLoginError("No se ha podido conectar con TECA. Revisa la conexión e inténtalo de nuevo.");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <div className="auth-brand"><span className="brand-mark">T</span><div><strong>TECA</strong><small>Gestión clínica</small></div></div>
        <div><span className="auth-icon"><FiShield /></span><h1>Tu clínica, organizada y segura.</h1><p>Agenda, pacientes y documentación clínica protegidos en un único espacio de trabajo.</p></div>
        <small>Centro de Osteopatía TECA</small>
      </section>
      <section className="auth-form-side">
        <form className="auth-card" onSubmit={handleSubmit(submit)}>
          <div><p className="page-kicker">Acceso profesional</p><h2>Bienvenido de nuevo</h2><p className="page-subtitle">Introduce tus credenciales para continuar.</p></div>
          {location.state?.passwordChanged && <p className="status-message">Contraseña actualizada. Ya puedes iniciar sesión.</p>}
          {location.state?.reason === "expired" && <p className="status-message" role="status">Tu sesión ha caducado por seguridad. Vuelve a entrar y te llevaremos a donde estabas.</p>}
          <label className="field"><span>Email</span><input type="email" autoComplete="username" placeholder="nombre@teca.es" {...register("email", { required: true })} />{errors.email && <small className="helper" style={{ color: "var(--danger)" }}>Escribe tu email.</small>}</label>
          <label className="field"><span>Contraseña</span><div style={{ position: "relative" }}><input type={showPassword ? "text" : "password"} autoComplete="current-password" style={{ paddingRight: 44 }} {...register("password", { required: true })} /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <FiEyeOff /> : <FiEye />}</button></div>{errors.password && <small className="helper" style={{ color: "var(--danger)" }}>Escribe tu contraseña.</small>}</label>
          <div className="auth-options"><label style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="checkbox" {...register("rememberMe")} /> Recordarme 30 días</label><Link to="/forgot-password">¿Olvidaste la contraseña?</Link></div>
          {loginError && <p className="status-message is-error" role="alert">{loginError}</p>}
          <button className="button-primary" style={{ minHeight: 48 }} disabled={isSubmitting}>{isSubmitting ? "Entrando…" : <>Iniciar sesión <FiArrowRight /></>}</button>
          <p className="helper" style={{ textAlign: "center", margin: 0 }}><FiLock style={{ verticalAlign: "middle" }} /> Sesión cifrada y cookies HttpOnly</p>
        </form>
      </section>
    </main>
  );
};

export default PageLogin;
