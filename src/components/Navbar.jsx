import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
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
  const location = useLocation();
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
  const showExpandedNavigation = !compact || mobileOpen;
  const pageTitle = location.pathname.startsWith("/customers")
    ? "Clientes"
    : location.pathname.startsWith("/profile")
      ? "Perfil"
      : location.pathname.startsWith("/clinic")
        ? "Clínica y agendas"
        : location.pathname.startsWith("/employees")
          ? "Empleados"
          : location.pathname.startsWith("/system")
            ? "Estado del sistema"
            : "Agenda";

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  const navLink = (item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.path}
        to={item.path}
        title={!showExpandedNavigation ? item.label : undefined}
        onClick={() => setMobileOpen(false)}
        className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
      >
        <Icon aria-hidden="true" />
        {showExpandedNavigation && <span>{item.label}</span>}
      </NavLink>
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className={`app-shell ${compact ? "is-compact" : ""}`}>
      <header className="mobile-topbar">
        <button type="button" className="mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
          <FiMenu />
        </button>
        <NavLink className="mobile-topbar-brand" to="/home" aria-label="Ir a la agenda">
          <span className="brand-mark">T</span>
          <span><strong>{pageTitle}</strong><small>TECA</small></span>
        </NavLink>
        <button type="button" className="mobile-topbar-create" onClick={() => navigate("/home", { state: { createAppointment: true } })} aria-label="Crear cita">
          <FiPlus />
        </button>
      </header>
      {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú" />}

      <aside className={`sidebar ${mobileOpen ? "is-open" : ""}`} aria-label="Menú de la aplicación">
        <div className="brand-row">
          <div className="brand-mark">T</div>
          {showExpandedNavigation && <div><strong>TECA</strong><span>Gestión clínica</span></div>}
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
          <FiPlus /> {showExpandedNavigation && <span>Crear cita</span>}
        </button>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          {links.map(navLink)}
          {isAdmin && showExpandedNavigation && <p className="sidebar-section">Administración</p>}
          {managementLinks.map(navLink)}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/profile" className={({ isActive }) => `user-card ${isActive ? "is-active" : ""}`}>
            <span className="avatar">{initials.toUpperCase()}</span>
            {showExpandedNavigation && <span className="user-copy"><strong>{user?.name} {user?.lastName}</strong><small>{isAdmin ? "Administrador" : "Empleado"}</small></span>}
            {showExpandedNavigation && <FiUser />}
          </NavLink>
          <button type="button" className="sidebar-link" onClick={handleLogout} title="Cerrar sesión">
            <FiLogOut /> {showExpandedNavigation && <span>Cerrar sesión</span>}
          </button>
        </div>

        <button type="button" className="collapse-button" onClick={() => setCompact((value) => !value)} aria-label={compact ? "Ampliar menú" : "Contraer menú"}>
          {compact ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </aside>

      <div className="app-content"><Outlet /></div>

      <nav className="mobile-bottom-nav" aria-label="Navegación móvil">
        <NavLink to="/home" className={({ isActive }) => `mobile-nav-link ${isActive ? "is-active" : ""}`}>
          <FiCalendar /><span>Agenda</span>
        </NavLink>
        <NavLink to="/customers" className={({ isActive }) => `mobile-nav-link ${isActive ? "is-active" : ""}`}>
          <FiUsers /><span>Clientes</span>
        </NavLink>
        <button type="button" className="mobile-nav-create" onClick={() => navigate("/home", { state: { createAppointment: true } })} aria-label="Crear una cita">
          <FiPlus /><span>Cita</span>
        </button>
        <NavLink to="/profile" className={({ isActive }) => `mobile-nav-link ${isActive ? "is-active" : ""}`}>
          <FiUser /><span>Perfil</span>
        </NavLink>
        <button type="button" className={`mobile-nav-link ${mobileOpen ? "is-active" : ""}`} onClick={() => setMobileOpen(true)} aria-label="Abrir más opciones">
          <FiMenu /><span>Más</span>
        </button>
      </nav>
    </div>
  );
};

export default Navbar;
