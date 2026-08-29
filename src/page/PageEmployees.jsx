import { useCallback, useEffect, useState } from "react";
import { getEmployees, updateEmployee } from "@/API";
import FormRegister from "@/components/FormRegister";
import { useAuth } from "@/context/AuthContext";
import { FiEdit3, FiUserPlus, FiUsers } from "react-icons/fi";

const roleLabels = {
  ADMIN: "Administrador",
  EMPLOYEE: "Empleado",
};

const inputClass = "control";

const PageEmployees = () => {
  const { user: currentUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState({
    email: "",
    name: "",
    lastName: "",
    role: "EMPLOYEE",
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setStatus("");
    try {
      const response = await getEmployees();
      setEmployees(response.users);
      setSelectedId((current) =>
        response.users.some((employee) => employee.id === current)
          ? current
          : response.users[0]?.id || ""
      );
    } catch {
      setStatus("No se ha podido cargar el equipo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    const selected = employees.find((employee) => employee.id === selectedId);
    if (selected) {
      setForm({
        email: selected.email,
        name: selected.name,
        lastName: selected.lastName,
        role: selected.role,
      });
    }
  }, [employees, selectedId]);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const response = await updateEmployee(selectedId, form);
      setEmployees((current) =>
        current.map((employee) =>
          employee.id === response.user.id
            ? { ...employee, ...response.user }
            : employee
        )
      );
      setStatus("Empleado actualizado correctamente.");
    } catch (error) {
      setStatus(
        error.response?.data?.message ||
          "No se ha podido actualizar el empleado."
      );
    }
  };

  return (
    <main className="page">
      <div>
        <header className="page-header">
          <div><p className="page-kicker">Administración</p><h1 className="page-title">Empleados</h1>
          <p className="page-subtitle">
            Crea usuarios y gestiona los datos de tu equipo.
          </p></div>
        </header>

        <section className="responsive-two" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 18, alignItems: "start" }}>
          <div className="card card-pad">
            <FiUserPlus color="var(--primary)" size={22} />
            <FormRegister onCreated={loadEmployees} />
          </div>

          <div className="card card-pad">
            <div style={{ display: "flex", gap: 9, alignItems: "center" }}><FiEdit3 color="var(--primary)" /><h2 style={{ margin: 0, fontSize: 19 }}>Editar empleado</h2></div>
            {loading ? (
              <p className="mt-4 text-gray-600">Cargando equipo…</p>
            ) : employees.length === 0 ? (
              <p className="mt-4 text-gray-600">
                Todavía no hay usuarios que puedas gestionar.
              </p>
            ) : (
              <>
                <label className="field" style={{ marginTop: 16 }} htmlFor="employee-selector">
                  <span>Usuario</span>
                  <select
                    className={inputClass}
                    id="employee-selector"
                    onChange={(event) => setSelectedId(event.target.value)}
                    value={selectedId}
                  >
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} {employee.lastName} · {roleLabels[employee.role]}
                      </option>
                    ))}
                  </select>
                </label>

                <form className="employee-edit-form" onSubmit={handleUpdate}>
                  <label className="field">
                    <span>Nombre</span>
                    <input className={inputClass} name="name" onChange={handleChange} required value={form.name} />
                  </label>
                  <label className="field">
                    <span>Apellidos</span>
                    <input className={inputClass} name="lastName" onChange={handleChange} required value={form.lastName} />
                  </label>
                  <label className="field" style={{ gridColumn: "1 / -1" }}>
                    <span>Email</span>
                    <input className={inputClass} name="email" onChange={handleChange} required type="email" value={form.email} />
                  </label>
                  {currentUser.role === "SUPERADMIN" && (
                    <label className="field">
                      <span>Rol</span>
                      <select className={inputClass} name="role" onChange={handleChange} value={form.role}>
                        <option value="EMPLOYEE">Empleado</option>
                        <option value="ADMIN">Administrador</option>
                      </select>
                    </label>
                  )}
                  <button className="button-primary" style={{ gridColumn: "1 / -1" }}>
                    Guardar empleado
                  </button>
                </form>
              </>
            )}
            {status && (
              <p className="status-message" style={{ marginTop: 14 }} role="status">
                {status}
              </p>
            )}
          </div>
        </section>
        {!loading && employees.length > 0 && <section className="card card-pad" style={{ marginTop: 18 }}><div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}><FiUsers color="var(--primary)" /><h2 style={{ margin: 0, fontSize: 19 }}>Equipo con acceso</h2></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>{employees.map((employee) => <button key={employee.id} className="button-secondary" style={{ justifyContent: "flex-start", textAlign: "left", height: "auto", padding: 12 }} onClick={() => setSelectedId(employee.id)}><span className="avatar">{`${employee.name?.[0] || ""}${employee.lastName?.[0] || ""}`}</span><span><strong style={{ display: "block" }}>{employee.name} {employee.lastName}</strong><small className="helper">{roleLabels[employee.role]}</small></span></button>)}</div></section>}
      </div>
    </main>
  );
};

export default PageEmployees;
