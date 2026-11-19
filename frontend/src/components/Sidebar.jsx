import { Link, NavLink } from 'react-router-dom';

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div className={`overlay-bg ${open ? 'active' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'active' : ''}`}>
        <button className="sidebar-close" onClick={onClose} aria-label="إغلاق">
          <i className="fas fa-times" />
        </button>
        <ul className="sidebar-links">
          <li><Link to="/" onClick={onClose}>الرئيسية</Link></li>
          <li><Link to="/jobs" onClick={onClose}>الوظائف المتاحة</Link></li>
          <li><NavLink to="/applications" onClick={onClose}>الوظائف المتقدم عليها</NavLink></li>
          <li><NavLink to="/login" onClick={onClose}>تسجيل الدخول</NavLink></li>
          <li><NavLink to="/register" onClick={onClose}>إنشاء حساب</NavLink></li>
          <li><a href="/#footer" onClick={onClose}>عن خطوة</a></li>
          <li><a href="/#footer" onClick={onClose}>اتصل بنا</a></li>
          <li><a href="https://www.google.com" target="_blank" rel="noreferrer" onClick={onClose}>بحث خارجي</a></li>
        </ul>
      </aside>
    </>
  );
}
