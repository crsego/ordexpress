import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

function Sidebar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
      navigate('/login');
    }
  };

  return (
    <aside className="sidebar">
      <h1 className="sidebar-title">Admin</h1>
      <nav>
        <ul>
          <li>
            <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active-link' : ''}>
              Gestión Pedidos
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/inventory" className={({ isActive }) => isActive ? 'active-link' : ''}>
              Gestión Inventario
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/tables" className={({ isActive }) => isActive ? 'active-link' : ''}>
              Gestión Mesas
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/organizations" className={({ isActive }) => isActive ? 'active-link' : ''}>
              Gestión Organizacion
            </NavLink>
          </li>
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