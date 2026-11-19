import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminSidebar.css';

const navigation = [
  { label: 'لوحة التحكم', icon: 'fa-house', to: '/admin/dashboard' },
  { label: 'المستخدمون', icon: 'fa-users', to: '/admin/users' },
  { label: 'الشركات', icon: 'fa-building', to: '/admin/companies' },
  { label: 'الوظائف', icon: 'fa-briefcase', to: '/admin/jobs' },
 
  
  
];

export default function AdminSidebar({ open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return <aside className={`admin-dashboard-sidebar ${open ? 'is-open' : ''}`}><div className="admin-sidebar-brand"><span className="admin-sidebar-mark">K</span><div><strong>Khutwa</strong><small>Admin</small></div><button type="button" className="admin-sidebar-close" onClick={onClose} aria-label="إغلاق القائمة"><i className="fas fa-times" /></button></div><nav className="admin-dashboard-nav" aria-label="قائمة لوحة تحكم الأدمن">{navigation.map(item => <NavLink key={item.to} to={item.to} end={item.to === '/admin/dashboard'} className={({ isActive }) => isActive ? 'active' : ''} onClick={onClose}><i className={`fas ${item.icon}`} /><span>{item.label}</span></NavLink>)}<button type="button" onClick={handleLogout}><i className="fas fa-right-from-bracket" /><span>تسجيل الخروج</span></button></nav></aside>;
}
