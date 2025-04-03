import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../styles/DashboardLayout.css';

function DashboardLayout({ onLogout }) {
  return (
    <div className="dashboard-layout">
      <Sidebar onLogout={onLogout}/>
      <main className="dashboard-content">
        <Outlet /> {/* Aquí se renderizarán las rutas anidadas (Orders, Inventory, Tables) */}
      </main>
    </div>
  );
}

export default DashboardLayout;