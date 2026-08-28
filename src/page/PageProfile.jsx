import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FiLock, FiSave, FiShield, FiUser } from "react-icons/fi";
import { updatePassword, updateProfile } from "@/API";
import { useAuth } from "@/context/AuthContext";

const roleLabels = { SUPERADMIN: "Superadministrador", ADMIN: "Administrador", EMPLOYEE: "Empleado" };

const PageProfile = () => {
  const navigate = useNavigate();
  const { logout, updateCurrentUser, user } = useAuth();
  const [profile, setProfile] = useState({ name: "", lastName: "", email: "", currentPassword: "" });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [profileStatus, setProfileStatus] = useState({ text: "", error: false });
  const [passwordStatus, setPasswordStatus] = useState({ text: "", error: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => setProfile({ name: user.name, lastName: user.lastName, email: user.email, currentPassword: "" }), [user]);
  const changeProfile = (event) => setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
  const changePassword = (event) => setPassword((current) => ({ ...current, [event.target.name]: event.target.value }));

  const saveProfile = async (event) => {
    event.preventDefault(); setSaving(true); setProfileStatus({ text: "", error: false });
    try { const response = await updateProfile(profile); updateCurrentUser(response.user); setProfile((current) => ({ ...current, currentPassword: "" })); setProfileStatus({ text: "Datos personales actualizados", error: false }); }
    catch (error) { setProfileStatus({ text: error.response?.data?.message || "No se ha podido actualizar el perfil", error: true }); }
    finally { setSaving(false); }
  };

  const savePassword = async (event) => {
    event.preventDefault(); setPasswordStatus({ text: "", error: false });
    if (password.newPassword !== password.confirmPassword) return setPasswordStatus({ text: "Las contraseñas nuevas no coinciden", error: true });
    try { await updatePassword({ currentPassword: password.currentPassword, newPassword: password.newPassword }); await logout(); navigate("/", { replace: true, state: { passwordChanged: true } }); }
    catch (error) { setPasswordStatus({ text: error.response?.data?.message || "No se ha podido cambiar la contraseña", error: true }); }
  };

  const initials = `${user.name?.[0] || "T"}${user.lastName?.[0] || ""}`.toUpperCase();
  return (
    <main className="page" style={{ maxWidth: 980 }}>
      <header className="page-header"><div><p className="page-kicker">Cuenta</p><h1 className="page-title">Mi perfil</h1><p className="page-subtitle">Tus datos personales y la seguridad de tu cuenta. Los empleados se gestionan en su apartado independiente.</p></div></header>
      <section className="card card-pad" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}><span className="avatar" style={{ width: 58, height: 58, fontSize: 18 }}>{initials}</span><div><strong style={{ fontSize: 18 }}>{user.name} {user.lastName}</strong><div className="helper">{user.email}</div></div><span className="badge" style={{ marginLeft: "auto" }}><FiShield /> {roleLabels[user.role]}</span></section>
      <div className="responsive-two" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 18, alignItems: "start" }}>
        <section className="card card-pad"><div style={{ display: "flex", alignItems: "center", gap: 9 }}><FiUser color="var(--primary)" /><h2 style={{ margin: 0, fontSize: 19 }}>Datos personales</h2></div><form onSubmit={saveProfile} style={{ display: "grid", gap: 13, marginTop: 18 }}><label className="field"><span>Nombre</span><input required name="name" value={profile.name} onChange={changeProfile} /></label><label className="field"><span>Apellidos</span><input required name="lastName" value={profile.lastName} onChange={changeProfile} /></label><label className="field"><span>Email</span><input required type="email" name="email" value={profile.email} onChange={changeProfile} /></label>{profile.email !== user.email && <label className="field"><span>Contraseña actual</span><input required type="password" autoComplete="current-password" name="currentPassword" value={profile.currentPassword} onChange={changeProfile} /><small className="helper">Necesaria para cambiar el email.</small></label>}{profileStatus.text && <p className={`status-message ${profileStatus.error ? "is-error" : ""}`}>{profileStatus.text}</p>}<button className="button-primary" disabled={saving}><FiSave /> {saving ? "Guardando…" : "Guardar datos"}</button></form></section>
        <section className="card card-pad"><div style={{ display: "flex", alignItems: "center", gap: 9 }}><FiLock color="var(--primary)" /><h2 style={{ margin: 0, fontSize: 19 }}>Cambiar contraseña</h2></div><p className="helper">Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo.</p><form onSubmit={savePassword} style={{ display: "grid", gap: 13, marginTop: 18 }}><label className="field"><span>Contraseña actual</span><input required type="password" autoComplete="current-password" name="currentPassword" value={password.currentPassword} onChange={changePassword} /></label><label className="field"><span>Nueva contraseña</span><input required minLength={8} type="password" autoComplete="new-password" name="newPassword" value={password.newPassword} onChange={changePassword} /></label><label className="field"><span>Repite la nueva contraseña</span><input required minLength={8} type="password" autoComplete="new-password" name="confirmPassword" value={password.confirmPassword} onChange={changePassword} /></label>{passwordStatus.text && <p className={`status-message ${passwordStatus.error ? "is-error" : ""}`}>{passwordStatus.text}</p>}<button className="button-secondary"><FiLock /> Cambiar contraseña</button></form></section>
      </div>
    </main>
  );
};

export default PageProfile;
