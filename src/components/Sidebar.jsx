import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css'; // Para estilos

function Sidebar({ onLogout }) {

  const navigate = useNavigate();

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
  };
  return (
    <aside className="sidebar">
      <h1 className="sidebar-title">OrdExpress Admin</h1>
      <nav>
        <ul>
          <li>
            <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active-link' : ''}>
              Gestión de Pedidos
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/inventory" className={({ isActive }) => isActive ? 'active-link' : ''}>
              Gestión de Inventario
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/tables" className={({ isActive }) => isActive ? 'active-link' : ''}>
              Gestión de Mesas
            </NavLink>
          </li>
          {/* Puedes añadir más enlaces aquí (Usuarios, Reportes, Configuración, etc.) */}
        </ul>
      </nav>
      <div className="sidebar-logout">
        <button onClick={handleLogoutClick} className="logout-button">
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;