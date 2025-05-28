import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom'; // Ya no redireccionamos
import Sidebar from '../components/Sidebar';
import CreateOrganizationForm from '../components/CreateOrganizationForm';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/DashboardLayout.css';

function DashboardLayout({ onLogout }) {
  const [shouldCreateOrganization, setShouldCreateOrganization] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const organizationId = localStorage.getItem('organizationId');
    const rol = localStorage.getItem('userRol');

    console.log('organizationId:', organizationId);
    console.log('userRol:', rol);

    
    if (!organizationId || organizationId === "0" || organizationId === "null") {
      setShouldCreateOrganization(true);
    } else {
      setShouldCreateOrganization(false);
    }

    setLoading(false);
  }, []);

  const handleOrganizationCreated = (newOrgId) => {
    localStorage.setItem('organizationId', newOrgId);
    setShouldCreateOrganization(false);
    
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <main className="dashboard-content">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (shouldCreateOrganization) {
    return (
      <div className="dashboard-layout">
        <main className="dashboard-content">
          <CreateOrganizationForm onOrganizationCreated={handleOrganizationCreated} />
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar onLogout={onLogout}/>
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
