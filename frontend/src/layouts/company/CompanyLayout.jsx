import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './CompanyLayout.css';

const navigation = [
  { label: 'لوحة التحكم', icon: 'fa-house', to: '/company/dashboard' },
  { label: 'وظائفي', icon: 'fa-briefcase', to: '/company/jobs' },
  { label: 'إضافة وظيفة', icon: 'fa-plus', to: '/company/jobs/create' },
  { label: 'المتقدمون', icon: 'fa-users', to: '/company/applicants' },
  { label: 'ملف الشركة', icon: 'fa-building', to: '/company/profile' },
  
];

export default function CompanyLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return <div className="company-dashboard-shell" dir="rtl"><aside className={`company-dashboard-sidebar ${sidebarOpen ? 'is-open' : ''}`}><div className="company-sidebar-brand"><span className="company-sidebar-mark">K</span><div><strong>Khutwa</strong><small>مساحة الشركات</small></div><button type="button" className="company-sidebar-close" onClick={closeSidebar} aria-label="إغلاق القائمة"><i className="fas fa-times" /></button></div><nav className="company-dashboard-nav" aria-label="قائمة لوحة التحكم">{navigation.map(item => <NavLink key={item.to} to={item.to} end={item.to === '/company/dashboard'} className={({ isActive }) => isActive ? 'active' : ''} onClick={closeSidebar}><i className={`fas ${item.icon}`} /><span>{item.label}</span></NavLink>)}<button type="button" onClick={handleLogout}><i className="fas fa-right-from-bracket" /><span>تسجيل الخروج</span></button></nav></aside><div className={`company-dashboard-overlay ${sidebarOpen ? 'is-visible' : ''}`} onClick={closeSidebar} /><section className="company-dashboard-content"><header className="company-dashboard-header"><button type="button" className="company-dashboard-menu-button" onClick={() => setSidebarOpen(true)} aria-label="فتح القائمة"><i className="fas fa-bars" /></button><div className="company-dashboard-account"><span className="company-dashboard-avatar">{user?.name?.charAt(0) || 'ش'}</span><div><strong>{user?.name || 'حساب الشركة'}</strong><small>{user?.email}</small></div><i className="fas fa-chevron-down" /></div></header><main className="company-dashboard-main">{children}</main></section></div>;
}
