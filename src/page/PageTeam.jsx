import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiCalendar, FiEdit3, FiKey, FiLock, FiUserPlus, FiUsers } from "react-icons/fi";
import {
  createAgendaForAccount,
  createPractitioner,
  getTeam,
  invitePractitioner,
  tryRegister,
  updateEmployee,
  updateEmployeeAccess,
  updatePractitioner,
} from "@/API";
import { useAuth } from "@/context/AuthContext";

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const ROLE_LABELS = { SUPERADMIN: "Superadministrador", ADMIN: "Administrador", EMPLOYEE: "Empleado" };
const emptyPerson = { name: "", lastName: "", color: "#087655", withAgenda: true, withAccess: false, email: "", password: "", role: "EMPLOYEE" };

const errorText = (error, fallback) => error?.response?.data?.message || fallback;

// Una sola pantalla para todo el equipo: cada persona puede tener agenda (recibe
// citas), acceso a TECA (cuenta), ambas cosas o solo una.
const PageTeam = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "SUPERADMIN";
  const [person, setPerson] = useState(emptyPerson);
  const [message, setMessage] = useState({ text: "", error: false });
  const [accessForm, setAccessForm] = useState(null); // { key, email, password, role }
  const [editForm, setEditForm] = useState(null); // { key, name, lastName, email, color, role }
  const { data, isLoading, isError } = useQuery({ queryKey: ["team"], queryFn: getTeam });
  const people = data?.people || [];

  const notify = (text, error = false) => setMessage({ text, error });
  const refresh = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ["team"] }),
    queryClient.invalidateQueries({ queryKey: ["practitioners"] }),
  ]);

  const createMutation = useMutation({
    mutationFn: async (values) => {
      if (values.withAccess) {
        return tryRegister({ name: values.name, lastName: values.lastName, email: values.email, password: values.password, role: values.role, withAgenda: values.withAgenda });
      }
      return createPractitioner({ name: values.name, lastName: values.lastName, color: values.color });
    },
    onSuccess: async (_, values) => {
      notify(`${values.name} añadido al equipo${values.withAgenda ? " con agenda" : ""}${values.withAccess ? " y con acceso" : ""}.`);
      setPerson(emptyPerson);
      await refresh();
    },
    onError: (error) => notify(errorText(error, "No se ha podido añadir a la persona"), true),
  });

  const agendaMutation = useMutation({
    mutationFn: ({ agenda, item, active }) => updatePractitioner(agenda.id, { name: item.name, lastName: item.lastName || "", email: agenda.email || "", color: agenda.color, active }),
    onSuccess: async (_, { item, active }) => { notify(`Agenda de ${item.name} ${active ? "activada" : "desactivada"}.`); await refresh(); },
    onError: (error) => notify(errorText(error, "No se ha podido cambiar la agenda"), true),
  });
  const createAgendaMutation = useMutation({
    mutationFn: (item) => createAgendaForAccount(item.account.id),
    onSuccess: async (_, item) => { notify(`${item.name} ya tiene agenda y puede recibir citas.`); await refresh(); },
    onError: (error) => notify(errorText(error, "No se ha podido crear la agenda"), true),
  });
  const accessMutation = useMutation({
    mutationFn: ({ item, active }) => updateEmployeeAccess(item.account.id, active),
    onSuccess: async (_, { item, active }) => { notify(active ? `${item.name} puede volver a entrar en TECA.` : `${item.name} ya no puede entrar en TECA.`); await refresh(); },
    onError: (error) => notify(errorText(error, "No se ha podido cambiar el acceso"), true),
  });
  const grantAccessMutation = useMutation({
    mutationFn: ({ item, form }) => tryRegister({ name: item.name, lastName: item.lastName || item.name, email: form.email, password: form.password, role: form.role, practitionerId: item.agenda.id }),
    onSuccess: async (_, { item }) => { notify(`${item.name} ya puede entrar en TECA con su email y la contraseña indicada.`); setAccessForm(null); await refresh(); },
    onError: (error) => notify(errorText(error, "No se ha podido dar acceso"), true),
  });
  const inviteMutation = useMutation({
    mutationFn: ({ item, form }) => invitePractitioner(item.agenda.id, form.email),
    onSuccess: async (_, { item }) => { notify(`Invitación enviada a ${item.name}. El enlace vale 48 horas.`); setAccessForm(null); await refresh(); },
    onError: (error) => notify(errorText(error, "No se ha podido enviar la invitación"), true),
  });
  const editMutation = useMutation({
    mutationFn: async ({ item, form }) => {
      if (item.account?.canManageAccess) {
        await updateEmployee(item.account.id, { name: form.name, lastName: form.lastName, email: form.email, role: form.role });
      }
      if (item.agenda) {
        await updatePractitioner(item.agenda.id, {
          name: form.name,
          lastName: form.lastName,
          email: item.account ? (form.email || item.account.email) : form.email,
          color: form.color,
          active: item.agenda.active,
        });
      }
    },
    onSuccess: async () => { notify("Datos guardados."); setEditForm(null); await refresh(); },
    onError: (error) => notify(errorText(error, "No se han podido guardar los datos"), true),
  });

  const submitPerson = (event) => {
    event.preventDefault();
    if (!person.withAgenda && !person.withAccess) {
      notify("Marca al menos una opción: que reciba citas o que pueda entrar en TECA.", true);
      return;
    }
    if (person.withAccess && !PASSWORD_PATTERN.test(person.password)) {
      notify("La contraseña necesita 8 caracteres, mayúscula, minúscula, número y símbolo.", true);
      return;
    }
    createMutation.mutate(person);
  };

  const confirmAgenda = (item, active) => {
    if (!active && !window.confirm(`¿Desactivar la agenda de ${item.name}?\n\nDejará de aparecer en el calendario y no se le podrán dar citas nuevas. Sus citas se conservan y puedes volver a activarla.${item.account ? " Su acceso a TECA no cambia." : ""}`)) return;
    agendaMutation.mutate({ agenda: item.agenda, item, active });
  };
  const confirmAccess = (item, active) => {
    if (!active && !window.confirm(`¿Quitar el acceso de ${item.name}?\n\nNo podrá entrar en TECA y se cerrarán sus sesiones. Su agenda y sus citas no cambian.`)) return;
    accessMutation.mutate({ item, active });
  };

  const field = (label, input) => <label className="field"><span>{label}</span>{input}</label>;

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="page-kicker">Administración</p>
          <h1 className="page-title">Equipo</h1>
          <p className="page-subtitle">Cada persona puede tener <strong>agenda</strong> (se le pueden dar citas), <strong>acceso</strong> a TECA, o ambas cosas.</p>
        </div>
      </header>

      {message.text && <p className={`status-message ${message.error ? "is-error" : ""}`} role="status" style={{ marginBottom: 16 }}>{message.text}</p>}

      <div className="team-layout">
        <section className="card card-pad">
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}><FiUsers color="var(--primary)" /><h2 style={{ margin: 0, fontSize: 19 }}>Personas</h2></div>
          {isLoading ? <p className="helper">Cargando equipo…</p> : isError ? <p className="status-message is-error">No se ha podido cargar el equipo.</p> : (
            <ul className="team-list">
              {people.map((item) => {
                const isMe = item.account?.id === currentUser?.id;
                const editing = editForm?.key === item.key;
                const granting = accessForm?.key === item.key;
                return (
                  <li key={item.key} className={`team-person ${item.agenda && !item.agenda.active && (!item.account || item.account.disabledAt) ? "is-muted" : ""}`}>
                    <div className="team-person-head">
                      <span className="avatar" style={item.agenda ? { background: item.agenda.color, color: "#fff" } : undefined}>{`${item.name?.[0] || ""}${item.lastName?.[0] || ""}`}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong>{item.name} {item.lastName}</strong>{isMe && <span className="badge" style={{ marginLeft: 8 }}>Tú</span>}
                        <div className="team-chips">
                          <span className={`team-chip ${item.agenda?.active ? "is-on" : ""}`}><FiCalendar aria-hidden="true" /> {item.agenda ? (item.agenda.active ? "Agenda activa" : "Agenda desactivada") : "Sin agenda"}</span>
                          <span className={`team-chip ${item.account && !item.account.disabledAt ? "is-on" : ""}`}><FiKey aria-hidden="true" /> {item.account ? (item.account.disabledAt ? "Acceso desactivado" : `Acceso · ${item.account.email}`) : item.agenda?.status === "INVITED" ? "Invitación pendiente" : "Sin acceso"}</span>
                          {item.account && <span className="team-chip">{ROLE_LABELS[item.account.role]}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="team-actions">
                      {item.agenda ? (
                        <button type="button" className="button-ghost" disabled={agendaMutation.isPending} onClick={() => confirmAgenda(item, !item.agenda.active)}>{item.agenda.active ? "Desactivar agenda" : "Activar agenda"}</button>
                      ) : item.account && (item.account.canManageAccess || isMe) && (
                        <button type="button" className="button-ghost" disabled={createAgendaMutation.isPending} onClick={() => createAgendaMutation.mutate(item)}>Crear agenda</button>
                      )}
                      {item.account ? (
                        item.account.canManageAccess && <button type="button" className={item.account.disabledAt ? "button-ghost" : "button-ghost archive-button"} disabled={accessMutation.isPending} onClick={() => confirmAccess(item, Boolean(item.account.disabledAt))}><FiLock /> {item.account.disabledAt ? "Reactivar acceso" : "Quitar acceso"}</button>
                      ) : (
                        <button type="button" className="button-ghost" onClick={() => setAccessForm(granting ? null : { key: item.key, email: item.agenda?.email || "", password: "", role: "EMPLOYEE" })}><FiKey /> Dar acceso</button>
                      )}
                      {(item.account?.canManageAccess || !item.account) && (
                        <button type="button" className="button-ghost" onClick={() => setEditForm(editing ? null : { key: item.key, name: item.name, lastName: item.lastName, email: item.account?.email || item.agenda?.email || "", color: item.agenda?.color || "#087655", role: item.account?.role || "EMPLOYEE" })}><FiEdit3 /> Editar</button>
                      )}
                    </div>

                    {granting && (
                      <form className="team-inline-form" onSubmit={(event) => {
                        event.preventDefault();
                        if (!PASSWORD_PATTERN.test(accessForm.password)) { notify("La contraseña necesita 8 caracteres, mayúscula, minúscula, número y símbolo.", true); return; }
                        grantAccessMutation.mutate({ item, form: accessForm });
                      }}>
                        <p className="helper" style={{ margin: 0, gridColumn: "1 / -1" }}>Su agenda y sus citas se mantienen. Elige una contraseña y comunícasela, o envíale una invitación para que la cree él/ella.</p>
                        {field("Email", <input type="email" required value={accessForm.email} onChange={(event) => setAccessForm((current) => ({ ...current, email: event.target.value }))} />)}
                        {field("Contraseña", <input type="text" autoComplete="new-password" value={accessForm.password} onChange={(event) => setAccessForm((current) => ({ ...current, password: event.target.value }))} placeholder="Mín. 8, con mayúscula, número y símbolo" />)}
                        {isSuperAdmin && field("Rol", <select value={accessForm.role} onChange={(event) => setAccessForm((current) => ({ ...current, role: event.target.value }))}><option value="EMPLOYEE">Empleado</option><option value="ADMIN">Administrador</option></select>)}
                        <div className="team-inline-actions">
                          <button className="button-primary" disabled={grantAccessMutation.isPending}>{grantAccessMutation.isPending ? "Guardando…" : "Dar acceso con esta contraseña"}</button>
                          <button type="button" className="button-secondary" disabled={inviteMutation.isPending || !accessForm.email} onClick={() => inviteMutation.mutate({ item, form: accessForm })}>{inviteMutation.isPending ? "Enviando…" : "Enviar invitación por email"}</button>
                        </div>
                      </form>
                    )}

                    {editing && (
                      <form className="team-inline-form" onSubmit={(event) => { event.preventDefault(); editMutation.mutate({ item, form: editForm }); }}>
                        {field("Nombre", <input required value={editForm.name} onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))} />)}
                        {field("Apellidos", <input value={editForm.lastName} required={Boolean(item.account)} onChange={(event) => setEditForm((current) => ({ ...current, lastName: event.target.value }))} />)}
                        {field(item.account ? "Email de acceso" : "Email (opcional)", <input type="email" required={Boolean(item.account)} value={editForm.email} onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))} />)}
                        {item.agenda && field("Color en la agenda", <input type="color" value={editForm.color} onChange={(event) => setEditForm((current) => ({ ...current, color: event.target.value }))} />)}
                        {item.account && isSuperAdmin && field("Rol", <select value={editForm.role} onChange={(event) => setEditForm((current) => ({ ...current, role: event.target.value }))}><option value="EMPLOYEE">Empleado</option><option value="ADMIN">Administrador</option></select>)}
                        <div className="team-inline-actions">
                          <button className="button-primary" disabled={editMutation.isPending}>{editMutation.isPending ? "Guardando…" : "Guardar"}</button>
                          <button type="button" className="button-ghost" onClick={() => setEditForm(null)}>Cancelar</button>
                        </div>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card card-pad">
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}><FiUserPlus color="var(--primary)" /><h2 style={{ margin: 0, fontSize: 19 }}>Añadir persona</h2></div>
          <form onSubmit={submitPerson} style={{ display: "grid", gap: 12, marginTop: 14 }}>
            {field("Nombre *", <input required maxLength={100} value={person.name} onChange={(event) => setPerson((current) => ({ ...current, name: event.target.value }))} />)}
            {field(person.withAccess ? "Apellidos *" : "Apellidos", <input required={person.withAccess} maxLength={100} value={person.lastName} onChange={(event) => setPerson((current) => ({ ...current, lastName: event.target.value }))} />)}
            <label className="team-check"><input type="checkbox" checked={person.withAgenda} onChange={(event) => setPerson((current) => ({ ...current, withAgenda: event.target.checked }))} /><span><strong>Recibe citas</strong> (tiene agenda)<small className="helper">Fisioterapeutas, quiroprácticos…</small></span></label>
            {person.withAgenda && !person.withAccess && field("Color en la agenda", <input type="color" value={person.color} onChange={(event) => setPerson((current) => ({ ...current, color: event.target.value }))} />)}
            <label className="team-check"><input type="checkbox" checked={person.withAccess} onChange={(event) => setPerson((current) => ({ ...current, withAccess: event.target.checked }))} /><span><strong>Puede entrar en TECA</strong><small className="helper">Recepción o profesionales que usan la plataforma. Si no, recepción le da las citas.</small></span></label>
            {person.withAccess && (
              <>
                {field("Email *", <input type="email" required value={person.email} onChange={(event) => setPerson((current) => ({ ...current, email: event.target.value }))} />)}
                {field("Contraseña *", <input type="text" autoComplete="new-password" required value={person.password} onChange={(event) => setPerson((current) => ({ ...current, password: event.target.value }))} placeholder="Mín. 8, con mayúscula, número y símbolo" />)}
                {isSuperAdmin && field("Rol", <select value={person.role} onChange={(event) => setPerson((current) => ({ ...current, role: event.target.value }))}><option value="EMPLOYEE">Empleado</option><option value="ADMIN">Administrador</option></select>)}
              </>
            )}
            <button className="button-primary" disabled={createMutation.isPending}>{createMutation.isPending ? "Añadiendo…" : "Añadir al equipo"}</button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default PageTeam;
