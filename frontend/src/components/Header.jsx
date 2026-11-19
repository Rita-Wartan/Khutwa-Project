import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthDropdown({ label, type }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const options = type === 'login'
    ? [{ label: 'راغب بالعمل', to: '/login' }, { label: 'شركة', to: '/company/login' }]
    : [{ label: 'راغب بالعمل', to: '/register' }, { label: 'شركة', to: '/company/register' }];

  useEffect(() => {
    const close = event => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('touchstart', close); };
  }, []);

  return <div className="header-auth-dropdown" ref={ref}><button className={`header-auth-button ${type === 'login' ? 'header-auth-button-outline' : 'header-auth-button-filled'}`} type="button" aria-expanded={open} onClick={() => setOpen(current => !current)}>{label}<i className="fas fa-chevron-down header-auth-chevron" /></button><div className={`header-auth-menu ${open ? 'is-open' : ''}`}>{options.map(option => <Link key={option.to} to={option.to} onClick={() => setOpen(false)}>{option.label}</Link>)}</div></div>;
}

function AccountMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isCompany = user.role === 'company';

  useEffect(() => {
    const close = event => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('touchstart', close); };
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return <div className="header-account" ref={ref}><button className="header-account-button" type="button" aria-expanded={open} onClick={() => setOpen(current => !current)}><span className="header-account-avatar">{user.name?.charAt(0) || 'K'}</span><span className="header-account-label">{user.name || user.email}</span><i className="fas fa-chevron-down" /></button><div className={`header-account-menu ${open ? 'is-open' : ''}`}>{isCompany ? <><Link to="/company/dashboard" onClick={() => setOpen(false)}>لوحة التحكم</Link><Link to="/company/profile" onClick={() => setOpen(false)}>ملف الشركة</Link></> : <><Link to="/profile" onClick={() => setOpen(false)}>الملف الشخصي</Link><Link to="/jobs/saved" onClick={() => setOpen(false)}>الوظائف المحفوظة</Link><Link to="/applications" onClick={() => setOpen(false)}>الطلبات المقدمة</Link></>}<button type="button" onClick={handleLogout}>تسجيل الخروج</button></div></div>;
}

export default function Header({ onMenu }) {
  const { user, isAuthenticated } = useAuth();

  return <header><button className="menu-btn" onClick={onMenu} aria-label="القائمة"><i className="fas fa-bars" /></button><div className="logo"><h1>Khutwa</h1><span>خطوتك نحو المستقبل</span></div><div className="header-auth-actions">{isAuthenticated ? <AccountMenu user={user} /> : <><AuthDropdown label="إنشاء حساب" type="register" /><AuthDropdown label="تسجيل الدخول" type="login" /></>}</div></header>;
}
