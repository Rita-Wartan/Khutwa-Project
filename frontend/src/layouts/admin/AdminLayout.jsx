import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import './AdminLayout.css';

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return <div className="admin-dashboard-shell" dir="rtl"><AdminSidebar open={sidebarOpen} onClose={closeSidebar} /><div className={`admin-dashboard-overlay ${sidebarOpen ? 'is-visible' : ''}`} onClick={closeSidebar} /><section className="admin-dashboard-content"><header className="admin-dashboard-header"><button type="button" className="admin-dashboard-menu-button" onClick={() => setSidebarOpen(true)} aria-label="فتح القائمة"><i className="fas fa-bars" /></button><div className="admin-dashboard-account"><span className="admin-dashboard-avatar">{user?.name?.charAt(0) || 'أ'}</span><div><strong>{user?.name || 'مسؤول النظام'}</strong><small>{user?.email}</small></div></div></header><main className="admin-dashboard-main">{children}</main></section></div>;
}
