import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  FiActivity,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiLogOut,
  FiMenu,
  FiPlus,
  FiSettings,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

const links = [
  { label: "Agenda", path: "/home", icon: FiCalendar },
  { label: "Clientes", path: "/customers", icon: FiUsers },
];

const Navbar = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const isAdmin = ["SUPERADMIN", "ADMIN"].includes(user?.role);
  const managementLinks = isAdmin
    ? [
        { label: "Clínica y agendas", path: "/clinic", icon: FiClock },
        { label: "Empleados", path: "/employees", icon: FiSettings },
        { label: "Estado del sistema", path: "/system", icon: FiActivity },
      ]
    : [];

  const initials = `${user?.name?.[0] || "T"}${user?.lastName?.[0] || ""}`;
  const navLink = (item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.path}
        to={item.path}
        title={compact ? item.label : undefined}
        onClick={() => setMobileOpen(false)}
        className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
      >
        <Icon aria-hidden="true" />
        {!compact && <span>{item.label}</span>}
      </NavLink>
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className={`app-shell ${compact ? "is-compact" : ""}`}>
      <button type="button" className="mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
        <FiMenu />
      </button>
      {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú" />}

      <aside className={`sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark">T</div>
          {!compact && <div><strong>TECA</strong><span>Gestión clínica</span></div>}
          <button className="mobile-close" type="button" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú"><FiX /></button>
        </div>

        <button
          type="button"
          className="sidebar-create"
          onClick={() => {
            setMobileOpen(false);
            navigate("/home", { state: { createAppointment: true } });
          }}
          title="Crear cita"
        >
          <FiPlus /> {!compact && <span>Crear cita</span>}
        </button>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          {links.map(navLink)}
          {isAdmin && !compact && <p className="sidebar-section">Administración</p>}
          {managementLinks.map(navLink)}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/profile" className={({ isActive }) => `user-card ${isActive ? "is-active" : ""}`}>
            <span className="avatar">{initials.toUpperCase()}</span>
            {!compact && <span className="user-copy"><strong>{user?.name} {user?.lastName}</strong><small>{isAdmin ? "Administrador" : "Empleado"}</small></span>}
            {!compact && <FiUser />}
          </NavLink>
          <button type="button" className="sidebar-link" onClick={handleLogout} title="Cerrar sesión">
            <FiLogOut /> {!compact && <span>Cerrar sesión</span>}
          </button>
        </div>

        <button type="button" className="collapse-button" onClick={() => setCompact((value) => !value)} aria-label={compact ? "Ampliar menú" : "Contraer menú"}>
          {compact ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </aside>

      <div className="app-content"><Outlet /></div>
    </div>
  );
};

export default Navbar;
